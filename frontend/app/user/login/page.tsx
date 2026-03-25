"use client";

import { useState, useEffect } from "react";
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
    const [errorType, setErrorType] = useState<"locked" | "inactive" | "error" | "">("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [hasAttemptedAutoLogin, setHasAttemptedAutoLogin] = useState(false);

    useEffect(() => {
        const checkLockStatus = () => {
            if (!email.trim()) {
                if (errorType === "locked") {
                    setError("");
                    setErrorType("");
                }
                return;
            }
            const lockedUntil = localStorage.getItem(`locked_until_${email}`);
            if (lockedUntil && Date.now() < parseInt(lockedUntil)) {
                const minutesLeft = Math.ceil((parseInt(lockedUntil) - Date.now()) / 60000);
                setErrorType("locked");
                setError(`Too many login attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`);
            } else if (lockedUntil && Date.now() >= parseInt(lockedUntil)) {
                localStorage.removeItem(`locked_until_${email}`);
                localStorage.removeItem(`failed_login_attempts_${email}`);
                if (errorType === "locked") {
                    setError("");
                    setErrorType("");
                }
            } else {
                if (errorType === "locked") {
                    setError("");
                    setErrorType("");
                }
            }
        };
        
        checkLockStatus();
        const interval = setInterval(checkLockStatus, 60000);
        return () => clearInterval(interval);
    }, [email, errorType]);

    useEffect(() => {
        if (!hasAttemptedAutoLogin) {
            setHasAttemptedAutoLogin(true);
            const savedEmail = localStorage.getItem("remembered_email");
            const savedPass = localStorage.getItem("remembered_password");
            
            if (savedEmail && savedPass) {
                setEmail(savedEmail);
                setPassword(savedPass);
                setRememberMe(true);
                performLogin(savedEmail, savedPass, true);
            }
        }
    }, [hasAttemptedAutoLogin]);

    const handleEmailBlur = () => {
        if (!email.trim()) {
            setEmailError("Email is required");
            return;
        }
        setEmailError("");
    };

    const performLogin = async (loginEmail: string, loginPass: string, isRemember: boolean = rememberMe) => {
        setError("");
        setErrorType("");
        setEmailError("");
        setPasswordError("");

        const lockedUntil = localStorage.getItem(`locked_until_${loginEmail}`);
        if (lockedUntil && Date.now() < parseInt(lockedUntil)) {
            const minutesLeft = Math.ceil((parseInt(lockedUntil) - Date.now()) / 60000);
            setErrorType("locked");
            setError(`Too many login attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`);
            return;
        } else if (lockedUntil && Date.now() >= parseInt(lockedUntil)) {
            localStorage.removeItem(`locked_until_${loginEmail}`);
            localStorage.removeItem(`failed_login_attempts_${loginEmail}`);
        }

        setIsLoading(true);

        const handleSuccess = () => {
            if (isRemember) {
                localStorage.setItem("remembered_email", loginEmail);
                localStorage.setItem("remembered_password", loginPass);
            } else {
                localStorage.removeItem("remembered_email");
                localStorage.removeItem("remembered_password");
            }
        };

        // DEV BYPASS: Allow logging in as admin without backend, xóa đi khi backend đã có acc admin
        if (loginEmail === "admin@motive.sd" && loginPass === "admin") {
            // Create a fake token with admin role
            const fakePayload = {
                sub: 1,
                email: "admin@motive.sd",
                full_name: "Admin User",
                role: "admin",
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            };
            const fakeToken = `fake.${btoa(JSON.stringify(fakePayload))}.fake`;

            localStorage.setItem("admin_token", fakeToken);
            handleSuccess();
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
            handleSuccess();
            router.push('/user/homepage');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, password: loginPass }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMsg = data.message?.toLowerCase() || "";

                if (data.code === 'EMAIL_NOT_FOUND') {
                    throw new Error("EMAIL_NOT_FOUND");
                }
                if (data.code === 'INCORRECT_PASSWORD') {
                    throw new Error("INCORRECT_PASSWORD");
                }

                // Specific checks for email not found or incorrect password
                if (errorMsg.includes("not found") || errorMsg.includes("exist") || errorMsg.includes("no user")) {
                    throw new Error("EMAIL_NOT_FOUND");
                }
                if (errorMsg.includes("password") || errorMsg.includes("incorrect") || errorMsg.includes("wrong") || errorMsg.includes("credential")) {
                    throw new Error("INCORRECT_PASSWORD");
                }

                // Handle specific status-based errors from backend if available
                if (data.status === 'suspended') {
                    throw new Error("SUSPENDED|Your account is temporarily suspended. Please contact support.");
                }
                if (data.status === 'banned') {
                    throw new Error("BANNED|Your account has been permanently banned due to violations of our terms.");
                }
                if (data.status === 'locked') {
                    throw new Error("LOCKED|" + (data.message || "Your account is temporarily locked."));
                }
                if (data.status === 'inactive') {
                    throw new Error("INACTIVE|" + (data.message || "Your account is inactive."));
                }
                throw new Error(data.message || "Login failed");
            }

            // Save token to localStorage — use separate keys for admin vs user
            try {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                if (payload.role === 'admin') {
                    localStorage.setItem("admin_token", data.token);
                    handleSuccess();
                    router.push('/admin/customers');
                    return;
                }
            } catch (e) {
                console.error("Failed to parse token", e);
            }

            // Normal user token
            localStorage.setItem("token", data.token);

            // Reset failed attempts on successful login
            localStorage.removeItem(`failed_login_attempts_${loginEmail}`);
            localStorage.removeItem(`locked_until_${loginEmail}`);

            handleSuccess();

            // Redirect to homepage for normal users
            router.push("/user/homepage");
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.message === "EMAIL_NOT_FOUND") {
                    setErrorType("error");
                    setError("Invalid email or password");
                } else if (err.message === "INCORRECT_PASSWORD") {
                    let attempts = parseInt(localStorage.getItem(`failed_login_attempts_${loginEmail}`) || "0");
                    attempts += 1;
                    localStorage.setItem(`failed_login_attempts_${loginEmail}`, attempts.toString());
                    
                    if (attempts >= 5) {
                        const lockTime = Date.now() + 30 * 60 * 1000;
                        localStorage.setItem(`locked_until_${loginEmail}`, lockTime.toString());
                        setErrorType("locked");
                        setError("Too many login attempts. Please try again in 30 minutes.");
                    } else {
                        setErrorType("error");
                        setError("Invalid email or password");
                    }
                } else if (err.message.startsWith("LOCKED|")) {
                    setErrorType("locked");
                    setError(err.message.split("|")[1]);
                } else if (err.message.startsWith("INACTIVE|")) {
                    setErrorType("inactive");
                    setError(err.message.split("|")[1]);
                } else if (err.message.startsWith("BANNED|")) {
                    setErrorType("error");
                    setError(err.message.split("|")[1]);
                } else if (err.message.startsWith("SUSPENDED|")) {
                    setErrorType("error");
                    setError(err.message.split("|")[1]);
                } else {
                    setErrorType("error");
                    setError(err.message);
                }
            } else {
                setErrorType("error");
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        performLogin(email, password, rememberMe);
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
                            <div className={`p-4 text-sm font-medium rounded-lg border mb-4 flex items-start gap-3 shadow-sm ${
                                errorType === 'locked' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                                errorType === 'inactive' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                                'bg-red-50 text-red-800 border-red-200'
                            }`}>
                                {errorType === 'locked' ? (
                                    <svg className="w-5 h-5 shrink-0 text-orange-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                ) : errorType === 'inactive' ? (
                                    <svg className="w-5 h-5 shrink-0 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                <div className="leading-relaxed">
                                    {error}
                                </div>
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

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 border-gray-300 rounded text-black focus:ring-black accent-black"
                                />
                                <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">
                                    Remember my Password
                                </label>
                            </div>
                            <Link href="/user/forgot-password" className="text-sm font-semibold text-gray-800 hover:text-black hover:underline transition-colors">
                                Forgot your password?
                            </Link>
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