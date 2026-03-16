"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [adminProfile, setAdminProfile] = useState<{ full_name: string, role: string } | null>(null);

    useEffect(() => {
        // Fetch or get from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setAdminProfile({ full_name: payload.full_name, role: payload.role });
            } catch (e) {}
        }
    }, []);

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
            {/* Sidebar */}
            <aside className="w-[260px] bg-[#161B28] text-white flex flex-col justify-between fixed h-screen left-0 top-0 z-20">
                <div>
                    <div className="h-20 flex items-center px-6">
                        <div className="flex items-center gap-3">
                            {/* Simple logo text */}
                            <svg viewBox="0 0 40 40" className="w-8 h-8 text-white bg-blue-600 rounded-md p-1" fill="currentColor">
                                <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 30l-8-14h16l-8 14z" />
                                <path d="M20 8l-6 10h12l-6-10z" fill="#161B28" />
                            </svg>
                            <div>
                                <h1 className="font-bold text-lg leading-none tracking-wide">Motive SD</h1>
                                <span className="text-xs text-blue-400 font-medium tracking-wide">Admin Portal</span>
                            </div>
                        </div>
                    </div>
                    <nav className="px-4 py-6 flex flex-col gap-1.5">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#2563EB] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                    </svg>
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <div className="p-4 mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Support</div>
                    <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#1E2536] hover:bg-gray-700 text-sm font-medium text-gray-300 rounded-lg transition-colors border border-gray-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Help Center
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10 w-full shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {pageTitle}
                    </h2>
                    <div className="flex items-center gap-6">
                        <button className="text-gray-500 hover:text-gray-900 relative p-1 transition-colors">
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full"></span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer">
                            <div className="text-right flex flex-col justify-center">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{adminProfile?.full_name || 'Hanh Nguyen'}</p>
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">{adminProfile?.role === 'admin' ? 'Admin' : 'Admin'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-[#F3F4F6] p-8">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
