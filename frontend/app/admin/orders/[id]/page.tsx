"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
    ChevronLeft, 
    User, 
    CreditCard, 
    Truck, 
    MapPin, 
    ShoppingBag, 
    Receipt,
    Clock
} from 'lucide-react';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        // Here we would fetch actual order details using orderId
        // fetchOrderDetails(orderId)
    }, [orderId]);

    const handleUpdateStatus = async (newStatus: string) => {
        setIsUpdating(true);
        // Here we would call the backend API to update status
        // e.g. await fetch(`/api/admin/orders/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) })
        
        // Mock success
        setTimeout(() => {
            setOrder({ ...order, status: newStatus });
            setIsUpdating(false);
            // Optionally show a toast here
            // alert(`Order status updated to ${newStatus}`);
        }, 600);
    };

    const getStatusStyles = (status: string) => {
        const s = (status || "").toLowerCase();
        switch(s) {
            case 'pending': return { bg: 'bg-yellow-50', text: 'text-yellow-700' };
            case 'confirmed': return { bg: 'bg-purple-50', text: 'text-purple-700' };
            case 'shipping': return { bg: 'bg-blue-50', text: 'text-blue-700' };
            case 'completed': return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
            case 'cancelled': return { bg: 'bg-gray-100', text: 'text-gray-700' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-500' };
        }
    };

    if (isLoading || !order) return <div className="p-20 text-center text-gray-500">Loading order details...</div>;

    const statusStyle = getStatusStyles(order.status);

    return (
        <div className="max-w-[1200px] mx-auto pb-12 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                <div>
                    <button 
                        onClick={() => router.push('/admin/orders')}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="flex items-center gap-4 flex-wrap">
                        <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                        <p className="text-[13px] font-medium text-gray-500">Placed on {order.date}</p>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text}`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Total Amount Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 min-w-[240px]">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Amount</p>
                    <h2 className="text-3xl font-extrabold text-[#2563EB]">${order.total.toFixed(2)}</h2>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Customer Information</h2>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                                <p className="text-sm font-bold text-gray-900">{order.customer.fullName}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                                <p className="text-sm font-semibold text-gray-700">{order.customer.phone}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                <p className="text-sm font-semibold text-gray-700">{order.customer.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                        </div>
                        
                        <div className="bg-[#F9FAFB] rounded-xl p-4 border border-gray-100 flex items-center gap-4 mb-6">
                            <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                                {/* Simulated Card/COD icon */}
                                <svg className="w-6 h-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{order.payment.method}</p>
                                <p className="text-xs font-medium text-gray-500">{order.payment.methodDesc}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Billing Address</p>
                            <p className="text-sm font-medium text-gray-700 whitespace-pre-line leading-relaxed">
                                {order.payment.billingAddress}
                            </p>
                        </div>
                    </div>

                    {/* Shipping Method */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Truck className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Shipping Method</h2>
                        </div>
                        
                        <div className="bg-white border rounded-xl p-4 border-gray-200 flex items-center justify-between gap-4 mb-4">
                            <div>
                                <p className="text-sm font-bold text-gray-900">{order.shipping.method}</p>
                                <p className="text-xs font-medium text-gray-500">{order.shipping.methodDesc}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-[#2563EB]">{order.shipping.fee === 0 ? 'Free' : `$${order.shipping.fee.toFixed(2)}`}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{order.shipping.deliveryTime}</p>
                            </div>
                        </div>

                        <div className="bg-[#F9FAFB] rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                            <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Estimated Delivery</p>
                                <p className="text-sm font-bold text-gray-900">{order.shipping.estimatedDelivery}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Delivery Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Delivery Details</h2>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                                <p className="text-sm font-medium text-gray-700 whitespace-pre-line leading-relaxed">
                                    {order.delivery.address}
                                </p>
                            </div>
                            
                            {order.delivery.note && (
                                <div className="flex-1 bg-[#F5F8FF] border border-[#DEE8FF] rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileTextIcon className="w-4 h-4 text-[#2563EB]" />
                                        <p className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">Delivery Note</p>
                                    </div>
                                    <p className="text-[13px] font-medium text-gray-600 italic leading-relaxed">
                                        "{order.delivery.note}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Product List</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500">{order.items.length} Items</span>
                        </div>
                        
                        <div className="space-y-4">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors bg-white">
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h4>
                                        <p className="text-xs font-medium text-gray-500">Color: {item.color} | Size: {item.size}</p>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                        <p className="text-[11px] font-bold text-gray-400 mb-1">Qty: {item.qty}</p>
                                        <p className="text-sm font-bold text-gray-900">${item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Total Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Order Total Summary</h2>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-500">Subtotal</span>
                                <span className="font-bold text-gray-700">${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-500">Shipping Fee ({order.shipping.method})</span>
                                <span className="font-bold text-[#22C55E]">FREE</span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-6"></div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-gray-900">Grand Total</span>
                            <span className="text-2xl font-extrabold text-[#2563EB]">${order.total.toFixed(2)}</span>
                        </div>

                        {/* Action Buttons based on status */}
                        <div className="flex gap-4 justify-end">
                            {order.status === 'Pending' && (
                                <>
                                    <button 
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus('Cancelled')}
                                        className="px-6 py-2.5 text-sm font-bold text-[#DC2626] border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel Order
                                    </button>
                                    <button 
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus('Confirmed')}
                                        className="px-8 py-2.5 text-sm font-bold bg-[#2563EB] text-white rounded-xl hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
                                    >
                                        Confirm Order
                                    </button>
                                </>
                            )}

                            {order.status === 'Confirmed' && (
                                <>
                                    <button 
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus('Cancelled')}
                                        className="px-6 py-2.5 text-sm font-bold text-[#DC2626] border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel Order
                                    </button>
                                    <button 
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus('Shipping')}
                                        className="px-8 py-2.5 text-sm font-bold bg-[#2563EB] text-white rounded-xl hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
                                    >
                                        Mark as Shipping
                                    </button>
                                </>
                            )}

                            {order.status === 'Shipping' && (
                                <button 
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus('Completed')}
                                    className="px-8 py-2.5 text-sm font-bold bg-[#2563EB] text-white rounded-xl hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
                                >
                                    Mark as Completed
                                </button>
                            )}

                            {(order.status === 'Completed' || order.status === 'Cancelled') && (
                                <span className="text-sm font-bold flex items-center text-gray-500 py-2.5">
                                    No further actions required
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FileTextIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
            <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
    )
}
