import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";

export type NotificationType = "account_created" | "order_placed" | "account_deleted" | "order_confirmed" | "password_changed";

export interface CreateNotificationData {
    type: NotificationType;
    userId?: number;
    userName: string;
    userAvatar?: string;
    message: string;
}

/**
 * Create a new notification for the admin panel.
 * This is called automatically when users perform key actions.
 */
export async function createNotification(data: CreateNotificationData): Promise<void> {
    try {
        await db.insert(notifications).values({
            type: data.type,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar || null,
            message: data.message,
        });
        console.log(`[NOTIFICATION] ${data.type}: ${data.message}`);
    } catch (error) {
        console.error("Error creating notification:", error);
        // Don't throw — notification creation should not break the main flow
    }
}
