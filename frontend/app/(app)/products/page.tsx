'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi } from '@/lib/api-client';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    // Reset when category changes
    setPage(1);
    setProducts([]);
    setTotalPages(1);
  }, [category]);

  useEffect(() => {
    if (page === 1) {
      setLoading(true);
    }
    const fetchCall = category
      ? productApi.fetchByCategory(category, page, LIMIT)
      : productApi.fetchAll(page, LIMIT);

    fetchCall
      .then(({ products: newProducts, pagination }) => {
        setProducts((prev) => {
          if (page === 1) {
            return newProducts || [];
          } else {
            const existingIds = new Set(prev.map((p) => p.id));
            const filteredNew = (newProducts || []).filter((p) => !existingIds.has(p.id));
            return [...prev, ...filteredNew];
          }
        });
        if (pagination) {
          setTotalPages(pagination.totalPages);
          if (page < pagination.totalPages) {
            setTimeout(() => {
              setPage((p) => p + 1);
            }, 100);
          }
        } else {
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [category, page]);

  const displayTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'All Products';

  // Group products by set
  const groupedProducts: { [setName: string]: Product[] } = {};
  const ungroupedProducts: Product[] = [];

  products.forEach((p) => {
    if (p.sareeSet && p.sareeSet.trim() !== '') {
      const setKey = p.sareeSet.trim();
      if (!groupedProducts[setKey]) {
        groupedProducts[setKey] = [];
      }
      groupedProducts[setKey].push(p);
    } else {
      ungroupedProducts.push(p);
    }
  });

  const hasGroups = Object.keys(groupedProducts).length > 0;

  return (
    <div className="min-h-screen bg-cream pb-12 lg:bg-transparent lg:pb-0">
      <DesktopTopBar title={displayTitle} subtitle="Category catalog" />

      {/* Header — mobile only */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-divider lg:hidden">
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
      <div className="px-6 py-6 lg:px-0 lg:py-0">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner label="Loading products…" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-text-secondary">
            <p className="text-lg font-serif">No products found in this category</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grouped Sets */}
            {Object.entries(groupedProducts).map(([setName, items]) => (
              <div key={setName} className="space-y-4 bg-white/60 backdrop-blur border border-divider/60 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-divider/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-maroon text-base">📦</span>
                    <h4 className="font-serif text-base font-bold text-text-primary uppercase tracking-wide">
                      {setName} Set
                    </h4>
                  </div>
                  <span className="text-xs font-bold bg-maroon/10 text-maroon px-2.5 py-1 rounded-full">
                    {items.length} {items.length === 1 ? 'Color' : 'Colors'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 items-start">
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))}

            {/* Ungrouped/Single Designs */}
            {ungroupedProducts.length > 0 && (
              <div className="space-y-4">
                {hasGroups && (
                  <div className="flex items-center gap-2 border-b border-divider/40 pb-2">
                    <span className="text-maroon text-base">✨</span>
                    <h4 className="font-serif text-base font-bold text-text-primary uppercase tracking-wide">
                      Single Designs
                    </h4>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 items-start">
                  {ungroupedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Auto-loading loader at bottom */}
            {page < totalPages && (
              <div className="mt-8 flex justify-center py-4">
                <LoadingSpinner label="Loading more products..." />
              </div>
            )}
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
