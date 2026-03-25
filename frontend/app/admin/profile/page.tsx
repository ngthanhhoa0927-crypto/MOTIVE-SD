"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";
import { User, Mail, Phone, Calendar, MapPin, Camera, Edit2 } from "lucide-react";
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

export default function AdminProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    
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
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/user/login");
            return;
        }

        const fetchProfile = async () => {
            // DEV BYPASS: Use mock data if token is fake
            if (token.startsWith("fake.")) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({
                        fullName: payload.full_name || "Admin User",
                        email: payload.email || "admin@motive.sd",
                        phone: "0987654321",
                        dob: "15/05/1988",
                        address: "456 Admin Tower, Motive SD Headquarters",
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
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        if (token.startsWith("fake.")) {
            setIsEditing(false);
            alert("Profile updated (Mock)! Changes are saved locally for this session.");
            return;
        }

        // Validate date
        const parts = user.dob.split("/");
        if (user.dob && (parts.length !== 3 || user.dob.length !== 10)) {
            alert("Please enter a valid date (DD/MM/YYYY)");
            return;
        }

        const bodyData: any = {
            full_name: user.fullName,
            phone_number: user.phone,
            date_of_birth: formatDateToISO(user.dob),
            address: user.address,
        };
        if (user.avatarKey) {
            bodyData.avatar_url = user.avatarKey;
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
                    dob: formatDateToDisplay(p.date_of_birth) || "",
                    address: p.address || "",
                    avatar: p.avatar_view_url || "/images/avatar-placeholder.jpg",
                    avatarKey: p.avatar_url || ""
                });
                setIsEditing(false);
                alert("Admin profile updated successfully!");
                // Dispatch event to update avatar in layout header
                window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: p.avatar_view_url }));
            } else {
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

    if (isLoading) {
        return <div className="flex items-center justify-center p-20">Loading admin profile...</div>;
    }

    return (
        <div className={`space-y-8 ${inter.className}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Title Bar */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h1 className={`${playfair.className} text-3xl text-gray-900 mb-1`}>Admin Account Profile</h1>
                        <p className="text-sm text-gray-500">Manage your administrative information and preferences.</p>
                    </div>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Admin Profile
                        </button>
                    )}
                </div>

                <div className="p-8">
                    <form onSubmit={handleSave}>
                        {/* Avatar Section */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-12">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                                    <Image src={user.avatar} alt="Admin Avatar" width={128} height={128} className="object-cover w-full h-full" />
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Profile Picture</h3>
                                <p className="text-sm text-gray-500 max-w-md">
                                    This image will be visible in the admin header and audit logs. Square images are recommended.
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
                                    Administrative Email
                                </label>
                                <input 
                                    type="email" 
                                    disabled={true} // Usually email is locked for admins
                                    value={user.email}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed transition-all" 
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed by the admin themselves for security reasons.</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    Contact Number
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
                                        let digits = val.replace(/\D/g, "");
                                        if (digits.length > 8) digits = digits.substring(0, 8);
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
                                        if (digits.length === 8) {
                                            const d = parseInt(digits.substring(0, 2));
                                            const m = parseInt(digits.substring(2, 4));
                                            const y = parseInt(digits.substring(4, 8));
                                            const dateObj = new Date(y, m - 1, d);
                                            const isValid = dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d && y > 1900 && y <= new Date().getFullYear();
                                            setDobError(isValid ? "" : "Invalid date");
                                        } else {
                                            setDobError("");
                                        }
                                    }}
                                    placeholder="DD/MM/YYYY"
                                    className={`w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-1 transition-all text-gray-900 disabled:opacity-70 disabled:cursor-not-allowed ${
                                        dobError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    }`} 
                                />
                                {isEditing && dobError && <p className="text-[10px] text-red-500 font-medium mt-1">{dobError}</p>}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    Office/Work Address
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
                                    Save Admin Details
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
