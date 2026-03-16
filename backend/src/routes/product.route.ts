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
    name: z.string().min(2).max(255),
    base_price: z.number().positive(),
    weight: z.number().positive().optional(),
    description: z.string().optional(),
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
                    name: data.name,
                    slug: slug,
                    base_price: data.base_price.toString(),
                    weight: data.weight?.toString(),
                    description: data.description,
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
                return { ...img, image_url: url };
            }));

            // Sign variant URLs
            const signedVariants = await Promise.all(variants.map(async (v) => {
                let url = v.image_url;
                if (url && !url.startsWith('http')) {
                    url = await getPresignedDownloadUrl(url);
                }
                return { ...v, image_url: url };
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

export default productRouter;
