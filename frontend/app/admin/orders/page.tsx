"use client";
import React, { useState, useEffect } from 'react';

// Mock Data
const INITIAL_ORDERS = [
    {
        id: "ORD-8921",
        customerName: "Sarah Jenkins",
        email: "sarah.j@example.com",
        date: "Oct 24, 2023",
        totalAmount: 245.99,
        status: "Delivered",
        paymentMethod: "Credit Card",
        shippingAddress: "123 Main St, New York, NY 10001",
        items: [
            { name: "Black Dog Ear Baseball Cap", quantity: 2, price: 19.00 },
            { name: "Classic Beige Bucket Hat", quantity: 1, price: 15.00 }
        ]
    },
    {
        id: "ORD-8920",
        customerName: "Michael Brown",
        email: "mbrown@example.com",
        date: "Oct 24, 2023",
        totalAmount: 1020.00,
        status: "Processing",
        paymentMethod: "PayPal",
        shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
        items: [
            { name: "Vintage Denim Cap", quantity: 5, price: 18.00 },
            { name: "Knit Winter Hat", quantity: 2, price: 25.00 }
        ]
    },
    {
        id: "ORD-8919",
        customerName: "Emma Lawson",
        email: "emma.l@example.com",
        date: "Oct 23, 2023",
        totalAmount: 89.50,
        status: "Pending",
        paymentMethod: "Credit Card",
        shippingAddress: "789 Pine Rd, Chicago, IL 60601",
        items: [
            { name: "White Bear Ear Baseball Cap", quantity: 1, price: 20.00 },
            { name: "Sport Visor Cap", quantity: 2, price: 16.00 }
        ]
    },
    {
        id: "ORD-8918",
        customerName: "David Kim",
        email: "dkim@example.com",
        date: "Oct 23, 2023",
        totalAmount: 432.00,
        status: "Shipped",
        paymentMethod: "Stripe",
        shippingAddress: "321 Elm St, Seattle, WA 98101",
        items: [
            { name: "Wide Brim Sun Hat", quantity: 4, price: 28.00 },
        ]
    },
    {
        id: "ORD-8917",
        customerName: "Sophia Martinez",
        email: "sophia.m@example.com",
        date: "Oct 21, 2023",
        totalAmount: 125.00,
        status: "Cancelled",
        paymentMethod: "Credit Card",
        shippingAddress: "654 Birch Blvd, Miami, FL 33101",
        items: [
            { name: "Polka Dot Dog Ear Baseball Cap", quantity: 3, price: 21.00 }
        ]
    }
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>(INITIAL_ORDERS);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    
    // Modal states
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Form states for Editing
    const [editData, setEditData] = useState({
        status: ''
    });

    // In a real app, you would fetch orders here
    useEffect(() => {
        // fetchOrders()
    }, []);

    const openEditModal = (order: any) => {
        setSelectedOrder(order);
        setEditData({
            status: order.status
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (order: any) => {
        setSelectedOrder(order);
        setIsDeleteModalOpen(true);
    };

    const openViewModal = (order: any) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };

    const closeModals = () => {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsViewModalOpen(false);
        setTimeout(() => setSelectedOrder(null), 200);
    };

    const handleUpdateOrder = async () => {
        if (!selectedOrder) return;
        // Mock update
        const updatedOrders = orders.map(o => 
            o.id === selectedOrder.id ? { ...o, status: editData.status } : o
        );
        setOrders(updatedOrders);
        alert("Order updated successfully");
        closeModals();
    };

    const handleDeleteOrder = async () => {
        if (!selectedOrder) return;
        // Mock delete
        const updatedOrders = orders.filter(o => o.id !== selectedOrder.id);
        setOrders(updatedOrders);
        alert("Order deleted successfully");
        closeModals();
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) || 
                              order.id.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status: string) => {
        switch(status) {
            case 'Delivered': return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
            case 'Processing': return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
            case 'Shipped': return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
            case 'Pending': return { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' };
            case 'Cancelled': return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[600px]">
            {/* Toolbar */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                <div className="relative w-full max-w-md">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        placeholder="Search by Order ID or Customer Name" 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-gray-200 focus:bg-white transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                    <div className="relative shrink-0 w-full sm:w-auto">
                        <select 
                            className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-gray-300 cursor-pointer shadow-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                        </select>
                        <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="p-20 text-center text-gray-500">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
                    <p className="text-sm text-gray-500">Try adjusting your search or filter settings.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FCFCFD] border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                <th className="py-4 px-6 font-bold whitespace-nowrap">Order ID</th>
                                <th className="py-4 px-6 font-bold whitespace-nowrap">Customer</th>
                                <th className="py-4 px-6 font-bold whitespace-nowrap">Date</th>
                                <th className="py-4 px-6 font-bold whitespace-nowrap">Amount</th>
                                <th className="py-4 px-6 font-bold whitespace-nowrap">Status</th>
                                <th className="py-4 px-6 font-bold text-right shrink-0 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredOrders.map((order) => {
                                const statusStyle = getStatusStyles(order.status);
                                return (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                                        {order.id}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div>
                                            <span className="font-bold text-gray-900 block truncate max-w-[150px]">{order.customerName}</span>
                                            <span className="text-xs text-gray-500 mt-0.5 block truncate max-w-[150px]">{order.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600 font-medium whitespace-nowrap">
                                        {order.date}
                                    </td>
                                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                                        ${order.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${statusStyle.bg} rounded-full`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></div>
                                            <span className={`text-[11px] font-bold uppercase tracking-wide ${statusStyle.text}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openViewModal(order)} className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-md hover:bg-blue-50" title="View Order">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            <button onClick={() => openEditModal(order)} className="text-gray-400 hover:text-gray-900 transition-colors p-1.5 rounded-md hover:bg-gray-100" title="Update Status">
                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => openDeleteModal(order)} className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50" title="Delete Order">
                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Placeholder */}
            {!isLoading && filteredOrders.length > 0 && (
                <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white text-sm">
                    <span className="text-gray-500 font-medium">Showing <strong className="text-gray-900 font-semibold">{filteredOrders.length}</strong> orders</span>
                </div>
            )}

            {/* Overlays for Modals */}
            {(isEditModalOpen || isDeleteModalOpen || isViewModalOpen) && (
                <div className="fixed inset-0 z-40 bg-[#0F172AC4] backdrop-blur-[2px] transition-opacity" onClick={closeModals}></div>
            )}

            {/* Edit Status Modal */}
            {isEditModalOpen && selectedOrder && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-7 transform transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Update Order Status</h3>
                        <button onClick={closeModals} className="text-gray-400 hover:text-gray-800 transition-colors p-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-[13px] font-medium text-gray-500 mb-6">Change processing status for {selectedOrder.id}</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Order Status</label>
                            <div className="relative">
                                <select 
                                    value={editData.status} 
                                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                                    className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none shadow-sm"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between gap-3 overflow-hidden">
                        <button onClick={closeModals} className="flex-1 py-2.5 text-sm font-semibold border text-gray-700 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
                        <button onClick={handleUpdateOrder} className="flex-1 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow flex items-center justify-center gap-2">
                            Update Status
                        </button>
                    </div>
                </div>
            )}

            {/* View Order Modal */}
            {isViewModalOpen && selectedOrder && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                Order Details 
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusStyles(selectedOrder.status).bg} ${getStatusStyles(selectedOrder.status).text}`}>
                                    {selectedOrder.status}
                                </span>
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{selectedOrder.id} • {selectedOrder.date}</p>
                        </div>
                        <button onClick={closeModals} className="text-gray-400 hover:text-gray-800 transition-colors p-2 bg-white rounded-full border border-gray-200 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Customer Info */}
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Information</h4>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-gray-900">{selectedOrder.customerName}</p>
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {selectedOrder.email}</p>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping & Payment</h4>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700 flex items-start gap-2">
                                        <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span className="leading-tight">{selectedOrder.shippingAddress}</span>
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        Payment: <strong className="text-gray-900">{selectedOrder.paymentMethod}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Items</h4>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-[#FAFBFD] border-b border-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase">Product</th>
                                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase text-center">Qty</th>
                                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase text-right">Price</th>
                                        <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedOrder.items.map((item: any, idx: number) => (
                                        <tr key={idx} className="bg-white">
                                            <td className="py-3 px-4 text-sm font-bold text-gray-900">{item.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500 text-center font-medium">x{item.quantity}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500 text-right font-medium">${item.price.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-900 font-bold text-right">${(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-[#FAFBFD]">
                                    <tr>
                                        <td colSpan={3} className="py-4 px-4 text-right text-sm font-semibold text-gray-500">Total Amount:</td>
                                        <td className="py-4 px-4 text-right text-lg font-black text-blue-600">${selectedOrder.totalAmount.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                        <button onClick={() => { setIsViewModalOpen(false); setTimeout(() => openEditModal(selectedOrder), 200); }} className="py-2.5 px-6 text-sm font-bold text-[#2563EB] bg-white border border-[#2563EB] rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                            Update Status
                        </button>
                        <button onClick={closeModals} className="py-2.5 px-6 shrink-0 text-sm font-bold bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Order Modal */}
            {isDeleteModalOpen && selectedOrder && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-7 text-center">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-[6px] border-red-50/50">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Order</h3>
                    <p className="text-[13px] text-gray-600 font-medium mb-6 leading-relaxed">
                        Are you sure you want to delete order <strong className="text-gray-900 font-bold">{selectedOrder.id}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={closeModals} className="flex-1 py-2.5 text-sm font-bold border text-gray-700 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
                        <button onClick={handleDeleteOrder} className="flex-1 py-2.5 text-sm font-bold bg-[#DC2626] text-white rounded-lg hover:bg-red-700 transition-colors shadow">Delete Order</button>
                    </div>
                </div>
            )}
        </div>
    );
}
