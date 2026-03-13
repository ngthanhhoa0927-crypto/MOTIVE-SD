"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { User, Mail, Phone, Calendar, MapPin, Camera, Edit2, Shield, CreditCard, Package } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    
    // Mock user data
    const [user, setUser] = useState({
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 000-0000",
        dob: "1990-01-01",
        address: "123 Fashion Ave, Suite 456, New York, NY 10001",
        avatar: "/images/avatar-placeholder.jpg"
    });

    useEffect(() => {
        // Simple auth check - commented out temporarily for viewing
        // if (!localStorage.getItem("token")) {
        //     router.push("/user/login");
        // }
    }, [router]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        // Here you would typically send an API request to update the user
    };

    return (
        <div className={`min-h-screen flex flex-col bg-[#F9F8F4] ${inter.className}`}>
            <Header />

            <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/user/homepage" className="hover:text-gray-900 transition">HOME</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">MY ACCOUNT</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                    <Image src={user.avatar} alt="Avatar" width={48} height={48} className="object-cover" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{user.fullName}</p>
                                    <p className="text-xs text-gray-500">Premium Member</p>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-2">
                                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition">
                                    <User className="w-5 h-5" />
                                    My Profile
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <Package className="w-5 h-5" />
                                    My Orders
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Methods
                                </a>
                                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <Shield className="w-5 h-5" />
                                    Security settings
                                </a>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Title Bar */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h1 className={`${playfair.className} text-3xl text-gray-900 mb-1`}>Personal Profile</h1>
                                <p className="text-sm text-gray-500">Manage your information, privacy and security.</p>
                            </div>
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleSave}>
                                {/* Avatar Section */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-12">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                                            <Image src={user.avatar} alt="User Avatar" width={128} height={128} className="object-cover w-full h-full" />
                                        </div>
                                        {isEditing && (
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                                                <div className="flex flex-col items-center text-white">
                                                    <Camera className="w-6 h-6 mb-1" />
                                                    <span className="text-xs font-medium">Update</span>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" />
                                            </label>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Picture</h3>
                                        <p className="text-sm text-gray-500 max-w-md">
                                            We support PNGs, JPEGs and GIFs under 10MB. We recommend using a square image.
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-gray-100 mb-10" />

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Full Name */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            Full Name
                                        </label>
                                        <input 
                                            type="text" 
                                            disabled={!isEditing}
                                            value={user.fullName}
                                            onChange={(e) => setUser({...user, fullName: e.target.value})}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all text-gray-900" 
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            Email Address
                                        </label>
                                        <input 
                                            type="email" 
                                            disabled={!isEditing}
                                            value={user.email}
                                            onChange={(e) => setUser({...user, email: e.target.value})}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all text-gray-900" 
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            Phone Number
                                        </label>
                                        <input 
                                            type="tel" 
                                            disabled={!isEditing}
                                            value={user.phone}
                                            onChange={(e) => setUser({...user, phone: e.target.value})}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all text-gray-900" 
                                        />
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            Date of Birth
                                        </label>
                                        <input 
                                            type="date" 
                                            disabled={!isEditing}
                                            value={user.dob}
                                            onChange={(e) => setUser({...user, dob: e.target.value})}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all text-gray-900" 
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            Primary Address
                                        </label>
                                        <input 
                                            type="text" 
                                            disabled={!isEditing}
                                            value={user.address}
                                            onChange={(e) => setUser({...user, address: e.target.value})}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all text-gray-900" 
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {isEditing && (
                                    <div className="mt-10 flex items-center gap-4 justify-end border-t border-gray-100 pt-8">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="px-8 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 transition"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
