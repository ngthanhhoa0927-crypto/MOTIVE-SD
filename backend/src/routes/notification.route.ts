import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { authMiddleware, adminMiddleware } from "./auth.route.js";
import { getPresignedDownloadUrl } from "../utils/s3.js";

const notificationRouter = new Hono();

// GET /notifications — List latest notifications for admin dropdown
notificationRouter.get(
    "/",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const allNotifications = await db
                .select()
                .from(notifications)
                .orderBy(desc(notifications.createdAt))
                .limit(20);

            // Sign avatar URLs if they are S3 keys
            const signedNotifications = await Promise.all(
                allNotifications.map(async (notif) => {
                    let avatarUrl = notif.userAvatar;
                    if (avatarUrl && !avatarUrl.startsWith("http")) {
                        try {
                            avatarUrl = await getPresignedDownloadUrl(avatarUrl);
                        } catch {
                            avatarUrl = null;
                        }
                    }
                    return {
                        ...notif,
                        userAvatar: avatarUrl,
                    };
                })
            );

            return c.json({ notifications: signedNotifications }, 200);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// GET /notifications/unread-count — Get unread count for badge
notificationRouter.get(
    "/unread-count",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const unread = await db
                .select()
                .from(notifications)
                .where(eq(notifications.isRead, false));

            return c.json({ count: unread.length }, 200);
        } catch (error) {
            console.error("Error fetching unread count:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// PUT /notifications/:id/read — Mark a notification as read
notificationRouter.put(
    "/:id/read",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const id = parseInt(c.req.param("id"));

            const [updated] = await db
                .update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.id, id))
                .returning();

            if (!updated) {
                return c.json({ message: "Notification not found" }, 404);
            }

            return c.json({ message: "Notification marked as read" }, 200);
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

export default notificationRouter;
