import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { products, productImages, productVariants, productPromotions, categories, collections } from "../db/schema.js";
import { getPresignedDownloadUrl } from "../utils/s3.js";
import { authMiddleware, adminMiddleware } from "./auth.route.js";

const productRouter = new Hono();

// Validate product
const createProductSchema = z.object({
    category_id: z.number().int().positive(),
    collection_id: z.number().int().positive().optional(),
    brand: z.string().max(255).optional(),
    name: z.string().min(2).max(255),
    base_price: z.number().positive(),
    weight: z.number().positive().optional(),
    description: z.string().optional(),
    material: z.string().max(255).optional(),
    size_info: z.string().max(500).optional(),
    care: z.string().optional(),
    package_weight: z.number().positive().optional(),
    shipping_class: z.string().max(255).optional(),
    package_dimensions: z.string().max(255).optional(),
    lead_time: z.number().int().min(0).optional(),
    status: z.enum(["Draft", "Active", "Archived"]).default("Draft"),
    images: z.array(z.object({
        image_url: z.string(), // S3 Key
        is_primary: z.boolean().default(false),
        display_order: z.number().int().default(0)
    })).optional(),
    variants: z.array(z.object({
        sku: z.string().min(2).max(50),
        color: z.string().max(50).optional(),
        color_hex: z.string().max(10).optional(),
        size: z.string().max(20).optional(),
        price: z.number().positive(),
        stock_quantity: z.number().int().min(0).default(0),
        image_url: z.string().optional(), // S3 Key
        is_active: z.boolean().default(true)
    })).optional(),
    promotion_ids: z.array(z.number().int().positive()).optional()
});

// Create a new product (Admin)
productRouter.post(
    "/",
    authMiddleware,
    adminMiddleware,
    zValidator('json', createProductSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const data = c.req.valid('json');

            // Generate simple slug (e.g. "My Hat" -> "my-hat-1234")
            const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

            // Database Transaction ensures all related data is created together
            const newProduct = await db.transaction(async (tx) => {

                // 1. Insert Base Product
                const [product] = await tx.insert(products).values({
                    category_id: data.category_id,
                    collection_id: data.collection_id,
                    brand: data.brand,
                    name: data.name,
                    slug: slug,
                    base_price: data.base_price.toString(),
                    weight: data.weight?.toString(),
                    description: data.description,
                    material: data.material,
                    size_info: data.size_info,
                    care: data.care,
                    package_weight: data.package_weight?.toString(),
                    shipping_class: data.shipping_class,
                    package_dimensions: data.package_dimensions,
                    lead_time: data.lead_time,
                    status: data.status,
                }).returning();

                // 2. Insert Images (from S3 uploads)
                if (data.images && data.images.length > 0) {
                    const imageValues = data.images.map(img => ({
                        product_id: product.id,
                        image_url: img.image_url,
                        is_primary: img.is_primary,
                        display_order: img.display_order
                    }));
                    await tx.insert(productImages).values(imageValues);
                }

                // 3. Insert Variants (SKU tracking)
                if (data.variants && data.variants.length > 0) {
                    const variantValues = data.variants.map(v => ({
                        product_id: product.id,
                        sku: v.sku,
                        color: v.color,
                        color_hex: v.color_hex,
                        size: v.size,
                        price: v.price.toString(),
                        stock_quantity: v.stock_quantity,
                        image_url: v.image_url,
                        is_active: v.is_active
                    }));
                    await tx.insert(productVariants).values(variantValues);
                }

                // 4. Link Promotions
                if (data.promotion_ids && data.promotion_ids.length > 0) {
                    const promoValues = data.promotion_ids.map(promoId => ({
                        product_id: product.id,
                        promotion_id: promoId
                    }));
                    await tx.insert(productPromotions).values(promoValues);
                }

                return product;
            });

            return c.json({ message: "Product created successfully", product: newProduct }, 201);

        } catch (error) {
            console.error("Error creating product:", error);
            // Handle unique constraint violation (like duplicate SKU)
            if (error instanceof Error && error.message.includes('unique constraint')) {
                return c.json({ message: "A unique constraint was violated (e.g. duplicate SKU or Slug)" }, 409);
            }
            return c.json({ message: "Failed to create product" }, 500);
        }
    }
);

// List all products with their images and variants
productRouter.get("/", async (c) => {
    try {
        const allProducts = await db.select().from(products);
        
        // Fetch relations for each product
        const productsWithRelations = await Promise.all(allProducts.map(async (p) => {
            const images = await db.select().from(productImages).where(eq(productImages.product_id, p.id));
            const variants = await db.select().from(productVariants).where(eq(productVariants.product_id, p.id));
            
            // Sign image URLs
            const signedImages = await Promise.all(images.map(async (img) => {
                let url = img.image_url;
                if (url && !url.startsWith('http')) {
                    url = await getPresignedDownloadUrl(url);
                }
                return { ...img, signed_url: url, image_url: img.image_url };
            }));

            // Sign variant URLs
            const signedVariants = await Promise.all(variants.map(async (v) => {
                let url = v.image_url;
                if (url && !url.startsWith('http')) {
                    url = await getPresignedDownloadUrl(url);
                }
                return { ...v, signed_url: url, image_url: v.image_url };
            }));

            return {
                ...p,
                images: signedImages,
                variants: signedVariants
            };
        }));

        return c.json({ products: productsWithRelations }, 200);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return c.json({ message: "Failed to fetch products" }, 500);
    }
});
// Get single product with relations
productRouter.get("/:id", async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        if (isNaN(id)) return c.json({ message: "Invalid ID format" }, 400);

        const productRows = await db.select().from(products).where(eq(products.id, id));
        if (productRows.length === 0) return c.json({ message: "Product not found" }, 404);
        
        const p = productRows[0];
        
        const images = await db.select().from(productImages).where(eq(productImages.product_id, p.id));
        const variants = await db.select().from(productVariants).where(eq(productVariants.product_id, p.id));
        const promos = await db.select().from(productPromotions).where(eq(productPromotions.product_id, p.id));
        
        // Sign URLs
        const signedImages = await Promise.all(images.map(async (img) => {
            let url = img.image_url;
            if (url && !url.startsWith('http')) url = await getPresignedDownloadUrl(url);
            return { ...img, signed_url: url, image_url: img.image_url };
        }));

        const signedVariants = await Promise.all(variants.map(async (v) => {
            let url = v.image_url;
            if (url && !url.startsWith('http')) url = await getPresignedDownloadUrl(url);
            return { ...v, signed_url: url, image_url: v.image_url };
        }));

        return c.json({
            product: {
                ...p,
                images: signedImages,
                variants: signedVariants,
                promotion_ids: promos.map(pr => pr.promotion_id)
            }
        }, 200);
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return c.json({ message: "Failed to fetch product" }, 500);
    }
});

