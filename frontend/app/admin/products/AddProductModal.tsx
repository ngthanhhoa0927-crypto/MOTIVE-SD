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
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('');
    const [stock, setStock] = useState('0');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [errors, setErrors] = useState<any>({});

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
                setErrors((prev: any) => ({ ...prev, image: undefined }));
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
        const newErrors: any = {};

        // === Business Rule Validation ===
        if (!name.trim()) newErrors.name = "Product name is required";
        else if (name.trim().length < 10) newErrors.name = "Product name must be at least 10 characters";

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) newErrors.price = "Price must be greater than 0";

        const weightNum = parseFloat(weight);
        if (!weight || isNaN(weightNum) || weightNum <= 0) newErrors.weight = "Weight (g) is required and must be > 0";

        if (!imageKey) newErrors.image = "At least 1 product image is required";

        if (!size.trim()) newErrors.size = "Size is required (e.g. S, M, L, Free Size)";
        if (!color.trim()) newErrors.color = "Color is required (e.g. Black, White, Red)";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsSubmitting(true);
        const token = localStorage.getItem('admin_token');

        // Auto-generate SKU: PRODUCT_CODE-SIZE-COLOR
        const productCode = name.trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
            + Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const sku = `${productCode}-${size.trim().toUpperCase()}-${color.trim().toUpperCase()}`;

        const payload = {
            name: name.trim(),
            description: description || undefined,
            category_id: parseInt(categoryId) || (categories.length > 0 ? categories[0].id : 1),
            brand: brand || undefined,
            base_price: priceNum,
            weight: weightNum,
            status,
            images: [{ image_url: imageKey, is_primary: true, display_order: 0 }],
            variants: [{
                sku,
                size: size.trim(),
                color: color.trim(),
                price: priceNum,
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
                const detail = err.errors ? '\n' + err.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n') : '';
                alert(`Error: ${err.message || 'Validation failed'}${detail}`);
            }
        } catch (error) {
            console.error('Product creation error:', error);
            alert("Failed to create product. Check if the backend server is running.");
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
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 form-custom-scrollbar">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Image <span className="text-red-500">*</span></label>
                        <div className={`relative w-full h-[140px] rounded-xl border-2 border-dashed ${errors.image ? 'border-red-400 bg-red-50' : 'border-[#E5E7EB] bg-[#F9FAFB]'} hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group`}>
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
                                    <div className="text-[11px] font-medium text-gray-400">PNG, JPG or WebP (min 800×800)</div>
                                </>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                        </div>
                        {errors.image && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.image}</p>}
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span> <span className="text-gray-400 font-medium">(min 10 chars)</span></label>
                        <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors((p: any) => ({...p, name: undefined})); }} placeholder="e.g. Premium Baseball Cap" className={`w-full px-4 py-3 bg-white border ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl text-[13px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`} />
                        {errors.name && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[13px] font-bold text-gray-700 mb-2">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product features, materials, and benefits..." rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
                    </div>

                    {/* Category + Brand */}
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

                    {/* Price + Weight */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Price <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-500">$</span>
                                <input type="number" step="0.01" value={price} onChange={e => { setPrice(e.target.value); setErrors((p: any) => ({...p, price: undefined})); }} placeholder="0.00" className={`w-full pl-8 pr-4 py-3 bg-white border ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`} />
                            </div>
                            {errors.price && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Weight <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type="number" min="0" value={weight} onChange={e => { setWeight(e.target.value); setErrors((p: any) => ({...p, weight: undefined})); }} placeholder="e.g. 120" className={`w-full pl-4 pr-9 py-3 bg-white border ${errors.weight ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`} />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-gray-400 pointer-events-none">g</span>
                            </div>
                            {errors.weight && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.weight}</p>}
                        </div>
                    </div>

                    {/* Size + Color (Variant) */}
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                        <h3 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            Default Variant <span className="text-red-500">*</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[12px] font-bold text-gray-600 mb-1.5">Size <span className="text-red-500">*</span></label>
                                <input type="text" value={size} onChange={e => { setSize(e.target.value); setErrors((p: any) => ({...p, size: undefined})); }} placeholder="e.g. M" className={`w-full px-3 py-2.5 bg-white border ${errors.size ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`} />
                                {errors.size && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.size}</p>}
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-gray-600 mb-1.5">Color <span className="text-red-500">*</span></label>
                                <input type="text" value={color} onChange={e => { setColor(e.target.value); setErrors((p: any) => ({...p, color: undefined})); }} placeholder="e.g. Black" className={`w-full px-3 py-2.5 bg-white border ${errors.color ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`} />
                                {errors.color && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.color}</p>}
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-gray-600 mb-1.5">Stock</label>
                                <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                            </div>
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
