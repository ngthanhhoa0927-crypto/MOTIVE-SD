"use client";

import { useState } from "react";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError("");

        // Simple validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) {
            setEmailError("Enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8000/auth/request-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error("Failed to request reset");
            
            setIsSubmitted(true);
        } catch (error) {
            setEmailError("Something went wrong. Please try again.");
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
                    <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
                        Welcome to Motive SD
                    </p>
                    
                    {!isSubmitted ? (
                        <>
                            <h1 className={`${playfair.className} text-[40px] text-gray-900 mb-4 leading-tight`}>
                                Forgot your Password?
                            </h1>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-8 max-w-[340px]">
                                Enter your email address and we will send you a link to reset your password.
                            </p>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError("");
                                        }}
                                        className={`w-full py-3.5 pl-4 pr-12 bg-white border ${emailError ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200'} rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all`}
                                    />
                                    <svg className={`absolute right-4 top-4 w-5 h-5 ${emailError ? 'text-red-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {emailError && <p className="text-[11px] font-medium text-red-500 mt-1.5 ml-1">{emailError}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 mt-6 rounded-md text-xs font-semibold tracking-widest uppercase transition-colors bg-[#2C2B29] hover:bg-black text-white disabled:bg-gray-400"
                                >
                                    {isLoading ? "Processing..." : "Request Reset Link"}
                                </button>
                                
                                <div className="text-center mt-6">
                                    <Link href="/user/login" className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-black font-semibold">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-200">
                                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className={`${playfair.className} text-[40px] text-gray-900 mb-4 leading-tight`}>
                                Check your Email
                            </h1>
                            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[340px] mb-2">
                                We&apos;ve sent a password reset link to <strong className="text-gray-700">{email}</strong>.
                            </p>
                            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[340px]">
                                Please check your inbox and click the &quot;Reset Password&quot; button in the email to set a new password. The link will expire in 15 minutes.
                            </p>
                            
                            <div className="mt-8">
                                <Link href="/user/login" className="block w-full py-4 rounded-md text-xs font-semibold tracking-widest uppercase transition-colors bg-[#2C2B29] hover:bg-black text-white text-center">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
