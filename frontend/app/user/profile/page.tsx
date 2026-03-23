"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";
import { User, Mail, Phone, Calendar, MapPin, Camera, Edit2, Shield, CreditCard, Package, AlertTriangle, X } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"] });

// Helper to convert YYYY-MM-DD (from BE/Input) to DD/MM/YYYY
const formatDateToDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) return dateStr; // Already in DD/MM/YYYY
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
};

// Helper to convert DD/MM/YYYY (from User Input) back to YYYY-MM-DD (for BE/Date Input)
const formatDateToISO = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.includes("-")) return dateStr; // Already in YYYY-MM-DD
    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) return dateStr;
    return `${year}-${month}-${day}`;
};


export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [user, setUser] = useState({
        fullName: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        avatar: "/images/avatar-placeholder.jpg",
        avatarKey: ""
    });
    const [dobError, setDobError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/user/login");
            return;
        }

        const fetchProfile = async () => {
            // DEV BYPASS: Use mock data if token is fake or BE is down
            if (token.startsWith("fake.")) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({
                        fullName: payload.full_name || "Regular User",
                        email: payload.email || "user@motive.sd",
                        phone: "0123456789",
                        dob: "01/01/1995",
                        address: "123 Fashion Street, Motive City",
                        avatar: "/images/avatar-placeholder.jpg",
                        avatarKey: ""
                    });
                    setIsLoading(false);
                    return;
                } catch (e) {}
            }

            try {
                const res = await fetch("http://localhost:8000/auth/me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch profile");
                
                const data = await res.json();
                const p = data.profile;
                setUser({
                    fullName: p.full_name || "",
                    email: p.email || "",
                    phone: p.phone_number || "",
                    dob: formatDateToDisplay(p.date_of_birth) || "",
                    address: p.address || "",
                    avatar: p.avatar_view_url || "/images/avatar-placeholder.jpg",
                    avatarKey: p.avatar_url || ""
                });
            } catch (err) {
                console.error(err);
                // Even on error, if we have a fake token, don't redirect
                if (token.startsWith("fake.")) {
                    setIsLoading(false);
                    return;
                }
                router.push("/user/login");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;

        // DEV BYPASS: Just close editing mode for fake tokens
        if (token.startsWith("fake.")) {
            setIsEditing(false);
            return;
        }

        const bodyData: any = {
            full_name: user.fullName,
            phone_number: user.phone,
            date_of_birth: formatDateToISO(user.dob), // Convert DD/MM/YYYY to YYYY-MM-DD for BE
            address: user.address,
        };
        if (user.avatarKey) {
            bodyData.avatar_url = user.avatarKey;
        }

        // Validate date before saving
        const parts = user.dob.split("/");
        if (user.dob && (parts.length !== 3 || user.dob.length !== 10)) {
            alert("Please enter a valid date (DD/MM/YYYY)");
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });
            
            const data = await res.json();

            if (res.ok) {
                const p = data.profile;
                setUser({
                    fullName: p.full_name || "",
                    email: p.email || "",
                    phone: p.phone_number || "",
                    dob: formatDateToDisplay(p.date_of_birth) || "", // Keep in display format
                    address: p.address || "",
                    avatar: p.avatar_view_url || "/images/avatar-placeholder.jpg",
                    avatarKey: p.avatar_url || ""
                });
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                console.error("Failed to update profile:", data.message);
                alert(data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while updating profile");
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "profiles");

        try {
            const res = await fetch("http://localhost:8000/files/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setUser(prev => ({ ...prev, avatar: data.url, avatarKey: data.key }));
                window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: data.url }));
            }
        } catch (err) {
            console.error("Avatar upload failed:", err);
        }
    };

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // DEV BYPASS: Just clear token and redirect for fake tokens
        if (token.startsWith("fake.")) {
            setIsDeleting(true);
            setTimeout(() => {
                localStorage.removeItem("token");
                router.push("/user/login");
            }, 500);
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch("http://localhost:8000/auth/me", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                localStorage.removeItem("token");
                router.push("/user/login");
            } else {
                const data = await res.json();
                console.error("Failed to delete account:", data.message);
                alert(data.message || "Failed to delete account");
                setIsDeleting(false);
                setShowDeleteModal(false);
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while deleting the account");
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

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
                                <Link href="/user/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition">
                                    <User className="w-5 h-5" />
                                    My Profile
                                </Link>
                                <Link href="/user/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <Package className="w-5 h-5" />
                                    My Orders
                                </Link>
                                <Link href="/user/payments" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <CreditCard className="w-5 h-5" />
                                    Payment Methods
                                </Link>
                                <Link href="/user/security" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                                    <Shield className="w-5 h-5" />
                                    Security settings
                                </Link>
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
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
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
                                            type="text" 
                                            disabled={!isEditing}
                                            value={user.dob}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                
                                                // 1. Remove non-digits
                                                let digits = val.replace(/\D/g, "");
                                                
                                                // 2. Limit to 8 digits (DDMMYYYY)
                                                if (digits.length > 8) digits = digits.substring(0, 8);
                                                
                                                // 3. Format as DD/MM/YYYY
                                                let formatted = "";
                                                if (digits.length > 0) {
                                                    formatted += digits.substring(0, 2);
                                                    if (digits.length > 2) {
                                                        formatted += "/" + digits.substring(2, 4);
                                                        if (digits.length > 4) {
                                                            formatted += "/" + digits.substring(4, 8);
                                                        }
                                                    }
                                                }
                                                
                                                setUser({...user, dob: formatted});

                                                // 4. Validation logic
                                                if (digits.length === 8) {
                                                    const d = parseInt(digits.substring(0, 2));
                                                    const m = parseInt(digits.substring(2, 4));
                                                    const y = parseInt(digits.substring(4, 8));
                                                    
                                                    const dateObj = new Date(y, m - 1, d);
                                                    const isValid = 
                                                        dateObj.getFullYear() === y && 
                                                        dateObj.getMonth() === m - 1 && 
                                                        dateObj.getDate() === d &&
                                                        y > 1900 && y <= new Date().getFullYear();

                                                    if (!isValid) {
                                                        setDobError("Invalid date (e.g. 31/02 or future year)");
                                                    } else {
                                                        setDobError("");
                                                    }
                                                } else {
                                                    setDobError("");
                                                }
                                            }}
                                            placeholder="DD/MM/YYYY"
                                            className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-1 transition-all text-gray-900 disabled:opacity-70 disabled:cursor-not-allowed ${
                                                dobError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            }`} 
                                        />
                                        {isEditing && (
                                            <div className="flex justify-between mt-1">
                                                <p className="text-[10px] text-gray-400">Format: DD/MM/YYYY</p>
                                                {dobError && <p className="text-[10px] text-red-500 font-medium">{dobError}</p>}
                                            </div>
                                        )}
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

                            {/* Account Management Section */}
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <div className="border border-red-100 rounded-xl p-6 bg-red-50/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">Account Management</h2>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                                            <p className="text-xs text-gray-500 mt-1">Once you delete your account, there is no going back</p>
                                        </div>
                                        <button 
                                            onClick={() => setShowDeleteModal(true)}
                                            className="px-6 py-2.5 rounded-lg bg-[#bf0e38] text-white text-sm font-medium hover:bg-[#a00c2f] transition-colors whitespace-nowrap"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button 
                            onClick={() => !isDeleting && setShowDeleteModal(false)}
                            className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors"
                            disabled={isDeleting}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center mt-4">
                            {/* Alert Icon */}
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                                <AlertTriangle className="w-8 h-8 text-[#bf0e38]" />
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Confirm account deletion?
                            </h2>

                            {/* Description */}
                            <p className="text-sm text-gray-500 mb-8">
                                This action <span className="font-bold text-gray-900">cannot be undone</span>.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 w-full">
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#bf0e38] text-white text-sm font-semibold hover:bg-[#a00c2f] transition-colors disabled:opacity-50 flex justify-center items-center"
                                >
                                    {isDeleting ? "Deleting..." : "Delete Account"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
