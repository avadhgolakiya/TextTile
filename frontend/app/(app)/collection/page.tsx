'use client';

import { useEffect, useState } from 'react';
import { productApi, categoryApi } from '@/lib/api-client';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MultiShareBar } from '@/components/MultiShareBar';
import type { Product, Category } from '@/lib/types';
import { useTranslation } from '@/lib/language-store';
import { useSelectionStore } from '@/lib/selection-store';

export default function CollectionPage() {
  const { t } = useTranslation();
  const isSelectionMode = useSelectionStore((s) => s.isSelectionMode);
  const enterSelectionMode = useSelectionStore((s) => s.enterSelectionMode);
  const exitSelectionMode = useSelectionStore((s) => s.exitSelectionMode);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 10;

  // 1. Fetch Categories on mount
  useEffect(() => {
    categoryApi
      .fetchCategories()
      .then(({ categories }) => {
        const catsList = categories || [];
        setCategories(catsList);
        
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category');
        
        if (catParam) {
          setSelected(catParam);
        } else if (catsList.length > 0) {
          const firstCat = catsList[0].name;
          setSelected(firstCat.charAt(0).toUpperCase() + firstCat.slice(1));
        }
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      });
  }, []);

  // 2. Fetch Products whenever selected category or page changes
  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    productApi
      .fetchByCategory(selected, page, LIMIT)
      .then(({ products, pagination }) => {
        setProducts(products || []);
        if (pagination) {
          setTotalPages(pagination.totalPages);
          setTotalItems(pagination.total);
        } else {
          setTotalPages(1);
          setTotalItems(products?.length || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, [selected, page]);

  const handleCategoryChange = (catName: string) => {
    setSelected(catName);
    setPage(1);
  };

  const filters = categories
    .map((cat) => cat.name.charAt(0).toUpperCase() + cat.name.slice(1))
    .sort();

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
      <DesktopTopBar
        title={t('navCollection')}
        subtitle={`${totalItems} ${t('itemsCount')}`}
      />

      {/* Hero Header — mobile only */}
      <div className="bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] text-white px-6 py-10 rounded-b-[32px] shadow-md lg:hidden">
        <img
          src="/logo.jpg"
          alt="Swastik Fashion"
          className="h-8 w-auto object-contain mb-2"
        />
        <h1 className="font-serif text-4xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gold">
          {t('navCollection')}
        </h1>
        <p className="text-sm text-white/60 mt-1">
          {totalItems} {t('itemsCount')}
        </p>
      </div>

      <div className="desktop-split">
        {/* Filter chips — horizontal on mobile, vertical sidebar on desktop */}
        <aside className="px-6 py-4 lg:sticky lg:top-8 lg:px-0 lg:py-0">
          <h3 className="mb-3 hidden font-serif text-lg font-bold text-text-primary lg:block">
            {t('filterByType')}
          </h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col lg:overflow-visible lg:gap-2">
            {filters.map((f) => {
              const active = f.toLowerCase() === selected.toLowerCase();
              return (
                <button
                  key={f}
                  onClick={() => handleCategoryChange(f)}
                  className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold border transition duration-200 lg:w-full lg:rounded-2xl lg:px-4 lg:py-3 lg:text-left ${
                    active
                      ? 'bg-gradient-to-r from-maroon-dark to-maroon text-white border-transparent shadow-sm'
                      : 'bg-surface text-text-secondary border-divider hover:bg-cream-deep lg:hover:border-gold'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Grid of products */}
        <div className="px-6 lg:px-0">
          {/* Header row for grid */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="hidden lg:block font-serif text-2xl font-bold text-text-primary">
              {selected}
            </h2>
            <div className="flex-1 lg:hidden"></div>
            {!isSelectionMode ? (
              <button
                onClick={enterSelectionMode}
                className="bg-surface border border-divider px-4 py-2 rounded-lg text-sm font-bold text-text-primary shadow-sm hover:bg-cream-deep transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Select Multiple
              </button>
            ) : (
              <button
                onClick={exitSelectionMode}
                className="bg-cream-deep border border-divider px-4 py-2 rounded-lg text-sm font-bold text-text-secondary transition-colors"
              >
                Cancel Selection
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner label="Loading collection…" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-text-secondary">
              <p className="text-lg font-serif">{t('noProducts')}</p>
              <p className="text-sm mt-1">{t('tryAnotherCategory')}</p>
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
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 items-start">
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
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 items-start">
                    {ungroupedProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4 border-t border-divider pt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-surface border border-divider text-text-secondary disabled:opacity-40 hover:bg-cream-deep transition disabled:hover:bg-surface cursor-pointer"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm font-semibold text-text-secondary">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-semibold rounded-xl bg-surface border border-divider text-text-secondary disabled:opacity-40 hover:bg-cream-deep transition disabled:hover:bg-surface cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <MultiShareBar />
    </div>
  );
}
