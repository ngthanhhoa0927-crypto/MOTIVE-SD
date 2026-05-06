"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Mail, Phone, User, MapPin, Truck, ArrowLeft, Lock, Check, X } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCart, isAuthenticated, removeFromCart } from "@/lib/cartApi";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

interface CartItem {
    id: number;
    quantity: number;
    product_variant: any;
    product: any;
    product_image: any;
}

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isBuyNow = searchParams.get("buyNow") === "true";
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated_flag, setIsAuthenticated_flag] = useState(false);

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [fullName, setFullName] = useState("");
    const [province, setProvince] = useState<any>(null);
    const [district, setDistrict] = useState<any>(null);
    const [ward, setWard] = useState<any>(null);
    const [specificAddress, setSpecificAddress] = useState("");
    const [provincesData, setProvincesData] = useState<any[]>([]);
    const [districtsData, setDistrictsData] = useState<any[]>([]);
    const [wardsData, setWardsData] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [shippingMethod, setShippingMethod] = useState("standard");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [saveInfo, setSaveInfo] = useState(false);
    const [newOrderId, setNewOrderId] = useState<number | null>(null);

    useEffect(() => {
        const initCheckout = async () => {
            setLoading(true);
            try {
                const authenticated = await isAuthenticated();
                if (!authenticated) {
                    router.push("/user/login?redirect=/user/checkout");
                    return;
                }
                setIsAuthenticated_flag(true);

                const cart = await fetchCart();
                setCartItems(cart);
                
                // Fetch profile to pre-fill info
                const response = await fetch("http://localhost:8000/auth/me", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.profile) {
                         const p = data.profile;
                         const saved = localStorage.getItem("savedCheckoutInfo");
                         if (saved) {
                             try {
                                 const parsed = JSON.parse(saved);
                                 setEmail(parsed.email || p.email || "");
                                 setFullName(parsed.fullName || p.full_name || "");
                                 setPhone(parsed.phone || p.phone_number || "");
                                 setSpecificAddress(parsed.specificAddress || p.address || "");
                                 if (parsed.province) setProvince(parsed.province);
                                 if (parsed.district) setDistrict(parsed.district);
                                 if (parsed.ward) setWard(parsed.ward);
                                 if (parsed.districtsData) setDistrictsData(parsed.districtsData);
                                 if (parsed.wardsData) setWardsData(parsed.wardsData);
                                 setSaveInfo(true);
                             } catch(e) {
                                 setEmail(p.email || "");
                                 setFullName(p.full_name || "");
                                 setPhone(p.phone_number || "");
                                 setSpecificAddress(p.address || "");
                             }
                         } else {
                             setEmail(p.email || "");
                             setFullName(p.full_name || "");
                             setPhone(p.phone_number || "");
                             setSpecificAddress(p.address || "");
                         }
                    }
                }
            } catch (err: any) {
                console.error("Failed to initialize checkout:", err);
            } finally {
                setLoading(false);
            }
        };

        initCheckout();

        // Fetch provinces
        fetch("https://provinces.open-api.vn/api/?depth=3")
            .then(res => res.json())
            .then(data => {
                const popularNames = ["Thành phố Hà Nội", "Thành phố Hồ Chí Minh", "Thành phố Đà Nẵng", "Thành phố Hải Phòng", "Thành phố Cần Thơ"];
                const popular = data.filter((p: any) => popularNames.includes(p.name)).sort((a: any, b: any) => popularNames.indexOf(a.name) - popularNames.indexOf(b.name));
                const others = data.filter((p: any) => !popularNames.includes(p.name));
                setProvincesData([...popular, ...others]);
            })
            .catch(err => console.error("Failed to fetch provinces:", err));

        // Clean up buyNow data when leaving
        return () => {
            if (isBuyNow) {
                sessionStorage.removeItem("buyNowItem");
            }
        };
    }, [router, isBuyNow]);

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
            case "province":
                if (!value) error = "Province/City is required.";
                break;
            case "district":
                if (!value) error = "District is required.";
                break;
            case "ward":
                if (!value) error = "Ward/Commune is required.";
                break;
            case "specificAddress":
                if (!value) {
                    error = "Specific address is required.";
                } else if (value.trim().length < 5) {
                    error = "Address must be at least 5 characters.";
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

        if (!province) newErrors.province = "Province/City is required.";
        if (!district) newErrors.district = "District is required.";
        if (!ward) newErrors.ward = "Ward/Commune is required.";
        
        if (!specificAddress) {
            newErrors.specificAddress = "Specific address is required.";
        } else if (specificAddress.trim().length < 5) {
            newErrors.specificAddress = "Address must be at least 5 characters.";
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

    const handleCheckout = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setErrors({});
            setIsProcessing(true);
            try {
                const token = localStorage.getItem("token");
                const fullAddress = `${specificAddress}, ${ward.name}, ${district.name}`;
                
                const response = await fetch("http://localhost:8000/orders/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        receiverName: fullName,
                        receiverPhone: phone,
                        shippingAddress: fullAddress,
                        shippingCity: province.name,
                        paymentMethod: paymentMethod,
                        shippingMethod: shippingMethod
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setNewOrderId(data.order.id);
                    
                    if (!isBuyNow) {
                        window.dispatchEvent(new Event("cartUpdated"));
                    }

                    if (saveInfo) {
                        localStorage.setItem("savedCheckoutInfo", JSON.stringify({
                            email, fullName, phone, specificAddress,
                            province, district, ward,
                            districtsData, wardsData
                        }));
                    } else {
                        localStorage.removeItem("savedCheckoutInfo");
                    }
                    
                    setShowSuccess(true);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Failed to create order. Please try again.");
                }
            } catch (err) {
                console.error("Checkout failed:", err);
                alert("An unexpected error occurred. Please try again later.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const isFormFilled = fullName && province && district && ward && specificAddress && phone;

    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.product_variant.price) * item.quantity), 0);
    const shipping = shippingMethod === "express" ? 15.00 : (subtotal > 50 ? 0 : 5.00);
    const total = subtotal + shipping;

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </main>
                <Footer />
            </div>
        );
    }

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
                            {newOrderId && (
                                <Link href={`/user/orders/${newOrderId}`} className="w-full">
                                    <Button className="w-full bg-[#2B60E6] hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 py-7 rounded-2xl font-bold transition-all text-base">
                                        View Order Details
                                    </Button>
                                </Link>
                            )}
                            
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
                                        <input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Save my information</span>
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
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${errors.province ? 'text-red-500' : 'text-gray-500'}`}>
                                        <MapPin className="w-3 h-3" /> Province / City
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`w-full bg-[#F3F4F6] border-2 rounded-xl px-4 py-4 text-sm focus:outline-none transition-all appearance-none cursor-pointer ${errors.province ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-blue-600'}`}
                                            value={province?.code || ""}
                                            onChange={(e) => {
                                                if (!e.target.value) {
                                                    setProvince(null);
                                                    setDistrict(null);
                                                    setWard(null);
                                                    setDistrictsData([]);
                                                    setWardsData([]);
                                                } else {
                                                    const p = provincesData.find(p => p.code == e.target.value);
                                                    setProvince(p);
                                                    setDistrict(null);
                                                    setWard(null);
                                                    setDistrictsData(p?.districts || []);
                                                    setWardsData([]);
                                                }
                                                validateField("province", e.target.value);
                                            }}
                                            onBlur={(e) => validateField("province", e.target.value)}
                                        >
                                            <option value="">Select Province / City</option>
                                            {provincesData.map((p: any) => (
                                                <option key={p.code} value={p.code}>{p.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                        </div>
                                    </div>
                                    {errors.province && <p className="text-red-500 text-xs font-medium">{errors.province}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${errors.district ? 'text-red-500' : 'text-gray-500'}`}>
                                        District
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`w-full bg-[#F3F4F6] border-2 rounded-xl px-4 py-4 text-sm focus:outline-none transition-all appearance-none cursor-pointer ${!province ? 'opacity-50 cursor-not-allowed' : ''} ${errors.district ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-blue-600'}`}
                                            value={district?.code || ""}
                                            disabled={!province}
                                            onChange={(e) => {
                                                if (!e.target.value) {
                                                    setDistrict(null);
                                                    setWard(null);
                                                    setWardsData([]);
                                                } else {
                                                    const d = districtsData.find(d => d.code == e.target.value);
                                                    setDistrict(d);
                                                    setWard(null);
                                                    setWardsData(d?.wards || []);
                                                }
                                                validateField("district", e.target.value);
                                            }}
                                            onBlur={(e) => validateField("district", e.target.value)}
                                        >
                                            <option value="">Select District</option>
                                            {districtsData.map((d: any) => (
                                                <option key={d.code} value={d.code}>{d.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                        </div>
                                    </div>
                                    {errors.district && <p className="text-red-500 text-xs font-medium">{errors.district}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${errors.ward ? 'text-red-500' : 'text-gray-500'}`}>
                                        Ward / Commune
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`w-full bg-[#F3F4F6] border-2 rounded-xl px-4 py-4 text-sm focus:outline-none transition-all appearance-none cursor-pointer ${!district ? 'opacity-50 cursor-not-allowed' : ''} ${errors.ward ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-blue-600'}`}
                                            value={ward?.code || ""}
                                            disabled={!district}
                                            onChange={(e) => {
                                                const w = wardsData.find(w => w.code == e.target.value);
                                                setWard(w || null);
                                                validateField("ward", e.target.value);
                                            }}
                                            onBlur={(e) => validateField("ward", e.target.value)}
                                        >
                                            <option value="">Select Ward / Commune</option>
                                            {wardsData.map((w: any) => (
                                                <option key={w.code} value={w.code}>{w.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                            <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                        </div>
                                    </div>
                                    {errors.ward && <p className="text-red-500 text-xs font-medium">{errors.ward}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${errors.specificAddress ? 'text-red-500' : 'text-gray-500'}`}>
                                        Specific Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="House number, Street name"
                                        className={`w-full bg-[#F3F4F6] border-2 rounded-xl px-4 py-4 text-sm focus:outline-none transition-all ${errors.specificAddress ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-blue-600'}`}
                                        value={specificAddress}
                                        onChange={(e) => setSpecificAddress(e.target.value)}
                                        onBlur={(e) => validateField("specificAddress", e.target.value)}
                                    />
                                    {errors.specificAddress && <p className="text-red-500 text-xs font-medium">{errors.specificAddress}</p>}
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
                                <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-blue-600 bg-blue-50/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center flex-shrink-0">
                                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
                                            <span className="text-xs text-gray-500">Pay when you receive the product</span>
                                        </div>
                                    </div>
                                    <Truck className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </section>

                        {/* Order Action */}
                        <div className="pt-8">
                            <Link href="/user/cart" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2 mb-6">
                                <ArrowLeft className="w-4 h-4" /> Edit Shopping Cart
                            </Link>
                            <Button disabled={!isFormFilled || isProcessing} onClick={handleCheckout} className={`w-full text-white py-8 rounded-3xl font-bold text-lg uppercase tracking-[0.2em] shadow-xl transition-all transform ${isFormFilled && !isProcessing ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 hover:scale-[1.01] active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}>
                                {isProcessing ? "Processing..." : "Complete Order"}
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
                                            <Image src={item.product_image?.signed_url || "/images/placeholder-hat.png"} alt={item.product.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                                            <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900">
                                            ${(Number(item.product_variant.price) * item.quantity).toFixed(2)}
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
