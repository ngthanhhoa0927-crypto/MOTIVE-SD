import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db/index.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { carts, cartItems, orders, orderItems, productVariants, users, products, productImages } from "../db/schema.js";
import { authMiddleware } from "./auth.route.js";
import { createNotification } from "../utils/notification.js";
import { getPresignedDownloadUrl } from "../utils/s3.js";
const ordersRouter = new Hono();
ordersRouter.use("*", authMiddleware);
// Validation schema for checkout
const checkoutSchema = z.object({
    receiverName: z.string().min(2).max(255, "Name must be between 2 and 255 characters"),
    receiverPhone: z.string().regex(/^[0-9\-\+\s\(\)]{10,}$/, "Invalid phone number format"),
    shippingAddress: z.string().min(5).max(500, "Address must be between 5 and 500 characters"),
    shippingCity: z.string().min(2).max(255, "City must be between 2 and 255 characters"),
    paymentMethod: z.enum(["card", "cod"], { message: "Payment method must be 'card' or 'cod'" }),
    shippingMethod: z.enum(["standard", "express"], { message: "Shipping method must be 'standard' or 'express'" }),
});
// Shipping fee constants
const SHIPPING_FEES = {
    standard: 5,
    express: 15,
};
// Estimated delivery days
const DELIVERY_DAYS = {
    standard: 7,
    express: 3,
};
// Helper function to generate unique order code
const generateOrderCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};
// Helper function to calculate tax (10% tax rate)
const calculateTax = (subtotal) => {
    return Number((subtotal * 0.1).toFixed(2));
};
// Helper function to calculate estimated delivery date
const calculateEstimatedDeliveryDate = (shippingMethod) => {
    const days = DELIVERY_DAYS[shippingMethod] || 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};
