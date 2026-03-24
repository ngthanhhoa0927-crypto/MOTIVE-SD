import { Hono } from "hono";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, otps } from "../db/schema.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { sign, verify } from "hono/jwt";
import { sendOtpEmail } from "../utils/email.js";
import { getPresignedDownloadUrl } from "../utils/s3.js";

const authRouter = new Hono();

// Middleware to protect routes that require authentication
export const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ message: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = await verify(token, process.env.JWT_SECRET!, "HS256");
        c.set("jwtPayload", decoded);
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

            const latestOtp = otpRecord[0];

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
            await db.delete(otps).where(eq(otps.email, email));

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
                return c.json({ message: "Invalid login credentials" }, 401);
            }

            const currentUser = user[0];

            // Check if user is currently locked out
            if (currentUser.locked_until && new Date() < currentUser.locked_until) {
                return c.json({
                    message: "Your are temporarily locked. Please try again for 30 minutes",
                    status: "locked"
                }, 403);
            }

            // Kiểm tra mật khẩu
            const isPasswordValid = bcrypt.compareSync(password, currentUser.password_hash);
            if (!isPasswordValid) {
                const newAttempts = (currentUser.failed_login_attempts || 0) + 1;
                const updateData: any = {
                    failed_login_attempts: newAttempts,
                    updatedAt: new Date()
                };

                // Lock after 5 failed attempts
                if (newAttempts >= 5) {
                    updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                }

                await db.update(users)
                    .set(updateData)
                    .where(eq(users.id, currentUser.id));

                if (newAttempts >= 5) {
                    return c.json({
                        message: "Your are temporarily locked. Please try again for 30 minutes",
                        status: "locked"
                    }, 403);
                }

                return c.json({ message: "Invalid login credentials" }, 401);
            }

            // Reset failed attempts on successful login
            await db.update(users)
                .set({
                    failed_login_attempts: 0,
                    locked_until: null,
                    updatedAt: new Date()
                })
                .where(eq(users.id, currentUser.id));

            // Tạo token (hết hạn sau 24 giờ)
            const payload = {
                sub: currentUser.id,
                email: currentUser.email,
                full_name: currentUser.full_name,
                role: currentUser.role,
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

        // Kiểm tra xem user có tồn tại không
        const userRecord = await db.select().from(users).where(eq(users.id, id));
        if (userRecord.length === 0) {
            return c.json({ message: "User not found" }, 404);
        }

        // Xóa
        await db.delete(users).where(eq(users.id, id));

        return c.json({ message: "User deleted successfully" }, 200);
    } catch (error) {
        console.error("Error deleting user:", error);
        return c.json({ message: "Server error" }, 500);
    }
});

export default authRouter;
