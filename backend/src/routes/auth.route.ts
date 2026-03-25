import { Hono } from "hono";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, otps, otpTypeEnum, auditLogs } from "../db/schema.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { sign, verify } from "hono/jwt";
import { sendOtpEmail, sendResetPasswordEmail } from "../utils/email.js";
import { getPresignedDownloadUrl } from "../utils/s3.js";
import { logAudit, getUserDataSnapshot, createChangeDiff } from "../utils/audit.js";
import { createNotification } from "../utils/notification.js";
import * as crypto from "crypto";
const authRouter = new Hono();

// Middleware to protect routes that require authentication
export const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ message: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = await verify(token, process.env.JWT_SECRET!, "HS256") as any;
        c.set("jwtPayload", decoded);

        // Check if user account is still active
        const userId = decoded.sub as number;
        const userRecord = await db.select().from(users).where(eq(users.id, userId));

        if (userRecord.length === 0) {
            return c.json({ message: "User not found" }, 404);
        }

        const user = userRecord[0];

        // If user is disabled, reject the request
        if (!user.isActive) {
            return c.json({
                message: "Your account has been disabled",
                status: "disabled",
                reason: user.disabledReason,
                disabledAt: user.disabledAt
            }, 403);
        }

        await next();
    } catch (error) {
        return c.json({ message: "Invalid token" }, 401);
    }
};

// Check if user is Admin
export const adminMiddleware = async (c: any, next: any) => {
    const payload = c.get("jwtPayload");
    if (!payload || payload.role !== "admin") {
        return c.json({ message: "Forbidden: Admin access required" }, 403);
    }
    await next();
};

// Validate thông tin đăng ký
const registerSchema = z.object({
    full_name: z.string().min(3).max(255),
    email: z.string().email(),
    phone_number: z.string().optional(),
    date_of_birth: z.string().optional(),
    password: z.string().min(6).max(255),
    otp: z.string().length(6),
})

// ----------------- API đăng ký -----------------
authRouter.post(
    "/register",
    zValidator('json', registerSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({ field: i.path[0], message: i.message }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const { full_name, email, password, otp, phone_number, date_of_birth } = c.req.valid('json');

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await db.select().from(users).where(eq(users.email, email));
            if (existingUser.length > 0) {
                return c.json({ message: "Email already exists" }, 400);
            }

            // Kiểm tra OTP
            const otpRecord = await db.select().from(otps).where(eq(otps.email, email));
            if (otpRecord.length === 0) {
                return c.json({ message: "Please request an OTP first" }, 400);
            }

            // Tìm OTP chưa dùng, kiểu registration
            const latestOtp = otpRecord.find(o => o.type === "registration" && !o.is_used);

            if (!latestOtp) {
                return c.json({ message: "Invalid OTP" }, 400);
            }

            if (latestOtp.otp !== otp) {
                return c.json({ message: "Invalid OTP" }, 400);
            }

            if (new Date() > latestOtp.expiresAt) {
                return c.json({ message: "OTP has expired" }, 400);
            }

            // Hash mật khẩu
            const hashedPassword = bcrypt.hashSync(password, 10);

            // Tạo user
            const user = await db.insert(users).values({
                full_name,
                email,
                password_hash: hashedPassword,
                phone_number,
                date_of_birth,
            }).returning({
                full_name: users.full_name,
                email: users.email,
                createdAt: users.createdAt
            });

            // Xóa OTP sau khi sử dụng thành công
            await db
                .update(otps)
                .set({ is_used: true })
                .where(eq(otps.id, latestOtp.id));

            // Create admin notification
            await createNotification({
                type: "account_created",
                userName: full_name,
                message: `${full_name} created a new account`,
            });

            return c.json({ message: "User registered successfully", user }, 201);

            //Báo lỗi
        } catch (error) {
            console.log(error);
            return c.json({ message: "Server error" }, 500);
        }
    })

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(255),
})

//Validate thông tin gửi OTP
const sendOtpSchema = z.object({
    email: z.string().email(),
})

