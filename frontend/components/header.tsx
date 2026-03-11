import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingCart, Bell, Globe } from "lucide-react";

export default function Header() {
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
                <div className="flex-1 max-w-2xl mx-8 flex border-2 border-blue-600 rounded-md overflow-hidden h-10">
                    <input
                        type="text"
                        placeholder="Search fashion hats..."
                        className="flex-1 px-4 outline-none text-sm text-gray-700"
                    />
                    <button className="bg-blue-600 px-6 flex items-center justify-center hover:bg-blue-700 transition">
                        <Link href="/user/search"><Search className="w-4 h-4 text-white" /></Link>

                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    <Link href="/user/login" className="flex items-center gap-2 hover:text-blue-600 transition group">
                        <User className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                        <div className="text-sm leading-tight">
                            <p className="font-semibold text-gray-800 group-hover:text-blue-600">Login</p>

                        </div>
                    </Link>

                    <Link href="/cart" className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition group">
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
                        <Link href="/category/others">Others</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}