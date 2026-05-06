"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { User, Shield, Package } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function MyOrdersPage() {
    const router = useRouter();
    const [user, setUser] = useState({ fullName: "", avatar: "/images/avatar-placeholder.jpg" });
    const [isLoading, setIsLoading] = useState(true);

    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrdersAndProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/user/login");
                return;
            }

            try {
                // Fetch profile
                const profileRes = await fetch("http://localhost:8000/auth/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setUser({
                        fullName: profileData.profile?.full_name || "User",
                        avatar: profileData.profile?.avatar_view_url || "/images/avatar-placeholder.jpg"
                    });
                }

                const ordersRes = await fetch("http://localhost:8000/orders", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (ordersRes.ok) {
                    const data = await ordersRes.json();
                    const mappedOrders = (data.data || []).map((o: any) => ({
                        id: o.id,
                        order_code: o.order_code,
                        date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        total: `$${Number(o.total_amount).toFixed(2)}`,
                        status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
                        items: "-" // Omitting exact item count as API list doesn't return it
                    }));
                    setOrders(mappedOrders);
                }
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load user orders:", err);
                setIsLoading(false);
            }

        };

        fetchOrdersAndProfile();
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
                                {orders.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <p className="mb-4">You have not placed any orders yet.</p>
                                        <Link href="/user/homepage" className="text-blue-600 hover:underline">Start shopping</Link>
                                    </div>
                                ) : (
                                    orders.map((order, i) => (
                                    <div key={i} className="border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors shadow-sm bg-white">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-gray-900">{order.order_code}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'Confirmed' ? 'bg-purple-100 text-purple-700' :
                                                    order.status === 'Shipping' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">Placed on {order.date}</p>
                                        </div>
                                        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                                            <p className="font-bold text-gray-900 text-lg">{order.total}</p>
                                            <Link href={`/user/orders/${order.id}`} className="text-sm text-blue-600 font-semibold mt-1 flex items-center gap-1 hover:text-blue-800 transition">
                                                View Details
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                            </Link>
                                        </div>
                                    </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