// ----------------- API gửi OTP (đăng ký) -----------------
authRouter.post(
    "/send-otp",
    zValidator('json', sendOtpSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({ field: i.path[0], message: i.message }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const { email } = c.req.valid('json');

            // Kiểm tra email đã tồn tại trong hệ thống
            const existingUser = await db.select().from(users).where(eq(users.email, email));
            if (existingUser.length > 0) {
                return c.json({ message: "Email already exists" }, 400);
            }

            // Xóa OTP cũ nếu có để tránh spam
            await db.delete(otps).where(eq(otps.email, email));

            // Sinh mã OTP 6 số ngẫu nhiên
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Thiết lập thời gian hết hạn (10 phút)
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            // Lưu vào DB
            await db.insert(otps).values({
                email,
                otp: otpCode,
                type: "registration",
                is_used: false,
                expiresAt,
            });

            // Gửi email thật qua Nodemailer
            await sendOtpEmail(email, otpCode);

            return c.json({ message: "OTP sent successfully" }, 200);

        } catch (error) {
            console.error(error);
            return c.json({ message: "Server error" }, 500);
        }
    }
)

authRouter.post(
    "/login",
    zValidator('json', loginSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({ field: i.path[0], message: i.message }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const { email, password } = c.req.valid('json');

            // Kiểm tra email có tồn tại không
            const user = await db.select().from(users).where(eq(users.email, email));
            if (user.length === 0) {
                return c.json({ code: "EMAIL_NOT_FOUND", message: "Invalid email or password" }, 401);
            }

            const currentUser = user[0];

            // Check if user is active
            if (!currentUser.isActive) {
                return c.json({
                    message: "Your account is currently inactive. Please contact support.",
                    status: "inactive"
                }, 403);
            }

            // Kiểm tra mật khẩu
            const isPasswordValid = bcrypt.compareSync(password, currentUser.password_hash);
            if (!isPasswordValid) {
                return c.json({ code: "INCORRECT_PASSWORD", message: "Invalid email or password" }, 401);
            }

            // Tạo token (hết hạn sau 24 giờ)
            const payload = {
                sub: currentUser.id,
                email: currentUser.email,
                full_name: currentUser.full_name,
                role: currentUser.role,
                isActive: currentUser.isActive,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            }

            const token = await sign(payload, process.env.JWT_SECRET!);

            // Trả token
            return c.json({ message: "Login successful", token })

            //Báo lỗi
        } catch (error) {
            console.log(error);
            return c.json({ message: "Server error" }, 500);
        }
    })
// Validation schema cho change password
const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string()
        .min(6, "New password must be at least 6 characters")
        .max(255),
    confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}).refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
});

