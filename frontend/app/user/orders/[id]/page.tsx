"use client";

import { use } from "react";
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
    const orderId = params.id ? `#${params.id.toUpperCase()}` : "#MSD-89241";

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
                    <span className="text-gray-900">{orderId}</span>
                </div>

                <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                        <div>
                            <h1 className={`${playfair.className} text-4xl text-gray-900 mb-2 font-bold`}>Order {orderId}</h1>
                            <p className="text-sm text-gray-500 font-medium">Placed on October 24, 2025 at 2:45 PM</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors">
                                <FileText className="w-4 h-4" /> Invoice
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
                                <Truck className="w-4 h-4" /> Track Order
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-14 bg-[#F9FAFB] rounded-2xl p-8 border border-gray-100">
                        <div className="flex justify-between items-end mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                                <h3 className="font-bold text-blue-600 text-lg">Shipped</h3>
                            </div>
                            <span className="text-sm font-semibold text-gray-500">Arriving by March 27, 2026</span>
                        </div>
                        
                        <div className="relative w-full h-2 bg-gray-200 rounded-full mb-4">
                            <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: '66%' }} />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span className="text-blue-600">Processing</span>
                            <span className="text-blue-600">Shipped</span>
                            <span>Delivered</span>
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
                            <p className="font-bold text-gray-900 mb-1">John Doe</p>
                            <div className="text-sm text-gray-500 leading-relaxed font-medium">
                                <p>1234 Sapphire Street, Suite 450</p>
                                <p>San Diego, CA 92101</p>
                                <p>United States</p>
                                <p className="mt-2 text-gray-700">Phone: <span className="font-bold">+1 (555) 000-0000</span></p>
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
                                    <span className="text-[10px] text-white font-black italic">VISA</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Visa ending in 4242</p>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase">Exp: 12/26</p>
                                </div>
                            </div>
                            <div className="text-xs">
                                <span className="font-bold text-gray-500 uppercase tracking-widest block mb-1">Billing Address:</span>
                                <span className="text-gray-900 font-medium">Same as shipping address</span>
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
                                    <span className="text-gray-500 font-medium tracking-wide">Order ID</span>
                                    <span className="font-bold text-gray-900">{orderId}</span>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-gray-500 font-medium tracking-wide">Items</span>
                                    <span className="font-bold text-gray-900">1 Items</span>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-gray-500 font-medium tracking-wide">Status</span>
                                    <span className="font-black text-blue-600">SHIPPED</span>
                                </div>
                            </div>
                            <button className="text-blue-600 text-sm font-bold flex items-center gap-2 hover:text-blue-800 transition-colors w-full justify-center bg-blue-50 py-3 rounded-xl">
                                <CornerDownLeft className="w-4 h-4" />
                                RETURN ITEMS
                            </button>
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
                                    <tr className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-6 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-[#F3F4F6] rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200">
                                                    <Image src="/images/hat-dog-black.png" alt="Black Dog Ear Baseball Cap" fill className="object-cover hover:scale-110 transition-transform duration-300" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm mb-1">Black Dog Ear Baseball Cap</h4>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Size: M | Color: Obsidian Black</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6 font-bold text-gray-900">$45.00</td>
                                        <td className="py-6 px-6 font-bold text-gray-900 text-center">1</td>
                                        <td className="py-6 px-6 font-bold text-gray-900 text-right">$45.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Calculation */}
                    <div className="flex flex-col items-end mt-12 bg-gray-50 rounded-2xl p-8 ml-auto lg:w-[400px] border border-gray-100">
                        <div className="w-full space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Subtotal</span>
                                <span className="font-bold text-gray-900">$45.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Shipping (Standard)</span>
                                <span className="font-bold text-gray-900">$5.00</span>
                            </div>
                        </div>
                        <div className="w-full flex justify-between items-baseline pt-6 border-t border-gray-200">
                            <span className="font-extrabold text-gray-900 uppercase tracking-widest text-sm">Total</span>
                            <span className="font-black text-blue-600 text-3xl">$50.00</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
