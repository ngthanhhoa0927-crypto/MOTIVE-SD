"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Mail, Phone, User, MapPin, Truck, CreditCard, ArrowLeft, Lock, Check, X } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

// Mock cart items for summary
const cartItems = [
    {
        id: 1,
        name: "Black Dog Ear Baseball Cap",
        price: 19.00,
        image: "/images/hat-dog-black.png",
        quantity: 1,
    },
    {
        id: 2,
        name: "Bear Cub Ear Baseball Cap",
        price: 22.00,
        image: "/images/hat-bear.png",
        quantity: 2,
    }
];

export default function CheckoutPage() {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [shippingMethod, setShippingMethod] = useState("standard");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    const validateField = (field: string, value: string) => {
        let error = "";

        switch (field) {
            case "fullName":
                if (!value) {
                    error = "Full name is required.";
                } else if (/[0-9]/.test(value) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
                    error = "Full name must not contain numbers or special characters.";
                } else if (value.trim().length < 2) {
                    error = "Full name must be at least 2 characters.";
                }
                break;
            case "address":
                if (!value) {
                    error = "Street address is required.";
                } else if (value.trim().length < 5) {
                    error = "Address must be at least 5 characters.";
                }
                break;
            case "city":
                if (!value) {
                    error = "City is required.";
                } else if (/[0-9]/.test(value) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
                    error = "City must contain only letters.";
                }
                break;
            case "phone":
                if (!value) {
                    error = "Phone number is required.";
                } else {
                    const phoneRegex = /^(0\d{9}|(\(\+84\)|\+84)\d{9})$/;
                    if (!phoneRegex.test(value)) {
                        error = "Invalid phone number.";
                    }
                }
                break;
        }

        setErrors(prev => {
            const next = { ...prev };
            if (error) {
                next[field] = error;
            } else {
                delete next[field];
            }
            return next;
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Full Name
        if (!fullName) {
            newErrors.fullName = "Full name is required.";
        } else if (/[0-9]/.test(fullName) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(fullName)) {
            newErrors.fullName = "Full name must not contain numbers or special characters.";
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = "Full name must be at least 2 characters.";
        }

        // Street Address
        if (!address) {
            newErrors.address = "Street address is required.";
        } else if (address.trim().length < 5) {
            newErrors.address = "Address must be at least 5 characters.";
        }

        // City
        if (!city) {
            newErrors.city = "City is required.";
        } else if (/[0-9]/.test(city) || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(city)) {
            newErrors.city = "City must contain only letters.";
        }

        // Phone
        if (!phone) {
            newErrors.phone = "Phone number is required.";
        } else {
            const phoneRegex = /^(0\d{9}|(\(\+84\)|\+84)\d{9})$/;
            if (!phoneRegex.test(phone)) {
                newErrors.phone = "Invalid phone number.";
            }
        }

        return newErrors;
    };

    const handleCheckout = () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            setShowSuccess(true);
        }
    };

    const isFormFilled = fullName && address && city && phone;

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = shippingMethod === "express" ? 15.00 : (subtotal > 50 ? 0 : 5.00);
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return (
        <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-[#FAF9F6] rounded-[24px] p-8 max-w-[480px] w-full mx-4 shadow-2xl flex flex-col items-center text-center transform transition-all relative border border-gray-100">
                        <button onClick={() => setShowSuccess(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="w-20 h-20 bg-green-100/80 rounded-full flex items-center justify-center mb-6 mt-4">
                            <Check className="w-10 h-10 text-emerald-500" strokeWidth={3} />
                        </div>
                        
                        <h2 className={`text-[28px] font-bold text-[#1A1A1A] mb-8 leading-tight ${inter.className}`}>Thank You for Your Order!</h2>
                        
                        <div className="w-full flex flex-col gap-4">
                            <Link href="/user/orders/MSD-89241" className="w-full">
                                <Button className="w-full bg-[#2B60E6] hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 py-7 rounded-2xl font-bold transition-all text-base">
                                    View Order Details
                                </Button>
                            </Link>
                            
                            <Link href="/user/homepage" className="w-full">
                                <Button variant="outline" className="w-full bg-transparent border-2 border-gray-200/80 text-gray-700 hover:bg-gray-50 py-7 rounded-2xl font-bold transition-all text-base">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            <Header />

            <main className="flex-grow max-w-[1400px] mx-auto w-full px-8 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-200 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 uppercase tracking-widest font-semibold">
                            <Link href="/user/cart" className="hover:text-blue-600 transition-colors">Cart</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-900">Checkout</span>
                        </div>
                        <h1 className={`${playfair.className} text-5xl text-gray-900`}>Secure Checkout</h1>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-gray-500 text-sm font-medium">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            <Lock className="w-4 h-4 text-green-600" />
                            <span>SSL Encrypted</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Buyer Protection</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Checkout Form */}
                    <div className="flex-1 space-y-12">
                        {/* Section 1: Contact Information */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${errors.phone ? 'text-red-500' : 'text-gray-500'}`}>
                                        <Phone className="w-3 h-3" /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="0xx.xxxx.xxx"
                                        className={`w-full bg-[#F3F4F6] border-2 rounded-xl px-4 py-4 text-sm focus:outline-none transition-all ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-blue-600'}`}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onBlur={(e) => validateField("phone", e.target.value)}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs font-medium">{errors.phone}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Keep me updated on news and exclusive offers</span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Shipping Address */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <div className="md:col-span-2 space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${errors.fullName ? 'text-red-500' : 'text-gray-500'}`}>
                                        <User className="w-3 h-3" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className={`w-full bg-[#F3F4F6] border-2 rounded-xl px-4 py-4 text-sm focus:outline-none transition-all ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-blue-600'}`}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        onBlur={(e) => validateField("fullName", e.target.value)}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-xs font-medium">{errors.fullName}</p>}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${errors.address ? 'text-red-500' : 'text-gray-500'}`}>
                                        <MapPin className="w-3 h-3" /> Street Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123 Fashion Ave, Suite 456"
                                        className={`w-full bg-[#F3F4F6] border-2 rounded-xl px-4 py-4 text-sm focus:outline-none transition-all ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-blue-600'}`}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        onBlur={(e) => validateField("address", e.target.value)}
                                    />
                                    {errors.address && <p className="text-red-500 text-xs font-medium">{errors.address}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${errors.city ? 'text-red-500' : 'text-gray-500'}`}>
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="New York"
                                        className={`w-full bg-[#F3F4F6] border-2 rounded-xl px-4 py-4 text-sm focus:outline-none transition-all ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-blue-600'}`}
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        onBlur={(e) => validateField("city", e.target.value)}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs font-medium">{errors.city}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="10001"
                                        className="w-full bg-[#F3F4F6] border-none rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Shipping Method */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                <h2 className="text-xl font-bold text-gray-900">Shipping Method</h2>
                            </div>
                            <div className="space-y-4">
                                <label onClick={() => setShippingMethod('standard')} className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all cursor-pointer ${shippingMethod === 'standard' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${shippingMethod === 'standard' ? 'border-blue-600' : 'border-gray-200'}`}>
                                            {shippingMethod === 'standard' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 uppercase text-sm tracking-wide">Standard Delivery</span>
                                            <span className="text-sm text-gray-500">4-10 business days</span>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-lg leading-none ${shippingMethod === 'standard' ? 'text-blue-600' : 'text-gray-900'}`}>{subtotal > 50 ? "$0.00" : "$5.00"}</div>
                                </label>
                                <label onClick={() => setShippingMethod('express')} className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all cursor-pointer ${shippingMethod === 'express' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${shippingMethod === 'express' ? 'border-blue-600' : 'border-gray-200'}`}>
                                            {shippingMethod === 'express' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 uppercase text-sm tracking-wide">Express Delivery</span>
                                            <span className="text-sm text-gray-500">2-3 business days</span>
                                        </div>
                                    </div>
                                    <div className={`font-bold text-lg leading-none ${shippingMethod === 'express' ? 'text-blue-600' : 'text-gray-900'}`}>$15.00</div>
                                </label>
                            </div>
                        </section>

                        {/* Section 4: Payment Method */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                            </div>
                            <div className="space-y-4">
                                <label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-blue-600" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">Credit or Debit Card</span>
                                            <span className="text-xs text-gray-500">Secure payment via Stripe</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <CreditCard className="w-6 h-6 text-gray-400" />
                                    </div>
                                </label>
                                <label className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-blue-600" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">Cash on Delivery</span>
                                            <span className="text-xs text-gray-500">Pay when you receive the product</span>
                                        </div>
                                    </div>
                                    <Truck className="w-6 h-6 text-gray-400" />
                                </label>
                            </div>
                        </section>

                        {/* Order Action */}
                        <div className="pt-8">
                            <Link href="/user/cart" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2 mb-6">
                                <ArrowLeft className="w-4 h-4" /> Edit Shopping Cart
                            </Link>
                            <Button disabled={!isFormFilled} onClick={handleCheckout} className={`w-full text-white py-8 rounded-3xl font-bold text-lg uppercase tracking-[0.2em] shadow-xl transition-all transform ${isFormFilled ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 hover:scale-[1.01] active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}>
                                Complete Order
                            </Button>
                            <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
                                <Lock className="w-3 h-3" /> Your transaction is secured with industry-standard encryption.
                            </p>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:w-[450px]">
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 sticky top-12">
                            <h2 className={`${playfair.className} text-3xl text-gray-900 mb-8`}>Order Details</h2>

                            <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-6 items-center group">
                                        <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mb-8 border-t border-gray-100 pt-8">
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
                                    <span className="text-gray-500 font-medium">Tax</span>
                                    <span className="text-gray-900 font-bold">${tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-baseline mb-8 px-2">
                                <span className="text-xl font-bold text-gray-900 leading-none">Total</span>
                                <span className="text-4xl font-extrabold text-blue-600 leading-none">${total.toFixed(2)}</span>
                            </div>

                            <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-4 items-start border border-blue-100">
                                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                                    Your order includes our <strong>7-Day Quality Guarantee</strong>. If you're not satisfied, we'll make it right.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
