"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ChevronRight } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

// Mock initial cart data
const initialCartItems = [
    {
        id: 1,
        name: "Black Dog Ear Baseball Cap",
        price: 19.00,
        image: "/images/hat-dog-black.png",
        quantity: 1,
        color: "Obsidian Black",
        size: "M",
    },
    {
        id: 2,
        name: "Bear Cub Ear Baseball Cap",
        price: 22.00,
        image: "/images/hat-bear.png",
        quantity: 2,
        color: "Soft White",
        size: "L",
    },
    {
        id: 3,
        name: "Polka Dot Dog Ear Baseball Cap",
        price: 21.00,
        image: "/images/hat-dog-dot.png",
        quantity: 1,
        color: "Dotted Blue",
        size: "S",
    }
];

export default function CartPage() {
    const [cartItems, setCartItems] = useState(initialCartItems);


    const updateQuantity = (id: number, delta: number) => {
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    if (cartItems.length === 0) {
        return (
            <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className={`${playfair.className} text-4xl text-gray-900 mb-4`}>Your cart is empty</h2>
                    <p className="text-gray-500 max-w-md mb-8">
                        It looks like you haven't added anything to your cart yet. Explore our latest collections and find your perfect style.
                    </p>
                    <Link href="/user/homepage">
                        <Button className="bg-[#2C2B29] hover:bg-black text-white px-8 py-6 rounded-full font-semibold transition-all">
                            Start Shopping
                        </Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
            <Header />

            <main className="flex-grow max-w-[1400px] mx-auto w-full px-8 py-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 uppercase tracking-widest font-semibold">
                    <Link href="/user/homepage" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900">Shopping Cart</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items Area */}
                    <div className="flex-1">
                        <div className="flex items-baseline justify-between mb-8 border-b border-gray-200 pb-4">
                            <h1 className={`${playfair.className} text-5xl text-gray-900`}>Your Cart</h1>
                            <span className="text-gray-500 font-medium">{cartItems.length} Items</span>
                        </div>

                        <div className="space-y-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-8 transition-all hover:shadow-md hover:border-blue-100">
                                    {/* Image Container */}
                                    <div className="relative w-32 h-32 bg-[#F3F4F6] rounded-xl overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Item Info */}
                                    <div className="flex-grow text-center sm:text-left">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                            <span>Color: <span className="text-gray-900">{item.color}</span></span>
                                            <span>Size: <span className="text-gray-900">{item.size}</span></span>
                                        </div>
                                        <p className="text-blue-600 font-bold text-lg">${item.price.toFixed(2)}</p>
                                    </div>

                                    {/* Quantity and Actions */}
                                    <div className="flex flex-col items-center sm:items-end gap-6 h-full justify-between">
                                        <div className="flex items-center bg-[#F3F4F6] rounded-full p-1 border border-gray-200">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Back to Home */}
                        <div className="mt-12">
                            <Link href="/user/homepage" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Continue Shopping</span>
                            </Link>
                        </div>
                    </div>

                    {/* Summary Area */}
                    <div className="lg:w-[400px]">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-12">
                            <h2 className={`${playfair.className} text-3xl text-gray-900 mb-8 border-b border-gray-100 pb-4`}>Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Shipping</span>
                                    <span className={`${shipping === 0 ? "text-green-600" : "text-gray-900"} font-bold`}>
                                        {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Estimated Tax</span>
                                    <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
                                </div>
                            </div>



                            <div className="flex justify-between items-baseline mb-10">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-3xl font-extrabold text-blue-600">${total.toFixed(2)}</span>
                            </div>

                            <Link href="/user/checkout" className="w-full">
                                <Button className="w-full bg-[#2C2B29] hover:bg-black text-white py-7 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-gray-200 transition-all transform active:scale-[0.98]">
                                    Proceed To Checkout
                                </Button>
                            </Link>

                            <div className="mt-6 flex justify-center items-center gap-4">
                                <Image src="/images/logo.png" alt="Payment Logos" width={100} height={30} className="opacity-20 grayscale brightness-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
