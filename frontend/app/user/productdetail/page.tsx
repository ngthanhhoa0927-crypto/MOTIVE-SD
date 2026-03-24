"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, Package, RefreshCcw, Truck, Ticket } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

// ====== BE INTERFACES ======
interface ProductImage {
    id: number;
    image_url: string;
    is_primary: boolean;
    display_order: number;
}

interface ProductVariant {
    id: number;
    color: string | null;
    color_hex: string | null;
    size: string | null;
    sku: string;
    price: string;
    stock_quantity: number;
    image_url: string | null;
    is_active: boolean;
}

interface Product {
    id: number;
    name: string;
    description: string;
    base_price: string;
    images: ProductImage[];
    variants: ProductVariant[];
}

export default function ProductDetailsPage() {
    const router = useRouter();

    // ====== CORE STATES ======
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // ====== USER SELECTION STATES ======
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [quantity, setQuantity] = useState<number | string>(1);
    const [quantityError, setQuantityError] = useState("");
    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);

        const fetchProduct = async () => {
            try {
                // FIXME: Thay bằng Endpoint thật cần tích hợp, 
                // Ở đây gán mặc định URL fetch Product của bạn.
                const res = await fetch("http://localhost:8000/products");
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.products && data.products.length > 0) {
                        const p: Product = data.products[0];
                        setProduct(p);
                        
                        // Set state mặc định với variant đầu tiên
                        if (p.variants && p.variants.length > 0) {
                            setSelectedColor(p.variants[0].color);
                            setSelectedSize(p.variants[0].size);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch product from BE:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-white">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen bg-white">
                <Header />
                <main className="flex-grow flex items-center justify-center flex-col gap-4">
                    <Package className="w-12 h-12 text-gray-300" />
                    <h2 className="text-xl font-bold text-gray-800">Product Ready For Integration</h2>
                    <p className="text-gray-500 text-sm max-w-sm text-center">
                        Waiting for backend /products API to provide data. 
                        No mock data used.
                    </p>
                </main>
                <Footer />
            </div>
        );
    }

    // ====== DYNAMIC DATA & LOGIC ======
    
    // 1. Phân tách danh sách colors, sizes từ biến thể BE
    const colors = Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))) as string[];
    const sizes = Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))) as string[];

    // 2. Tìm biến thể (variant) hiện tại user đang chọn
    const currentVariant = product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
    );

    // 3. Logic CHECK Tồn kho (Availability) -> "Available / Out of Stock"
    // Nếu variant tồn tại, trang bị bật (is_active), và số lượng (stock_quantity) > 0 -> In Stock
    const inStock = currentVariant ? (currentVariant.is_active && currentVariant.stock_quantity > 0) : false;
    
    // Giá tiền (ưu tiên giá variant, sau đó lấy giá gốc)
    const currentPrice = currentVariant ? currentVariant.price : product.base_price;

    // Hình ảnh (Gộp ảnh Variant nếu có + Ảnh sản phẩm)
    const displayImages = product.images.length > 0 
        ? product.images.sort((a,b) => a.display_order - b.display_order).map(img => img.image_url)
        : ["/images/placeholder-hat.png"];
        
    if (currentVariant?.image_url && !displayImages.includes(currentVariant.image_url)) {
        displayImages.unshift(currentVariant.image_url);
    }


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
                    <Link href="/category/all" className="hover:text-blue-600 transition">Products</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
                </div>

                {/* --- PRODUCT MAIN SECTION --- */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

                    {/* Left Col: Images */}
                    <div>
                        {/* Big Image */}
                        <div className="aspect-square bg-white border border-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center mb-4 p-8 shadow-sm">
                            <Image
                                src={displayImages[selectedImageIdx] || "/images/placeholder-hat.png"}
                                alt="Product Image"
                                fill
                                className="object-contain p-4"
                            />
                            {displayImages.length > 1 && (
                                <button 
                                    onClick={() => setSelectedImageIdx((prev) => (prev + 1) % displayImages.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {displayImages.length > 1 && (
                            <div className="grid grid-cols-6 gap-3">
                                {displayImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedImageIdx(idx)}
                                        className={`aspect-square bg-gray-50 border rounded-lg overflow-hidden relative cursor-pointer hover:border-blue-400 transition ${selectedImageIdx === idx ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-200'}`}
                                    >
                                        <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Col: Info */}
                    <div className="py-2">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
                            
                            {/* AVAILABILITY TAG */}
                            <div className="mb-4">
                                {inStock ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Available
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Out of Stock
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-6">
                                {product.description || "No description provided for this product."}
                            </p>
                        </div>

                        {/* Colors */}
                        {colors.length > 0 && (
                            <div className="mt-6">
                                <span className="text-sm font-semibold text-gray-800 block mb-2">Color: {selectedColor}</span>
                                <div className="flex gap-3">
                                    {colors.map((color, idx) => {
                                        // Tìm mã màu hex tương ứng từ variants
                                        const varMatch = product.variants.find(v => v.color === color);
                                        const hex = varMatch?.color_hex || "#888888";
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setSelectedImageIdx(0); // Reset ảnh
                                                }}
                                                className={`w-8 h-8 rounded-full cursor-pointer border-2 transition ${selectedColor === color ? 'border-blue-600 ring-2 ring-blue-100 shadow-md' : 'border-gray-300 hover:border-gray-400'}`}
                                                style={{ backgroundColor: hex }}
                                                title={color}
                                                aria-label={`Select color ${color}`}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        {sizes.length > 0 && (
                            <div className="mt-8">
                                <span className="text-sm font-semibold text-gray-800 block mb-2">Size</span>
                                <div className="flex flex-wrap gap-2">
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
                        )}

                        {/* Price */}
                        <div className="mt-8 mb-4">
                            <div className="text-3xl font-bold text-blue-600">${Number(currentPrice).toFixed(2)}</div>
                            <div className="mt-1">{renderStars(5)}</div>
                        </div>

                        {/* Actions (Disabled if Out of stock) */}
                        <div className="mt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1 items-center">
                                    <div className={`flex items-center border rounded-md h-12 w-28 overflow-hidden transition-colors ${!inStock ? "bg-gray-100 border-gray-200 opacity-60 pointer-events-none" : quantityError ? "border-red-500 bg-red-50/10" : "border-gray-300 ring-offset-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500"}`}>
                                        <button 
                                            onClick={() => {
                                                setQuantity(Math.max(1, Number(quantity) - 1));
                                                setQuantityError(""); 
                                            }} 
                                            disabled={!inStock}
                                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg disabled:cursor-not-allowed"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="text" 
                                            value={quantity} 
                                            disabled={!inStock}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, ""); 
                                                setQuantity(val);
                                                setQuantityError(""); 
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
                                            className="flex-1 h-full w-full text-center text-sm font-medium outline-none bg-transparent disabled:cursor-not-allowed" 
                                        />
                                        <button 
                                            onClick={() => {
                                                setQuantity(Math.min(99, Number(quantity) + 1));
                                                setQuantityError(""); 
                                            }} 
                                            disabled={!inStock}
                                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg disabled:cursor-not-allowed"
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
                                <Button 
                                    disabled={!inStock}
                                    className={`h-12 px-10 rounded-md font-semibold text-sm transition-colors ${!inStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                    Add to Cart
                                </Button>
                                {inStock ? (
                                    <Link href="/user/checkout">
                                        <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-10 rounded-md font-semibold text-sm">Buy now</Button>
                                    </Link>
                                ) : (
                                    <Button disabled variant="outline" className="border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed h-12 px-10 rounded-md font-semibold text-sm">Buy now</Button>
                                )}
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
                                <h3 className="font-bold text-gray-900 text-base mb-2">{product.name}</h3>
                                <p>
                                    {product.description || "Updating description..."}
                                </p>
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
            </main>

            <Footer />
        </div>
    );
}