import { Hono } from "hono";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, otps } from "../db/schema.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { sign } from "hono/jwt";

const authRouter = new Hono();

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

// ----------------- API gửi OTP -----------------
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

            // Kiểm tra email đã tồn tại trong hệ thống (nếu là đăng ký thì email chưa được tồn tại)
            const existingUser = await db.select().from(users).where(eq(users.email, email));
            if (existingUser.length > 0) {
                return c.json({ message: "Email already exists" }, 400);
            }

            // Xóa OTP cũ nếu có để tránh spam
            await db.delete(otps).where(eq(otps.email, email));

            // Sinh mã OTP 6 số ngẫu nhiên
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Thiết lập thời gian hết hạn (ví dụ: 10 phút = 10 * 60 * 1000 ms)
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

            // Lưu vào DB
            await db.insert(otps).values({
                email,
                otp: otpCode,
                expiresAt,
            });

            // Ghi log ra console thay vì gửi email thật
            console.log(`\n========================================`);
            console.log(`[MOCK EMAIL] Gửi OTP đến: ${email}`);
            console.log(`[MOCK EMAIL] Mã OTP của bạn là: ${otpCode}`);
            console.log(`[MOCK EMAIL] Sẽ hết hạn vào: ${expiresAt.toLocaleString()}`);
            console.log(`========================================\n`);

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

            // Kiểm tra mật khẩu
            const isPasswordValid = bcrypt.compareSync(password, user[0].password_hash);
            if (!isPasswordValid) {
                return c.json({ message: "Invalid login credentials" }, 401);
            }

            // Tạo token (hết hạn sau 24 giờ)
            const payload = {
                sub: user[0].id, // Subject (thường là ID của user)
                email: user[0].email,
                full_name: user[0].full_name,
                role: user[0].role,
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

export default authRouter;
