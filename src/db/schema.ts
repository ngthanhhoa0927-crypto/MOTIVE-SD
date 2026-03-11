import { pgTable, serial, varchar, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    role: roleEnum("role").notNull().default("user"),
    full_name: varchar("full_name").notNull(),
    email: varchar("email").notNull().unique(),
    password_hash: varchar("password_hash").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
});


