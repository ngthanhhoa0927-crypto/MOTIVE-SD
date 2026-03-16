"use client";
import React from 'react';

// Mock data as BE does not have dashboard stats APIs yet
const RECENT_ORDERS = [
    { id: '#ORD-8921', customer: 'Sarah Jenkins', initials: 'SJ', avatarColor: 'bg-blue-100 text-blue-600', date: 'Oct 24, 2023', amount: '$245.99', status: 'Delivered', statusColor: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
    { id: '#ORD-8920', customer: 'Michael Brown', initials: 'MB', avatarColor: 'bg-purple-100 text-purple-600', date: 'Oct 24, 2023', amount: '$1,020.00', status: 'Processing', statusColor: 'bg-amber-50 text-amber-600 ring-amber-100' },
    { id: '#ORD-8919', customer: 'Emma Lawson', initials: 'EL', avatarColor: 'bg-pink-100 text-pink-600', date: 'Oct 23, 2023', amount: '$89.50', status: 'Delivered', statusColor: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
    { id: '#ORD-8918', customer: 'David Kim', initials: 'DK', avatarColor: 'bg-indigo-100 text-indigo-600', date: 'Oct 23, 2023', amount: '$432.00', status: 'Shipped', statusColor: 'bg-blue-50 text-blue-600 ring-blue-100' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">$128,430.00</h3>
                    </div>
                </div>

                {/* Active Users */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+5.2%</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Active Users</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">1,842</h3>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+8.1%</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Total Orders</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">4,521</h3>
                    </div>
                </div>
            </div>

            {/* Main Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trends Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-2 flex flex-col">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Sales Trends</h3>
                            <p className="text-sm font-medium text-gray-500">Monthly revenue performance</p>
                        </div>
                        <div className="relative">
                            <select className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 transition-shadow shadow-sm">
                                <option>Last 6 Months</option>
                                <option>This Year</option>
                            </select>
                            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* CSS Bar Chart */}
                    <div className="flex-1 flex items-end justify-between mt-auto gap-4 pt-4 sm:px-4">
                        {/* JAN */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div className="w-full bg-[#E5E7EB] rounded-t-lg transition-all group-hover:bg-[#D1D5DB] relative" style={{ height: '80px' }}>
                                {/* Tooltip on hover */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    $14,200
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">JAN</span>
                        </div>
                        {/* FEB */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div className="w-full bg-[#F3F4F6] rounded-t-lg transition-all group-hover:bg-[#E5E7EB] relative" style={{ height: '120px' }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    $18,500
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">FEB</span>
                        </div>
                        {/* MAR */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div className="w-full bg-[#C7D2FE] rounded-t-lg transition-all group-hover:bg-[#A5B4FC] relative" style={{ height: '90px' }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    $16,100
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">MAR</span>
                        </div>
                        {/* APR */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div className="w-full bg-[#9CA3AF] rounded-t-lg transition-all group-hover:bg-[#6B7280] relative" style={{ height: '160px' }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    $24,800
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">APR</span>
                        </div>
                        {/* MAY (Active) */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div className="w-full bg-[#2563EB] shadow-lg shadow-blue-500/20 rounded-t-lg transition-all group-hover:bg-blue-700 relative" style={{ height: '200px' }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    $32,400
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">MAY</span>
                        </div>
                        {/* JUN */}
                        <div className="flex flex-col items-center gap-3 w-full group">
                            <div className="w-full bg-[#9CA3AF] rounded-t-lg transition-all group-hover:bg-[#6B7280] relative" style={{ height: '140px' }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    $21,200
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">JUN</span>
                        </div>
                    </div>
                </div>

                {/* Popular Categories */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Popular Categories</h3>
                        <div className="space-y-5">
                            {/* Category 1 */}
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        <span className="text-sm font-bold text-gray-900">Electronics</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">45%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            {/* Category 2 */}
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                        <span className="text-sm font-bold text-gray-900">Apparel</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">30%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                            {/* Category 3 */}
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                                        <span className="text-sm font-bold text-gray-900">Home Goods</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">15%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                                </div>
                            </div>
                            {/* Category 4 */}
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                        <span className="text-sm font-bold text-gray-900">Others</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">10%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: '10%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-8 py-2.5 text-sm font-bold text-[#2563EB] border border-blue-100 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors">
                        View Details
                    </button>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Recent Orders</h3>
                        <p className="text-sm font-medium text-gray-500">Monitor your most recent customer transactions</p>
                    </div>
                    <button className="px-4 py-2 text-sm font-bold border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm shrink-0">
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FCFCFD] border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                <th className="py-4 px-6">Order ID</th>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Date</th>
                                <th className="py-4 px-6">Amount</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {RECENT_ORDERS.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-6 font-bold text-gray-900">{order.id}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.avatarColor}`}>
                                                {order.initials}
                                            </div>
                                            <span className="font-semibold text-gray-900">{order.customer}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-500 font-medium">{order.date}</td>
                                    <td className="py-4 px-6 font-bold text-gray-900">{order.amount}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 overflow-hidden ${order.statusColor}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="relative inline-block text-left opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
