"use client";

import { use, useState, useEffect } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Download, Truck, MapPin, CreditCard, Receipt, FileText, CornerDownLeft } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function OrderDetailsPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const [order, setOrder] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch(`http://localhost:8000/orders/${params.id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setOrder(data.order);
                    setItems(data.items);
                } else {
                    const data = await res.json();
                    setError(data.message || "Failed to fetch order details");
                }
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError("An error occurred while fetching order details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [params.id]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error || !order) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Order not found"}</div>;

    const orderIdDisplay = order.order_code;
    const orderDate = new Date(order.created_at).toLocaleString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const getStatusWidth = (status: string) => {
        const stages = ['processing', 'confirmed', 'shipping', 'delivered', 'completed'];
        const index = stages.indexOf(status.toLowerCase());
        if (index === -1) return '0%';
        return `${(index / (stages.length - 1)) * 100}%`;
    };

    const statusMap: Record<string, string> = {
        'processing': 'Processing',
        'confirmed': 'Confirmed',
        'shipping': 'Shipping',
        'delivered': 'Delivered',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
    };

    return (
        <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
            <Header />

            <main className="flex-grow max-w-[1200px] mx-auto w-full px-8 py-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 uppercase tracking-widest font-semibold">
                    <Link href="/user/homepage" className="hover:text-blue-600 transition-colors">Homepage</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/user/profile" className="hover:text-blue-600 transition-colors">My Account</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/user/orders" className="hover:text-blue-600 transition-colors">Order History</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900">{orderIdDisplay}</span>
                </div>

                <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                        <div>
                            <h1 className={`${playfair.className} text-4xl text-gray-900 mb-2 font-bold`}>Order {orderIdDisplay}</h1>
                            <p className="text-sm text-gray-500 font-medium">Placed on {orderDate}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-14 bg-[#F9FAFB] rounded-2xl p-8 border border-gray-100">
                        <div className="flex justify-between items-end mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                                <h3 className="font-bold text-blue-600 text-lg">Order Status: {statusMap[order.status.toLowerCase()] || order.status}</h3>
                            </div>
                            <span className="text-sm font-semibold text-gray-500">
                                {order.estimated_delivery_date ? `Estimated delivery: ${new Date(order.estimated_delivery_date).toLocaleDateString()}` : "Estimated delivery: TBD"}
                            </span>
                        </div>
                        
                        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-4">
                            <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: getStatusWidth(order.status) }} />
                        </div>
                        <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                            <span className={order.status.toLowerCase() === 'processing' || getStatusWidth(order.status) !== '0%' ? "text-blue-600" : ""}>Created</span>
                            <span className={['confirmed', 'shipping', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? "text-blue-600" : ""}>Confirmed</span>
                            <span className={['shipping', 'delivered', 'completed'].includes(order.status.toLowerCase()) ? "text-blue-600" : ""}>Shipping</span>
                            <span className={['delivered', 'completed'].includes(order.status.toLowerCase()) ? "text-blue-600" : ""}>Delivered</span>
                            <span className={['completed'].includes(order.status.toLowerCase()) ? "text-blue-600" : ""}>Completed</span>
                        </div>
                    </div>

                    {/* Three Columns Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
                        {/* Shipping Address */}
                        <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-4 text-blue-600">
                                <MapPin className="w-4 h-4" />
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500">Shipping Address</h4>
                            </div>
                            <p className="font-bold text-gray-900 mb-1">{order.receiver_name}</p>
                            <div className="text-sm text-gray-500 leading-relaxed font-medium">
                                <p>{order.shipping_address}</p>
                                <p>{order.shipping_city}</p>
                                <p className="mt-2 text-gray-700">Phone: <span className="font-bold">{order.receiver_phone}</span></p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-4 text-blue-600">
                                <CreditCard className="w-4 h-4" />
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500">Payment Method</h4>
                            </div>
                            <div className="flex items-center gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="w-10 h-6 bg-blue-900 rounded-[4px] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <span className="text-[10px] text-white font-black italic uppercase">{order.payment_method}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{order.payment_method === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase">Status: {order.payment_status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-4 text-blue-600">
                                <Receipt className="w-4 h-4" />
                                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500">Order Summary</h4>
                            </div>
                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg">
                                    <span className="text-gray-500 font-medium tracking-wide">Order Code</span>
                                    <span className="font-bold text-gray-900">{order.order_code}</span>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-gray-500 font-medium tracking-wide">Items</span>
                                    <span className="font-bold text-gray-900">{items.length} Items</span>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-gray-500 font-medium tracking-wide">Status</span>
                                    <span className="font-black text-blue-600 uppercase">{order.status}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-6">Product Details</h3>
                        <div className="w-full overflow-x-auto border border-gray-100 rounded-2xl">
                            <table className="w-full min-w-[700px] text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-widest font-bold">
                                        <th className="py-4 px-6 rounded-tl-2xl">Product</th>
                                        <th className="py-4 px-6">Price</th>
                                        <th className="py-4 px-6 text-center">Quantity</th>
                                        <th className="py-4 px-6 text-right rounded-tr-2xl">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-6 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-[#F3F4F6] rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200">
                                                        <Image src={item.product_image || "/images/placeholder-hat.png"} alt={item.product_name} fill className="object-cover hover:scale-110 transition-transform duration-300" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{item.product_name}</h4>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Size: {item.size} | Color: {item.color}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6 font-bold text-gray-900">${Number(item.price_at_purchase).toFixed(2)}</td>
                                            <td className="py-6 px-6 font-bold text-gray-900 text-center">{item.quantity}</td>
                                            <td className="py-6 px-6 font-bold text-gray-900 text-right">${(Number(item.price_at_purchase) * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Calculation */}
                    <div className="flex flex-col items-end mt-12 bg-gray-50 rounded-2xl p-8 ml-auto lg:w-[400px] border border-gray-100">
                        <div className="w-full space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Subtotal</span>
                                <span className="font-bold text-gray-900">${Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Shipping ({order.shipping_method})</span>
                                <span className="font-bold text-gray-900">${Number(order.shipping_fee).toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="w-full flex justify-between items-baseline pt-6 border-t border-gray-200">
                            <span className="font-extrabold text-gray-900 uppercase tracking-widest text-sm">Total</span>
                            <span className="font-black text-blue-600 text-3xl">${Number(order.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
