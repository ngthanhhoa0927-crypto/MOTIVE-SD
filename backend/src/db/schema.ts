import { pgTable, serial, varchar, boolean, timestamp, pgEnum, integer, decimal, text, primaryKey } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    role: roleEnum("role").notNull().default("user"),
    full_name: varchar("full_name").notNull(),
    email: varchar("email").notNull().unique(),
    phone_number: varchar("phone_number"),
    date_of_birth: varchar("date_of_birth"),
    address: text("address"),
    avatar_url: varchar("avatar_url", { length: 500 }),
    password_hash: varchar("password_hash").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    disabledAt: timestamp("disabled_at"),
    disabledReason: varchar("disabled_reason", { length: 500 }),
    disabledBy: integer("disabled_by"), // admin user id who disabled this user
    failed_login_attempts: integer("failed_login_attempts").notNull().default(0),
    locked_until: timestamp("locked_until"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const otpTypeEnum = pgEnum("otp_type", ["registration", "reset_password"]);

export const otps = pgTable("otps", {
    id: serial("id").primaryKey(),
    email: varchar("email").notNull(),
    otp: varchar("otp").notNull(),
    type: otpTypeEnum("type").notNull().default("registration"),
    is_used: boolean("is_used").notNull().default(false),
    userId: integer("user_id"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productStatusEnum = pgEnum("product_status", ["Draft", "Active", "Archived"]);

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
});

export const collections = pgTable("collections", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
});

export const promotions = pgTable("promotions", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    discount_percentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
});

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    category_id: integer("category_id").references(() => categories.id).notNull(),
    collection_id: integer("collection_id").references(() => collections.id),
    brand: varchar("brand", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    base_price: decimal("base_price", { precision: 18, scale: 2 }).notNull(),
    weight: decimal("weight", { precision: 10, scale: 2 }),
    description: text("description"),
    
    // Specifications
    material: varchar("material", { length: 255 }),
    size_info: varchar("size_info", { length: 500 }),
    care: text("care"),
    
    // Shipping
    package_weight: decimal("package_weight", { precision: 10, scale: 2 }),
    shipping_class: varchar("shipping_class", { length: 255 }),
    package_dimensions: varchar("package_dimensions", { length: 255 }),
    lead_time: integer("lead_time"),
    
    status: productStatusEnum("status").default("Draft"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const productImages = pgTable("product_images", {
    id: serial("id").primaryKey(),
    product_id: integer("product_id").references(() => products.id).notNull(),
    image_url: varchar("image_url", { length: 500 }).notNull(),
    is_primary: boolean("is_primary").default(false),
    display_order: integer("display_order").default(0),
    color: varchar("color", { length: 50 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productVariants = pgTable("product_variants", {
    id: serial("id").primaryKey(),
    product_id: integer("product_id").references(() => products.id).notNull(),
    color: varchar("color", { length: 50 }),
    color_hex: varchar("color_hex", { length: 10 }),
    size: varchar("size", { length: 20 }),
    sku: varchar("sku", { length: 50 }).notNull().unique(),
    price: decimal("price", { precision: 18, scale: 2 }).notNull(),
    stock_quantity: integer("stock_quantity").default(0),
    image_url: varchar("image_url", { length: 500 }),
    is_active: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});

export const productPromotions = pgTable("product_promotions", {
    product_id: integer("product_id").references(() => products.id).notNull(),
    promotion_id: integer("promotion_id").references(() => promotions.id).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.product_id, t.promotion_id] }),
}));

// Audit Log for tracking admin actions
export const auditActionEnum = pgEnum("audit_action", [
    "user_created",
    "user_updated",
    "user_deleted",
    "user_disabled",
    "user_enabled",
    "password_reset",
    "login_failed",
    "login_success",
    "admin_action",
]);

export const auditLogs = pgTable("audit_logs", {
    id: serial("id").primaryKey(),
    action: auditActionEnum("action").notNull(),
    performedBy: integer("performed_by").notNull(), // Admin user ID
    targetUser: integer("target_user"), // User affected by action
    entityType: varchar("entity_type", { length: 50 }).notNull(), // "user", "product", etc.
    entityId: integer("entity_id"), // ID of the entity
    ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
    userAgent: varchar("user_agent", { length: 500 }), // Browser/client info
    description: varchar("description", { length: 500 }), // Human-readable description
    dataBefore: text("data_before"), // JSON snapshot before action
    dataAfter: text("data_after"), // JSON snapshot after action
    status: varchar("status", { length: 20 }).default("success"), // "success", "failed"
    errorMessage: varchar("error_message", { length: 500 }), // If failed
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notification system for admin panel
export const notificationTypeEnum = pgEnum("notification_type", [
    "account_created",
    "order_placed",
    "account_deleted",
    "order_confirmed",
    "password_changed",
]);

export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    type: notificationTypeEnum("type").notNull(),
    userId: integer("user_id"),
    userName: varchar("user_name", { length: 255 }).notNull(),
    userAvatar: varchar("user_avatar", { length: 500 }),
    message: varchar("message", { length: 500 }).notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const carts = pgTable("carts", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id").references(() => carts.id).notNull(),
    productVariantId: integer("product_variant_id").references(() => productVariants.id).notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Order enums
export const orderStatusEnum = pgEnum("order_status", ["processing", "shipped", "delivered", "cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["card", "cod"]);
export const shippingMethodEnum = pgEnum("shipping_method", ["standard", "express"]);

// Orders and Order Items tables
export const orders = pgTable("orders", {
    id: serial("id").primaryKey(),
    order_code: varchar("order_code", { length: 50 }).notNull().unique(),
    userId: integer("user_id").references(() => users.id).notNull(),
    receiver_name: varchar("receiver_name").notNull(),
    receiver_phone: varchar("receiver_phone").notNull(),
    shipping_address: text("shipping_address").notNull(),
    shipping_city: varchar("shipping_city", { length: 255 }).notNull(),
    payment_method: paymentMethodEnum("payment_method").notNull(),
    shipping_method: shippingMethodEnum("shipping_method").notNull(),
    status: orderStatusEnum("status").default("processing").notNull(),
    subtotal: decimal("subtotal", { precision: 18, scale: 2 }).notNull(),
    shipping_fee: decimal("shipping_fee", { precision: 18, scale: 2 }).notNull(),
    tax: decimal("tax", { precision: 18, scale: 2 }).default("0"),
    total_amount: decimal("total_amount", { precision: 18, scale: 2 }).notNull(),
    payment_url: varchar("payment_url", { length: 500 }),
    payment_status: varchar("payment_status", { length: 50 }).default("pending"),
    estimated_delivery_date: timestamp("estimated_delivery_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id).notNull(),
    product_id: integer("product_id").references(() => products.id).notNull(),
    product_name: varchar("product_name").notNull(),
    product_image: varchar("product_image", { length: 500 }),
    quantity: integer("quantity").notNull(),
    price_at_purchase: decimal("price_at_purchase", { precision: 18, scale: 2 }).notNull(),
    size: varchar("size", { length: 50 }),
    color: varchar("color", { length: 50 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

