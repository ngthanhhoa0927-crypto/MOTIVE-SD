import { db } from "./index.js";
import { users, categories } from "./schema.js";
import * as bcrypt from "bcryptjs";

export async function seedData() {
    try {
        // Check if any users exist
        const result = await db.select().from(users).limit(1);
        
        if (result.length > 0) {
            console.log("Database already has users. Skipping user seeding.");
        } else {
            console.log("Seeding initial data...");

            // Admin Account
            const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
            const adminHash = bcrypt.hashSync(adminPassword, 10);
            
            await db.insert(users).values({
                full_name: "System Admin",
                email: process.env.ADMIN_EMAIL || "admin@motive.com",
                password_hash: adminHash,
                role: "admin",
            });
            console.log("- Admin account created.");

            // Regular User Account
            const userPassword = "User@123456";
            const userHash = bcrypt.hashSync(userPassword, 10);
            
            await db.insert(users).values({
                full_name: "Nguyễn Văn A",
                email: "vana@motive.com",
                password_hash: userHash,
                role: "user",
            });
            console.log("- Regular user account created.");
        }

        const catResult = await db.select().from(categories).limit(1);
        if (catResult.length === 0) {
            console.log("Seeding categories...");
            await db.insert(categories).values([
                { name: "Baseball Caps" },
                { name: "Bucket Hats" },
                { name: "Beanies" },
                { name: "Visors" },
                { name: "Snapbacks" }
            ]);
            console.log("- Categories created.");
        }



        console.log("Database seeding completed successfully.");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}
