"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ChevronRight } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { fetchCart, removeFromCart, updateCartItem, isAuthenticated } from "@/lib/cartApi";
import { useRouter } from "next/navigation";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

interface CartItem {
    id: number;
    quantity: number;
    product_variant: any;
    product: any;
    product_image: any;
}

export default function CartPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [isAuthenticated_flag, setIsAuthenticated_flag] = useState(false);

    // Fetch cart items on mount
    useEffect(() => {
        const initCart = async () => {
            try {
                if (!isAuthenticated()) {
                    setIsAuthenticated_flag(false);
                    setLoading(false);
                    return;
                }

                setIsAuthenticated_flag(true);
                const items = await fetchCart();
                setCartItems(items || []);
            } catch (err: any) {
                console.error("Failed to fetch cart:", err);
                setError(err.message || "Failed to fetch cart");
            } finally {
                setLoading(false);
            }
        };

        initCart();
    }, []);

    const updateQuantity = async (cartItemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            await removeItem(cartItemId);
            return;
        }

        try {
            await updateCartItem(cartItemId, newQuantity);
            setCartItems((prev) =>
                prev.map((item) =>
                    item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                )
            );
            window.dispatchEvent(new CustomEvent("cartUpdated"));
        } catch (err) {
            setError("Failed to update quantity");
        }
    };

    const removeItem = async (cartItemId: number) => {
        try {
            await removeFromCart(cartItemId);
            setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
            window.dispatchEvent(new CustomEvent("cartUpdated"));
        } catch (err) {
            setError("Failed to remove item");
        }
    };

    const subtotal = cartItems.reduce(
        (acc, item) => acc + (Number(item.product_variant.price) * item.quantity),
        0
    );
    const total = subtotal;

    return (
        <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
            <Header />

            <main className="flex-grow max-w-[1400px] mx-auto w-full px-8 py-12">
                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Not Logged In */}
                {!loading && !isAuthenticated_flag && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-[#F9F8F4] rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className={`${playfair.className} text-3xl text-gray-900 mb-4`}>Please Login</h2>
                        <p className="text-gray-500 mb-6">You need to be logged in to view your cart.</p>
                        <Button 
                            onClick={() => router.push("/user/login")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Login Now
                        </Button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                )}

                {/* Cart Content */}
                {!loading && isAuthenticated_flag && (
                    <>
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
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                            <div className="w-24 h-24 bg-[#F9F8F4] rounded-full flex items-center justify-center mx-auto mb-6">
                                                <ShoppingBag className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <h2 className={`${playfair.className} text-3xl text-gray-900 mb-4`}>There are no items in the cart.</h2>
                                        </div>
                                    ) : (
                                        cartItems.map((item) => (
                                            <div key={item.id} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-8 transition-all hover:shadow-md hover:border-blue-100">
                                            {/* Image Container */}
                                            <div className="relative w-32 h-32 bg-[#F3F4F6] rounded-xl overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.product_image?.signed_url || "/images/placeholder-hat.png"}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Item Info */}
                                            <div className="flex-grow text-center sm:text-left">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.product.name}</h3>
                                                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                                    {item.product_variant.color && <span>Color: <span className="text-gray-900">{item.product_variant.color}</span></span>}
                                                    {item.product_variant.size && <span>Size: <span className="text-gray-900">{item.product_variant.size}</span></span>}
                                                </div>
                                                <p className="text-blue-600 font-bold text-lg">${Number(item.product_variant.price).toFixed(2)}</p>
                                            </div>

                                            {/* Quantity and Actions */}
                                            <div className="flex flex-col items-center sm:items-end gap-6 h-full justify-between">
                                                <div className="flex items-center bg-[#F3F4F6] rounded-full p-1 border border-gray-200">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-10 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                                        ))
                                    )}
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
                                    </div>

                                    <div className="flex justify-between items-baseline mb-10">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-3xl font-extrabold text-blue-600">${total.toFixed(2)}</span>
                                    </div>

                                    {cartItems.length === 0 ? (
                                        <Button disabled className="w-full bg-gray-200 text-gray-400 py-7 rounded-2xl font-bold uppercase tracking-[0.2em] cursor-not-allowed">
                                            Proceed To Checkout
                                        </Button>
                                    ) : (
                                        <Link href="/user/checkout" className="w-full">
                                            <Button className="w-full bg-[#2C2B29] hover:bg-black text-white py-7 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg shadow-gray-200 transition-all transform active:scale-[0.98]">
                                                Proceed To Checkout
                                            </Button>
                                        </Link>
                                    )}

                                    <div className="mt-6 flex justify-center items-center gap-4">
                                        <Image src="/images/logo.png" alt="Payment Logos" width={100} height={30} className="opacity-20 grayscale brightness-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
