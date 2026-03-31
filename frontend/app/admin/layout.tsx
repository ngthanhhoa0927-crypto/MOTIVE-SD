"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface Notification {
    id: number;
    type: string;
    userId: number | null;
    userName: string;
    userAvatar: string | null;
    message: string;
    isRead: boolean;
    createdAt: string;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

function getNotifIcon(type: string) {
    switch (type) {
        case 'account_created':
            return <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
        case 'order_placed':
            return <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
        case 'account_deleted':
            return <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
        case 'order_confirmed':
            return <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;
        case 'password_changed':
            return <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
        default:
            return <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
}

function getNotifIconBg(type: string) {
    switch (type) {
        case 'account_created': return 'bg-[#2563EB]';
        case 'order_placed': return 'bg-[#1E293B]';
        case 'account_deleted': return 'bg-[#EF4444]';
        case 'order_confirmed': return 'bg-[#10B981]';
        case 'password_changed': return 'bg-[#F59E0B]';
        default: return 'bg-[#6B7280]';
    }
}

function getNotifHighlight(type: string) {
    return type === 'account_deleted';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [adminProfile, setAdminProfile] = useState<{ full_name: string, role: string, avatar?: string } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showLogoutToast, setShowLogoutToast] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        try {
            const [notifRes, countRes] = await Promise.all([
                fetch("http://localhost:8000/notifications", {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch("http://localhost:8000/notifications/unread-count", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);
            if (notifRes.ok) {
                const data = await notifRes.json();
                setNotifications(data.notifications || []);
            }
            if (countRes.ok) {
                const data = await countRes.json();
                setUnreadCount(data.count || 0);
            }
        } catch (err) {
            // Silently fail — notifications are non-critical
        }
    }, []);

    const markAsRead = async (id: number) => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        try {
            await fetch(`http://localhost:8000/notifications/${id}/read`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {}
    };

    useEffect(() => {
        // Fetch or get from token
        const token = localStorage.getItem('admin_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setAdminProfile({ full_name: payload.full_name, role: payload.role });
                
                // Fetch full profile to get avatar
                fetch("http://localhost:8000/auth/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.profile?.avatar_view_url) {
                        setAvatarUrl(data.profile.avatar_view_url);
                    }
                })
                .catch(() => {});
            } catch (e) {}
        }

        const handleAvatarUpdate = (e: any) => {
            setAvatarUrl(e.detail);
        };

        window.addEventListener('avatarUpdated', handleAvatarUpdate);
        return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    }, []);

    // Fetch notifications on mount + poll every 30s
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Auto-close dropdown on route change
    useEffect(() => {
        setIsProfileOpen(false);
        setIsNotificationOpen(false);
        setIsSidebarOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('remembered_password');
        setIsProfileOpen(false);
        setShowLogoutToast(true);
        setTimeout(() => {
            router.push('/user/homepage');
        }, 1200);
    };

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { name: 'Orders', href: '/admin/orders', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'Customers', href: '/admin/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ];

    let pageTitle = 'Admin Area';
    if (pathname === '/admin/dashboard') pageTitle = 'Dashboard Overview';
    if (pathname === '/admin/customers') pageTitle = 'User Management';
    if (pathname === '/admin/orders') pageTitle = 'Orders Management';
    if (pathname === '/admin/products') pageTitle = 'Products Management';

    return (
        <div className={`min-h-screen bg-[#F3F4F6] flex ${inter.className}`}>
            {/* Custom Logout Toast */}
            {showLogoutToast && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-[bounce_0.3s_ease-out]">
                    <div className="bg-white rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-4 flex items-center gap-3 min-w-[300px]">
                        <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 tracking-tight">Success</p>
                            <p className="text-[13px] font-medium text-gray-500 mt-0.5">Logout Successfully. Redirecting...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed h-screen left-0 top-0 z-30 w-[260px] bg-[#161B28] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    <div className="h-20 flex items-center justify-between px-6">
                        <Link href="/admin/dashboard" className="flex flex-col justify-center gap-1.5 hover:opacity-90 transition">
                            <Image 
                                src="/images/logo.png" 
                                alt="Motive SD" 
                                width={200} 
                                height={50} 
                                className="object-contain h-10 w-auto bg-white px-3 py-1 rounded-md"
                            />
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <nav className="px-4 py-6 flex flex-col gap-1.5">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#2563EB] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                    </svg>
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <div className="p-4 mb-4 shrink-0">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Support</div>
                    <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#1E2536] hover:bg-gray-700 text-sm font-medium text-gray-300 rounded-lg transition-colors border border-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Help Center
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 lg:ml-[260px] flex flex-col h-[100dvh] overflow-hidden min-w-0">
                {/* Header */}
                <header className="h-16 lg:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight truncate max-w-[200px] sm:max-w-none">
                            {pageTitle}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                className="text-gray-500 hover:text-gray-900 relative p-1 transition-colors"
                                onClick={() => {
                                    setIsNotificationOpen(!isNotificationOpen);
                                    if(isProfileOpen) setIsProfileOpen(false);
                                }}
                            >
                                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#2563EB] border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white z-10">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                                <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)}></div>
                                    <div className="absolute right-0 mt-3 w-[400px] bg-white rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right border border-gray-100/50">
                                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
                                        </div>
                                        
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length === 0 && (
                                                <div className="px-5 py-8 text-center text-sm text-gray-400">
                                                    No notifications yet
                                                </div>
                                            )}
                                            {notifications.map((notif) => (
                                                <div 
                                                    key={notif.id} 
                                                    className={`flex gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50/80 transition-colors cursor-pointer group ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                                    onClick={() => { if (!notif.isRead) markAsRead(notif.id); }}
                                                >
                                                    <div className="relative flex-shrink-0 mt-1">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            {notif.userAvatar ? (
                                                                <Image src={notif.userAvatar} alt={notif.userName} width={40} height={40} className="object-cover" />
                                                            ) : (
                                                                <span className="text-sm font-bold text-gray-500">{notif.userName.charAt(0).toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        <div className={`absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center ${getNotifIconBg(notif.type)}`}>
                                                            {getNotifIcon(notif.type)}
                                                        </div>
                                                    </div>
                                                    <div className="text-[13px] text-gray-600 leading-snug">
                                                        <p className="mb-0.5"><span className={`font-semibold ${getNotifHighlight(notif.type) ? 'text-[#EF4444]' : 'text-gray-900'}`}>{notif.userName}</span> {notif.message.replace(notif.userName + ' ', '')}</p>
                                                        <p className="text-[11px] text-gray-400 font-medium group-hover:text-blue-500 transition-colors">{timeAgo(notif.createdAt)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="pt-2 pb-1 bg-gray-50/50 rounded-b-xl border-t border-gray-50">
                                            <button className="w-full text-center py-2 text-sm font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">
                                                See all activity
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <div 
                                className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer group"
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen);
                                    if(isNotificationOpen) setIsNotificationOpen(false);
                                }}
                            >
                                <div className="text-right flex flex-col justify-center">
                                    <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{adminProfile?.full_name || 'Hanh Nguyen'}</p>
                                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">{adminProfile?.role === 'admin' ? 'Admin' : 'Admin'}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 group-hover:border-blue-300 transition-colors">
                                    {avatarUrl ? (
                                        <Image src={avatarUrl} alt="Avatar" width={40} height={40} className="object-cover" />
                                    ) : (
                                        <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    )}
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                                        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                                            {avatarUrl && <Image src={avatarUrl} alt="Avatar" width={32} height={32} className="rounded-full object-cover" />}
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-900 truncate">{adminProfile?.full_name || 'Hanh Nguyen'}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{adminProfile?.role || 'admin'}@motive.sd</p>
                                            </div>
                                        </div>
                                        <Link 
                                            href="/admin/profile" 
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            My Profile
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Log Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-[#F3F4F6] p-4 lg:p-8">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