// Helper function to generate mock payment URL (replace with Stripe integration)
const generatePaymentUrl = (orderCode, totalAmount) => {
    return `https://payment.example.com/checkout?orderCode=${orderCode}&amount=${totalAmount}`;
};
// POST /api/orders/checkout
ordersRouter.post("/checkout", zValidator("json", checkoutSchema, (result, c) => {
    if (!result.success) {
        return c.json({
            message: "Validation failed",
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        }, 400);
    }
}), async (c) => {
    try {
        const userPayload = c.get("jwtPayload");
        const userId = userPayload.sub;
        const { receiverName, receiverPhone, shippingAddress, shippingCity, paymentMethod, shippingMethod } = c.req.valid("json");
        // 1. Get user's cart
        const userCart = await db.select().from(carts).where(eq(carts.userId, userId));
        if (userCart.length === 0) {
            return c.json({ message: "Cart not found" }, 404);
        }
        const cartId = userCart[0].id;
        // 2. Get cart items with product and variant details
        const items = await db.select({
            cartItem: cartItems,
            variant: productVariants,
            product: products,
            image: productImages,
        })
            .from(cartItems)
            .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
            .innerJoin(products, eq(productVariants.product_id, products.id))
            .leftJoin(productImages, and(eq(productImages.product_id, products.id), eq(productImages.is_primary, true)))
            .where(eq(cartItems.cartId, cartId));
        // 3. Validate cart is not empty
        if (items.length === 0) {
            return c.json({ message: "Cart is empty" }, 400);
        }
        // 4. Calculate totals
        let subtotal = 0;
        items.forEach((item) => {
            const itemPrice = Number(item.variant.price) * item.cartItem.quantity;
            subtotal += itemPrice;
        });
        subtotal = Number(subtotal.toFixed(2));
        const shippingFee = SHIPPING_FEES[shippingMethod];
        const tax = calculateTax(subtotal);
        const totalAmount = Number((subtotal + shippingFee + tax).toFixed(2));
        const estimatedDeliveryDate = calculateEstimatedDeliveryDate(shippingMethod);
        // 5. Generate order code
        const orderCode = generateOrderCode();
        // 6. Create order
        const [createdOrder] = await db
            .insert(orders)
            .values({
            order_code: orderCode,
            userId,
            receiver_name: receiverName,
            receiver_phone: receiverPhone,
            shipping_address: shippingAddress,
            shipping_city: shippingCity,
            payment_method: paymentMethod,
            shipping_method: shippingMethod,
            subtotal: String(subtotal),
            shipping_fee: String(shippingFee),
            tax: String(tax),
            total_amount: String(totalAmount),
            status: "processing",
            estimated_delivery_date: estimatedDeliveryDate,
        })
            .returning();
        // 7. Create order items with snapshot data
        const orderItemsData = await Promise.all(items.map(async (item) => {
            let imageUrl = item.image?.image_url;
            if (imageUrl && !imageUrl.startsWith("http")) {
                imageUrl = await getPresignedDownloadUrl(imageUrl);
            }
            return {
                orderId: createdOrder.id,
                product_id: item.product.id,
                product_name: item.product.name,
                product_image: imageUrl,
                quantity: item.cartItem.quantity,
                price_at_purchase: item.variant.price,
                size: item.variant.size,
                color: item.variant.color,
            };
        }));
        await db.insert(orderItems).values(orderItemsData);
        // 8. Handle payment method
        let paymentUrl = null;
        if (paymentMethod === "card") {
            paymentUrl = generatePaymentUrl(orderCode, totalAmount);
            // Update order with payment URL
            await db
                .update(orders)
                .set({ payment_url: paymentUrl })
                .where(eq(orders.id, createdOrder.id));
        }
        // 9. Clear cart
        await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
        // 10. Create notification
        const user = await db.select().from(users).where(eq(users.id, userId));
        if (user.length > 0) {
            await createNotification({
                type: "order_placed",
                userId: userId,
                userName: user[0].full_name,
                userAvatar: user[0].avatar_url || undefined,
                message: `Order #${orderCode} placed successfully`,
            });
        }
        // 11. Return response
        const response = {
            message: "Order created successfully",
            order: {
                id: createdOrder.id,
                order_code: createdOrder.order_code,
                status: createdOrder.status,
                total_amount: Number(createdOrder.total_amount),
                created_at: createdOrder.createdAt,
            },
        };
        if (paymentMethod === "card") {
            response.payment_url = paymentUrl;
        }
        return c.json(response, 201);
    }
    catch (error) {
        console.error("Checkout failed:", error);
        return c.json({ message: "Failed to create order", error: String(error) }, 500);
    }
});
// GET /api/user/orders - Get user's orders with pagination
const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});
ordersRouter.get("/", zValidator("query", paginationSchema, (result, c) => {
    if (!result.success) {
        return c.json({ message: "Invalid pagination parameters" }, 400);
    }
}), async (c) => {
    try {
        const userPayload = c.get("jwtPayload");
        const userId = userPayload.sub;
        const { page, limit } = c.req.valid("query");
        const offset = (page - 1) * limit;
        // Get total count
        const [countResult] = await db
            .select({ count: sql `cast(count(*) as integer)` })
            .from(orders)
            .where(eq(orders.userId, userId));
        const totalCount = countResult?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);
        // Get paginated orders
        const userOrders = await db
            .select({
            id: orders.id,
            order_code: orders.order_code,
            created_at: orders.createdAt,
            total_amount: orders.total_amount,
            status: orders.status,
        })
            .from(orders)
            .where(eq(orders.userId, userId))
            .orderBy(desc(orders.createdAt))
            .limit(limit)
            .offset(offset);
        return c.json({
            data: userOrders.map((order) => ({
                order_code: order.order_code,
                created_at: order.created_at,
                total_amount: Number(order.total_amount),
                status: order.status,
            })),
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_count: totalCount,
                limit: limit,
            },
        }, 200);
    }
    catch (error) {
        console.error("Failed to fetch orders:", error);
        return c.json({ message: "Failed to fetch orders" }, 500);
    }
});
// GET /api/user/orders/:order_id - Get single order details
ordersRouter.get("/:orderId", async (c) => {
    try {
        const userPayload = c.get("jwtPayload");
        const userId = userPayload.sub;
        const orderId = Number(c.req.param("orderId"));
        // Validate orderId is a number
        if (isNaN(orderId)) {
            return c.json({ message: "Invalid order ID" }, 400);
        }
        // Get order with authorization check
        const order = await db
            .select()
            .from(orders)
            .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
        if (order.length === 0) {
            return c.json({ message: "Order not found" }, 404);
        }
        const orderData = order[0];
        // Get order items
        const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));
        return c.json({
            order: {
                id: orderData.id,
                order_code: orderData.order_code,
                receiver_name: orderData.receiver_name,
                receiver_phone: orderData.receiver_phone,
                shipping_address: orderData.shipping_address,
                shipping_city: orderData.shipping_city,
                payment_method: orderData.payment_method,
                shipping_method: orderData.shipping_method,
                status: orderData.status,
                subtotal: Number(orderData.subtotal),
                shipping_fee: Number(orderData.shipping_fee),
                tax: Number(orderData.tax),
                total_amount: Number(orderData.total_amount),
                estimated_delivery_date: orderData.estimated_delivery_date,
                payment_status: orderData.payment_status,
                created_at: orderData.createdAt,
                updated_at: orderData.updatedAt,
            },
            items: items.map((item) => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name,
                product_image: item.product_image,
                quantity: item.quantity,
                price_at_purchase: Number(item.price_at_purchase),
                size: item.size,
                color: item.color,
            })),
        }, 200);
    }
    catch (error) {
        console.error("Failed to fetch order details:", error);
        return c.json({ message: "Failed to fetch order details" }, 500);
    }
});
export default ordersRouter;
