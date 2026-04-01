"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All categories');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    
    // Auto-close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isCategoryOpen && !(e.target as Element).closest('.category-dropdown')) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isCategoryOpen]);

    const [activeTab, setActiveTab] = useState('All');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    
    // Actions dropdown
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    // Delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);

    // Bulk modal
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkActionType, setBulkActionType] = useState<'delete' | 'archive' | null>(null);

    // Single Archive Modal
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [productToArchive, setProductToArchive] = useState<any>(null);

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
            } else {
                setProducts([]); // Fallback to empty array on error
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setProducts([]); // Fallback to empty array on network error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.action-dropdown-btn') && !target.closest('.action-dropdown-menu')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // === Shared payload builder for PUT requests (synced with backend Zod schema) ===
    const buildProductPayload = (product: any, overrides: Record<string, any> = {}) => {
        const basePrice = parseFloat(product.base_price) || 0.01;
        return {
            category_id: product.category_id,
            name: product.name,
            base_price: basePrice,
            weight: product.weight ? parseFloat(product.weight) : 1, // required, fallback 1g
            description: product.description,
            status: product.status,
            images: (product.images || []).map((img: any, idx: number) => ({
                image_url: img.image_url,
                is_primary: img.is_primary ?? idx === 0,
                display_order: img.display_order ?? idx
            })),
            variants: (product.variants || []).map((v: any) => ({
                sku: v.sku || `SKU-${product.id}-${Date.now()}`,
                color: v.color || 'Default',
                color_hex: v.color_hex,
                size: v.size || 'Free Size',
                price: basePrice, // Single price model
                stock_quantity: v.stock_quantity ?? 0,
                image_url: v.image_url,
                is_active: v.is_active ?? true
            })),
            ...overrides
        };
    };

    const toggleStatus = async (product: any) => {
        const newStatus = product.status === 'Active' ? 'Draft' : 'Active';
        const token = localStorage.getItem('admin_token');
        try {
            const payload = buildProductPayload(product, { status: newStatus });

            const response = await fetch(`http://localhost:8000/products/${product.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
            } else {
                const err = await response.json();
                console.error("Failed to toggle status API:", err);
                alert("Failed to update status");
            }
        } catch (e) {
            console.error("Failed to toggle status", e);
        }
    };

    const confirmDelete = (product: any) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
        setOpenDropdownId(null);
    };

    const confirmArchive = (product: any) => {
        setProductToArchive(product);
        setIsArchiveModalOpen(true);
        setOpenDropdownId(null);
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

    const handleArchive = async () => {
        if (!productToArchive) return;
        const token = localStorage.getItem('admin_token');
        setIsLoading(true);
        try {
            const payload = buildProductPayload(productToArchive, { status: 'Archived' });

            const response = await fetch(`http://localhost:8000/products/${productToArchive.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                setProducts(products.map(p => p.id === productToArchive.id ? { ...p, status: 'Archived' } : p));
                setIsArchiveModalOpen(false);
                setProductToArchive(null);
            } else {
                alert("Failed to archive product");
            }
        } catch (e) {
            console.error("Failed to archive product", e);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmBulkAction = (type: 'delete' | 'archive') => {
        if (selectedIds.size === 0) return;
        setBulkActionType(type);
        setIsBulkModalOpen(true);
    };

    const executeBulkDelete = async () => {
        const token = localStorage.getItem('admin_token');
        setIsLoading(true);
        try {
            await Promise.all(
                Array.from(selectedIds).map(id => fetch(`http://localhost:8000/products/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => null))
            );
            
            setProducts(products.filter(p => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
            setIsBulkModalOpen(false);
            setBulkActionType(null);
        } catch (e) {
            console.error(e);
            alert("Error bulk deleting products");
        } finally {
            setIsLoading(false);
        }
    };

    const executeBulkArchive = async () => {
        const token = localStorage.getItem('admin_token');
        setIsLoading(true);
        try {
            await Promise.all(
                Array.from(selectedIds).map(async (id) => {
                    const product = products.find(p => p.id === id);
                    if (!product) return;
                    
                    const payload = buildProductPayload(product, { status: 'Archived' });

                    await fetch(`http://localhost:8000/products/${id}`, {
                        method: 'PUT',
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    }).catch(() => null);
                })
            );
            
            setProducts(products.map(p => selectedIds.has(p.id) ? { ...p, status: 'Archived' } : p));
            setSelectedIds(new Set());
            setIsBulkModalOpen(false);
            setBulkActionType(null);
        } catch (e) {
            console.error("Failed to bulk archive", e);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                                 p.id.toString().includes(search);
            
            let matchesTab = true;
            const stock = p.variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0;
            
            let matchesCategory = true;
            if (selectedCategory !== 'All categories') {
                const categoryNames: Record<number, string> = {
                    1: 'Baseball Hat',
                    2: 'Bucket Hat',
                    3: 'Sun Protection Hat',
                    4: 'Flat Cap',
                    5: 'Others'
                };
                matchesCategory = categoryNames[p.category_id] === selectedCategory;
            }
            
            if (activeTab === 'Active') matchesTab = p.status === 'Active';
            if (activeTab === 'Drafts') matchesTab = p.status === 'Draft';
            if (activeTab === 'Archived') matchesTab = p.status === 'Archived';
            if (activeTab === 'Out of Stock') matchesTab = stock === 0;
            
            return matchesSearch && matchesTab && matchesCategory;
        });
    }, [products, search, activeTab, selectedCategory]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedProducts.map(p => p.id)));
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Breadcrumb & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 sm:mb-6">
                <div>
                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-gray-500 mb-1">
                        <Link href="/admin/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
                        <span className="text-gray-300">/</span>
                        <Link href="/admin/products" className="hover:text-gray-900 transition-colors">Products</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-blue-600 font-semibold truncate max-w-[120px] sm:max-w-none">Product list</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Product list</h1>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Link href="/admin/products/add" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Add Product
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 overflow-hidden">
                {/* Tabs */}
                <div className="px-6 flex items-center gap-8 border-b border-gray-100 overflow-x-auto hide-scrollbar">
                    {['All', 'Active', 'Out of Stock', 'Drafts', 'Archived'].map(tab => {
                        const count = tab === 'All' ? products.length : 
                                      tab === 'Active' ? products.filter(p=>p.status==='Active').length :
                                      tab === 'Drafts' ? products.filter(p=>p.status==='Draft').length :
                                      tab === 'Archived' ? products.filter(p=>p.status==='Archived').length :
                                      products.filter(p=>(p.variants?.reduce((sum:number, v:any)=>sum+v.stock_quantity,0)||0)===0).length;

                        return (
                            <button 
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                                className={`py-4 whitespace-nowrap text-[14px] font-bold transition-colors border-b-2 relative ${
                                    activeTab === tab 
                                        ? 'border-blue-600 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {tab}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search & Toolbar */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:max-w-[720px]">
                        <div className="relative flex-1">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-[13px] font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        
                        <div className="relative category-dropdown w-full sm:w-[200px]">
                            <button 
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className={`flex items-center justify-between w-full px-4 py-2.5 bg-white border ${isCategoryOpen ? 'border-blue-600 ring-1 ring-blue-600' : 'border-blue-600'} rounded-lg text-[13px] font-bold text-gray-700 transition-all shadow-sm`}
                            >
                                <span className={selectedCategory === 'All categories' ? 'text-gray-500 font-medium' : 'text-gray-900'}>{selectedCategory}</span>
                                <svg className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {isCategoryOpen && (
                                <div className="absolute z-40 top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                                    {['All categories', 'Baseball Hat', 'Bucket Hat', 'Sun Protection Hat', 'Flat Cap', 'Others'].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setIsCategoryOpen(false);
                                                setCurrentPage(1);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center justify-between transition-colors ${selectedCategory === cat ? 'bg-blue-50/80 text-blue-900 font-bold' : 'text-gray-700 font-medium hover:bg-gray-50'}`}
                                        >
                                            {cat}
                                            {selectedCategory === cat && (
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-[#F9FAFB] border-b border-gray-200/80">
                                <th className="py-3 px-6 w-12">
                                </th>
                                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 tracking-wide">Product Name</th>
                                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 tracking-wide w-[12%]">Price</th>
                                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 tracking-wide w-[15%]">Category</th>
                                <th className="py-3 px-4 text-[12px] font-bold text-gray-500 tracking-wide w-[10%]">Stock</th>
                                <th className="py-3 px-6 text-[12px] font-bold text-gray-500 tracking-wide w-[10%] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-sm font-semibold text-gray-500">Loading products...</td></tr>
                            ) : paginatedProducts.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-sm font-semibold text-gray-500">No matching products.</td></tr>
                            ) : paginatedProducts.map((p, idx) => {
                                const primaryImage = p.images?.find((img: any) => img.is_primary)?.signed_url || p.images?.[0]?.signed_url || '/images/image-placeholder.png';
                                const toggleOn = p.status === 'Active';
                                const stockCount = p.variants?.reduce((s: number,v:any)=>s+v.stock_quantity,0) || 0;
                                
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                                checked={selectedIds.has(p.id)}
                                                onChange={() => toggleSelect(p.id)}
                                            />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-[44px] h-[44px] rounded border border-gray-200/80 bg-white overflow-hidden p-0.5 flex-shrink-0 flex items-center justify-center">
                                                    <Image src={primaryImage} alt={p.name} width={40} height={40} className="object-cover h-full w-full rounded-sm" unoptimized />
                                                </div>
                                                <div>
                                                    <Link href={`/admin/products/${p.id}`} className="block">
                                                        <p className="text-[14px] font-bold text-gray-900 hover:text-blue-600 transition-colors max-w-[200px] truncate">{p.name}</p>
                                                    </Link>
                                                    <p className="text-[12px] font-medium text-gray-400 mt-0.5">ID: {p.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-[14px] font-semibold text-gray-900">
                                            ${parseFloat(p.base_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-4 px-4 text-[13px] font-bold text-gray-600">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                {p.category_id === 1 ? 'Baseball Hat' : 
                                                 p.category_id === 2 ? 'Bucket Hat' : 
                                                 p.category_id === 3 ? 'Sun Protection Hat' : 
                                                 p.category_id === 4 ? 'Flat Cap' : 
                                                 p.category_id === 5 ? 'Others' : 
                                                 'Others'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-[14px] font-semibold text-gray-900">
                                            {stockCount}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                                <div className="relative inline-block text-left">
                                                <button 
                                                    id={`btn-${p.id}`}
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setOpenDropdownId(openDropdownId === p.id ? null : p.id); 
                                                    }}
                                                    className={`action-dropdown-btn w-9 h-9 flex flex-col items-center justify-center gap-1 mx-auto rounded-xl transition-all ${openDropdownId === p.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                                                >
                                                    <div className="w-[3.5px] h-[3.5px] rounded-full bg-current"></div>
                                                    <div className="w-[3.5px] h-[3.5px] rounded-full bg-current"></div>
                                                    <div className="w-[3.5px] h-[3.5px] rounded-full bg-current"></div>
                                                </button>
                                                
                                                {openDropdownId === p.id && (
                                                    <div 
                                                        className={`action-dropdown-menu absolute right-full mr-2 z-[9999] w-40 rounded-xl bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-gray-100 focus:outline-none animate-in fade-in zoom-in-95 slide-in-from-right-2 duration-200 ${idx >= paginatedProducts.length - 2 && paginatedProducts.length > 2 ? 'bottom-0 origin-bottom-right' : 'top-0 origin-top-right'}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="p-1.5 space-y-0.5">
                                                            <Link 
                                                                href={`/admin/products/${p.id}`} 
                                                                className="flex w-full px-3 py-2.5 text-[13.5px] font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-left items-center group transition-all"
                                                            >
                                                                <svg className="w-4 h-4 mr-2.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 2-4 6-9 6s-9-4-9-6 4-6 9-6 9 4 9 6z" /></svg>
                                                                View detail
                                                            </Link>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); confirmArchive(p); }} 
                                                                className="flex w-full px-3 py-2.5 text-[13.5px] font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-left items-center group transition-all"
                                                            >
                                                                <svg className="w-4 h-4 mr-2.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                                                Archive
                                                            </button>
                                                            <div className="my-1 border-t border-gray-100"></div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); confirmDelete(p); }} 
                                                                className="flex w-full px-3 py-2.5 text-[13.5px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg text-left items-center group transition-all"
                                                            >
                                                                <svg className="w-4 h-4 mr-2.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer Controls */}
                <div className="p-4 border-t border-gray-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mt-auto bg-white rounded-b-xl shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.05)] w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center flex-1 w-full gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group px-2 shrink-0">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white" 
                                checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                                onChange={toggleSelectAll}
                            />
                            <span className="text-[13px] font-bold text-gray-700 group-hover:text-blue-600 transition whitespace-nowrap">Select All</span>
                        </label>
                        
                        {selectedIds.size > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-1 sm:ml-6 xl:mr-8 w-full gap-3 sm:gap-6 bg-gray-50/50 sm:bg-transparent p-3 rounded-lg sm:p-0">
                                <span className="text-[13px] font-bold text-blue-600 whitespace-nowrap">{selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected</span>
                                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                    <button 
                                        onClick={() => confirmBulkAction('delete')}
                                        className="flex-1 sm:flex-none px-4 sm:px-5 py-2 border border-rose-200 text-rose-600 text-[12px] sm:text-[13px] font-bold rounded-lg hover:bg-rose-50 hover:border-rose-300 transition shadow-sm"
                                    >
                                        Delete
                                    </button>
                                    <button 
                                        onClick={() => confirmBulkAction('archive')}
                                        className="flex-1 sm:flex-none px-4 sm:px-5 py-2 border border-gray-200 text-gray-700 text-[12px] sm:text-[13px] font-bold rounded-lg hover:bg-gray-50 transition shadow-sm"
                                    >
                                        Archive
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-1.5 isolate w-full xl:w-auto xl:pl-8 xl:border-l border-gray-100 mt-2 xl:mt-0 pt-3 xl:pt-0 border-t xl:border-t-0">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="relative inline-flex items-center rounded-lg px-2 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">&larr;</span>
                        </button>
                        
                        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar max-w-[150px] sm:max-w-none">
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`relative inline-flex flex-shrink-0 items-center px-2.5 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-lg transition ${currentPage === idx + 1 ? 'z-10 bg-gray-100 text-gray-900 border border-gray-200' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="relative inline-flex items-center rounded-lg px-2 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">&rarr;</span>
                        </button>
                    </div>
                </div>
            </div>

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

            {/* Bulk Action Modal Overlay */}
            {isBulkModalOpen && bulkActionType && (
                <>
                    <div className="fixed inset-0 z-40 bg-[#0F172AC4] backdrop-blur-[2px] transition-opacity" onClick={() => setIsBulkModalOpen(false)}></div>
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8 pt-6 text-center animate-in zoom-in-95 duration-200">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border-[6px] ${bulkActionType === 'delete' ? 'bg-[#FEF2F2] border-red-50/50' : 'bg-[#FFFBEB] border-yellow-50/50'}`}>
                            {bulkActionType === 'delete' ? (
                                <svg className="w-6 h-6 text-[#DC2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            ) : (
                                <svg className="w-6 h-6 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                            )}
                        </div>
                        <h3 className="text-[22px] font-bold text-gray-900 tracking-tight mb-2">
                            {bulkActionType === 'delete' ? 'Delete Products?' : 'Archive Products?'}
                        </h3>
                        <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed px-4">
                            Are you sure you want to {bulkActionType} <span className="font-bold text-gray-900">{selectedIds.size}</span> selected product{selectedIds.size > 1 ? 's' : ''}?
                            {bulkActionType === 'delete' ? ' This action is permanent and cannot be undone.' : ''}
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button onClick={bulkActionType === 'delete' ? executeBulkDelete : executeBulkArchive} className={`w-full py-3 text-[13px] font-bold text-white rounded-xl transition ${bulkActionType === 'delete' ? 'bg-[#E4312B] hover:bg-red-700 shadow-[0_2px_10px_-3px_rgba(220,38,38,0.4)]' : 'bg-[#D97706] hover:bg-amber-700 shadow-[0_2px_10px_-3px_rgba(217,119,6,0.4)]'}`}>
                                {bulkActionType === 'delete' ? 'Delete Products' : 'Archive Products'}
                            </button>
                            <button onClick={() => setIsBulkModalOpen(false)} className="w-full py-3 text-[13px] font-bold border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition shadow-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
            {/* Product Archive Modal Overlay */}
            {isArchiveModalOpen && productToArchive && (
                <>
                    <div className="fixed inset-0 z-[10000] bg-[#0F172AC4] backdrop-blur-[2px] transition-opacity" onClick={() => setIsArchiveModalOpen(false)}></div>
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-8 pt-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border-[6px] border-amber-50/50">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        </div>
                        <h3 className="text-[22px] font-bold text-gray-900 tracking-tight mb-2">Archive Product?</h3>
                        <p className="text-[13px] text-gray-500 font-medium mb-6 leading-relaxed px-4">
                            Are you sure you want to archive this product? It will be hidden from the storefront but kept in your records.
                        </p>
                        
                        {/* Selected Product Card inside modal */}
                        <div className="bg-[#FAFBFD] border border-gray-100/80 rounded-xl p-4 flex items-center gap-4 mb-8 text-left">
                            <div className="w-[50px] h-[50px] rounded border border-gray-200 bg-white overflow-hidden p-1 flex-shrink-0 flex items-center justify-center shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                                <Image 
                                    src={productToArchive.images?.find((img: any) => img.is_primary)?.signed_url || productToArchive.images?.[0]?.signed_url || '/images/image-placeholder.png'} 
                                    alt={productToArchive.name} 
                                    width={42} height={42} 
                                    className="object-cover w-full h-full rounded-[2px]" 
                                    unoptimized
                                />
                            </div>
                            <div className="truncate">
                                <h4 className="text-[13px] font-bold text-gray-900 leading-tight mb-1 truncate">{productToArchive.name}</h4>
                                <p className="text-[11px] font-medium text-gray-400">ID: {productToArchive.id}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleArchive} className="w-full py-3 text-[13px] font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition shadow-[0_2px_10px_-3px_rgba(217,119,6,0.4)]">
                                Archive Product
                            </button>
                            <button onClick={() => setIsArchiveModalOpen(false)} className="w-full py-3 text-[13px] font-bold border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition shadow-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
