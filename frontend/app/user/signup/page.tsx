"use client";

import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isValidEmail, isValidDate } from "@/lib/validation";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function SignUpPage() {
    const router = useRouter();

    // Form states
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [dob, setDob] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [error, setError] = useState("");
    const [fullNameError, setFullNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [dobError, setDobError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input Info, 2: Input OTP

    const isValidName = (name: string) => {
        const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
        return nameRegex.test(name);
    };

    const isPastDate = (dateString: string) => {
        const [day, month, year] = dateString.split("/");
        if (!day || !month || !year || year.length !== 4) return false;
        const dobDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dobDate < today;
    };

    const isStrictEmail = (emailStr: string) => {
        if (emailStr.split('@').length !== 2) return false; // Có đúng 1 dấu @
        if (/\s/.test(emailStr)) return false; // Không có khoảng trắng
        if (emailStr.startsWith('.') || emailStr.endsWith('.')) return false; // Không bắt đầu/kết thúc bằng dấu .
        const parts = emailStr.split('@');
        const domainPart = parts[1];
        if (!domainPart || !domainPart.includes('.')) return false; // Có ít nhất 1 dấu (.) sau @
        if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false; // Domain không bắt đầu/kết thúc bằng .
        return true;
    };

    const isValidPassword = (pwd: string) => {
        // Ít nhất 8 ký tự, có chứa cả chữ cái và số
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&._-]{8,}$/;
        return passwordRegex.test(pwd);
    };

    const isFormValid = fullName.trim() !== "" && isValidName(fullName) && 
                        dob.trim() !== "" && isValidDate(dob) && isPastDate(dob) && 
                        email.trim() !== "" && isStrictEmail(email) && !emailError && 
                        password !== "" && isValidPassword(password) &&
                        confirmPassword !== "" && password === confirmPassword && 
                        termsAccepted;

    const handleDobChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const isDeleting = input.length < dob.length;
        let value = input.replace(/\D/g, "");
        
        if (value.length > 8) value = value.slice(0, 8);

        let formattedValue = "";
        if (value.length > 0) {
            formattedValue = value.slice(0, 2);
            if (value.length > 2 || (value.length === 2 && !isDeleting)) {
                formattedValue += "/";
                if (value.length > 2) {
                    formattedValue += value.slice(2, 4);
                    if (value.length > 4 || (value.length === 4 && !isDeleting)) {
                        formattedValue += "/";
                        if (value.length > 4) {
                            formattedValue += value.slice(4, 8);
                        }
                    }
                }
            }
        }
        setDob(formattedValue);
        if (dobError) setDobError("");
    };

    const handleFullNameBlur = () => {
        if (!fullName.trim()) setFullNameError("Full name is required");
        else if (!isValidName(fullName)) setFullNameError("Name cannot contain numbers or special characters.");
        else setFullNameError("");
    };

    const handleEmailBlur = async () => {
        if (!email.trim()) {
            setEmailError("Email is required");
            return;
        }
        if (!isStrictEmail(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        // Kiểm tra xem email đã tồn tại hay chưa
        try {
            const res = await fetch("http://localhost:8000/auth/check-email?email=" + encodeURIComponent(email));
            if (res.ok) {
                const data = await res.json();
                // Tùy theo response từ backend nhưng nếu có "exists": true hoặc data.message là "exists"
                if (data.exists || data.message === "Email already exists" || data.message === "Email already exits") {
                    setEmailError("Email already exits");
                    return;
                }
            } else if (res.status === 409 || res.status === 400) {
                // Đôi khi check email lỗi sẽ ra 409 Conflict
                const data = await res.json().catch(() => ({}));
                if (data.message && data.message.toLowerCase().includes("exist")) {
                    setEmailError("Email already exits");
                    return;
                }
            }
        } catch (error) {
            // Không làm gì nếu API chết hoặc chưa có sẵn (front-end only tests)
        }

        setEmailError("");
    };

    const handleDobBlur = () => {
        if (!dob.trim()) setDobError("Date of Birth is required");
        else if (!isValidDate(dob)) setDobError("Please enter a valid date (dd/mm/yyyy).");
        else if (!isPastDate(dob)) setDobError("Date of Birth must be in the past.");
        else setDobError("");
    };

    const handlePasswordBlur = () => {
        if (!password) {
            setPasswordError("Password is required");
        } else if (!isValidPassword(password)) {
            setPasswordError("Password must be at least 8 characters and contain both letters and numbers.");
        } else {
            setPasswordError("");
        }
        
        // Re-validate confirm password if it has been typed already
        if (confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
        } else if (confirmPassword && password === confirmPassword) {
            setConfirmPasswordError("");
        }
    };

    const handleConfirmPasswordBlur = () => {
        if (!confirmPassword) setConfirmPasswordError("Confirm password is required");
        else if (password !== confirmPassword) setConfirmPasswordError("Passwords do not match.");
        else setConfirmPasswordError("");
    };

    // Xử lý Gửi OTP (Bước 1)
    const handleSendOtp = async (e?: FormEvent<HTMLFormElement> | MouseEvent) => {
        e?.preventDefault();
        setError("");
        setEmailError("");
        setDobError("");

        if (!isStrictEmail(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        if (dob && !isValidDate(dob)) {
            setDobError("Please enter a valid date (dd/mm/yyyy).");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.message && data.message.toLowerCase().includes("exist")) {
                    setEmailError("Email already exits");
                    return;
                }
                if (data.errors && data.errors.length > 0) {
                    throw new Error(data.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(", "));
                }
                throw new Error(data.message || "Failed to send OTP");
            }

            // Gửi OTP thành công -> chuyển sang form nhập OTP
            setStep(2);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý tạo tài khoản (Bước 2)
    const handleRegister = async (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:8000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    full_name: fullName, 
                    email, 
                    password, 
                    otp,
                    phone_number: phoneNumber,
                    date_of_birth: dob
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.errors && data.errors.length > 0) {
                    throw new Error(data.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(", "));
                }
                throw new Error(data.message || "Registration failed");
            }

            // Redirect to login page on success
            router.push("/user/login?registered=true");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
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
                <Image
                    src="/images/login-background.png"
                    alt="Fashion model in yellow tracksuit"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="text-white text-3xl font-bold tracking-tighter">
                        <Image src="/images/logo.png" alt="Motive SD" width={160} height={40} className="object-contain h-10 w-auto" />
                    </div>
                </div>
            </div>

            {/* Cột phải: Form Đăng ký */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F9F8F4] p-8 sm:p-12 overflow-y-auto">
                <div className="w-full max-w-[420px] py-8">
                    {/* Tiêu đề */}
                    <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
                        Welcome to Motive SD
                    </p>
                    <h1 className={`${playfair.className} text-[2.75rem] leading-tight text-gray-900 mb-8`}>
                        Create Your <span className="text-gray-500 italic">Account</span>
                    </h1>

                    {step === 1 ? (
                        /* Form Bước 1: Thông tin người dùng */
                        <form className="space-y-4" onSubmit={handleSendOtp}>
                            {error && (
                                <div className="p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-100 mb-4">
                                    {error}
                                </div>
                            )}
                            {/* Full Name */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Full Name*"
                                    value={fullName}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setFullName(e.target.value);
                                        if (fullNameError) setFullNameError("");
                                    }}
                                    onBlur={handleFullNameBlur}
                                    className={`w-full py-3.5 pl-4 pr-12 bg-white border ${fullNameError ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200'} rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all`}
                                    required
                                />
                                <svg className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${fullNameError ? 'text-red-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {fullNameError && <p className="text-[10px] text-red-500 mt-1 ml-1">{fullNameError}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Date of Birth*"
                                    value={dob}
                                    onChange={handleDobChange}
                                    onBlur={handleDobBlur}
                                    maxLength={10}
                                    className={`w-full py-3.5 pl-4 pr-12 bg-white border ${dobError ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200'} rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all`}
                                />
                                <svg className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${dobError ? 'text-red-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {dobError && <p className="text-[10px] text-red-500 mt-1 ml-1">{dobError}</p>}
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email Address*"
                                    value={email}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError("");
                                    }}
                                    onBlur={handleEmailBlur}
                                    className={`w-full py-3.5 pl-4 pr-12 bg-white border ${emailError ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200'} rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all`}
                                    required
                                />
                                <svg className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${emailError ? 'text-red-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {emailError && <p className="text-[10px] text-red-500 mt-1 ml-1">{emailError}</p>}
                            </div>

                            {/* Phone Number */}
                            <div className="relative">
                                <input
                                    type="tel"
                                    placeholder="Phone Number (Optional)"
                                    value={phoneNumber}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                                    className="w-full py-3.5 pl-4 pr-12 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                                />
                                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password*"
                                    value={password}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setPassword(e.target.value);
                                        if (passwordError) setPasswordError("");
                                    }}
                                    onBlur={handlePasswordBlur}
                                    className={`w-full py-3.5 pl-4 pr-12 bg-white border ${passwordError ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200'} rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${passwordError ? 'text-red-400 hover:text-red-500' : 'text-gray-300 hover:text-gray-500'}`}
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

                            {/* Confirm Password */}
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password*"
                                    value={confirmPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        setConfirmPassword(e.target.value);
                                        if (confirmPasswordError) setConfirmPasswordError("");
                                    }}
                                    onBlur={handleConfirmPasswordBlur}
                                    className={`w-full py-3.5 pl-4 pr-12 bg-white border ${confirmPasswordError ? 'border-red-500 text-red-500 placeholder-red-300' : 'border-gray-200'} rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${confirmPasswordError ? 'text-red-400 hover:text-red-500' : 'text-gray-300 hover:text-gray-500'}`}
                                >
                                    {showConfirmPassword ? (
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
                                {confirmPasswordError && <p className="text-[10px] text-red-500 mt-1 ml-1">{confirmPasswordError}</p>}
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-start gap-3 pt-2 pb-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 border-gray-300 rounded text-black focus:ring-black accent-black shrink-0"
                                />
                                <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                                    I agree to Motive SD&apos;s Terms of Service and Privacy Policy. I consent to receiving curated style updates and exclusive offers.
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !isFormValid}
                                className={`w-full py-4 mt-2 rounded-md text-sm font-semibold tracking-widest uppercase transition-colors ${isLoading || !isFormValid ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#2C2B29] hover:bg-black text-white"}`}
                            >
                                {isLoading ? "Sending OTP..." : "CREATE MY ACCOUNT"}
                            </button>
                        </form>
                    ) : (
                        /* Form Bước 2: Nhập OTP */
                        <form className="space-y-4" onSubmit={handleRegister}>
                            {error && (
                                <div className="p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-100 mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-600 mb-6">
                                    We&apos;ve sent a 6-digit verification code to <span className="font-semibold">{email}</span>. Please enter it below.
                                </p>
                                
                                <div className="relative max-w-[200px] mx-auto">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={otp}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value.replace(/\D/g, ""))} // Chỉ cho phép nhập số
                                        className="w-full py-3.5 text-center text-xl tracking-[0.5em] font-semibold bg-white border border-gray-200 rounded-md outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                className={`w-full py-4 mt-4 bg-[#2C2B29] hover:bg-black text-white rounded-md text-sm font-semibold tracking-widest uppercase transition-colors ${(isLoading || otp.length !== 6) ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {isLoading ? "Creating Account..." : "Verify & Create Account"}
                            </button>
                            
                            {/* Back/Resend options */}
                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp("");
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
                                >
                                    ← Back to editing
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={isLoading}
                                    className="text-xs text-gray-500 hover:text-gray-900 font-semibold underline"
                                >
                                    Resend code
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Footer Text */}
                    <p className="text-center text-sm text-gray-500 mt-8">
                        Already a member? <Link href="/user/login" className="text-gray-900 font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}