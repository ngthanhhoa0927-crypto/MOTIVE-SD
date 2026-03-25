"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import AddProductModal from './AddProductModal';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All Products');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    
    // Add product state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);

    const ITEMS_PER_PAGE = 10;

    const fetchProducts = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch("http://localhost:8000/products", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                                 p.id.toString().includes(search);
            
            let matchesTab = true;
            if (activeTab === 'Published') matchesTab = p.status === 'Active';
            if (activeTab === 'Drafts') matchesTab = p.status === 'Draft';
            if (activeTab === 'Archived') matchesTab = p.status === 'Archived';
            
            return matchesSearch && matchesTab;
        });
    }, [products, search, activeTab]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
        }
    };
    
    const confirmDelete = (product: any) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch(`http://localhost:8000/products/${productToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
                fetchProducts();
            } else {
                alert("Failed to delete product");
            }
        } catch (e) {
            alert("Error deleting product");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Management</h1>
            </div>

            <div className="bg-white rounded-[14px] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-200/80 overflow-hidden relative">
                {/* Search Bar */}
                <div className="p-5 border-b border-gray-100 bg-white">
                    <div className="relative w-full">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input 
                            type="text" 
                            placeholder="Search products name..." 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100/50 rounded-xl text-[13px] font-medium placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors outline-none"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                {/* Tabs & Add Button */}
                <div className="px-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex gap-8 text-[13px] font-bold text-gray-400 -mb-px overflow-x-auto hide-scrollbar">
                        {['All Products', 'Published', 'Drafts', 'Archived'].map(tab => {
                            const count = tab === 'All Products' ? products.length : 
                                         tab === 'Published' ? products.filter(p=>p.status==='Active').length :
                                         tab === 'Drafts' ? products.filter(p=>p.status==='Draft').length :
                                         products.filter(p=>p.status==='Archived').length;

                            return (
                                <button 
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                    className={`py-4 whitespace-nowrap border-b-2 transition-colors ${
                                        activeTab === tab 
                                            ? 'border-blue-600 text-blue-600' 
                                            : 'border-transparent hover:text-gray-700 hover:border-gray-200'
                                    }`}
                                >
                                    {tab} {count > 0 ? `(${count > 999 ? (count/1000).toFixed(1)+'k' : count})` : '(0)'}
                                </button>
                            );
                        })}
                    </div>
                    {/* Add Product Button */}
                    <button onClick={() => setIsAddModalOpen(true)} className="shrink-0 ml-4 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563EB] text-white text-[13px] font-bold hover:bg-blue-700 transition shadow-[0_2px_10px_-3px_rgba(37,99,235,0.5)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Add new product
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-100/80 bg-[#FCFCFD]">
                                <th className="py-4 px-6 w-12">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer" 
                                        checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[38%]">Product Details</th>
                                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[17%]">Sales/Revenue</th>
                                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[15%]">Price</th>
                                <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[15%]">Stock Level</th>
                                <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right w-[15%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/80">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-sm font-semibold text-gray-400">Loading products...</td></tr>
                            ) : paginatedProducts.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-sm font-semibold text-gray-400">No products found.</td></tr>
                            ) : paginatedProducts.map(p => {
                                const primaryImage = p.images?.find((img: any) => img.is_primary)?.signed_url || p.images?.[0]?.signed_url || '/images/image-placeholder.png';
                                const mockSales = p.id * 1530; 
                                
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer" 
                                                checked={selectedIds.has(p.id)}
                                                onChange={() => toggleSelect(p.id)}
                                            />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-[52px] h-[52px] rounded border border-gray-200/80 bg-white shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                                                    <Image src={primaryImage} alt={p.name} width={44} height={44} className="object-cover h-full w-full rounded-sm" unoptimized />
                                                </div>
                                                <div>
                                                    <h3 className="text-[13px] font-bold text-gray-900 mb-[3px] leading-tight">{p.name}</h3>
                                                    <p className="text-[11px] font-medium text-gray-400">ID: {p.id} <span className="mx-0.5">|</span> Category: {p.category_id || 'Uncategorized'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-[13px] font-bold text-gray-900">${mockSales.toLocaleString()}.00</div>
                                            <div className="text-[10px] font-bold text-[#10B981] mt-1 flex items-center gap-1">
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                                12% MONTH
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-[13px] font-bold text-gray-900">
                                            ${parseFloat(p.base_price).toFixed(2)}
                                        </td>
                                        <td className="py-4 px-4 text-[13px] font-bold text-gray-700">
                                            {p.variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex flex-col items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/products/${p.id}`} className="text-[13px] font-bold text-[#2563EB] hover:text-blue-800 transition block leading-none">
                                                    Update
                                                </Link>
                                                <button onClick={() => confirmDelete(p)} className="text-[13px] font-bold text-[#2563EB] hover:text-blue-800 transition block leading-none">
                                                    More
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer Toolbar */}
                <div className="p-4 border-t border-gray-100/80 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FCFCFD] rounded-b-xl">
                    {/* Left: Selection actions */}
                    <div className="flex items-center gap-4 text-sm w-full md:w-auto">
                        <label className="flex items-center gap-2 font-bold text-[13px] text-gray-700 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-blue-600" 
                                checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                                onChange={toggleSelectAll}
                            />
                            Select All
                        </label>
                        <span className="text-gray-500 font-medium text-[13px]">{selectedIds.size} product selected</span>
                        {selectedIds.size > 0 && (
                            <div className="flex gap-3 ml-auto md:ml-4">
                                <button className="px-6 py-2 border border-red-200 text-[#E4312B] text-[13px] font-bold rounded-full hover:bg-red-50 transition shadow-sm bg-white">Delete</button>
                                <button className="px-6 py-2 border border-gray-200 text-gray-600 text-[13px] font-bold rounded-full hover:bg-gray-50 transition shadow-sm bg-white">Hide</button>
                            </div>
                        )}
                    </div>
                    
                    {/* Right: Pagination */}
                    <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-[11px] font-medium text-gray-400 mr-2 uppercase tracking-wide">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} results
                        </span>
                        
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-3 py-1.5 text-[13px] font-bold text-gray-400 disabled:opacity-50 hover:text-gray-700 transition"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`w-8 h-8 rounded border flex items-center justify-center text-[13px] font-bold transition-all ${
                                    currentPage === idx + 1 ? 'border-gray-200 bg-white text-gray-900 shadow-sm' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        
                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-3 py-1.5 text-[13px] font-bold text-gray-900 whitespace-nowrap disabled:opacity-50 border border-gray-200 bg-white rounded shadow-sm hover:bg-gray-50 transition ml-1"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            <AddProductModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchProducts();
                }}
            />

            {/* Delete Modal Overlay */}
            {isDeleteModalOpen && productToDelete && (
                <>
                    <div className="fixed inset-0 z-40 bg-[#0F172AC4] backdrop-blur-[2px] transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8 pt-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4 border-[6px] border-red-50/50">
                            <svg className="w-6 h-6 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-[22px] font-bold text-gray-900 tracking-tight mb-2">Delete Product?</h3>
                        <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed px-4">
                            Are you sure you want to delete this product? This action is permanent and cannot be undone.
                        </p>
                        
                        {/* Selected Product Card inside modal */}
                        <div className="bg-[#FAFBFD] border border-gray-100/80 rounded-xl p-4 flex items-center gap-4 mb-8 text-left">
                            <div className="w-[50px] h-[50px] rounded border border-gray-200 bg-white overflow-hidden p-1 flex-shrink-0 flex items-center justify-center shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                                <Image 
                                    src={productToDelete.images?.find((img: any) => img.is_primary)?.signed_url || productToDelete.images?.[0]?.signed_url || '/images/image-placeholder.png'} 
                                    alt={productToDelete.name} 
                                    width={42} height={42} 
                                    className="object-cover w-full h-full rounded-[2px]" 
                                    unoptimized
                                />
                            </div>
                            <div className="truncate">
                                <h4 className="text-[13px] font-bold text-gray-900 leading-tight mb-1 truncate">{productToDelete.name}</h4>
                                <p className="text-[11px] font-medium text-gray-400">ID: {productToDelete.id} <span className="mx-0.5">•</span> Category: {productToDelete.category_id}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleDelete} className="w-full py-3 text-[13px] font-bold bg-[#E4312B] text-white rounded-xl hover:bg-red-700 transition shadow-[0_2px_10px_-3px_rgba(220,38,38,0.4)]">
                                Delete Product
                            </button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3 text-[13px] font-bold border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition shadow-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}
