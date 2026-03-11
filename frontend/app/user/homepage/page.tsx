import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { Zap, Ticket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    // Mock data (giữ nguyên từ các phần trước)
    const coupons = [
        { title: "Save $5", desc: "Orders from $50", color: "bg-blue-600 hover:bg-blue-700" },
        { title: "Save $10", desc: "Orders from $100", color: "bg-blue-600 hover:bg-blue-700" },
        { title: "Save 15%", desc: "Plus $20 gift", color: "bg-blue-600 hover:bg-blue-700" },
        { title: "Free Shipping", desc: "Any Order", color: "bg-blue-600 hover:bg-blue-700" },
    ];

    const recommendations = Array(12).fill({
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
        <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
            {/* 1. Header xuất hiện trên cùng */}
            <Header />

            {/* 2. Phần nội dung chính (Main) */}
            <main className="flex-grow max-w-[1400px] mx-auto px-8 py-8 space-y-12">

                {/* --- Hero Banner --- */}
                <section className="grid grid-cols-3 gap-4 h-[350px]">
                    {/* KHUNG LỚN (LEFT) */}
                    <div className="col-span-2 bg-[#E2DFD8] rounded-xl relative overflow-hidden p-10 flex flex-col justify-center">
                        {/* Thêm ảnh ở đây */}
                        <div className="absolute inset-0 w-full h-full z-0">
                            <Image
                                src="/images/hero-model.png" // Đường dẫn ảnh của bạn
                                alt="Fashion Model"
                                fill
                                className="object-cover object-right mix-blend-multiply"
                                priority
                            />
                        </div>

                        <div className="relative z-10">
                            <span className="text-orange-500 font-bold text-xs tracking-widest mb-2 flex items-center gap-1">
                                <Zap className="w-4 h-4 fill-orange-500 text-orange-500" /> FLASH SALE TODAY
                            </span>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">UP TO 50% OFF</h2>
                            <p className="text-gray-600 text-sm mb-6">All fashion hat collections</p>
                            <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8 font-semibold shadow-sm">
                                Shop Now
                            </Button>
                        </div>
                    </div>

                    {/* 2 KHUNG NHỎ (RIGHT) */}
                    <div className="col-span-1 grid grid-rows-2 gap-4">
                        {/* Khung Bucket Hats */}
                        <div className="rounded-xl p-6 relative flex flex-col justify-center overflow-hidden">
                            {/* Ảnh nền phủ kín */}
                            <div className="absolute inset-0 w-full h-full z-0">
                                <Image
                                    src="/images/bucket-hat.png"
                                    alt="Bucket Hat"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-gray-900">Bucket Hats</h3>
                                <p className="text-sm text-gray-500">From $5</p>
                            </div>
                        </div>

                        {/* Khung Baseball Caps */}
                        <div className="rounded-xl p-6 relative flex flex-col justify-center overflow-hidden">
                            {/* Ảnh nền phủ kín */}
                            <div className="absolute inset-0 w-full h-full z-0">
                                <Image
                                    src="/images/baseball-cap.png"
                                    alt="Baseball Cap"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-gray-900">Baseball Caps</h3>
                                <p className="text-sm text-gray-500">From $4</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Coupons --- */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Ticket className="w-6 h-6 text-yellow-500" />
                        <h3 className="font-bold text-xl">Discount Codes</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {coupons.map((coupon, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 text-center shadow-sm">
                                <p className="font-bold text-blue-700 text-lg mb-1">{coupon.title}</p>
                                <p className="text-xs text-gray-500 mb-4">{coupon.desc}</p>
                                <Button className={`w-full h-9 text-xs font-bold ${coupon.color}`}>Save</Button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Recommendations --- */}
                <section className="bg-white rounded-2xl p-8 border shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl text-blue-700 uppercase tracking-tight">Product Recommendations</h3>
                    </div>
                    <div className="grid grid-cols-6 gap-6 mb-10">
                        {recommendations.map((item, i) => (
                            <div key={i} className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition relative group">
                                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded mb-2 inline-block relative z-10">
                                    {item.discount}
                                </span>
                                <Link href="/user/productdetail" className="block aspect-square bg-gray-50 rounded mb-2 relative overflow-hidden flex items-center justify-center border border-gray-100">
                                    <Image src="/images/placeholder-hat.png" alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                </Link>
                                <Link href="/user/productdetail">
                                    <h4 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 h-8 hover:text-blue-600 transition">{item.name}</h4>
                                </Link>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-blue-600 font-bold text-sm">{item.price}</span>
                                    <span className="text-gray-400 text-[10px] line-through">{item.oldPrice}</span>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    {renderStars(5)}
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-[10px] h-6 px-3 rounded">
                                        Buy
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <Button variant="outline" className="border-blue-600 text-blue-600 px-12 py-6 rounded-xl font-bold hover:bg-blue-50">
                            Load More
                        </Button>
                    </div>
                </section>

                {/* --- ABOUT US --- */}
                <section className="bg-white rounded-xl p-8 border shadow-sm flex items-center gap-12">
                    <div className="w-1/3 flex justify-center border-r border-gray-100 pr-8">
                        <div className="text-center w-full flex justify-center">
                            <Image
                                src="/images/logo.png"
                                alt="Motive SD"
                                width={180}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <div className="w-2/3">
                        <h3 className="font-bold text-blue-700 mb-4 text-lg">MOTIVE SD - Home of Headwear</h3>
                        <div className="text-sm text-gray-600 space-y-3 leading-relaxed">
                            <p>Welcome to Motive SD - your ideal destination for finding high-quality caps, hats, and beanies. Since the beginning of our journey, we have continuously grown to become a trusted online store serving customers in many countries around the world.</p>
                            <p>Motive SD is headquartered in South Korea, and all of our products are shipped directly from there. With experience in the industry and the trust of thousands of customers, we aim to be more than just an online store - we strive to be a reliable partner for all your headwear needs.</p>
                            <p>We are committed to delivering high-quality products. Every item we offer is carefully selected and authentic, so you can shop with confidence. At Motive SD, we constantly work to expand our product range, bringing fresh and exciting options to suit every style and preference.</p>
                        </div>
                    </div>
                </section>

                {/* --- CUSTOMER REVIEWS --- */}
                <section className="bg-white rounded-xl p-8 border shadow-sm flex gap-12">
                    {/* Review Stats */}
                    <div className="w-1/4">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-yellow-400 text-xl">⭐</span>
                            <h3 className="font-bold text-lg">Customer Reviews</h3>
                        </div>
                        <div className="flex gap-6 items-center">
                            <div className="text-center">
                                <p className="text-5xl font-extrabold text-blue-600">4.8</p>
                                <div className="text-yellow-400 text-sm my-2">★★★★★</div>
                                <p className="text-[10px] text-gray-500">Based on<br />12,345 reviews</p>
                            </div>
                            <div className="flex-1 space-y-2 text-[10px] font-medium text-gray-500">
                                <div className="flex items-center gap-2"><span>5 Stars</span><div className="h-1.5 w-full bg-gray-100 rounded"><div className="h-full bg-yellow-400 rounded w-[85%]"></div></div><span>9,256</span></div>
                                <div className="flex items-center gap-2"><span>4 Stars</span><div className="h-1.5 w-full bg-gray-100 rounded"><div className="h-full bg-yellow-400 rounded w-[10%]"></div></div><span>1,552</span></div>
                                <div className="flex items-center gap-2"><span>3 Stars</span><div className="h-1.5 w-full bg-gray-100 rounded"><div className="h-full bg-yellow-400 rounded w-[3%]"></div></div><span>864</span></div>
                                <div className="flex items-center gap-2"><span>2 Stars</span><div className="h-1.5 w-full bg-gray-100 rounded"><div className="h-full bg-yellow-400 rounded w-[1%]"></div></div><span>247</span></div>
                                <div className="flex items-center gap-2"><span>1 Star</span><div className="h-1.5 w-full bg-gray-100 rounded"><div className="h-full bg-yellow-400 rounded w-[0.5%]"></div></div><span>123</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Card Review */}
                    <div className="w-3/4 grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((_, idx) => (
                            <div key={idx} className="border border-gray-100 rounded-lg p-5 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-yellow-400 text-sm">★★★★★</div>
                                    <span className="text-gray-400 text-[10px] font-bold">5/5</span>
                                </div>
                                <h4 className="font-bold text-sm mb-2 text-gray-800">Great Quality Hat!</h4>
                                <p className="text-xs text-gray-600 mb-5 line-clamp-3 leading-relaxed">
                                    Highly recommend this store! The quality is amazing, shipping was fast, and the hat looks exactly like the pictures. Will buy again!
                                </p>
                                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-50">
                                    <div className="relative w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                                        {/* Avatar Reviewer */}
                                        <Image src="/images/avatar-placeholder.jpg" alt="User Avatar" fill className="object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-800">By: Rose Park</p>
                                        <p className="text-[9px] text-gray-400">10 days ago</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* 3. Footer nằm dưới cùng */}
            <Footer />
        </div>
    );
}