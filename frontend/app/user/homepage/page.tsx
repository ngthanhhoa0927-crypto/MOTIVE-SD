"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Zap, Ticket, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HomePage() {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost:8000/products", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data.products && data.products.length > 0) {
                        const mapped = data.products.map((p: any) => {
                            const primaryImg = p.images?.find((img: any) => img.is_primary);
                            const firstImg = p.images?.[0];
                            const imgSrc = primaryImg?.signed_url || primaryImg?.image_url
                                || firstImg?.signed_url || firstImg?.image_url
                                || "/images/placeholder-hat.png";
                            return {
                                id: p.id,
                                name: p.name,
                                price: `$${parseFloat(p.base_price).toFixed(2)}`,
                                oldPrice: "",
                                image: imgSrc,
                            };
                        });
                        setRecommendations(mapped.reverse().slice(0, 6));
                        setLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.log("Backend not reachable, using fallback products");
            }

            // Fallback mock data (only when backend is unreachable)
            setRecommendations([
                { id: 1, name: "Black Dog Ear Baseball Cap", price: "$19.00", oldPrice: "$29.00", image: "/images/hat-dog-black.png" },
                { id: 2, name: "Polka Dot Dog Ear Baseball Cap", price: "$21.00", oldPrice: "$29.00", image: "/images/hat-dog-dot.png" },
                { id: 3, name: "Bear Cub Ear Baseball Cap", price: "$22.00", oldPrice: "$32.00", image: "/images/hat-bear.png" },
                { id: 4, name: "White Bear Ear Baseball Cap", price: "$20.00", oldPrice: "$30.00", image: "/images/hat-bear-white.png" },
                { id: 5, name: "White Rabbit Ear Baseball Cap", price: "$24.00", oldPrice: "$35.00", image: "/images/placeholder-hat.png" },
                { id: 6, name: "Classic Beige Bucket Hat", price: "$15.00", oldPrice: "$25.00", image: "/images/hat-rabbit-white.png" },
            ]);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const renderStars = (rating: number) => (
        <div className="flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3 h-3 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
            ))}
        </div>
    );

    // Animation Variants
    const fadeUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] overflow-x-hidden">
            <Header />

            <main className="flex-grow max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-16">

                {/* --- Hero Banner --- */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeUp}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[350px]"
                >
                    {/* LEFT SECTION (LARGE) */}
                    <div className="col-span-1 lg:col-span-2 bg-[#E2DFD8] rounded-2xl relative overflow-hidden p-10 flex flex-col justify-center shadow-sm h-[350px] lg:h-auto group">
                        <div className="absolute inset-0 w-full h-full z-0 transition-transform duration-700 ease-out group-hover:scale-105">
                            <Image
                                src="/images/hero-model.png" 
                                alt="Fashion Model"
                                fill
                                className="object-cover object-right mix-blend-multiply"
                                priority
                            />
                        </div>

                        <div className="relative z-10 w-full max-w-lg">
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full font-bold text-xs tracking-widest mb-4"
                            >
                                <Zap className="w-3.5 h-3.5 fill-orange-500" /> FLASH SALE TODAY
                            </motion.span>
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight"
                            >
                                UP TO 50% OFF
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-gray-700 text-sm md:text-base mb-8 font-medium"
                            >
                                Discover the new fashion hat collections of the season.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <Button className="bg-white text-gray-900 hover:bg-gray-50 rounded-full px-8 h-12 font-bold shadow-lg shadow-black/5 hover:-translate-y-1 transition-all duration-300">
                                    Shop Collection
                                </Button>
                            </motion.div>
                        </div>
                    </div>

                    {/* RIGHT SECTION (SMALL) */}
                    <div className="col-span-1 grid grid-rows-2 gap-6 hidden lg:grid">
                        <motion.div 
                            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
                            className="rounded-2xl p-6 relative flex flex-col justify-center overflow-hidden shadow-sm group border border-gray-100/50"
                        >
                            <div className="absolute inset-0 w-full h-full z-0 transition-transform duration-700 ease-in-out group-hover:scale-110">
                                <Image src="/images/bucket-hat.png" alt="Bucket Hat" fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                            </div>
                            <div className="relative z-10 mt-auto">
                                <h3 className="font-extrabold text-white text-xl tracking-tight">Bucket Hats</h3>
                                <p className="text-sm font-medium text-white/80">Starting at $5</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
                            className="rounded-2xl p-6 relative flex flex-col justify-center overflow-hidden shadow-sm group border border-gray-100/50"
                        >
                            <div className="absolute inset-0 w-full h-full z-0 transition-transform duration-700 ease-in-out group-hover:scale-110">
                                <Image src="/images/baseball-cap.png" alt="Baseball Cap" fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                            </div>
                            <div className="relative z-10 mt-auto">
                                <h3 className="font-extrabold text-white text-xl tracking-tight">Baseball Caps</h3>
                                <p className="text-sm font-medium text-white/80">Starting at $4</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* --- Recommendations --- */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeUp}
                    className="bg-white/80 backdrop-blur-sm rounded-[24px] p-6 md:p-10 border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-black text-2xl text-gray-900 tracking-tight">Recommended For You</h3>
                            <p className="text-sm font-medium text-gray-500 mt-1">Handpicked styles based on your trend</p>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                    <motion.div 
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-8 mb-4"
                    >
                        {recommendations.map((item, i) => (
                            <motion.div 
                                key={item.id || i} 
                                variants={fadeUp}
                                className="group relative"
                            >
                                <Link href={`/user/productdetail/${item.id || i + 1}`} className="block relative mb-3">
                                    <div className="aspect-square bg-[#F8F9FA] rounded-xl overflow-hidden flex items-center justify-center border border-gray-100/50 transition-all duration-300 group-hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.05)] group-hover:border-transparent">
                                        <Image src={item.image || "/images/placeholder-hat.png"} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                </Link>

                                <div>
                                    <div className="mb-2">
                                        {renderStars(5)}
                                    </div>
                                    <Link href={`/user/productdetail/${item.id || i + 1}`}>
                                        <h4 className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-tight mb-2 hover:text-[#2563EB] transition-colors">{item.name}</h4>
                                    </Link>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-gray-900 font-black text-[15px]">{item.price}</span>
                                            <span className="text-gray-400 font-medium text-[11px] line-through">{item.oldPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                    )}
                </motion.section>

                {/* --- ABOUT US --- */}
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7 }}
                    className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-[24px] p-10 md:p-14 border border-blue-50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center gap-12"
                >
                    <div className="w-full md:w-1/3 flex justify-center md:border-r border-gray-100/80 md:pr-10">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center w-[220px] h-[100px]"
                        >
                            <Image src="/images/logo.png" alt="Motive SD" width={180} height={60} className="object-contain" />
                        </motion.div>
                    </div>
                    <div className="w-full md:w-2/3">
                        <h3 className="font-black text-[#1E3A8A] mb-5 text-2xl tracking-tight">MOTIVE SD <span className="text-gray-400 font-medium px-2">|</span> Home of Headwear</h3>
                        <div className="text-[14px] text-gray-600 space-y-4 font-medium leading-relaxed max-w-3xl">
                            <p>Welcome to Motive SD - your ideal destination for finding high-quality caps, hats, and beanies. Since the beginning of our journey, we have continuously grown to become a trusted online store serving customers in many countries around the world.</p>
                            <p>Headquartered in South Korea, all of our products are shipped directly from there. With extensive industry experience, we aim to be more than just a store - we strive to be a reliable partner for all your headwear needs.</p>
                            <p>We are committed to delivering excellence. Every item we offer is carefully selected and authentic, ensuring you can shop with complete confidence and discover fresh options to suit your personal style.</p>
                        </div>
                    </div>
                </motion.section>

                {/* --- CUSTOMER REVIEWS --- */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="bg-white rounded-[24px] p-8 md:p-12 border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col xl:flex-row gap-12"
                >
                    {/* Review Stats */}
                    <motion.div variants={fadeUp} className="w-full xl:w-1/4">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <span className="text-blue-600 text-lg">⭐</span>
                            </div>
                            <h3 className="font-black text-2xl tracking-tight text-gray-900">Real Reviews</h3>
                        </div>
                        <div className="flex gap-8 items-center bg-[#F8FAFC] p-6 rounded-2xl border border-gray-100">
                            <div className="text-center">
                                <p className="text-6xl font-black text-gray-900 tracking-tighter">4.8</p>
                                <div className="text-yellow-400 text-sm my-3">{renderStars(5)}</div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-tight">12,345<br/>Ratings</p>
                            </div>
                            <div className="flex-1 space-y-2.5 text-[11px] font-bold text-gray-500">
                                {[
                                    { s: '5', pct: '85', cnt: '9.2k' },
                                    { s: '4', pct: '10', cnt: '1.5k' },
                                    { s: '3', pct: '3', cnt: '864' },
                                    { s: '2', pct: '1', cnt: '247' },
                                    { s: '1', pct: '0.5', cnt: '123' },
                                ].map((row) => (
                                    <div key={row.s} className="flex items-center gap-3">
                                        <span className="w-8 text-right">{row.s} ★</span>
                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${row.pct}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                viewport={{ once: true }}
                                                className="h-full bg-[#F59E0B] rounded-full"
                                            ></motion.div>
                                        </div>
                                        <span className="w-8">{row.cnt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card Review */}
                    <div className="w-full xl:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: "Rose Park", date: "2 days ago", text: "Highly recommend this store! The quality is amazing, shipping was fast, and the hat looks exactly like the pictures. Will buy again!" },
                            { name: "James Smith", date: "1 week ago", text: "Fit is perfect and the material feels very premium. It took a while to arrive but the customer service was extremely helpful tracking it." },
                            { name: "Linda Chen", date: "Memory style", text: "I bought the vintage denim cap and I wear it everywhere now. The stitch work is incredible for the price point." }
                        ].map((review, idx) => (
                            <motion.div 
                                key={idx} 
                                variants={fadeUp}
                                whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                                className="border border-gray-100/80 rounded-2xl p-6 bg-white transition-all duration-300 flex flex-col"
                            >
                                <div className="flex inset-x items-center gap-1 mb-4">
                                    {renderStars(5)}
                                </div>
                                <h4 className="font-bold text-[15px] mb-3 text-gray-900 leading-tight">Great Quality Hat!</h4>
                                <p className="text-[13px] text-gray-500 mb-6 leading-relaxed font-medium flex-grow">
                                    "{review.text}"
                                </p>
                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100/50">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full overflow-hidden flex items-center justify-center font-bold text-blue-700 text-[13px]">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-900 leading-tight">{review.name}</p>
                                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{review.date}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </main>

            <Footer />
        </div>
    );
}