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
    const [collectionId, setCollectionId] = useState('');
    const [status, setStatus] = useState('Draft');
    const [weight, setWeight] = useState('');
    
    // Custom Dropdown States
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isCollectionOpen, setIsCollectionOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as Element).closest('.custom-select')) {
                setIsStatusOpen(false);
                setIsCategoryOpen(false);
                setIsCollectionOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Multiple Images
    const [images, setImages] = useState<{url: string, key: string, is_primary: boolean, color?: string}[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageColor, setSelectedImageColor] = useState<string | null>(null);

    // Variations (Strictly Size and Color as per BE)
    const [sizeOptions, setSizeOptions] = useState<string[]>(['S', 'M', 'L']);
    const [sizeInput, setSizeInput] = useState('');
    const [colorOptions, setColorOptions] = useState<string[]>(['Black', 'White']);
    const [colorInput, setColorInput] = useState('');

    const [variantsData, setVariantsData] = useState<any[]>([]);
    
    // Meta Data States
    const [categories, setCategories] = useState<any[]>([
        { id: 1, name: 'Baseball Hat' },
        { id: 2, name: 'Bucket Hat' },
        { id: 3, name: 'Sun Protection Hat' },
        { id: 4, name: 'Flat Cap' },
        { id: 5, name: 'Others' }
    ]);
    const [collections, setCollections] = useState<any[]>([{ id: 1, name: 'Summer Collection' }, { id: 2, name: 'Winter Collection' }, { id: 3, name: 'Limited Edition' }]);

    useEffect(() => {
        fetch("http://localhost:8000/categories")
            .then(res => res.json())
            .then(data => { if (data.categories?.length > 0) setCategories(data.categories); })
            .catch(console.error);
    }, []);

    // Generate variants combination when options change
    useEffect(() => {
        const generated: any[] = [];
        if (sizeOptions.length > 0 && colorOptions.length > 0) {
            sizeOptions.forEach(size => {
                colorOptions.forEach(color => {
                    generated.push({ name: `${size} - ${color}`, size, color, price: '', stock: '', sku: '', color_hex: '#000000', image_url: '', image_preview: '', is_active: true });
                });
            });
        } else if (sizeOptions.length > 0) {
            sizeOptions.forEach(size => {
                generated.push({ name: size, size, color: '', price: '', stock: '', sku: '', color_hex: '', image_url: '', image_preview: '', is_active: true });
            });
        } else if (colorOptions.length > 0) {
            colorOptions.forEach(color => {
                generated.push({ name: color, size: '', color, price: '', stock: '', sku: '', color_hex: '#000000', image_url: '', image_preview: '', is_active: true });
            });
        } else {
            generated.push({ name: 'Default', size: '', color: '', price: '', stock: '', sku: '', color_hex: '', image_url: '', image_preview: '', is_active: true });
        }
        
        setVariantsData(prev => {
            return generated.map(g => {
                const existing = prev.find(p => p.name === g.name);
                return existing ? existing : g;
            });
        });
    }, [sizeOptions, colorOptions]);

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');
        const token = localStorage.getItem('admin_token');
        const res = await fetch("http://localhost:8000/files/upload", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        return await res.json();
    };

    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        
        const remaining = 10 - images.length;
        if (remaining <= 0) {
            alert("Maximum 10 images reached.");
            return;
        }

        const filesToUpload = files.slice(0, remaining);
        if (files.length > remaining) {
            alert(`Only the first ${remaining} images were selected for upload (Total limit is 10).`);
        }

        setIsUploading(true);
        try {
            for (const file of filesToUpload) {
                const data = await handleFileUpload(file);
                setImages(prev => {
                    const newImages = [...prev, { url: data.url, key: data.key, is_primary: prev.length === 0, color: selectedImageColor || undefined }];
                    return newImages.slice(0, 10); // Final safety clamp
                });
            }
        } catch(error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input to allow re-uploading same file
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        const wasPrimary = newImages[index].is_primary;
        newImages.splice(index, 1);
        if (wasPrimary && newImages.length > 0) newImages[0].is_primary = true;
        setImages(newImages);
    };

    const setPrimaryImage = (index: number) => {
        setImages(images.map((img, i) => ({ ...img, is_primary: i === index })));
    };

    const [variationError, setVariationError] = useState<{type: 'size' | 'color', message: string} | null>(null);

    const addOption = (type: 'size' | 'color', value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            setVariationError({ type, message: `Please enter a ${type} value` });
            return;
        }

        if (type === 'size') {
            if (sizeOptions.includes(trimmed)) {
                setVariationError({ type, message: `Size "${trimmed}" already exists` });
                return;
            }
            setSizeOptions([...sizeOptions, trimmed]);
            setSizeInput('');
        } else {
            if (colorOptions.includes(trimmed)) {
                setVariationError({ type, message: `Color "${trimmed}" already exists` });
                return;
            }
            setColorOptions([...colorOptions, trimmed]);
            setColorInput('');
        }
        setVariationError(null);
    };

    const removeOption = (type: 'size' | 'color', value: string) => {
        if (type === 'size') setSizeOptions(sizeOptions.filter(o => o !== value));
        else setColorOptions(colorOptions.filter(o => o !== value));
    };

    const handleVariantChange = (idx: number, field: string, value: any) => {
        const newVariants = [...variantsData];
        newVariants[idx][field] = value;
        setVariantsData(newVariants);
    };

    const handleVariantImgChange = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const data = await handleFileUpload(file);
            handleVariantChange(idx, 'image_url', data.key);
            handleVariantChange(idx, 'image_preview', data.url);
        } catch(error) {
            alert("Variant image upload failed");
        }
    };

    const handleApplyAllPrice = (e: any) => setVariantsData(variantsData.map(v => ({ ...v, price: e.target.value })));
    const handleApplyAllStock = (e: any) => setVariantsData(variantsData.map(v => ({ ...v, stock: e.target.value })));

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const newErrors: any = {};
        
        // === Business Rule Validation (synced with backend Zod schema) ===
        if (!name.trim()) newErrors.name = "Product name is required";
        else if (name.trim().length < 10) newErrors.name = "Product name must be at least 10 characters";
        
        if (images.length === 0) newErrors.images = "At least one product image is required";
        else if (images.filter(img => img.is_primary).length === 0) newErrors.images = "A primary image is required";

        // Weight is required
        const parsedWeight = parseFloat(weight);
        if (!weight || isNaN(parsedWeight) || parsedWeight <= 0) {
            newErrors.weight = "Product weight (g) is required and must be greater than 0";
        }

        // Variants: must have ≥1, each must have size + color
        if (variantsData.length === 0) {
            newErrors.variantsGlobal = "At least 1 variant (size + color) is required";
        }

        let hasVariantErrors = false;
        newErrors.variants = {};
        const sizeColorCombos = new Set<string>();
        
        for (let i = 0; i < variantsData.length; i++) {
            const v = variantsData[i];
            if (!v.is_active) continue;
            
            // Size required
            if (!v.size || !v.size.trim()) {
                newErrors.variants[i] = { ...newErrors.variants[i], size: "Size is required" };
                hasVariantErrors = true;
            }
            // Color required
            if (!v.color || !v.color.trim()) {
                newErrors.variants[i] = { ...newErrors.variants[i], color: "Color is required" };
                hasVariantErrors = true;
            }
            // Duplicate (size, color) check
            if (v.size && v.color) {
                const combo = `${v.size.trim()}||${v.color.trim()}`;
                if (sizeColorCombos.has(combo)) {
                    newErrors.variants[i] = { ...newErrors.variants[i], color: "Duplicate (size, color) combination" };
                    hasVariantErrors = true;
                }
                sizeColorCombos.add(combo);
            }
            // Stock validation
            const stockNum = parseInt(v.stock);
            if (isNaN(stockNum) || stockNum < 0) {
                newErrors.variants[i] = { ...newErrors.variants[i], stock: "Stock must be ≥ 0" };
                hasVariantErrors = true;
            }
        }

        // Base price validation (product-level, from first variant)
        const basePriceNum = parseFloat(variantsData[0]?.price || '0');
        if (isNaN(basePriceNum) || basePriceNum <= 0) {
            newErrors.variants[0] = { ...newErrors.variants[0], price: "Price must be greater than 0" };
            hasVariantErrors = true;
        }

        setErrors(newErrors);

        if (newErrors.name || newErrors.images || newErrors.weight || newErrors.variantsGlobal || hasVariantErrors) {
            setErrors({ ...newErrors, global: "Please fix all validation errors before saving." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('admin_token');

        // Auto-generate SKU: PRODUCT_CODE-SIZE-COLOR
        const productCode = name.trim().substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
            + Math.floor(Math.random() * 100).toString().padStart(2, '0');
        
        const payload = {
            name: name.trim(),
            description: description || undefined,
            category_id: parseInt(categoryId) || categories[0]?.id || 1,
            collection_id: collectionId ? parseInt(collectionId) : undefined,
            base_price: basePriceNum,
            weight: parsedWeight,
            status,
            images: images.map((img, idx) => ({ 
                image_url: img.key, 
                is_primary: img.is_primary, 
                display_order: idx, 
                color: img.color || undefined 
            })),
            variants: variantsData.filter(v => v.is_active).map((v, i) => ({
                sku: v.sku && v.sku.trim() ? v.sku.trim() : `${productCode}-${v.size.trim().toUpperCase()}-${v.color.trim().toUpperCase()}`,
                size: v.size.trim(),
                color: v.color.trim(),
                color_hex: v.color ? v.color_hex : undefined,
                price: basePriceNum, // Single price model
                stock_quantity: parseInt(v.stock) || 0,
                image_url: v.image_url || undefined,
                is_active: true
            }))
        };

        try {
            const res = await fetch("http://localhost:8000/products", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                const err = await res.json();
                const detail = err.errors 
                    ? '\n' + err.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n') 
                    : '';
                setErrors({ ...newErrors, global: `Error: ${err.message || 'Validation failed'}${detail}` });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error(error);
            setErrors({ ...newErrors, global: "Failed to create product. Check network connection." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-32">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 sm:mb-6">
                <div>
                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-gray-500 mb-1">
                        <Link href="/admin/products" className="hover:text-gray-900 transition-colors">Products</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-blue-600 font-semibold">Add Product</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Add new product</h1>
                </div>
            </div>

            {/* Global Error Message */}
            {errors.global && (
                <div className="animate-in slide-in-from-top-4 duration-300 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    </div>
                    <p className="text-[13px] font-bold text-red-900">{errors.global}</p>
                    <button onClick={() => setErrors({...errors, global: null})} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Main Details */}
                <div className="w-full lg:w-2/3 space-y-6">
                    
                    {/* General Information */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">General Information</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                                <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors({...errors, name: undefined, global: undefined}); }} placeholder="Enter product name..." className={`w-full px-4 py-2.5 bg-[#F9FAFB] border ${errors.name ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500'} rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1`} />
                                {errors.name && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write something..." rows={5} className="w-full p-4 bg-[#F9FAFB] border border-gray-200 rounded-lg focus:bg-white text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Product Images (Multiple) */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-[16px] font-bold text-gray-900">Product Images <span className="text-red-500">*</span></h2>
                            <span className={`text-[12px] font-bold ${images.length >= 10 ? 'text-orange-600' : 'text-gray-400'}`}>
                                {images.length} / 10
                            </span>
                        </div>
                        {errors.images && <p className="text-red-500 text-[12px] font-bold mb-4">{errors.images}</p>}
                        
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100">
                            <button
                                onClick={() => setSelectedImageColor(null)}
                                className={`px-4 py-2 rounded-t-lg text-[13px] font-bold transition-all border-b-2 ${selectedImageColor === null ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                General Images
                            </button>
                            {colorOptions.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedImageColor(color)}
                                    className={`px-4 py-2 rounded-t-lg text-[13px] font-bold transition-all border-b-2 ${selectedImageColor === color ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            {images.map((img, idx) => {
                                const isMatch = selectedImageColor === null ? !img.color : img.color === selectedImageColor;
                                if (!isMatch) return null;

                                return (
                                    <div key={idx} className={`relative w-full aspect-square rounded-xl border-2 ${img.is_primary ? 'border-blue-500' : 'border-gray-200'} overflow-hidden group`}>
                                        <Image src={img.url} alt="Product" fill className="object-cover" unoptimized/>
                                        
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none">
                                            <div className="pointer-events-auto flex flex-col gap-2">
                                                {!img.is_primary && (
                                                    <button onClick={() => setPrimaryImage(idx)} className="text-[11px] font-bold text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700">Set Primary</button>
                                                )}
                                                <button onClick={() => removeImage(idx)} className="text-[11px] font-bold text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700">Remove</button>
                                            </div>
                                        </div>
                                        {img.is_primary && (
                                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none">Primary</div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {images.length < 10 && (
                                <div className="relative w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-[#F9FAFB] hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                                    {isUploading ? (
                                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                            <div className="text-[12px] font-bold text-gray-500">Add Images</div>
                                        </>
                                    )}
                                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png, image/jpeg, image/webp" onChange={handleMainImageChange} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Variations (Restricted to Size and Color) */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-[16px] font-bold text-gray-900">Product Variations</h2>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Size Options */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                <div className="flex gap-4">
                                    <div className="w-1/4 pt-2">
                                        <label className="block text-[13px] font-bold text-gray-900">Size Options</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white border border-gray-200 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 items-center focus-within:border-blue-500">
                                            {sizeOptions.map(opt => (
                                                <div key={opt} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded text-[13px] font-semibold text-gray-700 border border-gray-200">
                                                    {opt}
                                                    <button onClick={() => removeOption('size', opt)} className="text-gray-400 hover:text-red-500">×</button>
                                                </div>
                                            ))}
                                            <input 
                                                type="text" 
                                                value={sizeInput} 
                                                onChange={e => { setSizeInput(e.target.value); if(variationError?.type === 'size') setVariationError(null); }} 
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption('size', sizeInput); } }} 
                                                placeholder="Add size (e.g. L, XL)..." 
                                                className="flex-1 min-w-[120px] text-[13px] bg-transparent outline-none p-1 placeholder-gray-400 font-medium" 
                                            />
                                        </div>
                                        {variationError?.type === 'size' && (
                                            <p className="text-red-500 text-[11px] font-bold mt-2">{variationError.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Color Options */}
                            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                <div className="flex gap-4">
                                    <div className="w-1/4 pt-2">
                                        <label className="block text-[13px] font-bold text-gray-900">Color Options</label>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white border border-gray-200 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-2 items-center focus-within:border-blue-500">
                                            {colorOptions.map(opt => (
                                                <div key={opt} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded text-[13px] font-semibold text-gray-700 border border-gray-200">
                                                    {opt}
                                                    <button onClick={() => removeOption('color', opt)} className="text-gray-400 hover:text-red-500">×</button>
                                                </div>
                                            ))}
                                            <input 
                                                type="text" 
                                                value={colorInput} 
                                                onChange={e => { setColorInput(e.target.value); if(variationError?.type === 'color') setVariationError(null); }} 
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption('color', colorInput); } }} 
                                                placeholder="Add color (e.g. Red, Blue)..." 
                                                className="flex-1 min-w-[120px] text-[13px] bg-transparent outline-none p-1 placeholder-gray-400 font-medium" 
                                            />
                                        </div>
                                        {variationError?.type === 'color' && (
                                            <p className="text-red-500 text-[11px] font-bold mt-2">{variationError.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Variations List Table */}
                            {variantsData.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-[14px] font-bold text-gray-900 mb-3">Configure Variations</h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                        <table className="w-full text-left bg-white table-fixed">
                                            <thead>
                                                <tr className="bg-[#F9FAFB] border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                    <th className="py-3 px-2 w-[16%]">Variant</th>
                                                    <th className="py-3 px-2 w-[8%] text-center">Image</th>
                                                    <th className="py-3 px-2 w-[18%]">Color Hex</th>
                                                    <th className="py-3 px-2 w-[16%]">Price ($)*</th>
                                                    <th className="py-3 px-2 w-[14%]">Stock*</th>
                                                    <th className="py-3 px-2 w-[18%]">SKU</th>
                                                    <th className="py-3 px-2 w-[10%] text-center">Active</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* Global Fill */}
                                                <tr className="bg-blue-50/50 border-b border-blue-100">
                                                    <td colSpan={3} className="py-2.5 px-2 text-[12px] font-bold text-blue-800 text-right pe-4">Quick apply:</td>
                                                    <td className="py-2.5 px-2"><input type="number" onChange={handleApplyAllPrice} placeholder="Price" className="w-full px-2 py-1.5 bg-white border border-blue-200 rounded text-[13px] font-medium focus:outline-none" /></td>
                                                    <td className="py-2.5 px-2"><input type="number" onChange={handleApplyAllStock} placeholder="Stock" className="w-full px-2 py-1.5 bg-white border border-blue-200 rounded text-[13px] font-medium focus:outline-none" /></td>
                                                    <td colSpan={2}></td>
                                                </tr>
                                                {/* Variants */}
                                                {variantsData.map((v, idx) => (
                                                    <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${!v.is_active ? 'opacity-50 grayscale' : ''}`}>
                                                        <td className="py-3 px-2 text-[12px] font-bold text-gray-900 truncate" title={v.name}>{v.name}</td>
                                                        <td className="py-3 px-2">
                                                            <div className="w-9 h-9 rounded border border-gray-200 bg-gray-50 relative overflow-hidden flex items-center justify-center cursor-pointer mx-auto">
                                                                {v.image_preview ? (
                                                                    <Image src={v.image_preview} alt="V" fill className="object-cover" unoptimized/>
                                                                ) : (
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                                )}
                                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleVariantImgChange(idx, e)} />
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <input type="color" value={v.color_hex || '#000000'} onChange={(e) => handleVariantChange(idx, 'color_hex', e.target.value)} disabled={!v.color} className={`w-5 h-5 rounded cursor-pointer ${!v.color ? 'opacity-30' : ''}`} />
                                                                <span className="text-[10px] sm:text-[11px] font-mono text-gray-500 uppercase truncate">{v.color ? v.color_hex : 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2 align-top">
                                                            <input type="number" min="0" step="0.01" value={v.price} onChange={(e) => { handleVariantChange(idx, 'price', e.target.value); if(errors.variants?.[idx]?.price){ const nv = {...errors.variants}; delete nv[idx]?.price; setErrors({...errors, variants: nv, global: undefined}); } }} disabled={!v.is_active} placeholder="0.00" className={`w-full px-2 py-1.5 bg-[#F9FAFB] border ${errors.variants?.[idx]?.price ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500'} rounded text-[13px] font-medium focus:bg-white focus:outline-none disabled:bg-gray-100 min-w-[60px]`} />
                                                            {errors.variants?.[idx]?.price && (
                                                                <p className="text-red-500 text-[10px] font-bold mt-1 leading-tight">{errors.variants[idx].price}</p>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-2 align-top">
                                                            <input type="number" min="0" value={v.stock} onChange={(e) => { handleVariantChange(idx, 'stock', e.target.value); if(errors.variants?.[idx]?.stock){ const nv = {...errors.variants}; delete nv[idx]?.stock; setErrors({...errors, variants: nv, global: undefined}); } }} disabled={!v.is_active} placeholder="0" className={`w-full px-2 py-1.5 bg-[#F9FAFB] border ${errors.variants?.[idx]?.stock ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500'} rounded text-[13px] font-medium focus:bg-white focus:outline-none disabled:bg-gray-100 min-w-[50px]`} />
                                                            {errors.variants?.[idx]?.stock && (
                                                                <p className="text-red-500 text-[10px] font-bold mt-1 leading-tight">{errors.variants[idx].stock}</p>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <input type="text" value={v.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} disabled={!v.is_active} placeholder="SKU-..." className="w-full px-2 py-1.5 bg-[#F9FAFB] border border-gray-200 rounded text-[13px] font-medium focus:bg-white focus:outline-none focus:border-blue-500 disabled:bg-gray-100 min-w-[70px]" />
                                                        </td>
                                                        <td className="py-3 px-2 text-center">
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" checked={v.is_active} onChange={(e) => handleVariantChange(idx, 'is_active', e.target.checked)} className="sr-only peer" />
                                                                <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                                            </label>
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
                    {/* Status & Visibility */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">Status & Visibility</h2>
                        <div>
                            <div className="relative custom-select">
                                <button 
                                    onClick={() => { setIsStatusOpen(!isStatusOpen); setIsCategoryOpen(false); setIsCollectionOpen(false); }}
                                    className={`flex items-center justify-between w-full px-4 py-2.5 bg-[#F9FAFB] border ${isStatusOpen ? 'border-blue-500 ring-1 ring-blue-500 bg-white' : 'border-gray-200'} rounded-lg text-[13px] font-bold text-gray-900 transition-all`}
                                >
                                    <span>
                                        {status === 'Draft' ? 'Draft' : status === 'Active' ? 'Active' : 'Archived'}
                                    </span>
                                    <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isStatusOpen && (
                                    <div className="absolute z-40 top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                                        {[
                                            { val: 'Draft', label: 'Draft' },
                                            { val: 'Active', label: 'Active' },
                                            { val: 'Archived', label: 'Archived' }
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                onClick={() => { setStatus(opt.val); setIsStatusOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between transition-colors ${status === opt.val ? 'bg-blue-50/80 text-blue-900 font-bold' : 'text-gray-700 font-medium hover:bg-gray-50'}`}
                                            >
                                                {opt.label}
                                                {status === opt.val && <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">Organization</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                                <div className="relative custom-select">
                                    <button 
                                        onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsStatusOpen(false); setIsCollectionOpen(false); }}
                                        className={`flex items-center justify-between w-full px-4 py-2.5 bg-[#F9FAFB] border ${isCategoryOpen ? 'border-blue-500 ring-1 ring-blue-500 bg-white' : 'border-gray-200'} rounded-lg text-[13px] font-medium text-gray-900 transition-all`}
                                    >
                                        <span className={!categoryId ? 'text-gray-400' : ''}>
                                            {categoryId ? categories.find(c => c.id.toString() === categoryId)?.name || 'Select category' : 'Select category'}
                                        </span>
                                        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {isCategoryOpen && (
                                        <div className="absolute z-40 top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => { setCategoryId(cat.id.toString()); setIsCategoryOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between transition-colors ${categoryId === cat.id.toString() ? 'bg-blue-50/80 text-blue-900 font-bold' : 'text-gray-700 font-medium hover:bg-gray-50'}`}
                                                >
                                                    {cat.name}
                                                    {categoryId === cat.id.toString() && <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-2">Collection</label>
                                <div className="relative custom-select">
                                    <button 
                                        onClick={() => { setIsCollectionOpen(!isCollectionOpen); setIsStatusOpen(false); setIsCategoryOpen(false); }}
                                        className={`flex items-center justify-between w-full px-4 py-2.5 bg-[#F9FAFB] border ${isCollectionOpen ? 'border-blue-500 ring-1 ring-blue-500 bg-white' : 'border-gray-200'} rounded-lg text-[13px] font-medium text-gray-900 transition-all`}
                                    >
                                        <span className={!collectionId ? 'text-gray-400' : ''}>
                                            {collectionId ? collections.find(c => c.id.toString() === collectionId)?.name || 'No Collection' : 'No Collection'}
                                        </span>
                                        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCollectionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {isCollectionOpen && (
                                        <div className="absolute z-40 top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                                            <button
                                                onClick={() => { setCollectionId(''); setIsCollectionOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between transition-colors ${!collectionId ? 'bg-blue-50/80 text-blue-900 font-bold' : 'text-gray-700 font-medium hover:bg-gray-50'}`}
                                            >
                                                No Collection
                                                {!collectionId && <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                            </button>
                                            {collections.map(col => (
                                                <button
                                                    key={col.id}
                                                    onClick={() => { setCollectionId(col.id.toString()); setIsCollectionOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between transition-colors ${collectionId === col.id.toString() ? 'bg-blue-50/80 text-blue-900 font-bold' : 'text-gray-700 font-medium hover:bg-gray-50'}`}
                                                >
                                                    {col.name}
                                                    {collectionId === col.id.toString() && <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                        <h2 className="text-[16px] font-bold text-gray-900 mb-5">Specifications</h2>
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Weight <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type="number" min="0" step="0.01" value={weight} onChange={e => { setWeight(e.target.value); setErrors({...errors, weight: undefined, global: undefined}); }} placeholder="e.g. 150" className={`w-full pl-4 pr-10 py-2.5 bg-[#F9FAFB] border ${errors.weight ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg text-[13px] font-medium focus:bg-white focus:outline-none focus:border-blue-500`} />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-400 pointer-events-none">g</span>
                            </div>
                            {errors.weight && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.weight}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] lg:ml-[260px]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex justify-end">
                    <div className="py-3 sm:py-4 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button onClick={() => router.push('/admin/products')} className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-[12px] sm:text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 bg-[#2563EB] text-white rounded-xl text-[12px] sm:text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
