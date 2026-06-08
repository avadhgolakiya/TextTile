'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi } from '@/lib/api-client';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCall = category
      ? productApi.fetchByCategory(category)
      : productApi.fetchAll();

    fetchCall
      .then(({ products }) => {
        setProducts(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [category]);

  const displayTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'All Products';

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-divider">
        <button
          onClick={() => router.back()}
          className="text-text-primary hover:text-maroon transition p-1 font-semibold"
        >
          ← Back
        </button>
        <h1 className="font-serif text-2xl font-semibold text-text-primary">
          {displayTitle}
        </h1>
      </header>

      {/* Grid of products */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner label="Loading products…" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-text-secondary">
            <p className="text-lg font-serif">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading products…" />}>
      <ProductsContent />
    </Suspense>
  );
}
