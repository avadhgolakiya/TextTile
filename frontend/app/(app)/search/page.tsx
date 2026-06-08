'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi } from '@/lib/api-client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .fetchAll()
      .then(({ products }) => {
        setAllProducts(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const results = allProducts.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Search Bar Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white/90 backdrop-blur sticky top-0 z-10 border-b border-divider">
        <button
          onClick={() => router.back()}
          className="text-text-primary hover:text-maroon transition p-1 font-semibold"
        >
          ← Back
        </button>
        <input
          type="text"
          autoFocus
          placeholder="Search sarees, fabric, code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-base font-sans text-text-primary outline-none placeholder:text-text-secondary"
        />
      </header>

      {/* Content */}
      <div className="px-6 py-4 space-y-4 max-w-xl mx-auto">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner label="Loading products…" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center text-text-secondary">
            {query.trim() === '' ? (
              <p>No products available yet.</p>
            ) : (
              <p>No matches for &ldquo;{query}&rdquo;</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="card flex gap-4 p-3 border border-divider hover:shadow transition duration-200"
              >
                <div className="relative w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-cream-deep border border-divider">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary text-2xl">
                      🧵
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary font-semibold">
                      Code: {product.id}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-text-primary leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  {product.subtitle && (
                    <p className="text-xs text-text-secondary truncate mt-1">
                      {product.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center text-text-secondary font-bold text-lg px-1">
                  →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
