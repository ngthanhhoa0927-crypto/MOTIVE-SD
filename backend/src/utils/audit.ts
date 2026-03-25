import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";
import type { Context } from "hono";

export type AuditAction = 
    | "user_created"
    | "user_updated"
    | "user_deleted"
    | "user_disabled"
    | "user_enabled"
    | "password_reset"
    | "login_failed"
    | "login_success"
    | "admin_action";

export interface AuditLogData {
    action: AuditAction;
    performedBy: number; // Admin user ID
    targetUser?: number;
    entityType: string; // "user", "product", etc.
    entityId?: number;
    description: string;
    dataBefore?: any; // Object or JSON string
    dataAfter?: any; // Object or JSON string
    status?: "success" | "failed";
    errorMessage?: string;
}

/**
 * Extract client IP address from request
 */
export function getClientIp(c: Context): string {
    const xForwardedFor = c.req.header("x-forwarded-for");
    if (xForwardedFor) {
        // Take the first IP if multiple IPs provided
        return xForwardedFor.split(",")[0].trim();
    }

    const xRealIp = c.req.header("x-real-ip");
    if (xRealIp) {
        return xRealIp;
    }

    // Fallback - may not work in all environments
    return "0.0.0.0";
}

/**
 * Extract user agent from request
 */
export function getUserAgent(c: Context): string {
    const userAgent = c.req.header("user-agent") || "Unknown";
    return userAgent.substring(0, 500); // Truncate to 500 characters
}

/**
 * Log audit event to database
 */
export async function logAudit(c: Context, logData: AuditLogData): Promise<void> {
    try {
        const ipAddress = getClientIp(c);
        const userAgent = getUserAgent(c);

        // Convert objects to JSON strings
        const dataBefore = logData.dataBefore
            ? typeof logData.dataBefore === "string"
                ? logData.dataBefore
                : JSON.stringify(logData.dataBefore)
            : null;

        const dataAfter = logData.dataAfter
            ? typeof logData.dataAfter === "string"
                ? logData.dataAfter
                : JSON.stringify(logData.dataAfter)
            : null;

        await db.insert(auditLogs).values({
            action: logData.action,
            performedBy: logData.performedBy,
            targetUser: logData.targetUser,
            entityType: logData.entityType,
            entityId: logData.entityId,
            ipAddress,
            userAgent,
            description: logData.description,
            dataBefore,
            dataAfter,
            status: logData.status || "success",
            errorMessage: logData.errorMessage,
        });

        console.log(`[AUDIT] ${logData.action} - ${logData.description}`);
    } catch (error) {
        console.error("Error logging audit:", error);
        // Don't throw - audit logging should not break functionality
    }
}

/**
 * Helper to get user info summary (safe to log)
 */
export function getUserDataSnapshot(user: any) {
    return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        isActive: user.isActive,
        phone_number: user.phone_number,
        createdAt: user.createdAt,
    };
}

/**
 * Create a diff between before and after states
 */
export function createChangeDiff(before: any, after: any): string {
    const changes: string[] = [];

    for (const key in after) {
        if (before[key] !== after[key]) {
            changes.push(
                `${key}: "${before[key] || "N/A"}" → "${after[key] || "N/A"}"`
            );
        }
    }

    return changes.join(", ");
}
