"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Filter, Zap, Star } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
    // Mock data cho bộ lọc
    const filterSizes = ["Free size", "S (20-21\")", "M (21-22\")", "L (22-23\")", "XL (23-24\")"];
    const filterColors = [
        { name: "Black", color: "bg-black" },
        { name: "White", color: "bg-white border border-gray-300" },
        { name: "Blue", color: "bg-blue-600" },
        { name: "Red", color: "bg-red-600" },
        { name: "Grey", color: "bg-gray-400" },
    ];
    const filterGenders = ["Men", "Women", "Unisex"];
    const filterAges = ["Kids (2-12)", "Teens (13-19)", "Adults (20+)"];
    const filterPrices = ["Under $5", "$5 - $10", "$10 - $15", "Over $15"];

    // Mock data cho sản phẩm
    const flashSaleProducts = Array(6).fill({
        name: "Plaid dog ear baseball cap",
        price: "$19.00",
        oldPrice: "$29.00",
        discount: "-32%",
    });

    const products = Array(18).fill({
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

            <main className="flex-grow max-w-[1400px] mx-auto w-full px-8 py-6">
                {/* --- BREADCRUMBS --- */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-600 transition">Homepage</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900 font-medium">Baseball Hat</span>
                </div>

                <div className="flex gap-8">
                    {/* --- SIDEBAR: FILTERS --- */}
                    <aside className="w-[240px] flex-shrink-0">
                        <div className="flex items-center gap-2 mb-6 text-gray-900">
                            <Filter className="w-5 h-5" />
                            <h2 className="font-bold text-lg">FILTERS</h2>
                        </div>

                        <div className="space-y-6 text-sm text-gray-700">
                            {/* Size Filter */}
                            <div>
                                <h3 className="font-semibold mb-3">Size</h3>
                                <div className="space-y-2.5">
                                    {filterSizes.map((size, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                            <span className="group-hover:text-blue-600 transition">{size}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Color Filter */}
                            <div>
                                <h3 className="font-semibold mb-3">Color</h3>
                                <div className="space-y-2.5">
                                    {filterColors.map((color, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                            <div className={`w-3.5 h-3.5 rounded-full ${color.color}`}></div>
                                            <span className="group-hover:text-blue-600 transition">{color.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <h3 className="font-semibold mb-3">Gender</h3>
                                <div className="space-y-2.5">
                                    {filterGenders.map((gender, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                            <span className="group-hover:text-blue-600 transition">{gender}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Age Filter */}
                            <div>
                                <h3 className="font-semibold mb-3">Age</h3>
                                <div className="space-y-2.5">
                                    {filterAges.map((age, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                            <span className="group-hover:text-blue-600 transition">{age}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <h3 className="font-semibold mb-3">Price</h3>
                                <div className="space-y-2.5">
                                    {filterPrices.map((price, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                            <span className="group-hover:text-blue-600 transition">{price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            <Button variant="secondary" className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700">
                                Clear Filters
                            </Button>
                        </div>
                    </aside>

                    {/* --- MAIN CONTENT --- */}
                    <div className="flex-1 min-w-0">

                        {/* Flash Sale Banner in Search */}
                        <section className="bg-[#1C3FAA] rounded-xl p-6 mb-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <h3 className="font-bold text-white text-lg">FLASH SALE</h3>
                            </div>
                            <div className="grid grid-cols-6 gap-3">
                                {flashSaleProducts.map((item, idx) => (
                                    <Link href={`/product/fs-${idx}`} key={idx} className="block bg-white rounded-lg p-2.5 relative hover:shadow-lg transition cursor-pointer">
                                        <span className="absolute top-2 left-2 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                            {item.discount}
                                        </span>
                                        <div className="aspect-square bg-gray-50 rounded mb-2 relative overflow-hidden flex items-center justify-center border border-gray-100">
                                            <Image src="/images/placeholder-hat.png" alt={item.name} fill className="object-cover" />
                                        </div>
                                        <h4 className="text-[10px] font-semibold text-gray-800 line-clamp-2 mb-1 h-7">{item.name}</h4>
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-blue-600 font-bold text-xs">{item.price}</span>
                                            <span className="text-gray-400 text-[9px] line-through">{item.oldPrice}</span>
                                        </div>
                                        {/* Simplified Add to Cart button for small space */}
                                        <div className="flex justify-between items-center mt-2">
                                            {renderStars(5)}
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-[9px] h-5 px-2 py-0 rounded">Buy</Button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Product Recommendations Grid */}
                        <section>
                            <h3 className="font-bold text-lg text-blue-700 mb-6 uppercase">Product Recommendations</h3>
                            <div className="grid grid-cols-6 gap-4">
                                {products.map((item, i) => (
                                    <div key={i} className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition relative group">
                                        <span className="absolute top-4 left-4 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                            {item.discount}
                                        </span>
                                        <Link href={`/product/${i}`} className="block aspect-square bg-gray-50 rounded mb-2 relative overflow-hidden flex items-center justify-center border border-gray-100">
                                            <Image src="/images/placeholder-hat.png" alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </Link>
                                        <Link href={`/product/${i}`}>
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

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}