// Update an existing product (Admin)
productRouter.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    zValidator('json', createProductSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const id = parseInt(c.req.param("id"));
            if (isNaN(id)) return c.json({ message: "Invalid ID format" }, 400);

            const data = c.req.valid('json');
            
            const updatedProduct = await db.transaction(async (tx) => {
                // Check if product exists
                const existing = await tx.select().from(products).where(eq(products.id, id));
                if (existing.length === 0) throw new Error("Product not found");

                // 1. Update Base Product
                const [product] = await tx.update(products).set({
                    category_id: data.category_id,
                    collection_id: data.collection_id,
                    brand: data.brand,
                    name: data.name,
                    base_price: data.base_price.toString(),
                    weight: data.weight?.toString(),
                    description: data.description,
                    material: data.material,
                    size_info: data.size_info,
                    care: data.care,
                    package_weight: data.package_weight?.toString(),
                    shipping_class: data.shipping_class,
                    package_dimensions: data.package_dimensions,
                    lead_time: data.lead_time,
                    status: data.status,
                    updatedAt: new Date()
                }).where(eq(products.id, id)).returning();

                // 2. Replace Images
                await tx.delete(productImages).where(eq(productImages.product_id, id));
                if (data.images && data.images.length > 0) {
                    const imageValues = data.images.map(img => ({
                        product_id: id,
                        image_url: img.image_url,
                        is_primary: img.is_primary,
                        display_order: img.display_order
                    }));
                    await tx.insert(productImages).values(imageValues);
                }

                // 3. Replace Variants
                await tx.delete(productVariants).where(eq(productVariants.product_id, id));
                if (data.variants && data.variants.length > 0) {
                    const variantValues = data.variants.map(v => ({
                        product_id: id,
                        sku: v.sku,
                        color: v.color,
                        color_hex: v.color_hex,
                        size: v.size,
                        price: v.price.toString(),
                        stock_quantity: v.stock_quantity,
                        image_url: v.image_url,
                        is_active: v.is_active
                    }));
                    await tx.insert(productVariants).values(variantValues);
                }

                // 4. Replace Promotions
                await tx.delete(productPromotions).where(eq(productPromotions.product_id, id));
                if (data.promotion_ids && data.promotion_ids.length > 0) {
                    const promoValues = data.promotion_ids.map(promoId => ({
                        product_id: id,
                        promotion_id: promoId
                    }));
                    await tx.insert(productPromotions).values(promoValues);
                }
                
                return product;
            });

            return c.json({ message: "Product updated successfully", product: updatedProduct }, 200);

        } catch (error) {
            console.error("Error updating product:", error);
            if (error instanceof Error && error.message === "Product not found") {
                return c.json({ message: "Product not found" }, 404);
            }
            if (error instanceof Error && error.message.includes('unique constraint')) {
                return c.json({ message: "A unique constraint was violated (e.g. duplicate SKU)" }, 409);
            }
            return c.json({ message: "Failed to update product" }, 500);
        }
    }
);

// Delete a product (Admin)
productRouter.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const id = parseInt(c.req.param("id"));
            if (isNaN(id)) return c.json({ message: "Invalid ID format" }, 400);

            await db.transaction(async (tx) => {
                // Check if product exists
                const existing = await tx.select().from(products).where(eq(products.id, id));
                if (existing.length === 0) throw new Error("Product not found");

                // Delete relations first (no cascade in schema)
                await tx.delete(productPromotions).where(eq(productPromotions.product_id, id));
                await tx.delete(productVariants).where(eq(productVariants.product_id, id));
                await tx.delete(productImages).where(eq(productImages.product_id, id));
                
                // Note: If order_items exist for this product, this deletion will fail due to foreign key constraint constraint.
                // In a production system, a soft delete is preferred. This fulfills the MVP requirement.
                await tx.delete(products).where(eq(products.id, id));
            });

            return c.json({ message: "Product deleted successfully" }, 200);

        } catch (error) {
            console.error("Error deleting product:", error);
            if (error instanceof Error && error.message === "Product not found") {
                return c.json({ message: "Product not found" }, 404);
            }
            if (error instanceof Error && error.message.includes('foreign key constraint')) {
                return c.json({ message: "Cannot delete product as it is part of an existing order" }, 409);
            }
            return c.json({ message: "Failed to delete product" }, 500);
        }
    }
);

export default productRouter;
