"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductForm from '../components/ProductForm';

export default function EditProductPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = React.use(paramsPromise);
    const router = useRouter();
    
    // View/Edit Mode Toggle
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);

    const fetchProduct = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('admin_token');
        try {
            const res = await fetch(`http://localhost:8000/products/${params.id}`, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (data.product) {
                setProduct(data.product);
            } else {
                alert("Product not found");
                router.push('/admin/products');
            }
        } catch(err) {
            console.error(err);
            alert("Error fetching product");
            router.push('/admin/products');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch categories for view mode
        fetch("http://localhost:8000/categories")
            .then(res => res.json())
            .then(data => {
                if (data.categories && data.categories.length > 0) {
                    setCategories(data.categories);
                }
            })
            .catch(err => console.error(err));

        if (params.id) {
            fetchProduct();
        }
    }, [params.id, router]);

    if (isLoading || !product) {
        return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading product details...</div>;
    }

    const categoryName = categories.find(c => c.id === product?.category_id)?.name || 'Unknown Category';
    const totalStock = product.variants?.reduce((acc: number, curr: any) => acc + (parseInt(curr.stock_quantity) || 0), 0) || 0;

    return (
        <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-32">
            
            {/* Breadcrumb & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 sm:mb-6">
                <div>
                    <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-gray-500 mb-1">
                        <Link href="/admin/products" className="hover:text-gray-900 transition-colors">Products</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-blue-600 font-semibold truncate max-w-[120px] sm:max-w-none">{isEditing ? 'Edit' : product.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{isEditing ? 'Edit Product' : product.name}</h1>
                        {!isEditing && (
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1.5 ${product.status === 'Active' ? 'bg-[#ECFDF5] text-[#10B981]' : product.status === 'Draft' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'Active' ? 'bg-[#10B981]' : product.status === 'Draft' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                                {product.status?.toUpperCase() || 'DRAFT'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* VIEW MODE */}
            {!isEditing && (
                <div className="space-y-6 pb-24 max-w-[1000px] animate-in fade-in zoom-in-95 duration-200">
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
                                    <div className="text-[15px] font-bold text-gray-900">{product.name}</div>
                                </div>
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Price</div>
                                    <div className="text-[15px] font-bold text-gray-900">$ {parseFloat(product.base_price || "0").toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
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
                                        {product.status === 'Active' ? 'Published' : product.status}
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
                            <svg className="w-[18px] h-[18px] text-[#1D4ED8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
                        <p className="text-[15px] text-[#334155] font-medium leading-[1.7] tracking-wider mt-4 whitespace-pre-wrap">
                            {product.description || "No description provided."}
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
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Brand</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.brand || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between items-center py-5 border-b border-gray-50">
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Material</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.material || "Not specified"}</span>
                                </div>
                                <div className="flex justify-between items-center py-5">
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Size</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.size_info || "Not specified"}</span>
                                </div>
                            </div>
                            
                            {/* Col 2 */}
                            <div className="flex flex-col">
                                <div className="flex justify-between items-center py-5 border-b border-gray-50 border-t border-gray-50 md:border-t-0">
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Weight</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.weight ? `${product.weight.toString().replace(/g/gi, '').trim()}g` : "Not specified"}</span>
                                </div>
                                <div className="flex justify-between items-center py-5">
                                    <span className="text-[13px] font-bold text-[#8A94A6]">Care Instruction</span>
                                    <span className="text-[13px] font-bold text-gray-900">{product.care || "Not specified"}</span>
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
                                    <div className="text-[15px] font-bold text-gray-900">{product.package_weight ? `${product.package_weight.toString().replace(/g/gi, '').trim()}g` : "Not specified"}</div>
                                </div>
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Shipping Class</div>
                                    <div className="text-[15px] font-bold text-gray-900">{product.shipping_class || "Not specified"}</div>
                                </div>
                            </div>
                            <div className="space-y-8 flex flex-col justify-between">
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Package Dimensions</div>
                                    <div className="text-[15px] font-bold text-gray-900">{product.package_dimensions || "Not specified"}</div>
                                </div>
                                <div>
                                    <div className="uppercase text-[11px] font-bold text-[#8A94A6] tracking-wider mb-2">Lead Time</div>
                                    <div className="text-[15px] font-bold text-gray-900">{product.lead_time ? `${product.lead_time} Days` : "Not specified"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODE */}
            <ProductForm 
                initialData={product} 
                isEditingMode={isEditing} 
                onCancel={() => setIsEditing(false)} 
                onSave={async (data) => {
                    await fetchProduct();
                    setIsEditing(false);
                    return true;
                }}
            />

            {/* View Mode Actions */}
            {!isEditing && (
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] lg:ml-[260px]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex justify-end">
                    <div className="py-3 sm:py-4 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
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
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
