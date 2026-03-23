"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, Package, RefreshCcw, Truck, Ticket } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function ProductDetailsPage() {
    // State quản lý lựa chọn của người dùng
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState("S");
    const [quantity, setQuantity] = useState<number | string>(1);
    const [quantityError, setQuantityError] = useState("");
    const [activeTab, setActiveTab] = useState("description");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    // Mock data for multiple colors
    const colorOptions = [
        {
            value: "bg-zinc-800",
            name: "Black",
            images: Array(6).fill("/images/hat-dog-black.png"),
        },
        {
            value: "bg-green-800",
            name: "Green",
            images: Array(6).fill("/images/hat-dog-dot.png"), // just using dot hat as a green placeholder proxy
        },
        {
            value: "bg-pink-200",
            name: "Pink",
            images: Array(6).fill("/images/hat-rabbit-white.png"), // using rabbit hat as pink mock
        },
        {
            value: "bg-gray-200",
            name: "White",
            images: Array(6).fill("/images/hat-bear-white.png"), // using bear white hat mock
        }
    ];

    const currentImages = colorOptions[selectedColor].images;
    const sizes = ["S", "M", "L", "XL", "Free Size"];

    const recommendations = [
        { name: "Plaid dog ear baseball cap", price: "$19.00", oldPrice: "$29.00", discount: "-32%", image: "/images/hat-dog-black.png" },
        { name: "Plaid dog ear baseball cap", price: "$19.00", oldPrice: "$29.00", discount: "-32%", image: "/images/hat-dog-dot.png" },
        { name: "Plaid dog ear baseball cap", price: "$19.00", oldPrice: "$29.00", discount: "-32%", image: "/images/hat-bear.png" },
        { name: "Plaid dog ear baseball cap", price: "$19.00", oldPrice: "$29.00", discount: "-32%", image: "/images/hat-bear-white.png" },
        { name: "Plaid dog ear baseball cap", price: "$19.00", oldPrice: "$29.00", discount: "-32%", image: "/images/hat-rabbit-white.png" },
        { name: "Plaid dog ear baseball cap", price: "$19.00", oldPrice: "$29.00", discount: "-32%", image: "/images/placeholder-hat.png" },
    ];

    const renderStars = (rating: number) => (
        <div className="flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
            ))}
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header />

            <main className="flex-grow max-w-[1400px] mx-auto px-8 py-6 w-full">
                {/* --- BREADCRUMBS --- */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
                    <Link href="/user/homepage" className="hover:text-blue-600 transition">Homepage</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/category/baseball-hat" className="hover:text-blue-600 transition">Baseball Hat</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900 font-medium">Plaid dog ear baseball cap</span>
                </div>

                {/* --- PRODUCT MAIN SECTION --- */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

                    {/* Cột trái: Hình ảnh */}
                    <div>
                        {/* Ảnh lớn */}
                        <div className="aspect-square bg-white border border-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center mb-4 p-8 shadow-sm">
                            <Image
                                src={currentImages[selectedImage]}
                                alt="Product Image"
                                fill
                                className="object-contain p-4"
                            />
                            {/* Nút next ảnh (mô phỏng) */}
                            <button 
                                onClick={() => setSelectedImage((prev) => (prev + 1) % currentImages.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        {/* Thumbnail mờ */}
                        <div className="grid grid-cols-6 gap-3">
                            {currentImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-square bg-gray-50 border rounded-lg overflow-hidden relative cursor-pointer hover:border-blue-400 transition ${selectedImage === idx ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200'}`}
                                >
                                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột phải: Thông tin sản phẩm */}
                    <div className="py-2">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Plaid Dog-Ear Baseball</h1>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-6">
                                Add a touch of fun and personality to your outfit with this cute puppy baseball cap, designed with an adorable 3D puppy face and soft floppy ears. This cap brings a playful and unique look that instantly stands out.
                            </p>
                        </div>

                        {/* Màu sắc */}
                        <div className="mt-6">
                            <span className="text-sm font-semibold text-gray-800 block mb-2">Color: {colorOptions[selectedColor].name}</span>
                            <div className="flex gap-3">
                                {colorOptions.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedColor(idx);
                                            setSelectedImage(0); // Reset ảnh về đầu tiên khi đổi màu
                                        }}
                                        className={`w-8 h-8 rounded-full cursor-pointer border-2 transition ${color.value} ${selectedColor === idx ? 'border-blue-600 ring-2 ring-blue-100 shadow-md' : 'border-gray-300 hover:border-gray-400'}`}
                                        aria-label={`Select color ${color.name}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <span className="text-sm font-semibold text-gray-800 block mb-2">Size</span>
                            <div className="flex gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-1.5 border rounded-md text-xs font-medium transition ${selectedSize === size ? 'border-gray-800 text-gray-800 bg-white ring-1 ring-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Giá */}
                        <div className="mt-8 mb-4">
                            <div className="text-3xl font-bold text-blue-600">{recommendations[0].price}</div>
                            <div className="mt-1">{renderStars(5)}</div>
                        </div>

                        {/* Hành động */}
                        <div className="mt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1 items-center">
                                    <div className={`flex items-center border rounded-md h-12 w-28 overflow-hidden transition-colors ${quantityError ? "border-red-500 bg-red-50/10" : "border-gray-300 ring-offset-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500"}`}>
                                        <button 
                                            onClick={() => {
                                                setQuantity(Math.max(1, Number(quantity) - 1));
                                                setQuantityError(""); // Clear error when use buttons
                                            }} 
                                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="text" 
                                            value={quantity} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, ""); // Chỉ lấy số
                                                setQuantity(val);
                                                setQuantityError(""); // Xóa lỗi khi người dùng sửa
                                            }}
                                            onBlur={(e) => {
                                                let num = parseInt(e.target.value);
                                                
                                                if (isNaN(num) || num < 1) {
                                                    setQuantity(1);
                                                    if (num === 0) setQuantityError("Minimum 1");
                                                } else if (num > 99) {
                                                    setQuantity(99);
                                                    setQuantityError("Maximum 99");
                                                } else {
                                                    setQuantity(num);
                                                    setQuantityError("");
                                                }
                                            }}
                                            className="flex-1 h-full w-full text-center text-sm font-medium outline-none bg-transparent" 
                                        />
                                        <button 
                                            onClick={() => {
                                                setQuantity(Math.min(99, Number(quantity) + 1));
                                                setQuantityError(""); // Clear error when use buttons
                                            }} 
                                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {quantityError && (
                                        <span className="text-[10px] text-red-500 font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                                            {quantityError}
                                        </span>
                                    )}
                                </div>
                                <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-10 rounded-md font-semibold text-sm">Add to Cart</Button>
                                <Link href="/user/checkout">
                                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-10 rounded-md font-semibold text-sm">Buy now</Button>
                                </Link>
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-3 gap-6">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-[#8B3A3A] rounded-full flex items-center justify-center text-white relative shadow-sm">
                                    <span className="absolute -top-1 -right-1 bg-[#8B3A3A] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">x2</span>
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium tracking-tight">Careful Packaging</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-[#8B3A3A] rounded-full flex items-center justify-center text-white relative shadow-sm">
                                    <span className="absolute -top-1 -right-1 bg-[#8B3A3A] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">7</span>
                                    <RefreshCcw className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium tracking-tight px-2">Free exchange within 7 days</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-[#8B3A3A] rounded-full flex items-center justify-center text-white relative shadow-sm">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium tracking-tight px-2">Fast product delivery</span>
                            </div>
                        </div>

                        {/* Coupons */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="border border-dashed border-blue-400 bg-blue-50/50 rounded-lg p-3 relative flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-blue-700 flex items-center gap-1 mb-0.5">Free Shipping <Truck className="w-3.5 h-3.5" /></p>
                                    <p className="text-[10px] text-gray-500">Any Order</p>
                                </div>
                                <Button size="sm" className="h-7 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700">Save</Button>
                            </div>
                            <div className="border border-dashed border-blue-400 bg-blue-50/50 rounded-lg p-3 relative flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-blue-700 flex items-center gap-1 mb-0.5">Save $5 <Ticket className="w-3.5 h-3.5 text-orange-500" /></p>
                                    <p className="text-[10px] text-gray-500">For first order</p>
                                </div>
                                <Button size="sm" className="h-7 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700">Save</Button>
                            </div>
                        </div>

                    </div>
                </section>

                <hr className="my-12 border-gray-100" />

                {/* --- PRODUCT DESCRIPTION TABS --- */}
                <section className="mb-16">
                    <div className="flex gap-8 border-b border-gray-200 mb-8">
                        <button 
                            className={`text-sm font-bold pb-3 uppercase tracking-wider transition ${activeTab === "description" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-800"}`}
                            onClick={() => setActiveTab("description")}
                        >
                            DESCRIPTION
                        </button>
                        <button 
                            className={`text-sm font-bold pb-3 uppercase tracking-wider transition ${activeTab === "review" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-800"}`}
                            onClick={() => setActiveTab("review")}
                        >
                            REVIEWS (30)
                        </button>
                    </div>

                    {activeTab === "description" ? (
                        <div className="max-w-4xl text-sm text-gray-700 leading-relaxed space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base mb-2">Plaid Dog-Ear Baseball</h3>
                                <p>
                                    Add a touch of fun and personality to your outfit with this cute puppy baseball cap. Designed with an adorable 3D puppy face and soft floppy ears, this cap brings a playful and unique look that instantly stands out.
                                </p>
                            </div>
                            <p>
                                Made from high-quality plaid fabric, the cap is lightweight, breathable, and comfortable for everyday wear. The curved brim helps provide shade from the sun, making it perfect for outdoor activities such as travel, or casual outings.
                            </p>
                            
                            <div className="flex flex-col md:flex-row gap-8 justify-center my-10 py-4">
                                <Image src="/images/hat-dog-black.png" alt="Detail 1" width={250} height={250} className="object-contain" />
                                <Image src="/images/hat-dog-dot.png" alt="Detail 2" width={250} height={250} className="object-contain" />
                            </div>

                            <p>Whether you're looking for a fun fashion accessory or a unique gift, this cap is a charming and stylish choice for anyone who loves cute design!</p>
                            
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Adorable 3D puppy design with floppy ears</li>
                                    <li>Stylish plaid pattern for a trendy look</li>
                                    <li>Soft and breathable fabric for comfortable wear</li>
                                    <li>Curved brim for sun protection</li>
                                    <li>Perfect for daily wear, travel, photos, and casual outfits</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Product Details:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Product Type: Baseball Cap</li>
                                    <li>Material: Premium fabric</li>
                                    <li>Design: 3D puppy style</li>
                                    <li>Pattern: Plaid</li>
                                    <li>Suitable for: Kids and adults</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl">
                            {/* OVERALL RATING */}
                            <div className="flex bg-[#F8F9FA] p-8 gap-12 rounded-sm mb-10 w-full max-w-2xl">
                                <div className="flex flex-col items-center justify-center min-w-[120px]">
                                    <div className="text-4xl font-extrabold text-gray-900 mb-1">4.9</div>
                                    <div className="mb-2">{renderStars(5)}</div>
                                    <div className="text-[10px] text-gray-500">Based on 30 reviews</div>
                                </div>
                                <div className="flex-1 space-y-1.5 border-l border-gray-200 pl-12 text-[10px] font-medium text-gray-500">
                                    <div className="flex items-center gap-3"><span className="w-8 text-right">5 Star</span><div className="h-2 flex-1 bg-gray-200"><div className="h-full bg-yellow-400 w-[100%]"></div></div><span className="w-8">100%</span></div>
                                    <div className="flex items-center gap-3"><span className="w-8 text-right">4 Star</span><div className="h-2 flex-1 bg-gray-200"><div className="h-full bg-yellow-400 w-[45%]"></div></div><span className="w-8">45%</span></div>
                                    <div className="flex items-center gap-3"><span className="w-8 text-right">3 Star</span><div className="h-2 flex-1 bg-gray-200"><div className="h-full bg-yellow-400 w-[0%]"></div></div><span className="w-8">0%</span></div>
                                    <div className="flex items-center gap-3"><span className="w-8 text-right">2 Star</span><div className="h-2 flex-1 bg-gray-200"><div className="h-full bg-yellow-400 w-[0%]"></div></div><span className="w-8">0%</span></div>
                                    <div className="flex items-center gap-3"><span className="w-8 text-right">1 Star</span><div className="h-2 flex-1 bg-gray-200"><div className="h-full bg-yellow-400 w-[0%]"></div></div><span className="w-8">0%</span></div>
                                </div>
                            </div>

                            {/* USER REVIEWS LIST */}
                            <div className="space-y-6 mb-12">
                                {[1, 2, 3, 4].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden relative">
                                            <Image src="/images/avatar-placeholder.jpg" alt="User" fill className="object-cover" />
                                        </div>
                                        <div>
                                            {renderStars(5)}
                                            <div className="text-[10px] text-gray-400 mt-1 mb-2">
                                                <span className="font-semibold text-gray-700">Alice Smith / Verified purchaser</span> • 05/04/2025
                                            </div>
                                            <p className="text-xs text-gray-700">Great quality hat, nice and helpful product</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ADD REVIEW FORM */}
                            <div className="max-w-xl">
                                <h3 className="font-bold text-gray-900 text-sm mb-4">Add more review</h3>
                                {!isLoggedIn ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                        <p className="text-sm text-gray-600 mb-4">You must be logged in to leave a review. No purchase is required!</p>
                                        <Button 
                                            onClick={() => router.push("/user/login")} 
                                            className="bg-blue-600 hover:bg-blue-700 text-xs font-bold px-8 h-9 rounded-sm"
                                        >
                                            LOGIN TO REVIEW
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="mb-4">
                                            <label className="block text-[10px] font-semibold text-gray-700 mb-2">Your review *</label>
                                            <div className="flex gap-1 text-gray-300">
                                                <Star className="w-4 h-4 cursor-pointer hover:text-yellow-400" />
                                                <Star className="w-4 h-4 cursor-pointer hover:text-yellow-400" />
                                                <Star className="w-4 h-4 cursor-pointer hover:text-yellow-400" />
                                                <Star className="w-4 h-4 cursor-pointer hover:text-yellow-400" />
                                                <Star className="w-4 h-4 cursor-pointer hover:text-yellow-400" />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-[10px] font-semibold text-gray-700 mb-2">Your Feedback *</label>
                                            <textarea className="w-full border border-gray-200 rounded text-sm p-3 h-24 outline-none focus:border-blue-400 transition" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-700 mb-2">Name *</label>
                                                <input type="text" className="w-full border border-gray-200 rounded h-10 px-3 text-sm outline-none focus:border-blue-400 transition" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-700 mb-2">Email *</label>
                                                <input type="email" className="w-full border border-gray-200 rounded h-10 px-3 text-sm outline-none focus:border-blue-400 transition" />
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => {
                                                if (!localStorage.getItem("token")) {
                                                    alert("Session expired. Please log in again.");
                                                    router.push("/user/login");
                                                    return;
                                                }
                                                alert("Review sent successfully!");
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-xs font-bold px-8 h-9 rounded-sm"
                                        >
                                            SEND
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* --- PRODUCT RECOMMENDATIONS --- */}
                <section className="mb-12">
                    <h3 className="font-bold text-sm text-blue-600 mb-6 uppercase tracking-wider">MAYBE YOU LIKE</h3>
                    <div className="grid grid-cols-6 gap-4">
                        {recommendations.map((item, i) => (
                            <div key={i} className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition relative group">
                                <span className="absolute top-4 left-4 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                    {item.discount}
                                </span>
                                <Link href={`/user/productdetail`} className="block aspect-square bg-gray-50 rounded mb-2 relative overflow-hidden flex items-center justify-center border border-gray-100">
                                    <Image src={item.image || "/images/placeholder-hat.png"} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                </Link>
                                <Link href={`/user/productdetail`}>
                                    <h4 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 h-8 hover:text-blue-600 transition">{item.name}</h4>
                                </Link>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-blue-600 font-bold text-sm">{item.price}</span>
                                    <span className="text-gray-400 text-[10px] line-through">{item.oldPrice}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    {renderStars(5)}
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-[10px] h-6 px-3 rounded">Buy</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}