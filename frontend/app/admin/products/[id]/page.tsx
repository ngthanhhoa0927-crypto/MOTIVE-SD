"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    
    // View/Edit Mode Toggle
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [brand, setBrand] = useState('Vintage Apparel');
    const [status, setStatus] = useState('Active');
    
    // Specification States
    const [material, setMaterial] = useState('80% Wool, 20% Polyester');
    const [sizeInfo, setSizeInfo] = useState('One Size Adjustable');
    const [weight, setWeight] = useState('120');
    const [care, setCare] = useState('Dry clean only');

    // Shipping States
    const [packageWeight, setPackageWeight] = useState('200');
    const [shippingClass, setShippingClass] = useState('Fragile / Standard Express');
    const [packageDimensions, setPackageDimensions] = useState('250 × 150 × 100 mm');
    const [leadTime, setLeadTime] = useState('2-3 Business Days');
    
    // Original Product Data for View Mode
    const [product, setProduct] = useState<any>(null);

    // Images
    const [images, setImages] = useState<{url: string, key: string, is_primary: boolean, color?: string}[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageColor, setSelectedImageColor] = useState<string | null>(null);

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
        // Fetch categories
        fetch("http://localhost:8000/categories")
            .then(res => res.json())
            .then(data => {
                if (data.categories && data.categories.length > 0) {
                    setCategories(data.categories);
                }
            })
            .catch(err => console.error(err));

        const loadProductData = (p: any) => {
            setProduct(p);
            setName(p.name || '');
            setDescription(p.description || '');
            setCategoryId(p.category_id ? p.category_id.toString() : '');
            setStatus(p.status || 'Active');
            setBrand(p.brand || 'Vintage Apparel');
            setMaterial(p.material || '80% Wool, 20% Polyester');
            setSizeInfo(p.size_info || 'One Size Adjustable');
            setWeight(p.weight ? p.weight.toString().replace(/g/gi, '').trim() : '120');
            setCare(p.care || 'Dry clean only');
            setPackageWeight(p.package_weight ? p.package_weight.toString().replace(/g/gi, '').trim() : '200');
            setShippingClass(p.shipping_class || 'Fragile / Standard Express');
            setPackageDimensions(p.package_dimensions || '250 × 150 × 100 mm');
            setLeadTime(p.lead_time || '2-3 Business Days');
            
            // Set Images
            if (p.images && p.images.length > 0) {
                setImages(p.images.map((img: any) => ({
                    url: img.signed_url || img.image_url,
                    key: img.image_url,
                    is_primary: img.is_primary,
                    color: img.color
                })));
            }

            // Set Variants Data
            if (p.variants && p.variants.length > 0) {
                setVariantsData(p.variants.map((v: any) => ({
                    name: v.sku?.split('-').pop() || 'Variant',
                    size: v.size || '',
                    color: v.color || '',
                    price: v.price || '',
                    stock: v.stock_quantity || 0,
                    sku: v.sku || ''
                })));
                setVariation1Options([]);
                setVariation2Options([]);
            }
        };

        if (params.id) {
            setIsLoading(true);
            const token = localStorage.getItem('admin_token');
            fetch(`http://localhost:8000/products/${params.id}`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    if (data.product) {
                        loadProductData(data.product);
                    } else {
                        alert("Product not found");
                        router.push('/admin/products');
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert("Error fetching product");
                    router.push('/admin/products');
                })
                .finally(() => setIsLoading(false));
        }
    }, [params.id, router]);

    // Generate variants combination when options change
    useEffect(() => {
        const generateCombos = () => {
            // Prevent auto-generation from wiping out fetched variant data on initial load
            if (variation1Options.length === 0 && variation2Options.length === 0) return;

            const v1IsSize = variation1Name.toLowerCase() === 'size';
            const v2IsSize = variation2Name.toLowerCase() === 'size';
            const v1IsColor = variation1Name.toLowerCase() === 'color';
            const v2IsColor = variation2Name.toLowerCase() === 'color';

            const generated: any[] = [];
            if (variation1Options.length > 0 && variation2Options.length > 0) {
                variation1Options.forEach(v1 => {
                    variation2Options.forEach(v2 => {
                        generated.push({ name: `${v1} - ${v2}`, size: v1IsSize ? v1 : (v2IsSize ? v2 : v1), color: v1IsColor ? v1 : (v2IsColor ? v2 : v2), price: 0, stock: 0, sku: '' });
                    });
                });
            } else if (variation1Options.length > 0) {
                variation1Options.forEach(v1 => {
                    generated.push({ name: v1, size: v1IsSize || !v1IsColor ? v1 : '', color: v1IsColor ? v1 : '', price: 0, stock: 0, sku: '' });
                });
            } else if (variation2Options.length > 0) {
                variation2Options.forEach(v2 => {
                    generated.push({ name: v2, size: v2IsSize ? v2 : '', color: v2IsColor || !v2IsSize ? v2 : '', price: 0, stock: 0, sku: '' });
                });
            } else {
                generated.push({ name: 'Default', size: '', color: '', price: 0, stock: 0, sku: '' });
            }
            return generated;
        };
        
        const generated = generateCombos();
        if (generated) {
            setVariantsData(prev => {
                return generated.map(g => {
                    const existing = prev.find(p => p.name === g.name);
                    return existing ? existing : g;
                });
            });
        }
    }, [variation1Options, variation2Options, variation1Name, variation2Name]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const token = localStorage.getItem('admin_token');
            for (const file of filesToUpload) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'products');
                
                const res = await fetch("http://localhost:8000/files/upload", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    setImages(prev => {
                        const newImages = [...prev, { url: data.url, key: data.key, is_primary: prev.length === 0, color: selectedImageColor || undefined }];
                        return newImages.slice(0, 10);
                    });
                } else {
                    alert(`Failed to upload ${file.name}`);
                }
            }
        } catch(error) {
            console.error(error);
            alert("Upload process encountered an error");
        } finally {
            setIsUploading(false);
            e.target.value = '';
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

    const [variationError, setVariationError] = useState<{type: 1 | 2, message: string} | null>(null);

    const addOption = (type: 1 | 2, value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            setVariationError({ type, message: 'Please enter a value' });
            return;
        }

        if (type === 1) {
            if (variation1Options.includes(trimmed)) {
                setVariationError({ type, message: `Option "${trimmed}" already exists` });
                return;
            }
            setVariation1Options([...variation1Options, trimmed]);
            setV1Input('');
        } else {
            if (variation2Options.includes(trimmed)) {
                setVariationError({ type, message: `Option "${trimmed}" already exists` });
                return;
            }
            setVariation2Options([...variation2Options, trimmed]);
            setV2Input('');
        }
        setVariationError(null);
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

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const newErrors: any = {};
        
        if (!name.trim()) newErrors.name = "Product name is required";
        if (images.length === 0) newErrors.images = "At least one product image is required";
        else if (images.filter(img => img.is_primary).length === 0) newErrors.images = "A primary image is required";

        let hasVariantErrors = false;
        newErrors.variants = {};
        for (let i = 0; i < variantsData.length; i++) {
            const v = variantsData[i];
            if (v.is_active) {
                const priceNum = parseFloat(v.price);
                const stockNum = parseInt(v.stock);
                if (isNaN(priceNum) || priceNum <= 0) {
                    newErrors.variants[i] = { ...newErrors.variants[i], price: "Price must be greater than 0." };
                    hasVariantErrors = true;
                }
                if (isNaN(stockNum) || stockNum < 0) {
                    newErrors.variants[i] = { ...newErrors.variants[i], stock: "Stock quantity must be a positive integer." };
                    hasVariantErrors = true;
                }
            }
        }

        setErrors(newErrors);

        if (newErrors.name || newErrors.images || hasVariantErrors) {
            setErrors({ ...newErrors, global: "Please fill in the missing fields and resolve validation errors." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('admin_token');

        const primaryPrice = variantsData.length > 0 ? parseFloat(variantsData[0].price) || 0 : 0;
        
        const payload = {
            name,
            description: description || undefined,
            category_id: parseInt(categoryId) || (categories.length > 0 ? categories[0].id : 1),
            base_price: primaryPrice,
            status,
            brand,
            material,
            size_info: sizeInfo,
            weight,
            care,
            package_weight: packageWeight,
            shipping_class: shippingClass,
            package_dimensions: packageDimensions,
            lead_time: leadTime,
            images: images.map((img, idx) => ({ image_url: img.key, is_primary: img.is_primary, display_order: idx, color: img.color })),
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
            const res = await fetch(`http://localhost:8000/products/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Return to view mode
                const updatedResponse = await res.json();
                setProduct({
                    ...product,
                    ...updatedResponse.product,
                    sale: product.sale,
                    revenue: product.revenue
                });
                setIsEditing(false);
            } else {
                if (res.status === 409) {
                    setErrors({ ...newErrors, global: "Product ID already exists." });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    const err = await res.json();
                    setErrors({ ...newErrors, global: `Error: ${err.message || 'Validation failed'}` });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        } catch (error) {
            console.error(error);
            setErrors({ ...newErrors, global: "Failed to update product" });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !product) {
        return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading product details...</div>;
    }

    const categoryName = categories.find(c => c.id.toString() === categoryId)?.name || 'Baseball Hat';
    const totalStock = variantsData.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0) || 0;

    return (
        <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-32">
            
            {/* Breadcrumb & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 sm:mb-6">
                <div>
                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-gray-500 mb-1">
                        <Link href="/admin/products" className="hover:text-gray-900 transition-colors">Products</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-blue-600 font-semibold truncate max-w-[120px] sm:max-w-none">{isEditing ? 'Edit' : name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{isEditing ? 'Edit Product' : name}</h1>
                        {!isEditing && (
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1.5 ${status === 'Active' ? 'bg-[#ECFDF5] text-[#10B981]' : status === 'Draft' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-[#10B981]' : status === 'Draft' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                                {status.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* VIEW MODE */}
            {!isEditing && (
                <div className="space-y-6 pb-24 max-w-[1000px]">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-8">
                            <svg className="w-[18px] h-[18px] text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h2 className="text-[17px] font-bold text-gray-900">Basic Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12 min-h-[100px]">
                            <div className="space-y-8 flex flex-col justify-between">
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Product Name</div>
                                    <div className="text-[15px] font-bold text-gray-900">{name}</div>
                                </div>
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Price</div>
                                    <div className="text-[15px] font-bold text-gray-900">$ {parseFloat(variantsData[0]?.price || "19.00").toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                            <div className="space-y-8 flex flex-col justify-between">
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Category</div>
                                    <div className="text-[15px] font-bold text-gray-900">{categoryName}</div>
                                </div>
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Status</div>
                                    <span className="inline-flex items-center px-3 py-1 rounded bg-[#E8F8F0] text-[#10B981] text-[12px] font-bold">
                                        {status === 'Active' ? 'Published' : status}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-8 flex flex-col justify-start">
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Stock Quantity</div>
                                    <div className="text-[15px] font-bold text-gray-900">{totalStock}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <svg className="w-[18px] h-[18px] text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <h2 className="text-[17px] font-bold text-gray-900">Product Images</h2>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {product.images?.length > 0 ? (
                                product.images.map((img: any, idx: number) => (
                                    <div key={idx} className="w-[160px] h-[160px] rounded-xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative flex items-center justify-center p-2">
                                        <Image src={img.signed_url || img.image_url} alt="Product" className="object-cover rounded-lg w-[140px] h-[140px]" width={140} height={140} unoptimized/>
                                    </div>
                                ))
                            ) : (
                                <div className="w-[160px] h-[160px] rounded-[14px] border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative flex items-center justify-center bg-[#FAFAFB]">
                                    <Image src="/images/image-placeholder.png" alt="No Image" width={60} height={60} unoptimized/>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-[18px] h-[18px] text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <h2 className="text-[17px] font-bold text-gray-900">Product Description</h2>
                        </div>
                        <p className="text-[15px] text-[#334155] font-medium leading-[1.7] tracking-wider mt-4">
                            {description || "No description provided."}
                        </p>
                    </div>

                    {/* Specifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <svg className="w-[18px] h-[18px] text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            <h2 className="text-[17px] font-bold text-gray-900">Specifications</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 mt-4">
                            {/* Col 1 */}
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center py-5 border-b border-gray-50">
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Material</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.material || "80% Wool, 20% Polyester"}</span>
                                </div>
                                <div className="flex justify-between items-center py-5">
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Size</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.size_info || "One Size Adjustable"}</span>
                                </div>
                            </div>
                            
                            {/* Col 2 */}
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center py-5 border-b border-gray-50 border-t border-gray-50 md:border-t-0">
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Weight</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.weight ? `${product.weight.toString().replace(/g/gi, '').trim()}g` : "120g"}</span>
                                </div>
                                <div className="flex justify-between items-center py-5">
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Care Instruction</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.care || "Dry clean only"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Logistics */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-8">
                            <svg className="w-[18px] h-[18px] text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14H5a2 2 0 00-2 2v2h2m10-4h3a2 2 0 012 2v2h-2m-8-4v-4a2 2 0 012-2h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V14M8 14a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" /></svg>
                            <h2 className="text-[17px] font-bold text-gray-900">Shipping & Logistics</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div className="space-y-8 flex flex-col justify-between">
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Package Weight</div>
                                    <div className="text-[15px] font-bold text-gray-900">{product.package_weight ? `${product.package_weight.toString().replace(/g/gi, '').trim()}g` : "200g"}</div>
                                </div>
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Shipping Class</div>
                                    <div className="text-[15px] font-bold text-gray-900">{product.shipping_class || "Fragile / Standard Express"}</div>
                                </div>
                            </div>
                            <div className="space-y-8 flex flex-col justify-between">
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Package Dimensions</div>
                                    <div className="text-[15px] font-bold text-gray-900">{product.package_dimensions || "250 × 150 × 100 mm"}</div>
                                </div>
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Lead Time</div>
                                    <div className="text-[15px] font-bold text-gray-900">{product.lead_time || "2-3 Business Days"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODE */}
            {isEditing && (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    {/* Global Error Message */}
                    {errors.global && (
                        <div className="animate-in slide-in-from-top-4 duration-300 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm mb-6">
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
                                        onChange={e => { setName(e.target.value); setErrors({...errors, name: undefined, global: undefined}); }} 
                                        placeholder="Enter product name..." 
                                        className={`w-full px-4 py-2.5 bg-[#F9FAFB] border ${errors.name ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 transition-colors`} 
                                    />
                                    {errors.name && <p className="text-red-500 text-[12px] font-bold mt-1.5">{errors.name}</p>}
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
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-[16px] font-bold text-gray-900">Product Images <span className="text-red-500">*</span></h2>
                                <span className={`text-[12px] font-bold ${images.length >= 10 ? 'text-orange-600' : 'text-gray-400'}`}>
                                    {images.length} / 10
                                </span>
                            </div>
                            
                            {errors.images && <p className="text-red-500 text-[12px] font-bold mb-4">{errors.images}</p>}

                            {/* Interactive Color Filter Tabs */}
                            {Array.from(new Set(variantsData.map(v => v.color).filter(Boolean))).length > 0 && (
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100">
                                    <button
                                        onClick={() => setSelectedImageColor(null)}
                                        className={`px-4 py-2 rounded-t-lg text-[13px] font-bold transition-all border-b-2 ${selectedImageColor === null ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        General Images
                                    </button>
                                    {Array.from(new Set(variantsData.map(v => v.color).filter(Boolean))).map((color: any) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedImageColor(color)}
                                            className={`px-4 py-2 rounded-t-lg text-[13px] font-bold transition-all border-b-2 ${selectedImageColor === color ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            )}

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
                                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Variations */}
                        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                            <h2 className="text-[16px] font-bold text-gray-900 mb-5">Product Variations</h2>
                            <div className="space-y-6">
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
                                                    onChange={e => { setV1Input(e.target.value); if(variationError?.type === 1) setVariationError(null); }} 
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(1, v1Input); } }} 
                                                    placeholder="Add option..." 
                                                    className="flex-1 min-w-[100px] text-[13px] bg-transparent outline-none border-none p-1 placeholder-gray-400 font-medium" 
                                                />
                                            </div>
                                            {variationError?.type === 1 && (
                                                <p className="text-red-500 text-[11px] font-bold mt-2">{variationError.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                                                    onChange={e => { setV2Input(e.target.value); if(variationError?.type === 2) setVariationError(null); }} 
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(2, v2Input); } }} 
                                                    placeholder="Add option..." 
                                                    className="flex-1 min-w-[100px] text-[13px] bg-transparent outline-none border-none p-1 placeholder-gray-400 font-medium" 
                                                />
                                            </div>
                                            {variationError?.type === 2 && (
                                                <p className="text-red-500 text-[11px] font-bold mt-2">{variationError.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

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
                                                    <tr className="bg-blue-50/30">
                                                        <td className="py-2.5 px-4 text-[13px] font-bold text-blue-800">Apply to all</td>
                                                        <td className="py-2.5 px-4"><input type="number" onChange={handleApplyAllPrice} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-[13px] font-medium focus:outline-none focus:border-blue-500" /></td>
                                                        <td className="py-2.5 px-4"><input type="number" onChange={handleApplyAllStock} placeholder="0" className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded text-[13px] font-medium focus:outline-none focus:border-blue-500" /></td>
                                                        <td className="py-2.5 px-4"></td>
                                                    </tr>
                                                    {variantsData.map((v, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50/50">
                                                            <td className="py-3 px-4 text-[13px] font-semibold text-gray-900 align-top">{v.name}</td>
                                                            <td className="py-3 px-4 align-top">
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-[10px] text-gray-500 text-[13px]">$</span>
                                                                    <input type="number" step="0.01" min="0" value={v.price} onChange={(e) => { handleVariantChange(idx, 'price', e.target.value); if(errors.variants?.[idx]?.price){ const nv = {...errors.variants}; delete nv[idx]?.price; setErrors({...errors, variants: nv, global: undefined}); } }} placeholder="0.00" className={`w-full pl-7 pr-3 py-1.5 bg-[#F9FAFB] border ${errors.variants?.[idx]?.price ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} rounded text-[13px] font-medium focus:bg-white focus:outline-none`} />
                                                                </div>
                                                                {errors.variants?.[idx]?.price && <p className="text-red-500 text-[10px] font-bold mt-1.5 leading-tight">{errors.variants[idx].price}</p>}
                                                            </td>
                                                            <td className="py-3 px-4 align-top">
                                                                <input type="number" min="0" value={v.stock} onChange={(e) => { handleVariantChange(idx, 'stock', e.target.value); if(errors.variants?.[idx]?.stock){ const nv = {...errors.variants}; delete nv[idx]?.stock; setErrors({...errors, variants: nv, global: undefined}); } }} placeholder="0" className={`w-full px-3 py-1.5 bg-[#F9FAFB] border ${errors.variants?.[idx]?.stock ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} rounded text-[13px] font-medium focus:bg-white focus:outline-none`} />
                                                                {errors.variants?.[idx]?.stock && <p className="text-red-500 text-[10px] font-bold mt-1.5 leading-tight">{errors.variants[idx].stock}</p>}
                                                            </td>
                                                            <td className="py-3 px-4 align-top">
                                                                <input type="text" value={v.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} placeholder="e.g. SKU-123" className="w-full px-3 py-1.5 bg-[#F9FAFB] border border-gray-200 rounded text-[13px] font-medium focus:bg-white focus:outline-none focus:border-blue-500" />
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
                                        {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
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
                                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Vintage Apparel" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                            <h2 className="text-[16px] font-bold text-gray-900 mb-5">Specifications</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Material</label>
                                    <input type="text" value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. 80% Wool" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Size Info</label>
                                    <input type="text" value={sizeInfo} onChange={e => setSizeInfo(e.target.value)} placeholder="e.g. One Size Adjustable" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Product Weight</label>
                                    <div className="relative">
                                        <input type="number" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 120" className="w-full pl-4 pr-9 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-gray-500 pointer-events-none">g</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Care Instructions</label>
                                    <input type="text" value={care} onChange={e => setCare(e.target.value)} placeholder="e.g. Dry clean only" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Logistics */}
                        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100/80 p-6">
                            <h2 className="text-[16px] font-bold text-gray-900 mb-5">Shipping & Logistics</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Package Weight</label>
                                    <div className="relative">
                                        <input type="number" min="0" value={packageWeight} onChange={e => setPackageWeight(e.target.value)} placeholder="e.g. 200" className="w-full pl-4 pr-9 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-gray-500 pointer-events-none">g</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Shipping Class</label>
                                    <input type="text" value={shippingClass} onChange={e => setShippingClass(e.target.value)} placeholder="e.g. Standard Express" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Package Dimensions</label>
                                    <input type="text" value={packageDimensions} onChange={e => setPackageDimensions(e.target.value)} placeholder="e.g. 250 × 150 × 100 mm" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-bold text-gray-700 mb-2">Lead Time</label>
                                    <input type="text" value={leadTime} onChange={e => setLeadTime(e.target.value)} placeholder="e.g. 2-3 Business Days" className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Bottom Form Actions */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] lg:ml-[260px]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex justify-end">
                    <div className="py-3 sm:py-4 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        {!isEditing ? (
                            <div className="flex w-full justify-between items-center sm:w-auto sm:ml-auto space-x-3">
                                <Link 
                                    href="/admin/products"
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-[6px] text-[13.5px] font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                                >
                                    <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Back
                                </Link>
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0D6EFD] text-white rounded-[6px] text-[13.5px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Update Product
                                </button>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setIsEditing(false)} 
                                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-[12px] sm:text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm min-w-[100px]"
                                >
                                    Discard
                                </button>
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting}
                                    className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 bg-[#2563EB] text-white rounded-xl text-[12px] sm:text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 min-w-[140px]"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
