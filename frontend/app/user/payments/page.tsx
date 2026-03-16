"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { User, Shield, CreditCard, Package, Plus } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function PaymentMethodsPage() {
    const router = useRouter();
    const [user, setUser] = useState({ fullName: "", avatar: "/images/avatar-placeholder.jpg" });
    const [isLoading, setIsLoading] = useState(true);

    const mockPayments = [
        { id: "1", type: "Visa", last4: "4242", expiry: "12/26", isDefault: true },
        { id: "2", type: "Mastercard", last4: "8888", expiry: "10/25", isDefault: false },
    ];

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

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
            <Header />

            <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/user/homepage" className="hover:text-gray-900 transition">HOME</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">PAYMENT METHODS</span>
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
                                <Link href="/user/payments" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Methods
                                </Link>
                                <Link href="/user/security" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <Shield className="w-5 h-5" />
                                    Security settings
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h1 className={`${playfair.className} text-3xl text-gray-900 mb-1`}>Payment Methods</h1>
                                <p className="text-sm text-gray-500">Manage your saved credit cards and payment preferences.</p>
                            </div>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm">
                                <Plus className="w-4 h-4" />
                                Add New Card
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mockPayments.map((card) => (
                                    <div key={card.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:border-gray-300 transition-colors relative">
                                        {card.isDefault && (
                                            <span className="absolute top-6 right-6 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg tracking-wide uppercase">Default</span>
                                        )}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-10 bg-gray-100 rounded flex items-center justify-center font-bold text-gray-400 italic">
                                                {card.type}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 tracking-wider">•••• •••• •••• {card.last4}</p>
                                                <p className="text-sm text-gray-500 font-medium">Expires {card.expiry}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">Edit</button>
                                            <button className="text-sm font-semibold text-gray-400 hover:text-red-600 transition">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
