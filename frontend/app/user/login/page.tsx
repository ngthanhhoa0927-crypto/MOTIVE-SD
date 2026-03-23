"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Khởi tạo font chữ để giống với thiết kế
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailBlur = async () => {
        if (!email.trim()) {
            setEmailError("Email is required");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/auth/check-email?email=" + encodeURIComponent(email));
            if (res.ok) {
                const data = await res.json();
                if (data.exists === false || data.message === "Email does not exist") {
                    setEmailError("Email does not exist in the system.");
                    return;
                }
            } else if (res.status === 404) {
                setEmailError("Email does not exist in the system.");
                return;
            }
        } catch (err) {
            // Ignore API connection errors for front-end fallback
        }
        setEmailError("");
    };


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setEmailError("");
        setPasswordError("");

        setIsLoading(true);

        // DEV BYPASS: Allow logging in as admin without backend, xóa đi khi backend đã có acc admin
        if (email === "admin@motive.sd" && password === "admin") {
            // Create a fake token with admin role
            const fakePayload = {
                sub: 1,
                email: "admin@motive.sd",
                full_name: "Admin User",
                role: "admin",
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            };
            const fakeToken = `fake.${btoa(JSON.stringify(fakePayload))}.fake`;

            localStorage.setItem("token", fakeToken);
            router.push('/admin/customers');
            setIsLoading(false);
            return;
        }

        // DEV BYPASS: Allow logging in as normal user without backend
        if (email === "user@motive.sd" && password === "user123") {
            // Create a fake token with user role
            const fakePayload = {
                sub: 2,
                email: "user@motive.sd",
                full_name: "Regular User",
                role: "user",
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            };
            const fakeToken = `fake.${btoa(JSON.stringify(fakePayload))}.fake`;
            
            localStorage.setItem("token", fakeToken);
            router.push('/user/homepage');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMsg = data.message?.toLowerCase() || "";
                
                // Specific checks for email not found or incorrect password
                if (errorMsg.includes("not found") || errorMsg.includes("exist") || errorMsg.includes("no user")) {
                    throw new Error("EMAIL_NOT_FOUND");
                }
                if (errorMsg.includes("password") || errorMsg.includes("incorrect") || errorMsg.includes("wrong") || errorMsg.includes("credential")) {
                    throw new Error("INCORRECT_PASSWORD");
                }

                // Handle specific status-based errors from backend if available
                if (data.status === 'suspended') {
                    throw new Error("Your account is temporarily suspended. Please contact support.");
                }
                if (data.status === 'banned') {
                    throw new Error("Your account has been permanently banned due to violations of our terms.");
                }
                throw new Error(data.message || "Login failed");
            }

            // Save token to localStorage
            localStorage.setItem("token", data.token);

            // Check role from token and redirect
            try {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                if (payload.role === 'admin') {
                    router.push('/admin/customers');
                    return;
                }
            } catch (e) {
                console.error("Failed to parse token", e);
            }

            // Redirect to homepage for normal users
            router.push("/user/homepage");
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.message === "EMAIL_NOT_FOUND") {
                    setEmailError("Email does not exist in the system.");
                } else if (err.message === "INCORRECT_PASSWORD") {
                    setPasswordError("Incorrect password. Please try again.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex ${inter.className}`}>
            {/* Cột trái: Hình ảnh */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-200">
                {/* Bạn cần thay đường dẫn ảnh vào src */}
                <Image
                    src="/images/login-background.png"
                    alt="Fashion model in yellow tracksuit"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Logo */}
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    {/* Thay bằng icon/logo thật của Motive SD */}
                    <div className="text-white text-3xl font-bold tracking-tighter">
                        <Image src="/images/logo.png" alt="Motive SD" width={160} height={40} className="object-contain h-10 w-auto" />
                    </div>
                </div>
            </div>

            {/* Cột phải: Form đăng nhập */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F9F8F4] p-8 sm:p-12">
                <div className="w-full max-w-[420px]">
                    {/* Tiêu đề */}
                    <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
                        Welcome to Motive SD
                    </p>
                    <h1 className={`${playfair.className} text-5xl text-gray-900 mb-1`}>
                        Login to your
                    </h1>
                    <h2 className={`${playfair.className} text-5xl text-gray-500 italic mb-4`}>
                        Account
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        Join our curated community of fashion enthusiasts and unlock exclusive access to the amazing collections.
                    </p>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-100 mb-4">
                                {error}
                            </div>
                        )}
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError("");
                                }}
                                onBlur={handleEmailBlur}
                                className={`w-full py-3.5 pl-4 pr-12 bg-white border ${emailError ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200'} rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all`}
                                required
                            />
                            {/* User Icon */}
                            <svg className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${emailError ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {emailError && <p className="text-[10px] text-red-500 mt-1 ml-1">{emailError}</p>}
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (passwordError) setPasswordError("");
                                }}
                                className={`w-full py-3.5 pl-4 pr-12 bg-white border ${passwordError ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200'} rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium`}
                                required
                            />
                            {/* Eye Icon */}
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${passwordError ? 'text-red-400 hover:text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.048 10.048 0 012.746-4.53m4.234-1.921A9.982 9.982 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-4.223-4.223L3 3m10.8-1.2l-4.2 4.2M12 15a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                            {passwordError && <p className="text-[10px] text-red-500 mt-1 ml-1">{passwordError}</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 border-gray-300 rounded text-black focus:ring-black accent-black"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">
                                Remember my Password
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email.trim() || !password.trim()}
                            className={`w-full py-4 mt-4 rounded-md text-sm font-semibold tracking-widest uppercase transition-colors ${isLoading || !email.trim() || !password.trim() ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#2C2B29] hover:bg-black text-white"}`}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {/* Footer Text */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Do not have an account? <Link href="/user/signup" className="text-gray-900 font-semibold hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}