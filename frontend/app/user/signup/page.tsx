import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function SignUpPage() {
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

                    {/* Form */}
                    <form className="space-y-4">
                        {/* Full Name */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full py-3.5 pl-4 pr-12 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                            />
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>

                        {/* Date of Birth - Custom layout để text nhỏ nằm trên */}
                        <div className="relative border border-gray-200 bg-white rounded-md px-4 py-2 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all">
                            <label className="block text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                                Date of Birth
                            </label>
                            <input
                                type="text"
                                placeholder="mm/dd/yyyy"
                                className="w-full text-sm outline-none bg-transparent placeholder-gray-300 text-gray-700"
                            />
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full py-3.5 pl-4 pr-12 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                            />
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        {/* Phone Number */}
                        <div className="relative">
                            <input
                                type="tel"
                                placeholder="Phone Number (Optional)"
                                className="w-full py-3.5 pl-4 pr-12 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                            />
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full py-3.5 pl-4 pr-12 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                            />
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="w-full py-3.5 pl-4 pr-12 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                            />
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>

                        {/* Checkbox (Dùng items-start vì text có thể rớt dòng) */}
                        <div className="flex items-start gap-3 pt-2 pb-2">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 w-4 h-4 border-gray-300 rounded text-black focus:ring-black accent-black shrink-0"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
                                I agree to Motive SD's Terms of Service and Privacy Policy. I consent to receiving curated style updates and exclusive offers.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-[#2C2B29] hover:bg-black text-white rounded-md text-sm font-semibold tracking-widest uppercase transition-colors"
                        >
                            Create My Account
                        </button>
                    </form>

                    {/* Footer Text */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already a member? <Link href="/user/login" className="text-gray-900 font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}