// Change Password API
authRouter.put(
    "/change-password",
    authMiddleware,
    zValidator('json', changePasswordSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({
                    field: i.path[0],
                    message: i.message
                }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const { oldPassword, newPassword } = c.req.valid('json');
            const jwtPayload = c.get("jwtPayload") as any;
            const userId = jwtPayload.sub as number;

            // Lấy user từ DB
            const userRecord = await db
                .select()
                .from(users)
                .where(eq(users.id, userId));

            if (userRecord.length === 0) {
                return c.json({ message: "User not found" }, 404);
            }

            const user = userRecord[0];

            // Kiểm tra mật khẩu cũ
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
            if (!isPasswordValid) {
                return c.json({ message: "Old password is incorrect" }, 400);
            }

            // Hash mật khẩu mới
            const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

            // Update password + updatedAt trong DB
            await db
                .update(users)
                .set({
                    password_hash: hashedNewPassword,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            // Create admin notification for password change
            await createNotification({
                type: "password_changed",
                userId: userId,
                userName: user.full_name,
                userAvatar: user.avatar_url || undefined,
                message: `${user.full_name} changed their password`,
            });

            return c.json({
                message: "Password changed successfully",
                data: {
                    email: user.email,
                    updatedAt: new Date()
                }
            }, 200);

        } catch (error) {
            console.error("Change password error:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);
// ----------------- API lấy thông tin Profile -----------------
authRouter.get("/me", authMiddleware, async (c) => {
    try {
        const userPayload = c.get("jwtPayload") as { sub: number };
        const userId = userPayload.sub;

        const userRecord = await db.select().from(users).where(eq(users.id, userId));
        if (userRecord.length === 0) {
            return c.json({ message: "User not found" }, 404);
        }

        const u = userRecord[0];

        let signedAvatarUrl = u.avatar_url;
        if (signedAvatarUrl && !signedAvatarUrl.startsWith("http")) {
            signedAvatarUrl = await getPresignedDownloadUrl(signedAvatarUrl);
        }

        // Don't send password hash to client
        const profile = {
            id: u.id,
            role: u.role,
            full_name: u.full_name,
            email: u.email,
            phone_number: u.phone_number,
            date_of_birth: u.date_of_birth,
            address: u.address,
            avatar_url: u.avatar_url, // raw key
            avatar_view_url: signedAvatarUrl, // signed URL for display
            createdAt: u.createdAt,
        };

        return c.json({ profile }, 200);

    } catch (error) {
        console.error("Error fetching profile:", error);
        return c.json({ message: "Server error" }, 500);
    }
});

// Validate thông tin cập nhật Profile
const updateProfileSchema = z.object({
    full_name: z.string({ error: "Name cannot be empty." })
        .min(1, "Name cannot be empty.")
        .max(255),
    email: z.string({ error: "Email address is required." })
        .min(1, "Email address is required.")
        .email("Invalid email format."),
    phone_number: z.string()
        .refine(val => !val || /^\d+$/.test(val), {
            message: "Phone number must be numeric."
        })
        .optional(),
    date_of_birth: z.string({ error: "DoB cannot be empty" })
        .min(1, "DoB cannot be empty"),
    address: z.string().optional(),
    avatar_url: z.string().optional()
});

// ----------------- API cập nhật thông tin Profile -----------------
authRouter.put(
    "/me",
    authMiddleware,
    zValidator('json', updateProfileSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({ field: i.path[0], message: i.message }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const userPayload = c.get("jwtPayload") as { sub: number };
            const userId = userPayload.sub;
            const updateData = c.req.valid('json');

            // Find user
            const userRecord = await db.select().from(users).where(eq(users.id, userId));
            if (userRecord.length === 0) {
                return c.json({ message: "User not found" }, 404);
            }

            const currentUser = userRecord[0];

            // If email is being changed, check if new email is already taken
            if (updateData.email && updateData.email !== currentUser.email) {
                const existingUser = await db.select().from(users).where(eq(users.email, updateData.email));
                if (existingUser.length > 0) {
                    return c.json({ message: "Email already exists" }, 400);
                }
            }

            // Update user
            const [updatedUser] = await db.update(users)
                .set({
                    ...updateData,
                    updatedAt: new Date()
                })
                .where(eq(users.id, userId))
                .returning({
                    id: users.id,
                    full_name: users.full_name,
                    email: users.email,
                    phone_number: users.phone_number,
                    date_of_birth: users.date_of_birth,
                    address: users.address,
                    avatar_url: users.avatar_url, // raw key
                });

            let signedAvatarUrl = updatedUser.avatar_url;
            if (signedAvatarUrl && !signedAvatarUrl.startsWith("http")) {
                signedAvatarUrl = await getPresignedDownloadUrl(signedAvatarUrl);
            }

            return c.json({
                message: "Profile updated successfully",
                profile: {
                    ...updatedUser,
                    avatar_view_url: signedAvatarUrl
                }
            }, 200);

        } catch (error) {
            console.error("Error updating profile:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// ----------------- ADMIN: Quản lý User -----------------

// Lấy danh sách tất cả người dùng
authRouter.get("/users", authMiddleware, adminMiddleware, async (c) => {
    try {
        const allUsers = await db.select().from(users);

        // Loại bỏ mật khẩu trước khi gửi về client
        const safeUsers = allUsers.map(u => {
            const { password_hash, ...safeUser } = u;
            return safeUser;
        });

        return c.json({ users: safeUsers }, 200);
    } catch (error) {
        console.error("Error fetching users:", error);
        return c.json({ message: "Server error" }, 500);
    }
});

// Lấy thông tin chi tiết 1 người dùng
authRouter.get("/users/:id", authMiddleware, adminMiddleware, async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        const userRecord = await db.select().from(users).where(eq(users.id, id));

        if (userRecord.length === 0) {
            return c.json({ message: "User not found" }, 404);
        }

        const { password_hash, ...safeUser } = userRecord[0];
        return c.json({ user: safeUser }, 200);
    } catch (error) {
        console.error("Error fetching user:", error);
        return c.json({ message: "Server error" }, 500);
    }
});

// Admin cập nhật thông tin người dùng (role, status, profile)
const adminUpdateUserSchema = z.object({
    full_name: z.string().min(3).max(255).optional(),
    email: z.string().email().optional(),
    role: z.enum(["user", "admin"]).optional(),
    isActive: z.boolean().optional(),
    phone_number: z.string().optional(),
    address: z.string().optional(),
});

authRouter.put(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    zValidator('json', adminUpdateUserSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "Validation failed", errors: result.error.issues }, 400);
        }
    }),
    async (c) => {
        try {
            const id = parseInt(c.req.param("id"));
            const updateData = c.req.valid('json');

            const [updatedUser] = await db.update(users)
                .set({ ...updateData, updatedAt: new Date() })
                .where(eq(users.id, id))
                .returning();

            if (!updatedUser) {
                return c.json({ message: "User not found" }, 404);
            }

            const { password_hash, ...safeUser } = updatedUser;
            return c.json({ message: "User updated successfully", user: safeUser }, 200);
        } catch (error) {
            console.error("Error updating user by admin:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// Xóa người dùng
authRouter.delete("/users/:id", authMiddleware, adminMiddleware, async (c) => {
    try {
        const id = parseInt(c.req.param("id"));
        const adminPayload = c.get("jwtPayload") as any;
        const adminId = adminPayload.sub as number;

        // Kiểm tra xem user có tồn tại không
        const userRecord = await db.select().from(users).where(eq(users.id, id));
        if (userRecord.length === 0) {
            return c.json({ message: "User not found" }, 404);
        }

        const targetUser = userRecord[0];
        const userDataSnapshot = getUserDataSnapshot(targetUser);

        // Cannot delete admin accounts
        if (targetUser.role === "admin") {
            await logAudit(c, {
                action: "user_deleted",
                performedBy: adminId,
                targetUser: id,
                entityType: "user",
                entityId: id,
                description: `Failed to delete admin user ${targetUser.email}`,
                dataBefore: userDataSnapshot,
                status: "failed",
                errorMessage: "Cannot delete admin accounts",
            });
            return c.json({ message: "Cannot delete admin accounts" }, 400);
        }

        // Cannot self-delete
        if (adminId === id) {
            await logAudit(c, {
                action: "user_deleted",
                performedBy: adminId,
                targetUser: id,
                entityType: "user",
                entityId: id,
                description: `Admin attempted to delete own account`,
                dataBefore: userDataSnapshot,
                status: "failed",
                errorMessage: "Cannot delete own account",
            });
            return c.json({ message: "You cannot delete your own account" }, 400);
        }

        // Xóa
        await db.delete(users).where(eq(users.id, id));

        // Log successful deletion
        await logAudit(c, {
            action: "user_deleted",
            performedBy: adminId,
            targetUser: id,
            entityType: "user",
            entityId: id,
            description: `Deleted user: ${targetUser.email} (${targetUser.full_name})`,
            dataBefore: userDataSnapshot,
            status: "success",
        });

        // Create admin notification
        await createNotification({
            type: "account_deleted",
            userId: id,
            userName: targetUser.full_name,
            userAvatar: targetUser.avatar_url || undefined,
            message: `${targetUser.full_name} account is deleted`,
        });

        return c.json({ message: "User deleted successfully" }, 200);
    } catch (error) {
        console.error("Error deleting user:", error);
        return c.json({ message: "Server error" }, 500);
    }
});

// ----------------- API Request Reset Password -----------------
const requestResetSchema = z.object({
    email: z.string().email(),
});

authRouter.post(
    "/request-reset",
    zValidator('json', requestResetSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "Validation failed", errors: result.error.issues }, 400);
        }
    }),
    async (c) => {
        try {
            const { email } = c.req.valid('json');

            // Find user
            const userRecord = await db.select().from(users).where(eq(users.email, email));
            if (userRecord.length === 0) {
                // To prevent email enumeration, we still return success message
                return c.json({ message: "If the email is registered, a password reset link has been sent." }, 200);
            }

            const user = userRecord[0];
            if (!user.isActive) {
                return c.json({
                    message: "Your account has been disabled. Please contact support.",
                    status: "disabled"
                }, 403);
            }

            // Generate token
            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

            // Delete old reset tokens for this email if any
            await db.delete(otps).where(eq(otps.email, email));

            // Save new token
            await db.insert(otps).values({
                email,
                otp: token,
                expiresAt,
            });

            // Send email
            const resetLink = `http://localhost:3000/user/reset-password?token=${token}`;
            await sendResetPasswordEmail(email, resetLink);

            return c.json({ message: "Password reset link sent successfully." }, 200);
        } catch (error) {
            console.error("Error requesting reset:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// ----------------- API Reset Password -----------------
const resetPasswordSchema = z.object({
    token: z.string().min(10),
    new_password: z.string().min(6).max(255),
});

authRouter.post(
    "/reset-password",
    zValidator('json', resetPasswordSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "Validation failed", errors: result.error.issues }, 400);
        }
    }),
    async (c) => {
        try {
            const { token, new_password } = c.req.valid('json');

            // Find token
            const otpRecord = await db.select().from(otps).where(eq(otps.otp, token));
            if (otpRecord.length === 0) {
                return c.json({ message: "Invalid or expired token" }, 400);
            }

            const latestOtp = otpRecord[0];

            if (new Date() > latestOtp.expiresAt) {
                await db.delete(otps).where(eq(otps.otp, token));
                return c.json({ message: "Token has expired" }, 400);
            }

            // Find user
            const email = latestOtp.email;
            const userRecord = await db.select().from(users).where(eq(users.email, email));
            if (userRecord.length === 0) {
                return c.json({ message: "User not found" }, 404);
            }

            const user = userRecord[0];
            if (!user.isActive) {
                return c.json({
                    message: "Your account has been disabled. Please contact support.",
                    status: "disabled"
                }, 403);
            }

            // Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
            if (bcrypt.compareSync(new_password, user.password_hash)) {
                return c.json({ message: "New password must be different from the old password" }, 400);
            }

            // Update password
            const hashedPassword = bcrypt.hashSync(new_password, 10);
            await db.update(users)
                .set({ password_hash: hashedPassword, updatedAt: new Date() })
                .where(eq(users.email, email));

            // Delete used token
            await db.delete(otps).where(eq(otps.otp, token));

            return c.json({ message: "Password reset successful." }, 200);
        } catch (error) {
            console.error("Error resetting password:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// ================== QUÊN MẬT KHẨU BẰNG OTP ==================

// Validation schema cho forgot password
const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
});

// API 1: Gửi OTP qua email cho forgot password
authRouter.post(
    "/forgot-password",
    zValidator('json', forgotPasswordSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({ field: i.path[0], message: i.message }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const { email } = c.req.valid('json');

            // Kiểm tra email có tồn tại không
            const userRecord = await db.select().from(users).where(eq(users.email, email));
            if (userRecord.length === 0) {
                // Return success message để tránh email enumeration
                return c.json({ message: "If the email is registered, an OTP has been sent." }, 200);
            }

            const user = userRecord[0];

            if (!user.isActive) {
                return c.json({
                    message: "Your account has been disabled. Please contact support.",
                    status: "disabled"
                }, 403);
            }

            // Xóa OTP cũ nếu có
            await db.delete(otps).where(
                eq(otps.email, email)
            );

            // Sinh OTP 6 chữ số
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Thiết lập thời gian hết hạn (5 phút)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            // Lưu OTP vào DB với type "reset_password"
            await db.insert(otps).values({
                email,
                otp: otpCode,
                type: "reset_password",
                is_used: false,
                userId: user.id,
                expiresAt,
            });

            // Gửi email OTP
            await sendOtpEmail(email, otpCode);

            return c.json({
                message: "OTP sent successfully to your email",
                expiresIn: 300 // 5 minutes in seconds
            }, 200);

        } catch (error) {
            console.error("Forgot password error:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// Validation schema cho verify OTP + reset password
const verifyResetOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(255),
    confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// API 2: Verify OTP + Reset Password
authRouter.post(
    "/verify-reset-otp",
    zValidator('json', verifyResetOtpSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({
                    field: i.path[0],
                    message: i.message
                }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const { email, otp, newPassword } = c.req.valid('json');

            // Kiểm tra OTP có tồn tại không
            const otpRecords = await db
                .select()
                .from(otps)
                .where(eq(otps.email, email));

            if (otpRecords.length === 0) {
                return c.json({ message: "OTP not found. Please request a new one." }, 400);
            }

            // Tìm OTP chưa dùng, kiểu reset_password
            const validOtp = otpRecords.find(
                o => o.otp === otp && o.type === "reset_password" && !o.is_used
            );

            if (!validOtp) {
                return c.json({ message: "Invalid OTP" }, 400);
            }

            // Kiểm tra OTP hết hạn
            if (new Date() > validOtp.expiresAt) {
                return c.json({ message: "OTP has expired" }, 400);
            }

            // Kiểm tra user có tồn tại không
            const userRecord = await db
                .select()
                .from(users)
                .where(eq(users.email, email));

            if (userRecord.length === 0) {
                return c.json({ message: "User not found" }, 404);
            }

            const user = userRecord[0];

            if (!user.isActive) {
                return c.json({
                    message: "Your account has been disabled. Please contact support.",
                    status: "disabled"
                }, 403);
            }

            // Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
            if (bcrypt.compareSync(newPassword, user.password_hash)) {
                return c.json({ message: "New password must be different from the old password" }, 400);
            }

            // Hash mật khẩu mới
            const hashedPassword = bcrypt.hashSync(newPassword, 10);

            // Update mật khẩu user
            await db
                .update(users)
                .set({
                    password_hash: hashedPassword,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));

            // Đánh dấu OTP là đã dùng
            await db
                .update(otps)
                .set({ is_used: true })
                .where(eq(otps.id, validOtp.id));

            // Xóa tất cả OTP cũ của user này
            await db
                .delete(otps)
                .where(eq(otps.email, email));

            // Create admin notification for password reset
            await createNotification({
                type: "password_changed",
                userId: user.id,
                userName: user.full_name,
                userAvatar: user.avatar_url || undefined,
                message: `${user.full_name} reset their password`,
            });

            return c.json({
                message: "Password reset successfully",
                data: {
                    email: user.email,
                    updatedAt: new Date()
                }
            }, 200);

        } catch (error) {
            console.error("Verify reset OTP error:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// ================== ADMIN: DISABLE/ENABLE USER ==================

// Validation schema for disable user
const disableUserSchema = z.object({
    reason: z.string().min(1, "Disable reason is required").max(500),
});

// API: Admin disable user
authRouter.post(
    "/users/:id/disable",
    authMiddleware,
    adminMiddleware,
    zValidator('json', disableUserSchema, (result, c) => {
        if (!result.success) {
            return c.json({
                message: "Validation failed",
                errors: result.error.issues.map(i => ({
                    field: i.path[0],
                    message: i.message
                }))
            }, 400);
        }
    }),
    async (c) => {
        try {
            const userId = parseInt(c.req.param("id"));
            const { reason } = c.req.valid('json');
            const adminPayload = c.get("jwtPayload") as any;
            const adminId = adminPayload.sub as number;

            // Check if target user exists
            const targetUserRecord = await db
                .select()
                .from(users)
                .where(eq(users.id, userId));

            if (targetUserRecord.length === 0) {
                return c.json({ message: "User not found" }, 404);
            }

            const targetUser = targetUserRecord[0];
            const userDataBefore = getUserDataSnapshot(targetUser);

            // Cannot disable admin accounts
            if (targetUser.role === "admin") {
                await logAudit(c, {
                    action: "user_disabled",
                    performedBy: adminId,
                    targetUser: userId,
                    entityType: "user",
                    entityId: userId,
                    description: `Failed to disable admin user ${targetUser.email}`,
                    status: "failed",
                    errorMessage: "Cannot disable admin accounts",
                });
                return c.json({ message: "Cannot disable admin accounts" }, 400);
            }

            // Cannot self-disable
            if (adminId === userId) {
                await logAudit(c, {
                    action: "user_disabled",
                    performedBy: adminId,
                    targetUser: userId,
                    entityType: "user",
                    entityId: userId,
                    description: `Admin attempted to disable own account`,
                    status: "failed",
                    errorMessage: "Cannot disable own account",
                });
                return c.json({ message: "You cannot disable your own account" }, 400);
            }

            // Already disabled
            if (!targetUser.isActive) {
                await logAudit(c, {
                    action: "user_disabled",
                    performedBy: adminId,
                    targetUser: userId,
                    entityType: "user",
                    entityId: userId,
                    description: `Attempted to disable already disabled user ${targetUser.email}`,
                    status: "failed",
                    errorMessage: "User is already disabled",
                });
                return c.json({ message: "User is already disabled" }, 400);
            }

            const userDataAfter = {
                ...userDataBefore,
                isActive: false,
            };

            // Disable user
            await db
                .update(users)
                .set({
                    isActive: false,
                    disabledAt: new Date(),
                    disabledReason: reason,
                    disabledBy: adminId,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            // Log successful disable
            const changeDiff = createChangeDiff(userDataBefore, userDataAfter);
            await logAudit(c, {
                action: "user_disabled",
                performedBy: adminId,
                targetUser: userId,
                entityType: "user",
                entityId: userId,
                description: `Disabled user: ${targetUser.email}. Reason: ${reason}`,
                dataBefore: userDataBefore,
                dataAfter: userDataAfter,
                status: "success",
            });

            return c.json({
                message: "User disabled successfully",
                data: {
                    userId,
                    email: targetUser.email,
                    fullName: targetUser.full_name,
                    disabledAt: new Date(),
                    reason
                }
            }, 200);

        } catch (error) {
            console.error("Disable user error:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// API: Admin enable user (re-activate)
authRouter.post(
    "/users/:id/enable",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const userId = parseInt(c.req.param("id"));
            const adminPayload = c.get("jwtPayload") as any;
            const adminId = adminPayload.sub as number;

            // Check if target user exists
            const targetUserRecord = await db
                .select()
                .from(users)
                .where(eq(users.id, userId));

            if (targetUserRecord.length === 0) {
                return c.json({ message: "User not found" }, 404);
            }

            const targetUser = targetUserRecord[0];
            const userDataBefore = getUserDataSnapshot(targetUser);

            // Already enabled
            if (targetUser.isActive) {
                await logAudit(c, {
                    action: "user_enabled",
                    performedBy: adminId,
                    targetUser: userId,
                    entityType: "user",
                    entityId: userId,
                    description: `Attempted to enable already active user ${targetUser.email}`,
                    status: "failed",
                    errorMessage: "User is already active",
                });
                return c.json({ message: "User is already active" }, 400);
            }

            const userDataAfter = {
                ...userDataBefore,
                isActive: true,
            };

            // Enable user
            await db
                .update(users)
                .set({
                    isActive: true,
                    disabledAt: null,
                    disabledReason: null,
                    disabledBy: null,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, userId));

            // Log successful enable
            await logAudit(c, {
                action: "user_enabled",
                performedBy: adminId,
                targetUser: userId,
                entityType: "user",
                entityId: userId,
                description: `Enabled user: ${targetUser.email} (${targetUser.full_name})`,
                dataBefore: userDataBefore,
                dataAfter: userDataAfter,
                status: "success",
            });

            return c.json({
                message: "User enabled successfully",
                data: {
                    userId,
                    email: targetUser.email,
                    fullName: targetUser.full_name,
                    enabledAt: new Date()
                }
            }, 200);

        } catch (error) {
            console.error("Enable user error:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// API: Get user disable status
authRouter.get(
    "/users/:id/status",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const userId = parseInt(c.req.param("id"));

            const userRecord = await db
                .select({
                    id: users.id,
                    email: users.email,
                    full_name: users.full_name,
                    isActive: users.isActive,
                    disabledAt: users.disabledAt,
                    disabledReason: users.disabledReason,
                    disabledBy: users.disabledBy,
                })
                .from(users)
                .where(eq(users.id, userId));

            if (userRecord.length === 0) {
                return c.json({ message: "User not found" }, 404);
            }

            return c.json({
                status: userRecord[0]
            }, 200);

        } catch (error) {
            console.error("Get user status error:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// ================== AUDIT LOGS ==================

// API: Get audit logs for a specific user
authRouter.get(
    "/audit-logs/user/:userId",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const userId = parseInt(c.req.param("userId"));
            const page = parseInt(c.req.query("page") || "1");
            const limit = parseInt(c.req.query("limit") || "20");
            const offset = (page - 1) * limit;

            // Get audit logs for this user
            const logs = await db
                .select()
                .from(auditLogs)
                .where(eq(auditLogs.targetUser, userId))
                .orderBy((t) => t.createdAt)
                .limit(limit)
                .offset(offset);

            // Get total count
            const countResult = await db
                .select()
                .from(auditLogs)
                .where(eq(auditLogs.targetUser, userId));

            return c.json({
                logs,
                pagination: {
                    page,
                    limit,
                    total: countResult.length,
                    pages: Math.ceil(countResult.length / limit),
                }
            }, 200);

        } catch (error) {
            console.error("Error fetching audit logs:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// API: Get audit logs by action type
authRouter.get(
    "/audit-logs/action/:action",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const action = c.req.param("action");
            const page = parseInt(c.req.query("page") || "1");
            const limit = parseInt(c.req.query("limit") || "20");
            const offset = (page - 1) * limit;

            // Get audit logs for this action
            const logs = await db
                .select()
                .from(auditLogs)
                .where(eq(auditLogs.action, action as any))
                .orderBy((t) => t.createdAt)
                .limit(limit)
                .offset(offset);

            // Get total count
            const countResult = await db
                .select()
                .from(auditLogs)
                .where(eq(auditLogs.action, action as any));

            return c.json({
                logs,
                pagination: {
                    page,
                    limit,
                    total: countResult.length,
                    pages: Math.ceil(countResult.length / limit),
                }
            }, 200);

        } catch (error) {
            console.error("Error fetching audit logs:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

// API: Get all audit logs (admin only)
authRouter.get(
    "/audit-logs",
    authMiddleware,
    adminMiddleware,
    async (c) => {
        try {
            const page = parseInt(c.req.query("page") || "1");
            const limit = parseInt(c.req.query("limit") || "20");
            const offset = (page - 1) * limit;

            // Get all audit logs
            const logs = await db
                .select()
                .from(auditLogs)
                .orderBy((t) => t.createdAt)
                .limit(limit)
                .offset(offset);

            // Get total count
            const countResult = await db.select().from(auditLogs);

            return c.json({
                logs,
                pagination: {
                    page,
                    limit,
                    total: countResult.length,
                    pages: Math.ceil(countResult.length / limit),
                }
            }, 200);

        } catch (error) {
            console.error("Error fetching audit logs:", error);
            return c.json({ message: "Server error" }, 500);
        }
    }
);

export default authRouter;
