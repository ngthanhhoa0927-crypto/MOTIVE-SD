"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
    ChevronRight, Star, Package, RefreshCcw, Truck, Ticket, 
    ShoppingCart, Flag, Info, ArrowLeft
} from "lucide-react";
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
    const [selectedColor, setSelectedColor] = useState<string>("Red");
    const [selectedSize, setSelectedSize] = useState<string>("M");
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [quantity, setQuantity] = useState<number | string>(1);
    const [activeTab, setActiveTab] = useState("description"); // Default to description
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviews, setReviews] = useState([
        { name: "SOPHIA MARTINEZ", role: "PRO SHOPPER", date: "2 HOURS AGO", text: "The quality of the wool is outstanding. I've worn it in -10°C weather and the ear flaps kept me incredibly warm. The leather strap is a nice premium touch that usually you only see on much more expensive designer brands.", rating: 5 },
        { name: "LIAM ANDERSON", role: "ADVENTURE LOVER", date: "YESTERDAY", text: "Classic look with modern performance. The red plaid pattern is vibrant but elegant. Fast shipping to the UK too. Definitely picking up the gray version next week.", rating: 5 }
    ]);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState("");
    const [isZooming, setIsZooming] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0, bgWidth: 0, bgHeight: 0 });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);

        const fetchProduct = async () => {
            try {
                // Fetch real data but we will override with mock for UI demo
                const res = await fetch("http://localhost:8000/products");
                if (res.ok) {
                    const data = await res.json();
                    if (data.products && data.products.length > 0) {
                        setProduct(data.products[0]);
                    }
                }
            } catch (error) {
                // Ignore fetch errors during UI development to prevent Next.js screen-covering error overlay
                console.log("Backend not reachable for product fetch.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, []);

    // ====== GENERATE MOCK VARIANTS WITH STOCK ======
    const mockVariants = [
        { color: "Red", size: "S", stock: 12 },
        { color: "Red", size: "M", stock: 5 },
        { color: "Red", size: "L", stock: 0 }, // Out of stock sample
        { color: "Red", size: "XL", stock: 3 },
        { color: "Gray", size: "S", stock: 0 }, // Out of stock sample
        { color: "Gray", size: "M", stock: 8 },
        { color: "Gray", size: "L", stock: 15 },
        { color: "Gray", size: "XL", stock: 2 },
        { color: "White", size: "S", stock: 10 },
        { color: "White", size: "M", stock: 20 },
        { color: "White", size: "L", stock: 5 },
        { color: "White", size: "XL", stock: 0 }, // Out of stock sample
        { color: "Black", size: "S", stock: 7 },
        { color: "Black", size: "M", stock: 0 }, // Out of stock sample
        { color: "Black", size: "L", stock: 12 },
        { color: "Black", size: "XL", stock: 18 },
    ];

    const currentVariant = mockVariants.find(v => v.color === selectedColor && v.size === selectedSize);
    const availableStock = currentVariant ? currentVariant.stock : 0;

    useEffect(() => {
        setIsOutOfStock(availableStock <= 0);
        // If current quantity exceeds new stock limit, clamp it
        if (Number(quantity) > availableStock && availableStock > 0) {
            setQuantity(availableStock);
        } else if (availableStock === 0) {
            setQuantity(1);
        }
    }, [selectedColor, selectedSize, availableStock]);

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

    // ====== MOCK DATA FOR PREMIUM UI ======
    const mockProduct = {
        name: "Plaid Dog-Ear Baseball",
        description: "Premium quality outdoor headwear with insulated fold-down ear flaps designed for ultimate warmth and style during the colder months.",
        base_price: "45.00",
        original_price: "65.00",
        colorImages: {
            "Red": [
                "/images/hat-dog-dot.png", 
                "/images/placeholder-hat.png",
                "/images/baseball-cap.png",
                "/images/hat-rabbit-white.png"
            ],
            "Gray": [
                "/images/hat-bear.png", 
                "/images/placeholder-hat.png",
                "/images/bucket-hat.png",
                "/images/hat-dog-black.png"
            ],
            "White": [
                "/images/hat-rabbit-white.png", 
                "/images/hat-bear-white.png",
                "/images/placeholder-hat.png",
                "/images/hat-dog-dot.png"
            ],
            "Black": [
                "/images/hat-dog-black.png", 
                "/images/baseball-cap.png",
                "/images/placeholder-hat.png",
                "/images/hat-bear.png"
            ]
        },
        colors: [
            { name: "Red", hex: "#B91C1C" },
            { name: "Gray", hex: "#4B5563" },
            { name: "White", hex: "#F3F4F6" },
            { name: "Black", hex: "#111827" }
        ],
        sizes: ["S", "M", "L", "XL"]
    };

    const handleAddToCart = () => {
        if (!inStock) return;
        
        const qty = Number(quantity);
        if (qty > availableStock) {
            alert(`Sorry, we only have ${availableStock} items in stock for ${selectedColor} - ${selectedSize}.`);
            setQuantity(availableStock);
            return;
        }

        alert(`Successfully added ${qty} items of ${selectedColor} - ${selectedSize} to cart!`);
    };

    const handlePostReview = () => {
        setReviewError("");
        setReviewSuccess("");

        if (!reviewText.trim()) {
            setReviewError("Please write something before posting.");
            return;
        }
        if (reviewRating === 0) {
            setReviewError("Please select a rating.");
            return;
        }

        const newReview = {
            name: "YOU",
            role: "VERIFIED BUYER",
            date: "JUST NOW",
            text: reviewText,
            rating: reviewRating
        };

        setReviews([newReview, ...reviews]);
        setReviewText("");
        setReviewRating(0);
        setHoverRating(0);
        setReviewSuccess("Thanks for your review!");
        setTimeout(() => setReviewSuccess(""), 3000); // Clear success msg shortly
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - left;
        const py = e.clientY - top;
        const x = (px / width) * 100;
        const y = (py / height) * 100;

        const zoomLevel = 2.5; // 2.5x zoom for high-detail view
        const boxSize = 256; // w-64 h-64 in Tailwind is 256px
        const boxCenter = boxSize / 2;

        const bgWidth = width * zoomLevel;
        const bgHeight = height * zoomLevel;
        const bgX = boxCenter - px * zoomLevel;
        const bgY = boxCenter - py * zoomLevel;

        setMousePos({ x, y, bgX, bgY, bgWidth, bgHeight });
    };

    const inStock = !isOutOfStock;
    const currentPrice = mockProduct.base_price;
    const displayImages = mockProduct.colorImages[selectedColor as keyof typeof mockProduct.colorImages] || mockProduct.colorImages["Red"];

    const renderStars = (rating: number, size = "w-3 h-3") => (
        <div className="flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`${size} ${s <= rating ? "fill-yellow-400 text-yellow-400 border-none" : "fill-gray-200 text-gray-200"}`} />
            ))}
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            <Header />

            <main className="flex-grow max-w-[1400px] mx-auto px-8 py-6 w-full">
                {/* --- BREADCRUMBS --- */}
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-8 uppercase tracking-[0.2em]">
                    <Link href="/user/homepage" className="hover:text-blue-600 transition">Homepage</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/category/all" className="hover:text-blue-600 transition">Baseball Hat</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600 font-black">Plaid dog-ear baseball cap</span>
                </div>

                {/* --- PRODUCT MAIN SECTION --- */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 animate-in fade-in duration-700">

                    {/* Left Col: Gallery */}
                    <div className="space-y-4">
                        <div 
                            className={`aspect-square bg-[#F8F9FA] rounded-3xl relative overflow-hidden flex items-center justify-center group border border-gray-50 ${isZooming ? "cursor-none" : "cursor-zoom-in"}`}
                            onMouseMove={isZooming ? handleMouseMove : undefined}
                            onClick={(e) => {
                                if (!isZooming) {
                                    handleMouseMove(e); // Initialize position immediately
                                }
                                setIsZooming(!isZooming);
                            }}
                            onMouseLeave={() => setIsZooming(false)}
                        >
                            <Image
                                src={displayImages[selectedImageIdx]}
                                alt="Product"
                                fill
                                className="object-contain p-12 transition-transform duration-700 ease-out"
                                unoptimized
                                priority
                            />

                            {/* Magnifying Glass Overlay */}
                            {isZooming && (
                                <div 
                                    className="absolute w-64 h-64 border-[3px] border-white/90 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)] pointer-events-none z-50 overflow-hidden bg-white/95"
                                    style={{
                                        left: `${mousePos.x}%`,
                                        top: `${mousePos.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        backgroundImage: `url(${displayImages[selectedImageIdx]})`,
                                        backgroundPosition: `${mousePos.bgX}px ${mousePos.bgY}px`,
                                        backgroundSize: `${mousePos.bgWidth}px ${mousePos.bgHeight}px`,
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                />
                            )}
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedImageIdx((prev) => (prev - 1 + displayImages.length) % displayImages.length); }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedImageIdx((prev) => (prev + 1) % displayImages.length); }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-8 left-8 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
                                <span className="text-[10px] font-black text-gray-900">{selectedImageIdx + 1} / {displayImages.length}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {displayImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImageIdx(idx)}
                                    className={`aspect-square bg-[#F8F9FA] rounded-[20px] overflow-hidden relative cursor-pointer transition-all border-2 ${selectedImageIdx === idx ? 'border-blue-600 shadow-lg scale-[0.98]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-contain p-3" unoptimized />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Col: Info */}
                    <div className="flex flex-col py-2">
                        <div className="space-y-6 mb-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">New Arrival</span>
                                    <div 
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all ${isOutOfStock ? "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-100"}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
                                        {isOutOfStock ? "Sold Out" : "In Stock"}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderStars(5)}
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">(124)</span>
                                </div>
                            </div>

                            <h1 className="text-[44px] font-black text-[#0F172A] leading-[1.1] tracking-tighter">
                                {mockProduct.name}
                            </h1>
                            <p className="text-[15px] font-medium text-gray-500 leading-relaxed max-w-lg">
                                {mockProduct.description}
                            </p>

                            <div className="flex items-center gap-6">
                                <span className="text-[38px] font-black text-blue-600 tracking-tighter">${currentPrice}</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-300 line-through mb-0.5">${mockProduct.original_price}</span>
                                    <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-black rounded border border-orange-100 uppercase tracking-wider">Save 30%</span>
                                </div>
                            </div>
                        </div>

                        {/* Variants */}
                        <div className="space-y-10 mb-12">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">Select Color: <span className="text-gray-900 ml-1">{selectedColor}</span></h4>
                                <div className="flex gap-4">
                                    {mockProduct.colors.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => {
                                                setSelectedColor(c.name);
                                                setSelectedImageIdx(0);
                                            }}
                                            className={`relative w-8 h-8 rounded-full transition-all flex items-center justify-center p-0.5 border ${selectedColor === c.name ? 'ring-2 ring-blue-600 ring-offset-2 scale-110 border-transparent shadow-xl shadow-blue-200' : 'hover:scale-110 border-gray-100'}`}
                                            title={c.name}
                                        >
                                            <div className="w-full h-full rounded-full" style={{ backgroundColor: c.hex }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Select Size 
                                        {currentVariant && (
                                            <span className={`ml-4 text-[10px] p-1 px-2 rounded-md ${availableStock > 0 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"}`}>
                                                Stock: {availableStock}
                                            </span>
                                        )}
                                    </h4>
                                    <button className="text-[10px] font-black text-blue-600 flex items-center gap-1.5 group">
                                        <Info className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {mockProduct.sizes.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            className={`w-16 h-12 flex items-center justify-center rounded-2xl text-[13px] font-black transition-all border-2 ${selectedSize === s ? 'border-blue-600 bg-blue-50/20 text-blue-600 shadow-md scale-[1.02]' : 'border-[#F1F5F9] text-gray-400 hover:border-gray-200'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center bg-[#F8F9FA] rounded-2xl h-14 px-5 border-2 transition-all ${!inStock ? 'opacity-40 grayscale pointer-events-none' : 'focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50'}`}>
                                    <button 
                                        type="button"
                                        onClick={() => setQuantity(prev => Math.max(1, Number(prev) - 1))} 
                                        className="text-gray-400 hover:text-gray-900 transition font-black text-2xl px-2 select-none"
                                    > – </button>
                                    
                                    <input 
                                        type="text"
                                        className="w-12 text-center bg-transparent text-[14px] font-black text-gray-900 outline-none" 
                                        value={quantity} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            let numVal = val === "" ? "" : Number(val);
                                            // Prevent entering more than available stock
                                            if (typeof numVal === "number" && numVal > availableStock) {
                                                numVal = availableStock;
                                            }
                                            setQuantity(numVal);
                                        }}
                                        onBlur={() => {
                                            if (quantity === "" || Number(quantity) < 1) setQuantity(1);
                                        }}
                                    />
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setQuantity(prev => {
                                            const next = Number(prev) + 1;
                                            return next > availableStock ? prev : next;
                                        })} 
                                        className={`text-gray-400 transition font-black text-2xl px-2 select-none ${Number(quantity) >= availableStock ? "opacity-20 cursor-not-allowed" : "hover:text-gray-900"}`}
                                    > + </button>
                                </div>

                                <Button 
                                    onClick={handleAddToCart}
                                    className={`flex-1 h-14 rounded-2xl text-[12px] font-black uppercase tracking-[0.1em] shadow-2xl shadow-blue-600/30 transition-all ${inStock ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed uppercase'}`}
                                    disabled={!inStock}
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" /> {inStock ? "Add To Cart" : "Sold Out"}
                                </Button>
                                
                                <Button 
                                    className={`flex-1 h-14 rounded-2xl text-[12px] font-black uppercase tracking-[0.1em] transition-all hover:scale-[1.02] active:scale-95 ${inStock ? 'bg-[#0F172A] hover:bg-black text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                                    disabled={!inStock}
                                >
                                    Buy Now
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 group cursor-default transition-all hover:shadow-lg hover:shadow-emerald-900/5">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200"><Truck className="w-5 h-5" /></div>
                                        <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Free Shipping</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-600/70 ml-14">Available for all orders over $99</p>
                                </div>
                                <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 group cursor-default transition-all hover:shadow-lg hover:shadow-blue-900/5">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200"><Ticket className="w-5 h-5" /></div>
                                        <span className="text-[11px] font-black text-blue-800 uppercase tracking-widest">PROMO CODES</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-blue-600/70 ml-14">Get $10 OFF with code MOTIVESD10</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- TABS SECTION --- */}
                <section className="mb-24">
                    <div className="flex gap-12 border-b border-gray-100 mb-12">
                        {["description", "review"].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-5 text-[14px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? "text-blue-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[4px] after:bg-blue-600 after:rounded-t-full" : "text-gray-300 hover:text-gray-600"}`}
                            >
                                {tab === "review" ? "REVIEWS(30)" : "DESCRIPTION"}
                            </button>
                        ))}
                    </div>

                    {activeTab === "description" ? (
                        <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
                                <div className="md:col-span-2 space-y-8">
                                    <h3 className="text-[28px] font-black text-gray-900 tracking-tighter">Ultimate Warmth & Unmatched Style</h3>
                                    <p className="text-gray-500 text-[16px] leading-relaxed">
                                        Crafted for those who refuse to compromise on either style or comfort during the winter months. Our Plaid Dog-Ear Baseball Cap features high-performance insulated flaps that can be folded down for complete ear protection or secured up for a classic look. The premium wool-blend exterior offers natural water resistance and timeless texture.
                                    </p>
                                    <div className="grid grid-cols-2 gap-8 pt-4">
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600"><Package className="w-4 h-4" /></div>
                                            <div>
                                                <h5 className="text-[12px] font-black text-gray-900 uppercase mb-1">Durable Build</h5>
                                                <p className="text-[10px] font-bold text-gray-400">Reinforced stitching at stress points</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600"><RefreshCcw className="w-4 h-4" /></div>
                                            <div>
                                                <h5 className="text-[12px] font-black text-gray-900 uppercase mb-1">Easy Care</h5>
                                                <p className="text-[10px] font-bold text-gray-400">Washable high-grade materials</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-8 bg-[#F8F9FA] p-8 rounded-[32px] border border-gray-50 shadow-sm">
                                    <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Tech Specs</h4>
                                    <div className="space-y-6">
                                        <div><p className="text-[9px] font-black text-gray-300 uppercase mb-1">Shell Material</p><p className="text-[13px] font-bold text-gray-700">Premium Highland Wool Mix</p></div>
                                        <div><p className="text-[9px] font-black text-gray-300 uppercase mb-1">Lining</p><p className="text-[13px] font-bold text-gray-700">Quilted Satin Finish</p></div>
                                        <div><p className="text-[9px] font-black text-gray-300 uppercase mb-1">Strap</p><p className="text-[13px] font-bold text-gray-700">Genuine Leather w/ Brass</p></div>
                                        <div><p className="text-[9px] font-black text-gray-300 uppercase mb-1">Insulation</p><p className="text-[13px] font-bold text-gray-700">3M Thinsulate™ Equivalent</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {/* RATING BREAKDOWN */}
                            <div className="flex flex-col lg:flex-row gap-16 mb-20 items-center lg:items-start">
                                <div className="flex flex-col items-center bg-[#F8FAFC] p-12 rounded-[40px] border border-blue-50 shadow-xl shadow-blue-900/5 min-w-[280px]">
                                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Total Score</span>
                                    <div className="text-[84px] font-black text-gray-900 leading-none mb-4 -tracking-wider">4.8</div>
                                    <div className="mb-4">{renderStars(5, "w-5 h-5")}</div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Global Average</p>
                                </div>
                                <div className="flex-1 w-full space-y-4 pt-4">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center gap-6 group cursor-default">
                                            <span className="text-[11px] font-black text-gray-900 w-4 tracking-tighter">{star} <span className="text-yellow-400 font-normal">★</span></span>
                                            <div className="h-3 flex-1 bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-blue-700 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                                                    style={{ width: `${star === 5 ? 78 : star === 4 ? 15 : 7 - star}%` }} 
                                                />
                                            </div>
                                            <span className="text-[11px] font-black text-gray-400 w-12 text-right">{star === 5 ? '78%' : star === 4 ? '15%' : `${7-star}%`}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FEEDBACK BOX */}
                            <div className="bg-[#0F172A] rounded-[40px] p-1 bg-[url('/images/noise.png')] shadow-2xl mb-24 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
                                <div className="p-10 relative z-10">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black shadow-lg shadow-white/10 group-hover:scale-110 transition-transform duration-500">
                                            <Flag className="w-6 h-6 fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="text-[18px] font-black text-white tracking-tight">Write a Premium Review</h4>
                                            <p className="text-[11px] font-bold text-blue-400/70 uppercase tracking-widest mt-1">SHARE YOUR EXPERIENCE WITH THE COMMUNITY</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-2 shadow-2xl">
                                        <textarea 
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="The hat fits perfectly and the material feels extremely premium..."
                                            className="w-full h-24 px-5 py-4 outline-none text-[14px] font-medium text-white placeholder:text-gray-500 bg-transparent resize-none border-none"
                                        />
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-t border-white/5 mt-1 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-4 items-center pl-1">
                                                    {[1,2,3,4,5].map(s => (
                                                        <Star 
                                                            key={s} 
                                                            className={`w-6 h-6 cursor-pointer transition-all hover:scale-110 ${s <= (hoverRating || reviewRating) ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-gray-600 hover:text-yellow-400"}`} 
                                                            onClick={() => { setReviewRating(s); setReviewError(""); }}
                                                            onMouseEnter={() => setHoverRating(s)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                        />
                                                    ))}
                                                </div>
                                                {reviewError && <span className="text-red-400 text-[11px] font-bold pl-1 animate-in fade-in">{reviewError}</span>}
                                                {reviewSuccess && <span className="text-emerald-400 text-[11px] font-bold pl-1 animate-in fade-in">{reviewSuccess}</span>}
                                            </div>
                                            <Button onClick={handlePostReview} className="h-12 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all w-full sm:w-auto">
                                                Post Review
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* REVIEWS LIST */}
                            <div className="space-y-10">
                                {reviews.map((rev, i) => (
                                    <div key={i} className="group bg-white rounded-[32px] p-8 border border-gray-50 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex gap-5">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden relative shadow-md ring-4 ring-white">
                                                    <Image src="/images/avatar-placeholder.jpg" alt={rev.name} fill className="object-cover" unoptimized />
                                                </div>
                                                <div>
                                                    <h5 className="text-[14px] font-black text-gray-900 leading-none mb-1.5 uppercase tracking-tight">{rev.name}</h5>
                                                    <p className="text-[10px] font-black text-blue-600/50 tracking-widest">{rev.role} • {rev.date}</p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-yellow-400/10 rounded-lg flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-500 border-none" />
                                                <span className="text-[11px] font-black text-yellow-600">{rev.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="text-[14px] font-medium text-gray-500 leading-relaxed mb-6 ml-0 md:ml-19 italic">
                                            &quot;{rev.text}&quot;
                                        </p>
                                        <div className="flex gap-8 md:ml-19 pt-6 border-t border-gray-50">
                                            <button className="flex items-center gap-2 text-[10px] font-black text-gray-300 hover:text-blue-600 transition uppercase tracking-widest"><RefreshCcw className="w-3.5 h-3.5" /> Helpful</button>
                                            <button className="flex items-center gap-2 text-[10px] font-black text-gray-300 hover:text-gray-900 transition uppercase tracking-widest">Share</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* --- MAYBE YOU LIKE --- */}
                <section className="mb-24">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-8 bg-blue-600 rounded-full" />
                            <h2 className="text-[28px] font-black text-gray-900 tracking-tighter uppercase">Maybe You Like</h2>
                        </div>
                        <Link href="/user/search" className="text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition">
                            View All Products +
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {[
                            { name: "Plaid Dog-Ear Baseball Cap", price: "45.00", img: "/images/hat-dog-dot.png", tag: "HOT" },
                            { name: "Rabbit Ear Baseball Cap", price: "39.00", img: "/images/hat-rabbit-white.png", tag: "-20%" },
                            { name: "Blue Dog-Ear Baseball Cap", price: "45.00", img: "/images/hat-bear.png", tag: "NEW" },
                            { name: "White Dog-Ear Baseball Cap", price: "45.00", img: "/images/hat-dog-black.png", tag: "HOT" },
                            { name: "Classic Plaid Beanie", price: "25.00", img: "/images/hat-dog-dot.png", tag: "-10%" },
                            { name: "Premium Fur Hat", price: "60.00", img: "/images/placeholder-hat.png", tag: "NEW" },
                        ].map((p, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[4/5] bg-[#F8F9FA] rounded-[32px] relative overflow-hidden mb-5 border border-transparent group-hover:border-blue-100 group-hover:shadow-2xl group-hover:shadow-blue-900/5 transition-all duration-500">
                                    <div className="absolute top-4 left-4 z-10 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-50 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-blue-600 tracking-tighter">{p.tag}</span>
                                    </div>
                                    <Image src={p.img} alt={p.name} fill className="object-contain p-8 transform group-hover:scale-110 transition-transform duration-700 ease-out" unoptimized />
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-500" />
                                    <div className="absolute bottom-5 left-5 right-5 translate-y-16 group-hover:translate-y-0 transition-all duration-500 ease-out">
                                        <Button className="w-full h-10 bg-white hover:bg-[#0F172A] hover:text-white text-gray-900 text-[10px] font-black rounded-xl shadow-xl transition-all uppercase tracking-widest border-none">View Product</Button>
                                    </div>
                                </div>
                                <div className="px-2 space-y-1">
                                    <h4 className="text-[12px] font-bold text-gray-900 leading-tight truncate group-hover:text-blue-600 transition-colors">{p.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] font-black text-gray-600">${p.price}</span>
                                        <div className="flex gap-0.5">{renderStars(5, "w-2.5 h-2.5")}</div>
                                    </div>
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