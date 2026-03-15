import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Lock,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const categories = [
  {
    name: "Baseball Caps",
    description: "Classic styles for everyday wear",
    image: "/images/hat-dog-black.png",
    href: "/user/homepage",
    bg: "bg-sky-50",
  },
  {
    name: "Bucket Hats",
    description: "Trendy & versatile designs",
    image: "/images/hat-bear.png",
    href: "/user/homepage",
    bg: "bg-amber-50",
  },
  {
    name: "Animal Ear Caps",
    description: "Fun & playful headwear",
    image: "/images/hat-rabbit-white.png",
    href: "/user/homepage",
    bg: "bg-rose-50",
  },
  {
    name: "Sun Protection",
    description: "Stay cool under the sun",
    image: "/images/hat-bear-white.png",
    href: "/user/homepage",
    bg: "bg-emerald-50",
  },
];

const bestSellers = [
  {
    name: "Black Dog Ear Baseball Cap",
    price: "$19.00",
    oldPrice: "$29.00",
    discount: "-34%",
    image: "/images/hat-dog-black.png",
  },
  {
    name: "Polka Dot Dog Ear Cap",
    price: "$21.00",
    oldPrice: "$29.00",
    discount: "-27%",
    image: "/images/hat-dog-dot.png",
  },
  {
    name: "Bear Cub Ear Baseball Cap",
    price: "$22.00",
    oldPrice: "$32.00",
    discount: "-31%",
    image: "/images/hat-bear.png",
  },
  {
    name: "White Rabbit Ear Cap",
    price: "$24.00",
    oldPrice: "$35.00",
    discount: "-31%",
    image: "/images/hat-rabbit-white.png",
  },
];

const trustSignals = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On orders over $50",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guarantee",
    desc: "100% authentic products",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "30-day return policy",
  },
  {
    icon: Lock,
    title: "Secure Payment",
    desc: "SSL encrypted checkout",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Slim Top Bar ─── */}
      <div className="bg-blue-600 text-white text-center text-xs py-2 font-medium tracking-wide">
        Free shipping on orders over $50 — Shop Now
      </div>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Motive SD"
              width={140}
              height={36}
              className="object-contain h-9 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link
              href="/user/homepage"
              className="hover:text-blue-600 transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/user/search"
              className="hover:text-blue-600 transition-colors"
            >
              Search
            </Link>
            <Link
              href="/user/login"
              className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          {/* Left — Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold tracking-wide">
              <Star className="w-3.5 h-3.5 fill-blue-600" />
              RATED 4.8 / 5 BY 12,000+ CUSTOMERS
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Premium{" "}
              <span className="text-blue-600">Headwear</span>
              <br />
              For Every Style
            </h1>
            <p className="text-lg text-gray-500 max-w-md leading-relaxed">
              Discover our curated collection of caps, hats, and beanies — shipped directly from South Korea with unmatched quality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/user/homepage"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/user/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Right — Image Collage */}
          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-amber-50 rounded-2xl p-6 aspect-square flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/hat-dog-black.png"
                      alt="Baseball Cap"
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
                <div className="bg-rose-50 rounded-2xl p-6 aspect-[4/3] flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/hat-bear.png"
                      alt="Bear Cap"
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-sky-50 rounded-2xl p-6 aspect-[4/3] flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/hat-rabbit-white.png"
                      alt="Rabbit Ear Cap"
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-6 aspect-square flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/hat-dog-dot.png"
                      alt="Polka Dot Cap"
                      fill
                      className="object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -left-4 bottom-12 bg-white rounded-xl p-4 shadow-xl border border-gray-100 flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Free Shipping</p>
                <p className="text-xs text-gray-400">Orders over $50</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Signals Bar ─── */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustSignals.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-xl p-3 flex-shrink-0">
                <item.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Shop by Category ─── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold tracking-wide mb-1">
              BROWSE COLLECTION
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/user/homepage"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className={`group ${cat.bg} rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="relative w-28 h-28 mb-5">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-500">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Best Sellers ─── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-blue-600 text-sm font-semibold tracking-wide mb-1">
                MOST POPULAR
              </p>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/user/homepage"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((item, i) => (
              <Link
                key={i}
                href="/user/productdetail"
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-6">
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                    {item.discount}
                  </span>
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-blue-600 font-bold text-lg">
                      {item.price}
                    </span>
                    <span className="text-gray-400 text-xs line-through">
                      {item.oldPrice}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-3 h-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">
                      (128)
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Brand Story ─── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 md:p-16 flex flex-col md:flex-row items-center gap-12 text-white">
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <Image
                src="/images/logo.png"
                alt="Motive SD"
                width={160}
                height={50}
                className="object-contain brightness-0 invert"
              />
            </div>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Home of Premium Headwear
            </h2>
            <p className="text-blue-100 leading-relaxed max-w-xl">
              Headquartered in South Korea, Motive SD delivers authentic,
              carefully curated caps, hats, and beanies to customers worldwide.
              Every item is hand-picked for quality so you can shop with
              confidence.
            </p>
            <Link
              href="/user/homepage"
              className="inline-flex items-center gap-2 mt-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Explore the Store
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Ready to Find Your Perfect Hat?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Join thousands of happy customers and discover headwear that matches
            your unique style.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/user/homepage"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/user/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-full border border-gray-200 hover:border-blue-200 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <Image
              src="/images/logo.png"
              alt="Motive SD"
              width={120}
              height={32}
              className="object-contain brightness-0 invert mb-4"
            />
            <p className="text-xs leading-relaxed">
              Premium headwear shipped directly from South Korea.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Shop</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/user/homepage" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/user/homepage" className="hover:text-white transition-colors">
                  Baseball Caps
                </Link>
              </li>
              <li>
                <Link href="/user/homepage" className="hover:text-white transition-colors">
                  Bucket Hats
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Account</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/user/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/user/signup" className="hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/user/cart" className="hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Support</p>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Returns & Exchanges
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs">
            <p>&copy; 2026 Motive SD. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Made with care in South Korea</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
