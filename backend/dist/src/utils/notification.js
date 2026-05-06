import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
/**
 * Create a new notification for the admin panel.
 * This is called automatically when users perform key actions.
 */
export async function createNotification(data) {
    try {
        await db.insert(notifications).values({
            type: data.type,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar || null,
            message: data.message,
        });
        console.log(`[NOTIFICATION] ${data.type}: ${data.message}`);
    }
    catch (error) {
        console.error("Error creating notification:", error);
        // Don't throw — notification creation should not break the main flow
    }
}
