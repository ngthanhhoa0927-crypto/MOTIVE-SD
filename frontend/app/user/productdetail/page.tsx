"use client";

import { useState } from "react";
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
    const [quantity, setQuantity] = useState(1);

    // Mock data
    const images = Array(6).fill("/images/placeholder-hat.png"); // Thay bằng ảnh thật
    const colors = ["bg-zinc-800", "bg-green-800", "bg-pink-200", "bg-gray-200"];
    const sizes = ["S", "M", "L", "XL", "Free Size"];

    const recommendations = Array(6).fill({
        name: "Plaid dog ear baseball cap",
        price: "$19.00",
        oldPrice: "$29.00",
        discount: "-32%",
    });

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
                    <Link href="/" className="hover:text-blue-600 transition">Homepage</Link>
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
                                src={images[selectedImage]}
                                alt="Product Image"
                                fill
                                className="object-contain p-4"
                            />
                            {/* Nút next ảnh (mô phỏng) */}
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition">
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        {/* Thumbnail mờ */}
                        <div className="grid grid-cols-6 gap-3">
                            {images.map((img, idx) => (
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
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Plaid Dog-Ear Baseball Cap</h1>
                            <div className="mt-1">{renderStars(5)}</div>
                        </div>

                        {/* Màu sắc */}
                        <div className="mt-6">
                            <span className="text-sm font-semibold text-gray-800 block mb-2">Color</span>
                            <div className="flex gap-3">
                                {colors.map((color, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedColor(idx)}
                                        className={`w-6 h-6 rounded-full cursor-pointer border-2 transition ${color} ${selectedColor === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        <div className="mt-6">
                            <span className="text-sm font-semibold text-gray-800 block mb-2">Size</span>
                            <div className="flex gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-1.5 border rounded text-xs font-medium transition ${selectedSize === size ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Giá & Hành động */}
                        <div className="mt-8">
                            <div className="text-2xl font-bold text-blue-600 mb-4">$19.00</div>
                            <div className="flex items-center gap-4">
                                {/* Chọn số lượng */}
                                <div className="flex items-center border border-gray-200 rounded h-10 w-24">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50">-</button>
                                    <input type="text" value={quantity} readOnly className="flex-1 h-full w-full text-center text-sm font-medium outline-none" />
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50">+</button>
                                </div>
                                <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-8 flex-1">Add to Cart</Button>
                                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 h-10 px-8 flex-1">Buy now</Button>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* Features (Chính sách) */}
                        <div className="grid grid-cols-3 gap-4 px-4">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-[#8B3A3A] rounded-full flex items-center justify-center text-white relative">
                                    <span className="absolute -top-1 -right-1 bg-[#8B3A3A] text-white text-[8px] font-bold px-1 rounded-full border border-white">x2</span>
                                    <Package className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium px-2">Careful Packaging</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-[#8B3A3A] rounded-full flex items-center justify-center text-white relative">
                                    <span className="absolute -top-1 -right-1 bg-[#8B3A3A] text-white text-[8px] font-bold px-1 rounded-full border border-white">7</span>
                                    <RefreshCcw className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium px-2">Free exchange within 7 days</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-[#8B3A3A] rounded-full flex items-center justify-center text-white relative">
                                    <span className="absolute -top-1 -right-1 bg-[#8B3A3A] text-white text-[8px] font-bold px-1 rounded-full border border-white">L</span>
                                    <Truck className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium px-2">Fast product delivery</span>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* Coupons */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-dashed border-blue-400 bg-blue-50/50 rounded-lg p-4 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-blue-700">Free Shipping</p>
                                        <p className="text-[10px] text-gray-500">Any Order</p>
                                    </div>
                                    <Ticket className="w-4 h-4 text-orange-500" />
                                </div>
                                <Button size="sm" className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700">Save</Button>
                            </div>
                            <div className="border border-dashed border-blue-400 bg-blue-50/50 rounded-lg p-4 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-blue-700">Save $5</p>
                                        <p className="text-[10px] text-gray-500">For first order</p>
                                    </div>
                                    <Ticket className="w-4 h-4 text-orange-500" />
                                </div>
                                <Button size="sm" className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700">Save</Button>
                            </div>
                        </div>

                    </div>
                </section>

                {/* --- PRODUCT RECOMMENDATIONS --- */}
                <section className="mb-12">
                    <h3 className="font-bold text-lg text-blue-700 mb-6 uppercase">Product Recommendations</h3>
                    <div className="grid grid-cols-6 gap-4">
                        {recommendations.map((item, i) => (
                            <div key={i} className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition relative group">
                                <span className="absolute top-4 left-4 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                    {item.discount}
                                </span>
                                <Link href={`/product/rec-${i}`} className="block aspect-square bg-gray-50 rounded mb-2 relative overflow-hidden flex items-center justify-center border border-gray-100">
                                    <Image src="/images/placeholder-hat.png" alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                </Link>
                                <Link href={`/product/rec-${i}`}>
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