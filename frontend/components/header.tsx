"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, User, ShoppingCart, Bell, Globe, LogOut } from "lucide-react";

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const allProducts = [
        {
            name: "Black Dog Ear Baseball Cap",
            price: "$19.00",
            oldPrice: "$29.00",
            image: "/images/hat-dog-black.png"
        },
        {
            name: "Polka Dot Dog Ear Baseball Cap",
            price: "$21.00",
            oldPrice: "$29.00",
            image: "/images/hat-dog-dot.png"
        },
        {
            name: "Bear Cub Ear Baseball Cap",
            price: "$22.00",
            oldPrice: "$32.00",
            image: "/images/hat-bear.png"
        },
        {
            name: "White Bear Ear Baseball Cap",
            price: "$20.00",
            oldPrice: "$30.00",
            image: "/images/hat-bear-white.png"
        },
        {
            name: "White Rabbit Ear Baseball Cap",
            price: "$24.00",
            oldPrice: "$35.00",
            image: "/images/hat-rabbit-white.png"
        },
        {
            name: "Classic Beige Bucket Hat",
            price: "$15.00",
            oldPrice: "$25.00",
            image: "/images/placeholder-hat.png"
        },
        {
            name: "Vintage Denim Cap",
            price: "$18.00",
            oldPrice: "$28.00",
            image: "/images/placeholder-hat.png"
        },
        {
            name: "Minimalist Beanie",
            price: "$12.00",
            oldPrice: "$20.00",
            image: "/images/placeholder-hat.png"
        },
        {
            name: "Sport Visor Cap",
            price: "$16.00",
            oldPrice: "$26.00",
            image: "/images/placeholder-hat.png"
        },
        {
            name: "Knit Winter Hat",
            price: "$25.00",
            oldPrice: "$40.00",
            image: "/images/placeholder-hat.png"
        },
        {
            name: "Wide Brim Sun Hat",
            price: "$28.00",
            oldPrice: "$45.00",
            image: "/images/placeholder-hat.png"
        },
        {
            name: "Kids Animal Ear Cap",
            price: "$18.00",
            oldPrice: "$28.00",
            image: "/images/placeholder-hat.png"
        }
    ];

    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);

        // Check login status
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserMenuOpen(false);
        router.push("/user/login");
    };

    return (
        <div className="w-full">
            {/* --- TOP BAR --- */}
            <div className="bg-gray-100 py-1.5 px-8 flex justify-between items-center text-xs text-gray-500">
                <div className="flex gap-4">
                    <Link href="/seller" className="hover:text-blue-600 transition">
                        Seller Center
                    </Link>
                </div>
                <div className="flex gap-4 items-center">
                    <Link href="/notifications" className="flex items-center gap-1 hover:text-blue-600 transition">
                        <Bell className="w-3 h-3" /> Notifications
                    </Link>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition">
                        <Globe className="w-3 h-3" /> Language
                    </div>
                </div>
            </div>

            {/* --- MAIN HEADER --- */}
            <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100">
                {/* Logo */}
                <Link href="/user/homepage" className="flex items-center hover:opacity-90 transition">
                    <Image src="/images/logo.png" alt="Motive SD" width={160} height={40} className="object-contain h-10 w-auto" />
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
                    <div className="flex border-2 border-blue-600 rounded-md overflow-hidden h-10 bg-white">
                        <input
                            type="text"
                            placeholder="Search fashion hats..."
                            className="flex-1 px-4 outline-none text-sm text-gray-700"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(e.target.value.length > 0);
                            }}
                            onFocus={() => {
                                if (searchQuery.length > 0) setIsDropdownOpen(true);
                            }}
                        />
                        <button className="bg-blue-600 px-6 flex items-center justify-center hover:bg-blue-700 transition">
                            <Link href="/user/search"><Search className="w-4 h-4 text-white" /></Link>
                        </button>
                    </div>

                    {/* Search Dropdown */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
                            {filteredProducts.length > 0 ? (
                                <ul className="py-2">
                                    {filteredProducts.map((product, idx) => (
                                        <li key={idx} className="hover:bg-gray-50 border-b border-gray-50 last:border-0 transition">
                                            <Link href="/user/productdetail" className="flex items-center gap-3 px-4 py-2" onClick={() => setIsDropdownOpen(false)}>
                                                <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-800 truncate">{product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-blue-600 font-bold text-sm bg-blue-50 px-1.5 rounded">{product.price}</span>
                                                        <span className="text-xs text-gray-400 line-through">{product.oldPrice}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                                        <Search className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm">No products found matching "<span className="font-semibold text-gray-700">{searchQuery}</span>"</p>
                                    <p className="text-xs mt-1 text-gray-400">Try checking your spelling or use more general terms</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {isLoggedIn ? (
                        <div className="relative" ref={userMenuRef}>
                            <button 
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 hover:opacity-80 transition focus:outline-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200 overflow-hidden shadow-sm">
                                    <Image src="/images/avatar-placeholder.jpg" alt="User Avatar" width={40} height={40} className="object-cover" />
                                </div>
                            </button>
                            
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 py-2">
                                    <Link href="/user/profile" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition" onClick={() => setUserMenuOpen(false)}>
                                        <User className="w-4 h-4" /> Account Details
                                    </Link>
                                    <div className="h-px bg-gray-100 my-1 mx-3 border-none"></div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition text-left"
                                    >
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/user/login" className="flex items-center gap-2 hover:text-blue-600 transition group">
                            <User className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                            <div className="text-sm leading-tight">
                                <p className="font-semibold text-gray-800 group-hover:text-blue-600">Login</p>
                            </div>
                        </Link>
                    )}

                    <Link href="/user/cart" className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition group">
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                            <span className="absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                                3
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">Cart</span>
                    </Link>
                </div>
            </header>

            {/* --- NAVIGATION --- */}
            <nav className="bg-white px-8 border-b shadow-sm">
                <ul className="flex justify-center gap-12 text-sm font-medium text-gray-600 py-3">
                    <li className="text-blue-600 border-b-2 border-blue-600 pb-3 -mb-3 cursor-pointer">
                        <Link href="/user/homepage">Homepage</Link>
                    </li>
                    <li className="cursor-pointer hover:text-blue-600 transition pb-3 -mb-3 border-b-2 border-transparent hover:border-blue-600">
                        <Link href="/category/baseball-hat">Baseball Hat</Link>
                    </li>
                    <li className="cursor-pointer hover:text-blue-600 transition pb-3 -mb-3 border-b-2 border-transparent hover:border-blue-600">
                        <Link href="/category/bucket-hat">Bucket Hat</Link>
                    </li>
                    <li className="cursor-pointer hover:text-blue-600 transition pb-3 -mb-3 border-b-2 border-transparent hover:border-blue-600">
                        <Link href="/category/sun-protection">Sun Protection Hat</Link>
                    </li>
                    <li className="cursor-pointer hover:text-blue-600 transition pb-3 -mb-3 border-b-2 border-transparent hover:border-blue-600">
                        <Link href="/category/flat-cap">Flat Cap</Link>
                    </li>
                    <li className="cursor-pointer hover:text-blue-600 transition pb-3 -mb-3 border-b-2 border-transparent hover:border-blue-600">
                        <Link href="/user/search">Others</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}