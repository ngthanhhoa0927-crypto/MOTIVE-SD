import { Hono } from "hono";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { sign } from "hono/jwt";

const authRouter = new Hono();

// Validate thông tin đăng ký
const registerSchema = z.object({
    full_name: z.string().min(3).max(255),
    email: z.string().email(),
    password: z.string().min(6).max(255),
})

//Validate thông tin đăng nhập
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(255),
})


// ----------------- API đăng nhập -----------------
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

            //


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
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
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
            const { full_name, email, password } = c.req.valid('json');

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await db.select().from(users).where(eq(users.email, email));
            if (existingUser.length > 0) {
                return c.json({ message: "Email already exists" }, 400);
            }

            // Hash mật khẩu
            const hashedPassword = bcrypt.hashSync(password, 10);

            // Tạo user
            const user = await db.insert(users).values({
                full_name,
                email,
                password_hash: hashedPassword
            }).returning({
                full_name: users.full_name,
                email: users.email,
                createdAt: users.createdAt
            });
            return c.json({ message: "User registered successfully", user }, 201);

            //Báo lỗi
        } catch (error) {
            console.log(error);
            return c.json({ message: "Server error" }, 500);
        }
    })

export default authRouter;
