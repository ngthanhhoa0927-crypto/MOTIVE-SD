"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { User, Shield, CreditCard, Package } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function MyOrdersPage() {
    const router = useRouter();
    const [user, setUser] = useState({ fullName: "", avatar: "/images/avatar-placeholder.jpg" });
    const [isLoading, setIsLoading] = useState(true);

    const mockOrders = [
        { id: "#ORD-00124", date: "Oct 24, 2025", total: "$124.00", status: "Delivered", items: 2 },
        { id: "#ORD-00123", date: "Oct 15, 2025", total: "$56.50", status: "Processing", items: 1 },
        { id: "#ORD-00120", date: "Sep 02, 2025", total: "$230.00", status: "Cancelled", items: 4 },
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
                        <span className="text-gray-900 font-medium">MY ORDERS</span>
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
                                <Link href="/user/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition">
                                    <Package className="w-5 h-5" />
                                    My Orders
                                </Link>
                                <Link href="/user/payments" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
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
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                            <h1 className={`${playfair.className} text-3xl text-gray-900 mb-1`}>My Orders</h1>
                            <p className="text-sm text-gray-500">View and track your recent orders.</p>
                        </div>

                        <div className="p-8">
                            <div className="space-y-4">
                                {mockOrders.map((order, i) => (
                                    <div key={i} className="border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors shadow-sm bg-white">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-gray-900">{order.id}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">Placed on {order.date} • {order.items} items</p>
                                        </div>
                                        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                                            <p className="font-bold text-gray-900 text-lg">{order.total}</p>
                                            <button className="text-sm text-blue-600 font-semibold mt-1 flex items-center gap-1 hover:text-blue-800 transition">
                                                View Details
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                            </button>
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
