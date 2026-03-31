"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

/* ── Scroll-triggered animation hook ── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/* ── Reusable animated wrapper ── */
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal(0.1);

  const baseTranslate = {
    up: "translate-y-12",
    left: "-translate-x-12",
    right: "translate-x-12",
    scale: "scale-95",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0 scale-100"
          : `opacity-0 ${baseTranslate[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Data ── */
const categories = [
  {
    name: "Baseball Caps",
    description: "Classic styles for everyday wear",
    image: "/images/hat-dog-black.png",
    href: "/user/homepage",
    bg: "from-sky-50 to-sky-100/50",
  },
  {
    name: "Bucket Hats",
    description: "Trendy & versatile designs",
    image: "/images/hat-bear.png",
    href: "/user/homepage",
    bg: "from-amber-50 to-amber-100/50",
  },
  {
    name: "Animal Ear Caps",
    description: "Fun & playful headwear",
    image: "/images/hat-rabbit-white.png",
    href: "/user/homepage",
    bg: "from-rose-50 to-rose-100/50",
  },
  {
    name: "Sun Protection",
    description: "Stay cool under the sun",
    image: "/images/hat-bear-white.png",
    href: "/user/homepage",
    bg: "from-emerald-50 to-emerald-100/50",
  },
];

const bestSellers = [
  {
    name: "Black Dog Ear Baseball Cap",
    price: "$19.00",
    oldPrice: "$29.00",
    image: "/images/hat-dog-black.png",
  },
  {
    name: "Polka Dot Dog Ear Cap",
    price: "$21.00",
    oldPrice: "$29.00",
    image: "/images/hat-dog-dot.png",
  },
  {
    name: "Bear Cub Ear Baseball Cap",
    price: "$22.00",
    oldPrice: "$32.00",
    image: "/images/hat-bear.png",
  },
  {
    name: "White Rabbit Ear Cap",
    price: "$24.00",
    oldPrice: "$35.00",
    image: "/images/hat-rabbit-white.png",
  },
];

const trustSignals = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: ShieldCheck, title: "Quality Guarantee", desc: "100% authentic products" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Lock, title: "Secure Payment", desc: "SSL encrypted checkout" },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── Slim Top Bar ─── */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-center text-xs py-2.5 font-medium tracking-widest uppercase">
        ✦ Free shipping on orders over $50 — Shop Now ✦
      </div>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/logo.png"
              alt="Motive SD"
              width={140}
              height={36}
              className="object-contain h-9 w-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/user/homepage" className="relative hover:text-gray-900 transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gray-900 after:transition-all after:duration-300 hover:after:w-full">
              Shop
            </Link>
            <Link href="/user/search" className="relative hover:text-gray-900 transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gray-900 after:transition-all after:duration-300 hover:after:w-full">
              Search
            </Link>
            <Link href="/user/login" className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.97]">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fafaf9] via-white to-[#f5f5f0] min-h-[85vh] flex items-center">
        {/* Subtle animated background elements */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #000 1px, transparent 1px), radial-gradient(circle at 80% 20%, #000 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left — Copy */}
          <div className="space-y-8">
            <Reveal delay={0}>
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold tracking-wider border border-gray-200/50">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                RATED 4.8 / 5 BY 12,000+ CUSTOMERS
              </div>
            </Reveal>
            <Reveal delay={150}>
              <h1 className="text-5xl md:text-[64px] font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                Premium{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">Headwear</span>
                </span>
                <br />
                For Every{" "}
                <span className="italic font-normal text-gray-500">Style</span>
              </h1>
            </Reveal>
            <Reveal delay={300}>
              <p className="text-lg text-gray-500 max-w-md leading-relaxed">
                Discover our curated collection of caps, hats, and beanies — shipped directly from South Korea with unmatched quality.
              </p>
            </Reveal>
            <Reveal delay={450}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/user/homepage"
                  className="group inline-flex items-center gap-3 px-9 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 cursor-pointer shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/20 active:scale-[0.97]"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/user/signup"
                  className="inline-flex items-center gap-3 px-9 py-4 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-gray-400 transition-all duration-300 cursor-pointer hover:shadow-lg active:scale-[0.97]"
                >
                  Create Account
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right — Image Collage with parallax */}
          <div className="relative hidden md:block">
            <div
              className="grid grid-cols-2 gap-5"
              style={{ transform: `translateY(${scrollY * -0.05}px)` }}
            >
              <div className="space-y-5">
                <Reveal delay={200}>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500">
                    <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2">
                      <Image src="/images/hat-dog-black.png" alt="Baseball Cap" fill className="object-contain drop-shadow-lg" />
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={350}>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500">
                    <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2">
                      <Image src="/images/hat-bear.png" alt="Bear Cap" fill className="object-contain drop-shadow-lg" />
                    </div>
                  </div>
                </Reveal>
              </div>
              <div className="space-y-5 pt-10">
                <Reveal delay={300}>
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500">
                    <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2">
                      <Image src="/images/hat-rabbit-white.png" alt="Rabbit Ear Cap" fill className="object-contain drop-shadow-lg" />
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={450}>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 aspect-square flex items-center justify-center overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500">
                    <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2">
                      <Image src="/images/hat-dog-dot.png" alt="Polka Dot Cap" fill className="object-contain drop-shadow-lg" />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
            {/* Floating Badge */}
            <Reveal delay={600} direction="left">
              <div className="absolute -left-4 bottom-12 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100/80 flex items-center gap-3 backdrop-blur-sm">
                <div className="bg-green-100 rounded-full p-2.5">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Free Shipping</p>
                  <p className="text-xs text-gray-400">Orders over $50</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] text-gray-400 tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── Trust Signals Bar ─── */}
      <section className="border-y border-gray-100 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustSignals.map((item, i) => (
            <Reveal key={i} delay={i * 100} direction="up">
              <div className="flex items-center gap-4 group cursor-default">
                <div className="bg-gray-50 rounded-2xl p-3.5 flex-shrink-0 group-hover:bg-gray-900 transition-colors duration-300">
                  <item.icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Shop by Category ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Reveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-gray-400 text-xs font-semibold tracking-[0.2em] mb-2 uppercase">
                Browse Collection
              </p>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/user/homepage"
              className="group text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
            >
              View All <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Reveal key={i} delay={i * 120}>
              <Link
                href={cat.href}
                className={`group bg-gradient-to-br ${cat.bg} rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-transparent hover:border-gray-200/50`}
              >
                <div className="relative w-28 h-28 mb-5">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-contain drop-shadow-md transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-xl"
                  />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-gray-900 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500">{cat.description}</p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span className="text-xs text-gray-600 font-semibold flex items-center gap-1">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Best Sellers ─── */}
      <section className="bg-[#fafaf9] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-gray-400 text-xs font-semibold tracking-[0.2em] mb-2 uppercase">
                  Most Popular
                </p>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  Best Sellers
                </h2>
              </div>
              <Link
                href="/user/homepage"
                className="group text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors cursor-pointer"
              >
                See All <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-7">
            {bestSellers.map((item, i) => (
              <Reveal key={i} delay={i * 120}>
                <Link
                  href="/user/productdetail"
                  className="group bg-white rounded-3xl border border-gray-100/80 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100/50 flex items-center justify-center p-8">
                    <div className="relative w-full h-full">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain transition-all duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-gray-600 transition-colors duration-200">
                      {item.name}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-900 font-bold text-lg">
                        {item.price}
                      </span>
                      <span className="text-gray-400 text-xs line-through">
                        {item.oldPrice}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-1">(128)</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Brand Story ─── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Reveal>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-14 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.02] rounded-full blur-2xl" />

            <div className="flex-shrink-0 relative z-10">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10">
                <Image
                  src="/images/logo.png"
                  alt="Motive SD"
                  width={180}
                  height={56}
                  className="object-contain brightness-0 invert"
                />
              </div>
            </div>
            <div className="space-y-5 text-center md:text-left relative z-10">
              <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                Home of Premium
                <br />
                <span className="text-gray-400 italic font-normal">Headwear</span>
              </h2>
              <p className="text-gray-400 leading-relaxed max-w-xl text-[15px]">
                Headquartered in South Korea, Motive SD delivers authentic,
                carefully curated caps, hats, and beanies to customers worldwide.
                Every item is hand-picked for quality so you can shop with
                confidence.
              </p>
              <Link
                href="/user/homepage"
                className="group inline-flex items-center gap-2 mt-3 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 cursor-pointer hover:shadow-lg active:scale-[0.97]"
              >
                Explore the Store
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="border-t border-gray-100 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <Reveal>
            <p className="text-gray-400 text-xs font-semibold tracking-[0.2em] mb-4 uppercase">
              Join The Community
            </p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-5 tracking-tight">
              Ready to Find Your Perfect Hat?
            </h2>
            <p className="text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
              Join thousands of happy customers and discover headwear that matches
              your unique style.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex justify-center gap-4">
              <Link
                href="/user/homepage"
                className="group inline-flex items-center gap-2 px-9 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 cursor-pointer shadow-xl shadow-gray-900/10 hover:shadow-2xl hover:shadow-gray-900/20 active:scale-[0.97]"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/user/signup"
                className="inline-flex items-center gap-2 px-9 py-4 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-gray-400 transition-all duration-300 cursor-pointer hover:shadow-lg active:scale-[0.97]"
              >
                Sign Up Free
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-gray-950 text-gray-500">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <div>
            <Image
              src="/images/logo.png"
              alt="Motive SD"
              width={120}
              height={32}
              className="object-contain brightness-0 invert mb-5 opacity-80"
            />
            <p className="text-xs leading-relaxed text-gray-500">
              Premium headwear shipped directly from South Korea.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Shop</p>
            <ul className="space-y-3 text-xs">
              <li><Link href="/user/homepage" className="hover:text-white transition-colors duration-200">All Products</Link></li>
              <li><Link href="/user/homepage" className="hover:text-white transition-colors duration-200">Baseball Caps</Link></li>
              <li><Link href="/user/homepage" className="hover:text-white transition-colors duration-200">Bucket Hats</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Account</p>
            <ul className="space-y-3 text-xs">
              <li><Link href="/user/login" className="hover:text-white transition-colors duration-200">Login</Link></li>
              <li><Link href="/user/signup" className="hover:text-white transition-colors duration-200">Register</Link></li>
              <li><Link href="/user/cart" className="hover:text-white transition-colors duration-200">Cart</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Support</p>
            <ul className="space-y-3 text-xs">
              <li><span className="hover:text-white transition-colors duration-200 cursor-pointer">Contact Us</span></li>
              <li><span className="hover:text-white transition-colors duration-200 cursor-pointer">Shipping Policy</span></li>
              <li><span className="hover:text-white transition-colors duration-200 cursor-pointer">Returns & Exchanges</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
            <p>&copy; 2026 Motive SD. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Made with care in South Korea</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
