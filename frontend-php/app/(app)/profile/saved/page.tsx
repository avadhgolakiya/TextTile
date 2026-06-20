'use client';

import { useSavedStore } from '@/lib/saved-store';
import { useRouter } from 'next/navigation';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';

export default function SavedProductsPage() {
  const router = useRouter();
  const savedDict = useSavedStore((s) => s.saved);
  const savedItems = Object.values(savedDict);

  return (
    <div className="min-h-screen bg-cream pb-12 lg:bg-transparent lg:pb-0">
      <DesktopTopBar
        title="Saved Products"
        subtitle={`${savedItems.length} items wishlisted`}
      />

      {/* Header — mobile only */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-divider lg:hidden">
        <button
          onClick={() => router.back()}
          className="text-text-primary hover:text-maroon transition p-1 font-semibold"
        >
          ← Back
        </button>
        <h1 className="font-serif text-2xl font-semibold text-text-primary">
          Saved Products
        </h1>
      </header>

      {/* Content grid */}
      <div className="px-6 py-6 lg:px-0 lg:py-0">
        {savedItems.length === 0 ? (
          <div className="py-24 text-center max-w-sm mx-auto space-y-4">
            <span className="text-5xl select-none block">🔖</span>
            <h3 className="font-serif text-xl font-bold text-text-primary">
              Your Saved List is Empty
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Bookmark sarees or suits while browsing the catalog to keep track of your favorite designs.
            </p>
            <div className="pt-2">
              <Link
                href="/collection"
                className="btn-primary w-full h-12 flex items-center justify-center font-bold text-sm"
              >
                Browse Collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 items-start">
            {savedItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
