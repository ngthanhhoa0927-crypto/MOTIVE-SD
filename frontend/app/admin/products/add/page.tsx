"use client";

import React from 'react';
import Link from 'next/link';
import ProductForm from '../components/ProductForm';

export default function AddProductPage() {
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

            <ProductForm />
        </div>
    );
}
