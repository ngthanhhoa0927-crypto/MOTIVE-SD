"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const productId = params.id;
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Product State
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [description, setDescription] = useState('');
    const [weight, setWeight] = useState('');
    const [status, setStatus] = useState<'Active' | 'Draft' | 'Archived'>('Draft');
    const [images, setImages] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            const token = localStorage.getItem('admin_token');
            try {
                const res = await fetch(`http://localhost:8000/products/${productId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const p = data.product;
                    setName(p.name || '');
                    setCategoryId(p.category_id?.toString() || '');
                    setBrand(p.brand || '');
                    setPrice(p.base_price?.toString() || '0');
                    setDescription(p.description || '');
                    setWeight(p.weight?.toString() || '');
                    setStatus(p.status || 'Draft');
                    setImages(p.images || []);
                    setVariants(p.variants || []);
                    
                    // Aggregate stock
                    const totalStock = p.variants?.reduce((s: number, v: any) => s + v.stock_quantity, 0) || 0;
                    setStock(totalStock.toString());
                } else {
                    alert("Failed to load product");
                    router.push('/admin/products');
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const res = await fetch("http://localhost:8000/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.categories || []);
                }
            } catch(e) { console.error(e) }
        };

        fetchProduct();
        fetchCategories();
    }, [productId, router]);

    const handleSave = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('admin_token');
        
        // Prepare updated variants - for MVP we just update the first variant's stock/price if it exists
        // Otherwise we create a default one
        let updatedVariants = [...variants];
        if (updatedVariants.length === 0) {
            updatedVariants = [{
                sku: `SKU-${Date.now()}`,
                price: parseFloat(price) || 0,
                stock_quantity: parseInt(stock) || 0,
                is_active: true
            }];
        } else {
            updatedVariants[0].price = parseFloat(price) || updatedVariants[0].price;
            updatedVariants[0].stock_quantity = parseInt(stock) || updatedVariants[0].stock_quantity;
        }

        const payload = {
            name,
            description,
            category_id: parseInt(categoryId) || 1,
            brand,
            base_price: parseFloat(price) || 0,
            weight: parseFloat(weight) || 0,
            status,
            images,
            variants: updatedVariants
        };

        try {
            const res = await fetch(`http://localhost:8000/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Product updated successfully!");
                router.push('/admin/products');
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-gray-500 font-semibold">Loading product details...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24 relative">
            <Link href="/admin/products" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                Back
            </Link>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left Column */}
                <div className="w-full lg:w-2/3 space-y-6">
                    
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-[15px]">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Basic Information
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-[13px] font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Category</label>
                                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-[13px] font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Brand</label>
                                    <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Vintage Apparel" className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-[13px] font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Stock Quantity</label>
                                    <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-[13px] font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-500">$</span>
                                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-8 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-[13px] font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-gray-900 font-bold text-[15px]">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Product Images
                            </div>
                            <button className="text-[13px] font-bold text-blue-600 hover:text-blue-800 transition">Add New Photo</button>
                        </div>
                        
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {images.map((img, idx) => (
                                <div key={idx} className={`relative w-[120px] h-[120px] rounded-xl border-2 flex-shrink-0 overflow-hidden ${img.is_primary ? 'border-blue-600 bg-blue-50/20' : 'border-gray-200 bg-white'}`}>
                                    {img.is_primary && (
                                        <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">MAIN</div>
                                    )}
                                    <Image src={img.signed_url || img.image_url} alt="Product" fill className="object-cover" unoptimized />
                                </div>
                            ))}
                            
                            <div className="w-[120px] h-[120px] rounded-xl border-2 border-dashed border-gray-200 bg-[#F9FAFB] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors flex-shrink-0">
                                <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <span className="text-[11px] font-bold text-gray-500">Upload</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-[15px]">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Product Description
                        </div>
                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            {/* Rich Text Toolbar Mock */}
                            <div className="flex items-center gap-1.5 p-3 border-b border-gray-100 bg-[#FCFCFD]">
                                {['bold', 'italic', 'underline', 'list', 'link', 'quote'].map((icon) => (
                                    <button key={icon} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors w-8 h-8 flex items-center justify-center">
                                        <div className="uppercase font-serif font-bold text-sm tracking-tighter">
                                            {icon === 'bold' ? 'B' : icon === 'italic' ? 'I' : icon === 'underline' ? 'U' : icon === 'list' ? '≡' : icon === 'link' ? '🔗' : '""'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                rows={6} 
                                className="w-full p-4 bg-white text-[13px] font-medium text-gray-700 focus:outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-[15px]">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Specifications
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Material</label>
                                <input type="text" defaultValue="80% Wool, 20% Polyester" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Size</label>
                                <input type="text" defaultValue="One Size Adjustable" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Weight</label>
                                <input type="text" value={weight} onChange={e => setWeight(e.target.value)} placeholder="120g" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Care Instructions</label>
                                <input type="text" defaultValue="Dry clean only" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="w-full lg:w-1/3 space-y-6">
                    
                    {/* Product Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
                        <h3 className="text-[14px] font-bold text-gray-900 mb-4">Product Status</h3>
                        
                        <div className="space-y-2">
                            <label className={`flex items-center gap-3 p-3 rounded-xl border ${status === 'Active' ? 'bg-[#EEF2FF] border-blue-200' : 'bg-[#F9FAFB] border-gray-100'} cursor-pointer hover:bg-gray-50 transition-colors`}>
                                <input type="radio" checked={status === 'Active'} onChange={() => setStatus('Active')} className="w-4 h-4 text-blue-600 accent-blue-600" />
                                <div>
                                    <div className="text-[13px] font-bold text-gray-900 leading-none mb-1">Published</div>
                                    <div className="text-[11px] font-medium text-gray-500 leading-none">Visible to all customers</div>
                                </div>
                            </label>
                            
                            <label className={`flex items-center gap-3 p-3 rounded-xl border ${status === 'Draft' ? 'bg-[#EEF2FF] border-blue-200' : 'bg-white border-gray-200'} cursor-pointer hover:bg-gray-50 transition-colors`}>
                                <input type="radio" checked={status === 'Draft'} onChange={() => setStatus('Draft')} className="w-4 h-4 text-blue-600 accent-blue-600" />
                                <div>
                                    <div className="text-[13px] font-bold text-gray-900 leading-none mb-1">Draft</div>
                                    <div className="text-[11px] font-medium text-gray-500 leading-none">Internal use only</div>
                                </div>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border ${status === 'Archived' ? 'bg-[#EEF2FF] border-blue-200' : 'bg-white border-gray-200'} cursor-pointer hover:bg-gray-50 transition-colors`}>
                                <input type="radio" checked={status === 'Archived'} onChange={() => setStatus('Archived')} className="w-4 h-4 text-gray-400" />
                                <div>
                                    <div className="text-[13px] font-bold text-gray-400 leading-none mb-1">Archived</div>
                                    <div className="text-[11px] font-medium text-gray-400 leading-none">Hidden from catalog</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Variations */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
                        <h3 className="text-[14px] font-bold text-gray-900 mb-5">Variations</h3>
                        
                        <div className="mb-5">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Available Sizes</label>
                            <div className="flex flex-wrap gap-2">
                                {['S', 'M', 'L'].map((s) => (
                                    <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold cursor-pointer ${s === 'M' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {s}
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">
                                    +
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Colors</label>
                            <div className="flex flex-wrap gap-2 items-center">
                                {['#1E3A8A', '#78350F', '#1F2937'].map((c, i) => (
                                    <div key={i} className={`w-6 h-6 rounded-full cursor-pointer ring-2 ring-offset-2 ${i === 0 ? 'ring-blue-500' : 'ring-transparent'}`} style={{ backgroundColor: c }}></div>
                                ))}
                                <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer ml-1">
                                    +
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
                        <h3 className="text-[14px] font-bold text-gray-900 mb-4">Tags</h3>
                        
                        <div className="mb-3 relative">
                            <input type="text" placeholder="Add a tag..." className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {['Vintage', 'Winter', 'Plaid', 'Premium'].map(t => (
                                <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-md text-[12px] font-bold text-gray-600">
                                    {t}
                                    <button className="text-gray-400 hover:text-gray-900">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/80 p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-30">
                <div className="max-w-6xl mx-auto flex justify-end gap-3 pl-64">
                    <button onClick={() => router.push('/admin/products')} className="px-6 py-2.5 text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
                        Discard
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="px-8 py-2.5 text-[13px] font-bold text-white bg-[#2563EB] rounded-xl hover:bg-blue-700 transition shadow-[0_2px_10px_-3px_rgba(37,99,235,0.5)] disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

        </div>
    );
}
