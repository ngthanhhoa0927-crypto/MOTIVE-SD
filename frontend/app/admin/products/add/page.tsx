"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [brand, setBrand] = useState('');
    
    // Images
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageKey, setImageKey] = useState<string | null>(null);

    // Variations
    const [variation1Name, setVariation1Name] = useState('Size');
    const [variation1Options, setVariation1Options] = useState<string[]>(['S', 'M', 'L']);
    const [v1Input, setV1Input] = useState('');
    
    const [variation2Name, setVariation2Name] = useState('Color');
    const [variation2Options, setVariation2Options] = useState<string[]>(['Black', 'White']);
    const [v2Input, setV2Input] = useState('');

    const [variantsData, setVariantsData] = useState<any[]>([]);
    
    // Category list from API
    const [categories, setCategories] = useState<any[]>([
        { id: 1, name: 'Baseball Hat' },
        { id: 2, name: 'Bucket Hat' },
        { id: 3, name: 'Sun Protection Hat' },
        { id: 4, name: 'Flat Cap' },
        { id: 5, name: 'Others' }
    ]);

    useEffect(() => {
        // Mock fetch categories, in real app it hits /categories
        fetch("http://localhost:8000/categories")
            .then(res => res.json())
            .then(data => {
                if (data.categories && data.categories.length > 0) {
                    setCategories(data.categories);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // Generate variants combination when options change
    useEffect(() => {
        const generated: any[] = [];
        const generateCombos = () => {
            const v1IsSize = variation1Name.toLowerCase() === 'size';
            const v2IsSize = variation2Name.toLowerCase() === 'size';
            const v1IsColor = variation1Name.toLowerCase() === 'color';
            const v2IsColor = variation2Name.toLowerCase() === 'color';

            if (variation1Options.length > 0 && variation2Options.length > 0) {
                variation1Options.forEach(v1 => {
                    variation2Options.forEach(v2 => {
                        generated.push({ 
                            name: `${v1} - ${v2}`, 
                            size: v1IsSize ? v1 : (v2IsSize ? v2 : v1), // Fallback map v1 to size if unknown
                            color: v1IsColor ? v1 : (v2IsColor ? v2 : v2), 
                            price: 0, 
                            stock: 0, 
                            sku: '' 
                        });
                    });
                });
            } else if (variation1Options.length > 0) {
                variation1Options.forEach(v1 => {
                    generated.push({ 
                        name: v1, 
                        size: v1IsSize || !v1IsColor ? v1 : '', 
                        color: v1IsColor ? v1 : '', 
                        price: 0, 
                        stock: 0, 
                        sku: '' 
                    });
                });
            } else if (variation2Options.length > 0) {
                variation2Options.forEach(v2 => {
                    generated.push({ 
                        name: v2, 
                        size: v2IsSize ? v2 : '', 
                        color: v2IsColor || !v2IsSize ? v2 : '', 
                        price: 0, 
                        stock: 0, 
                        sku: '' 
                    });
                });
            } else {
                generated.push({ name: 'Default', size: '', color: '', price: 0, stock: 0, sku: '' });
            }
        };
        generateCombos();
        
        // Preserve existing data for overlapping keys
        setVariantsData(prev => {
            return generated.map(g => {
                const existing = prev.find(p => p.name === g.name);
                return existing ? existing : g;
            });
        });
    }, [variation1Options, variation2Options]);

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
        } finally {
            setIsUploading(false);
        }
    };

    const addOption = (type: 1 | 2, value: string) => {
        if (!value.trim()) return;
        if (type === 1) {
            if (!variation1Options.includes(value)) setVariation1Options([...variation1Options, value.trim()]);
            setV1Input('');
        } else {
            if (!variation2Options.includes(value)) setVariation2Options([...variation2Options, value.trim()]);
            setV2Input('');
        }
    };

    const removeOption = (type: 1 | 2, value: string) => {
        if (type === 1) setVariation1Options(variation1Options.filter(o => o !== value));
        else setVariation2Options(variation2Options.filter(o => o !== value));
    };

    const handleVariantChange = (idx: number, field: string, value: string) => {
        const newVariants = [...variantsData];
        newVariants[idx][field] = value;
        setVariantsData(newVariants);
    };

    const handleApplyAllPrice = (e: any) => {
        const val = e.target.value;
        const newVariants = variantsData.map(v => ({ ...v, price: val }));
        setVariantsData(newVariants);
    };

    const handleApplyAllStock = (e: any) => {
        const val = e.target.value;
        const newVariants = variantsData.map(v => ({ ...v, stock: val }));
        setVariantsData(newVariants);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('Product name is required');
            return;
        }
        setIsSubmitting(true);
        const token = localStorage.getItem('admin_token');

        // Backend variants format expects flat price/stock per variant
        const primaryPrice = variantsData.length > 0 ? parseFloat(variantsData[0].price) || 0 : 0;
        
        const payload = {
            name,
            description: description || undefined,
            category_id: parseInt(categoryId) || (categories.length > 0 ? categories[0].id : 1),
            base_price: primaryPrice,
            status: 'Active',
            images: imageKey ? [{ image_url: imageKey, is_primary: true, display_order: 0 }] : [],
            variants: variantsData.map((v, i) => ({
                sku: v.sku || `SKU-${Date.now()}-${i}`,
                size: v.size || undefined,
                color: v.color || undefined,
                price: parseFloat(v.price) || 0,
                stock_quantity: parseInt(v.stock) || 0,
                is_active: true
            }))
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
                router.push('/admin/products');
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
        <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-32">
            {/* Breadcrumb & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 sm:mb-6">
                <div>
                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-gray-500 mb-1">
                        <Link href="/admin/products" className="hover:text-gray-900 transition-colors">Products</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-blue-600 font-semibold truncate max-w-[120px] sm:max-w-none">Add Product</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Add new product</h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Main Details */}
                <div className="w-full lg:w-2/3 space-y-6">
                    
                    {/* General Information */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">General Information</h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="Enter product name..." 
                                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Description</label>
                                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
                                    <div className="flex items-center gap-1.5 p-2 border-b border-gray-100 bg-[#FCFCFD]">
                                        {['B', 'I', 'U'].map((icon) => (
                                            <button key={icon} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded font-serif font-bold text-[13px]">
                                                {icon}
                                            </button>
                                        ))}
                                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                        <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded text-[13px] font-bold">
                                            ≡
                                        </button>
                                    </div>
                                    <textarea 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        placeholder="Write something..." 
                                        rows={5} 
                                        className="w-full p-4 bg-[#F9FAFB] focus:bg-white text-[13px] font-medium text-gray-700 focus:outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">Product Images <span className="text-red-500">*</span></h2>
                        
                        <div className="relative w-full h-[180px] rounded-xl border-2 border-dashed border-gray-300 bg-[#F9FAFB] hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                                        {isUploading ? (
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        )}
                                    </div>
                                    <div className="text-[14px] font-bold text-blue-600 mb-1">Click to upload <span className="text-gray-500 font-medium">or drag and drop</span></div>
                                    <div className="text-[12px] font-medium text-gray-400">SVG, PNG, JPG or GIF (max. 10MB)</div>
                                </>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* Variations */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">Product Variations</h2>
                        
                        <div className="space-y-6">
                            {/* Variation 1 */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                <div className="flex gap-4">
                                    <div className="w-1/3">
                                        <label className="block text-[12px] font-bold text-gray-700 mb-2">Variation 1</label>
                                        <input type="text" value={variation1Name} onChange={e => setVariation1Name(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[12px] font-bold text-gray-700 mb-2">Options</label>
                                        <div className="bg-white border border-gray-200 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 items-center focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                            {variation1Options.map(opt => (
                                                <div key={opt} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded text-[13px] font-semibold text-gray-700 border border-gray-200">
                                                    {opt}
                                                    <button onClick={() => removeOption(1, opt)} className="text-gray-400 hover:text-red-500">×</button>
                                                </div>
                                            ))}
                                            <input 
                                                type="text" 
                                                value={v1Input}
                                                onChange={e => setV1Input(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addOption(1, v1Input);
                                                    }
                                                }}
                                                placeholder="Add option..." 
                                                className="flex-1 min-w-[100px] text-[13px] bg-transparent outline-none border-none p-1 placeholder-gray-400 font-medium" 
                                            />
                                        </div>
                                    </div>
                                    <button className="self-end p-2.5 text-gray-400 hover:text-red-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Variation 2 */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                <div className="flex gap-4">
                                    <div className="w-1/3">
                                        <label className="block text-[12px] font-bold text-gray-700 mb-2">Variation 2</label>
                                        <input type="text" value={variation2Name} onChange={e => setVariation2Name(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[12px] font-bold text-gray-700 mb-2">Options</label>
                                        <div className="bg-white border border-gray-200 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 items-center focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                            {variation2Options.map(opt => (
                                                <div key={opt} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded text-[13px] font-semibold text-gray-700 border border-gray-200">
                                                    {opt}
                                                    <button onClick={() => removeOption(2, opt)} className="text-gray-400 hover:text-red-500">×</button>
                                                </div>
                                            ))}
                                            <input 
                                                type="text" 
                                                value={v2Input}
                                                onChange={e => setV2Input(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addOption(2, v2Input);
                                                    }
                                                }}
                                                placeholder="Add option..." 
                                                className="flex-1 min-w-[100px] text-[13px] bg-transparent outline-none border-none p-1 placeholder-gray-400 font-medium" 
                                            />
                                        </div>
                                    </div>
                                    <button className="self-end p-2.5 text-gray-400 hover:text-red-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 border-dashed text-blue-600 rounded-lg text-[13px] font-bold hover:bg-blue-50 transition-colors w-full justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Add Variation
                            </button>

                            {/* Variations List Table */}
                            {variantsData.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[14px] font-bold text-gray-900">Variations List</h3>
                                    </div>
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left bg-white">
                                            <thead>
                                                <tr className="bg-[#F9FAFB] border-b border-gray-200 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                                    <th className="py-3 px-4 w-1/3">Variation</th>
                                                    <th className="py-3 px-4">Price <span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4">Stock <span className="text-red-500">*</span></th>
                                                    <th className="py-3 px-4">SKU <span className="text-gray-400 font-medium normal-case">(Optional)</span></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* Global Set Row */}
                                                <tr className="bg-blue-50/30">
                                                    <td className="py-2.5 px-4 text-[13px] font-bold text-blue-800">Apply to all</td>
                                                    <td className="py-2.5 px-4">
                                                        <input type="number" onChange={handleApplyAllPrice} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-[13px] font-medium focus:outline-none focus:border-blue-500" />
                                                    </td>
                                                    <td className="py-2.5 px-4">
                                                        <input type="number" onChange={handleApplyAllStock} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-[13px] font-medium focus:outline-none focus:border-blue-500" />
                                                    </td>
                                                    <td className="py-2.5 px-4"></td>
                                                </tr>
                                                {/* Individual Variants */}
                                                {variantsData.map((v, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/50">
                                                        <td className="py-3 px-4 text-[13px] font-semibold text-gray-900">{v.name}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[13px]">$</span>
                                                                <input type="number" value={v.price || ''} onChange={(e) => handleVariantChange(idx, 'price', e.target.value)} placeholder="0.00" className="w-full pl-7 pr-3 py-1.5 bg-[#F9FAFB] border border-gray-200 rounded text-[13px] font-medium focus:bg-white focus:outline-none focus:border-blue-500" />
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <input type="number" value={v.stock || ''} onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)} placeholder="0" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-gray-200 rounded text-[13px] font-medium focus:bg-white focus:outline-none focus:border-blue-500" />
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <input type="text" value={v.sku || ''} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} placeholder="e.g. SKU-123" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-gray-200 rounded text-[13px] font-medium focus:bg-white focus:outline-none focus:border-blue-500" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Secondary Settings */}
                <div className="w-full lg:w-1/3 space-y-6">
                    {/* Category Settings */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">Category Settings <span className="text-red-500">*</span></h2>
                        
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Category</label>
                            <div className="relative">
                                <select 
                                    value={categoryId} 
                                    onChange={e => setCategoryId(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                    {categories.length === 0 && (
                                        <option value="1">Baseball Hat</option>
                                    )}
                                </select>
                                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Product Attributes */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">Product Attributes</h2>
                        
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Brand</label>
                            <input 
                                type="text" 
                                value={brand} 
                                onChange={e => setBrand(e.target.value)} 
                                placeholder="e.g. Vintage Apparel" 
                                className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Form Actions (Sticky Desktop / Native Flow) */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] lg:ml-[260px]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex justify-end">
                    <div className="py-3 sm:py-4 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => router.push('/admin/products')} 
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-[12px] sm:text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm min-w-[100px]"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 bg-[#2563EB] text-white rounded-xl text-[12px] sm:text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 min-w-[140px]"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Product'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
