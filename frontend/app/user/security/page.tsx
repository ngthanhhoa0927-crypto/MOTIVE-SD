"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { User, Shield, CreditCard, Package, Lock, Smartphone } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function SecuritySettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState({ fullName: "", avatar: "/images/avatar-placeholder.jpg" });
    const [isLoading, setIsLoading] = useState(true);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Because backend doesn't have Change Password API yet, these states are just mock behavior
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/user/login");
            return;
        }

        if (token.startsWith("fake.")) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    fullName: payload.full_name || "Regular User",
                    avatar: "/images/avatar-placeholder.jpg"
                });
            } catch (e) {}
        }
        
        setIsLoading(false);
    }, [router]);

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        // Simulate an API call
        setTimeout(() => {
            setIsUpdating(false);
            setSuccessMsg("Your password has been updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            
            // clear msg after 3s
            setTimeout(() => setSuccessMsg(""), 3000);
        }, 1000);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
            <Header />

            <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/user/homepage" className="hover:text-gray-900 transition">HOME</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">SECURITY SETTINGS</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                    <Image src={user.avatar} alt="Avatar" width={48} height={48} className="object-cover" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{user.fullName}</p>
                                    <p className="text-xs text-gray-500">Premium Member</p>
                                </div>
                            </div>
                            <nav className="flex flex-col gap-2">
                                <Link href="/user/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <User className="w-5 h-5" />
                                    My Profile
                                </Link>
                                <Link href="/user/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <Package className="w-5 h-5" />
                                    My Orders
                                </Link>
                                <Link href="/user/payments" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Methods
                                </Link>
                                <Link href="/user/security" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition">
                                    <Shield className="w-5 h-5" />
                                    Security settings
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                            <h1 className={`${playfair.className} text-3xl text-gray-900 mb-1`}>Security Settings</h1>
                            <p className="text-sm text-gray-500">Keep your account secure by updating your password and enabling 2FA.</p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                                
                                {/* Change Password Form */}
                                <div className="lg:col-span-3">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                        Change Password
                                    </h3>
                                    
                                    {successMsg && (
                                        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 text-sm font-semibold border border-green-200">
                                            {successMsg}
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordChange} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 font-medium" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 font-medium" 
                                            />
                                            <p className="text-[11px] text-gray-500 font-medium mt-2">Password must be at least 8 characters long and include a number & special character.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                            <input 
                                                type="password" 
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 font-medium" 
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={isUpdating}
                                            className="px-6 py-3 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black shadow-sm transition mt-6 disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {isUpdating ? "Updating..." : "Update Password"}
                                        </button>
                                    </form>
                                </div>

                                {/* 2FA & active sessions (Static Mock UI) */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-sm border border-blue-100">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2">Two-Factor Authentication</h3>
                                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                            Add an extra layer of security to your account. We will ask for a verification code when you sign in.
                                        </p>
                                        <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition w-full shadow-sm">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
