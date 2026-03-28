"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Filter, Zap, Star, X } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    // Mock data cho bộ lọc
    const filterSizes = ["Free size", "S (20-21\")", "M (21-22\")", "L (22-23\")", "XL (23-24\")"];
    const filterColors = [
        { name: "Black", color: "bg-black" },
        { name: "White", color: "bg-white border border-gray-300" },
        { name: "Blue", color: "bg-blue-600" },
        { name: "Red", color: "bg-red-600" },
        { name: "Grey", color: "bg-gray-400" },
    ];
    const filterPrices = ["Under $5", "$5 - $10", "$10 - $15", "Over $15"];

    // Mock data cho sản phẩm
    const flashSaleProducts = Array(6).fill({
        name: "Plaid dog ear baseball cap",
        price: "$19.00",
        oldPrice: "$29.00",
        discount: "-32%",
    });

    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic for Flash Sale
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const maxScrollLeft = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
                if (scrollRef.current.scrollLeft >= maxScrollLeft - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const slide = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (query && products.length > 0) {
            const results = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [query, products]);

    useEffect(() => {
        const fetchProducts = async () => {
            let fetchedProducts = [];
            try {
                const res = await fetch("http://localhost:8000/product");
                if (res.ok) {
                    const data = await res.json();
                    fetchedProducts = data.products || [];
                }
            } catch (error) {
                console.log("Backend not reachable, using mock products");
            }
            
            // BE not available or empty -> Use Mocks designed as BE schema
            if (fetchedProducts.length === 0) {
                fetchedProducts = [
                    { id: 1, name: "Black Dog Ear Baseball Cap", base_price: "19.00", oldPrice: "$29.00", images: [{image_url: "/images/hat-dog-black.png"}] },
                    { id: 2, name: "Polka Dot Dog Ear Baseball Cap", base_price: "21.00", oldPrice: "$29.00", images: [{image_url: "/images/hat-dog-dot.png"}] },
                    { id: 3, name: "Bear Cub Ear Baseball Cap", base_price: "22.00", oldPrice: "$32.00", images: [{image_url: "/images/hat-bear.png"}] },
                    { id: 4, name: "White Bear Ear Baseball Cap", base_price: "20.00", oldPrice: "$30.00", images: [{image_url: "/images/hat-bear-white.png"}] },
                    { id: 5, name: "White Rabbit Ear Baseball Cap", base_price: "24.00", oldPrice: "$35.00", images: [{image_url: "/images/hat-rabbit-white.png"}] },
                    { id: 6, name: "Classic Beige Bucket Hat", base_price: "15.00", oldPrice: "$25.00", images: [{image_url: "/images/placeholder-hat.png"}] },
                    { id: 7, name: "Vintage Denim Cap", base_price: "18.00", oldPrice: "$28.00", images: [{image_url: "/images/placeholder-hat.png"}] },
                    { id: 8, name: "Minimalist Beanie", base_price: "12.00", oldPrice: "$20.00", images: [{image_url: "/images/placeholder-hat.png"}] },
                    { id: 9, name: "Sport Visor Cap", base_price: "16.00", oldPrice: "$26.00", images: [{image_url: "/images/placeholder-hat.png"}] },
                    { id: 10, name: "Knit Winter Hat", base_price: "25.00", oldPrice: "$40.00", images: [{image_url: "/images/placeholder-hat.png"}] },
                    { id: 11, name: "Wide Brim Sun Hat", base_price: "28.00", oldPrice: "$45.00", images: [{image_url: "/images/placeholder-hat.png"}] },
                    { id: 12, name: "Kids Animal Ear Cap", base_price: "18.00", oldPrice: "$28.00", images: [{image_url: "/images/placeholder-hat.png"}] }
                ];
            }

            setProducts(fetchedProducts);
            setFilteredProducts(fetchedProducts);
        };
        fetchProducts();
    }, []);

    const toggleSelection = (stateSetter: any, value: string) => {
        stateSetter((prev: string[]) => 
            prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
    };

    const matchPrice = (priceStr: string) => {
        if (!priceStr) return false;
        const price = parseFloat(priceStr);
        if (isNaN(price)) return false;

        return selectedPrices.some(range => {
            if (range === "Under $5") return price < 5;
            if (range === "$5 - $10") return price >= 5 && price <= 10;
            if (range === "$10 - $15") return price > 10 && price <= 15;
            if (range === "Over $15") return price > 15;
            return false;
        });
    };

    const handleApplyFilters = () => {
        let filtered = [...products];

        // Filter Size (must exist in variants if variants array used)
        if (selectedSizes.length > 0) {
            filtered = filtered.filter(p => 
                p.variants && p.variants.some((v: any) => selectedSizes.includes(v.size))
            );
        }

        // Filter Color
        if (selectedColors.length > 0) {
            filtered = filtered.filter(p => 
                p.variants && p.variants.some((v: any) => selectedColors.includes(v.color))
            );
        }

        // Filter Price
        if (selectedPrices.length > 0) {
            filtered = filtered.filter(p => {
                // If variant prices exist, check if ANY variant matches
                if (p.variants && p.variants.length > 0) {
                    return p.variants.some((v: any) => matchPrice(v.price || p.base_price));
                }
                // Else fallback to base_price
                return matchPrice(p.base_price);
            });
        }

        setFilteredProducts(filtered);
        setIsFilterOpen(false); // Close mobile menu after applying
    };

    const handleClearFilters = () => {
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedPrices([]);
        setFilteredProducts(products);
    };


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
                    <Link href="/user/homepage" className="hover:text-blue-600 transition">Homepage</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900 font-medium">Baseball Hat</span>
                </div>

                <div className="flex gap-8 relative">
                    {/* --- SIDEBAR: FILTERS --- */}
                    {/* Mobile overlay */}
                    {isFilterOpen && (
                        <div 
                            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                            onClick={() => setIsFilterOpen(false)}
                        />
                    )}

                    <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white p-6 shadow-2xl overflow-y-auto transition-transform duration-300 md:relative md:w-[240px] md:bg-transparent md:p-0 md:shadow-none md:overflow-visible md:translate-x-0 md:flex-shrink-0 ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <div className="flex items-center justify-between mb-6 text-gray-900 border-b md:border-none pb-4 md:pb-0">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                <h2 className="font-bold text-lg">FILTERS</h2>
                            </div>
                            <button 
                                className="md:hidden text-gray-400 hover:text-gray-900 transition-colors"
                                onClick={() => setIsFilterOpen(false)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6 text-sm text-gray-700 pb-12 md:pb-0">
                            {/* Size Filter */}
                            <div>
                                <h3 className="font-semibold mb-3">Size</h3>
                                <div className="space-y-2.5">
                                    {filterSizes.map((size, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSizes.includes(size)}
                                                onChange={() => toggleSelection(setSelectedSizes, size)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                            />
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
                                            <input 
                                                type="checkbox" 
                                                checked={selectedColors.includes(color.name)}
                                                onChange={() => toggleSelection(setSelectedColors, color.name)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                            />
                                            <div className={`w-3.5 h-3.5 rounded-full ${color.color}`}></div>
                                            <span className="group-hover:text-blue-600 transition">{color.name}</span>
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
                                            <input 
                                                type="checkbox" 
                                                checked={selectedPrices.includes(price)}
                                                onChange={() => toggleSelection(setSelectedPrices, price)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                            />
                                            <span className="group-hover:text-blue-600 transition">{price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={handleApplyFilters} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                                Apply Filter
                            </Button>

                            <Button onClick={handleClearFilters} variant="secondary" className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700">
                                Clear Filters
                            </Button>
                        </div>
                    </aside>

                    {/* --- MAIN CONTENT --- */}
                    <div className="flex-1 min-w-0">
                        
                        {/* Mobile Filter Toggle */}
                        <div className="md:hidden flex items-center justify-between mb-6">
                            <h2 className="text-[16px] font-black text-gray-900 uppercase">Products</h2>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsFilterOpen(true)}
                                className="flex items-center gap-2 border-gray-200 text-xs font-bold rounded-lg h-9"
                            >
                                <Filter className="w-3.5 h-3.5" /> Filters
                            </Button>
                        </div>

                        {/* Flash Sale Banner in Search */}
                        <section className="bg-[#1C3FAA] rounded-xl p-6 mb-8 relative group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <h3 className="font-bold text-white text-lg">FLASH SALE</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => slide('left')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition backdrop-blur-sm">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => slide('right')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition backdrop-blur-sm">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {/* Updated to horizontal scroll/slider instead of a rigid 6-col grid */}
                            <div ref={scrollRef} className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {flashSaleProducts.map((item, idx) => (
                                    <Link href={`/user/productdetail/fs-${idx}`} key={idx} className="block w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0 snap-start bg-white rounded-lg p-2.5 relative hover:shadow-lg transition cursor-pointer">
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

                        {/* Search Results */}
                        {query && (
                            <section className="mb-12">
                                <h3 className="font-bold text-lg text-blue-700 mb-6 uppercase">
                                    Search Results for "{query}" <span className="text-sm font-medium text-gray-500 normal-case">({searchResults.length} items)</span>
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {searchResults.map((item: any, i: number) => (
                                        <div key={item.id || i} className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition relative group flex flex-col">
                                            {item.discount && (
                                                <span className="absolute top-4 left-4 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                                    {item.discount}
                                                </span>
                                            )}
                                            <Link href={`/user/productdetail/${item.id || i}`} className="block aspect-square bg-gray-50 rounded mb-2 relative overflow-hidden flex items-center justify-center border border-gray-100">
                                                <Image 
                                                    src={(item.images && item.images[0] && item.images[0].image_url) || "/images/placeholder-hat.png"} 
                                                    alt={item.name} 
                                                    fill 
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                                                />
                                            </Link>
                                            <Link href={`/user/productdetail/${item.id || i}`}>
                                                <h4 className="text-[11px] font-semibold text-gray-800 line-clamp-2 mb-1 h-8 hover:text-blue-600 transition">{item.name}</h4>
                                            </Link>
                                            <div className="flex items-baseline gap-1 mb-2">
                                                <span className="text-blue-600 font-bold text-sm">${parseFloat(item.base_price).toFixed(2)}</span>
                                                {item.oldPrice && <span className="text-gray-400 text-[10px] line-through">{item.oldPrice}</span>}
                                            </div>
                                            <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-50">
                                                {renderStars(5)}
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-[10px] h-6 px-3 rounded">Buy</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <div className="col-span-6 py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            No products found matching "{query}".
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Product Recommendations Grid (All Products) */}
                        <section>
                            <h3 className="font-bold text-lg text-blue-700 mb-6 uppercase">
                                All Products <span className="text-sm font-medium text-gray-500 normal-case">({filteredProducts.length} items)</span>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredProducts.map((item: any, i: number) => (
                                    <div key={item.id || i} className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition relative group flex flex-col">
                                        {item.discount && (
                                            <span className="absolute top-4 left-4 bg-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                                                {item.discount}
                                            </span>
                                        )}
                                        <Link href={`/user/productdetail/${item.id || i}`} className="block aspect-square bg-gray-50 rounded mb-2 relative overflow-hidden flex items-center justify-center border border-gray-100">
                                            <Image 
                                                src={(item.images && item.images[0] && item.images[0].image_url) || "/images/placeholder-hat.png"} 
                                                alt={item.name} 
                                                fill 
                                                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                                            />
                                        </Link>
                                        <Link href={`/user/productdetail/${item.id || i}`}>
                                            <h4 className="text-[11px] font-semibold text-gray-800 line-clamp-2 mb-1 h-8 hover:text-blue-600 transition">{item.name}</h4>
                                        </Link>
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-blue-600 font-bold text-sm">${parseFloat(item.base_price).toFixed(2)}</span>
                                            {item.oldPrice && <span className="text-gray-400 text-[10px] line-through">{item.oldPrice}</span>}
                                        </div>
                                        <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-50">
                                            {renderStars(5)}
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-[10px] h-6 px-3 rounded">Buy</Button>
                                        </div>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="col-span-6 py-12 text-center text-gray-500">
                                        No products match your selected filters.
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div></div>}>
            <SearchContent />
        </Suspense>
    );
}