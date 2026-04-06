import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db/index.js";
import { eq, and, sql } from "drizzle-orm";
import { carts, cartItems, products, productVariants, productImages } from "../db/schema.js";
import { authMiddleware } from "./auth.route.js";
import { getPresignedDownloadUrl } from "../utils/s3.js";

const cartRouter = new Hono();

cartRouter.use("*", authMiddleware);

// 0. GET /count
cartRouter.get("/count", async (c) => {
    try {
        const userPayload = c.get("jwtPayload") as { sub: number };
        const userId = userPayload.sub;

        const userCart = await db.select().from(carts).where(eq(carts.userId, userId));
        if (userCart.length === 0) {
            return c.json({ count: 0 }, 200);
        }

        const result = await db.select({
            totalQuantity: sql<number>`sum(${cartItems.quantity})::int`
        })
        .from(cartItems)
        .where(eq(cartItems.cartId, userCart[0].id));

        const count = result[0]?.totalQuantity || 0;
        return c.json({ count }, 200);
    } catch (error) {
        console.error("Failed to get cart count:", error);
        return c.json({ count: 0 }, 200); // Return 0 on error to avoid breaking UI
    }
});

// 1. GET /
cartRouter.get("/", async (c) => {
    try {
        const userPayload = c.get("jwtPayload") as { sub: number };
        const userId = userPayload.sub;

        // Get or Create cart atomically to prevent race conditions
        const [userCart] = await db.insert(carts)
            .values({ userId })
            .onConflictDoUpdate({
                target: carts.userId,
                set: { updatedAt: new Date() }
            })
            .returning();

        const cartId = userCart.id;

        // Get cart items with relations
        const items = await db.select({
            cartItemId: cartItems.id,
            quantity: cartItems.quantity,
            productVariant: productVariants,
            product: products,
            primaryImage: productImages
        })
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId))
        .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
        .innerJoin(products, eq(productVariants.product_id, products.id))
        .leftJoin(productImages, and(
            eq(productImages.product_id, products.id),
            eq(productImages.is_primary, true)
        ));

        // Format items and sign image url if necessary
        const formattedItems = await Promise.all(items.map(async (item) => {
            let imageUrl = item.primaryImage?.image_url;
            if (imageUrl && !imageUrl.startsWith("http")) {
                imageUrl = await getPresignedDownloadUrl(imageUrl);
            }
            return {
                id: item.cartItemId,
                quantity: item.quantity,
                product_variant: {
                    ...item.productVariant
                },
                product: {
                    ...item.product
                },
                product_image: item.primaryImage ? {
                    ...item.primaryImage,
                    signed_url: imageUrl
                } : null
            };
        }));

        return c.json({ items: formattedItems }, 200);

    } catch (error) {
        console.error("Failed to get cart items:", error);
        return c.json({ message: "Failed to fetch cart items" }, 500);
    }
});

// 2. POST /
const addCartItemSchema = z.object({
    product_variant_id: z.number().int().positive(),
    quantity: z.number().int().min(1).default(1)
});

cartRouter.post(
    "/",
    zValidator("json", addCartItemSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "Validation failed", errors: result.error.issues }, 400);
        }
    }),
    async (c) => {
        try {
            const userPayload = c.get("jwtPayload") as { sub: number };
            const userId = userPayload.sub;
            const { product_variant_id, quantity } = c.req.valid("json");

            // Verify the variant exists
            const variantExists = await db.select().from(productVariants).where(eq(productVariants.id, product_variant_id));
            if (variantExists.length === 0) {
                return c.json({ message: "Product variant not found" }, 404);
            }

            // Get or create cart atomically to prevent race conditions
            const [userCart] = await db.insert(carts)
                .values({ userId })
                .onConflictDoUpdate({
                    target: carts.userId,
                    set: { updatedAt: new Date() }
                })
                .returning();
            const cartId = userCart.id;

            // Check if item already in cart
            const existingItems = await db.select()
                .from(cartItems)
                .where(and(
                    eq(cartItems.cartId, cartId),
                    eq(cartItems.productVariantId, product_variant_id)
                ));

            if (existingItems.length > 0) {
                // Update quantity
                const existingItem = existingItems[0];
                const newQuantity = existingItem.quantity + quantity;
                const [updatedItem] = await db.update(cartItems)
                    .set({ quantity: newQuantity })
                    .where(eq(cartItems.id, existingItem.id))
                    .returning();
                return c.json({ message: "Cart item updated successfully", item: updatedItem }, 200);
            } else {
                // Insert new item
                const [newItem] = await db.insert(cartItems)
                    .values({
                        cartId: cartId,
                        productVariantId: product_variant_id,
                        quantity: quantity
                    }).returning();
                return c.json({ message: "Item added to cart", item: newItem }, 201);
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            return c.json({ message: "Failed to add to cart" }, 500);
        }
    }
);

// 3. PUT /:id
const updateCartItemSchema = z.object({
    quantity: z.number().int().min(0)
});

cartRouter.put(
    "/:id",
    zValidator("json", updateCartItemSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "Validation failed", errors: result.error.issues }, 400);
        }
    }),
    async (c) => {
        try {
            const userPayload = c.get("jwtPayload") as { sub: number };
            const userId = userPayload.sub;
            const cartItemId = parseInt(c.req.param("id"));
            const { quantity } = c.req.valid("json");

            if (isNaN(cartItemId)) return c.json({ message: "Invalid ID format" }, 400);

            // Verify item belongs to user's cart
            const userCart = await db.select().from(carts).where(eq(carts.userId, userId));
            if (userCart.length === 0) return c.json({ message: "Cart not found" }, 404);
            const cartId = userCart[0].id;

            const existingItems = await db.select().from(cartItems).where(and(
                eq(cartItems.id, cartItemId),
                eq(cartItems.cartId, cartId)
            ));

            if (existingItems.length === 0) {
                return c.json({ message: "Cart item not found" }, 404);
            }

            if (quantity === 0) {
                // Delete item
                await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
                return c.json({ message: "Cart item removed" }, 200);
            } else {
                // Update quantity
                const [updatedItem] = await db.update(cartItems)
                    .set({ quantity })
                    .where(eq(cartItems.id, cartItemId))
                    .returning();
                return c.json({ message: "Cart item updated", item: updatedItem }, 200);
            }

        } catch (error) {
            console.error("Failed to update cart item:", error);
            return c.json({ message: "Failed to update cart item" }, 500);
        }
    }
);

// 4. DELETE /:id
cartRouter.delete("/:id", async (c) => {
    try {
        const userPayload = c.get("jwtPayload") as { sub: number };
        const userId = userPayload.sub;
        const cartItemId = parseInt(c.req.param("id"));

        if (isNaN(cartItemId)) return c.json({ message: "Invalid ID format" }, 400);

        const userCart = await db.select().from(carts).where(eq(carts.userId, userId));
        if (userCart.length === 0) return c.json({ message: "Cart not found" }, 404);
        const cartId = userCart[0].id;

        const existingItems = await db.select().from(cartItems).where(and(
            eq(cartItems.id, cartItemId),
            eq(cartItems.cartId, cartId)
        ));

        if (existingItems.length === 0) {
            return c.json({ message: "Cart item not found" }, 404);
        }

        await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
        return c.json({ message: "Cart item removed successfully" }, 200);
    } catch (error) {
        console.error("Failed to delete cart item:", error);
        return c.json({ message: "Failed to delete cart item" }, 500);
    }
});

export default cartRouter;
