"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('0.00');
    const [stock, setStock] = useState('0');
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        fetch("http://localhost:8000/categories")
            .then(res => res.json())
            .then(data => {
                if (data.categories) {
                    setCategories(data.categories);
                }
            })
            .catch(err => console.error("Failed to fetch categories:", err));
    }, []);

    const [imageKey, setImageKey] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'products');

            const token = localStorage.getItem('admin_token');
            const res = await fetch("http://localhost:8000/files/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setImageKey(data.key);
                setImagePreview(data.url);
            } else {
                alert("Upload failed");
            }
        } catch(error) {
            console.error(error);
            alert("Upload failed due to network error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (status: 'Draft' | 'Active') => {
        setIsSubmitting(true);
        const token = localStorage.getItem('admin_token');

        const payload = {
            name,
            description,
            category_id: parseInt(categoryId) || (categories.length > 0 ? categories[0].id : 1),
            brand,
            base_price: parseFloat(price) || 0,
            status,
            images: imageKey ? [{ image_url: imageKey, is_primary: true, display_order: 0 }] : [],
            variants: [{
                sku: `SKU-${Math.floor(Math.random() * 10000)}`,
                price: parseFloat(price) || 0,
                stock_quantity: parseInt(stock) || 0,
                is_active: true
            }]
        };

        try {
            const res = await fetch("http://localhost:8000/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onSuccess();
            } else {
                const err = await res.json();
                alert(`Error: ${err.message || 'Validation failed'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to create product");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-[#0F172AC4] backdrop-blur-[2px] transition-opacity" onClick={onClose}></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[600px] bg-white rounded-[16px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100/80 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Add New Product</h2>
                        <p className="text-[13px] font-medium text-gray-500">Fill in the details to list a new item in your store</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 form-custom-scrollbar">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Images</label>
                        <div className="relative w-full h-[140px] rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        {isUploading ? (
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        )}
                                    </div>
                                    <div className="text-[14px] font-bold text-gray-700 mb-1">Click to upload or drag and drop</div>
                                    <div className="text-[11px] font-medium text-gray-400">PNG, JPG or WebP (max. 5MB)</div>
                                </>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* Target Inputs */}
                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Hats" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product features, materials, and benefits..." rows={4} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Category</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Brand Name</label>
                            <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Vintage Apparel" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-500">$</span>
                                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Stock Quantity</label>
                            <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100/80 bg-[#FCFCFD] flex items-center justify-between">
                    <button onClick={onClose} className="px-5 py-2.5 text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
                        Cancel
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => handleSubmit('Draft')} disabled={isSubmitting} className="px-5 py-2.5 text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm disabled:opacity-50">
                            Save as Draft
                        </button>
                        <button onClick={() => handleSubmit('Active')} disabled={isSubmitting} className="px-6 py-2.5 text-[13px] font-bold text-white bg-[#2563EB] rounded-xl hover:bg-blue-700 transition shadow-[0_2px_10px_-3px_rgba(37,99,235,0.5)] disabled:opacity-50">
                            {isSubmitting ? 'Publishing...' : 'Publish Product'}
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}
