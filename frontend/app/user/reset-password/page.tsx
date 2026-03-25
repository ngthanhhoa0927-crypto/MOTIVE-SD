"use client";

import { useState } from "react";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please try again.");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8000/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to reset password");
            }
            
            // Allow user to login immediately instead of waiting for 30 minutes
            // Clear specific locks for all stored accounts as safety measure
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith("locked_until_") || key.startsWith("failed_login_attempts_")) {
                    localStorage.removeItem(key);
                }
            });

            setIsSuccess(true);
        } catch (error: any) {
            setError(error.message || "Invalid or expired token. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex ${inter.className}`}>
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-200">
                <Image
                    src="/images/login-background.png"
                    alt="Models"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <Image src="/images/logo.png" alt="Motive SD" width={160} height={40} className="object-contain h-10 w-auto" />
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F9F8F4] p-8 sm:p-12">
                <div className="w-full max-w-[420px]">
                    
                    {!isSuccess ? (
                        <>
                            <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
                                Welcome to Motive SD
                            </p>
                            <h1 className={`${playfair.className} text-[40px] text-gray-900 mb-8 leading-tight`}>
                                Reset your Password
                            </h1>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 mb-4 font-medium">
                                        {error}
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full py-3.5 pl-4 pr-12 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.048 10.048 0 012.746-4.53m4.234-1.921A9.982 9.982 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-4.223-4.223L3 3m10.8-1.2l-4.2 4.2M12 15a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full py-3.5 pl-4 pr-12 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-medium"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                                        {showConfirmPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.048 10.048 0 012.746-4.53m4.234-1.921A9.982 9.982 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-4.223-4.223L3 3m10.8-1.2l-4.2 4.2M12 15a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 mt-8 rounded-md text-xs font-semibold tracking-widest uppercase transition-colors bg-[#2C2B29] hover:bg-black text-white disabled:bg-gray-400"
                                >
                                    {isLoading ? "Changing..." : "Change Password"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center border border-[#10B981]/30 text-[#10B981] mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h1 className={`${playfair.className} text-[40px] text-gray-900 mb-4 leading-tight`}>
                                Password Changed!
                            </h1>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-8 max-w-[340px]">
                                Your password has been successfully updated. You can now use your new password to sign in to your account.
                            </p>
                            
                            <Link href="/user/login" className="block w-full py-4 rounded-md text-xs font-semibold tracking-widest uppercase transition-colors bg-[#2C2B29] hover:bg-black text-white text-center">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F9F8F4]">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
