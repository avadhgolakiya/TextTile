'use client';

import { useEffect, useState } from 'react';
import { productApi } from '@/lib/api-client';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';

const filters = ['All', 'Sarees', 'Suits', 'Lehenga', 'Fabric', 'Dupatta'];

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('All');

  useEffect(() => {
    productApi
      .fetchAll()
      .then(({ products }) => {
        setProducts(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selected === 'All') return true;
    return (
      p.name.toLowerCase().includes(selected.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(selected.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] text-white px-6 py-10 rounded-b-[32px] shadow-md">
        <p className="text-xs uppercase tracking-[2.5px] text-gold font-semibold">
          Swastik Fashion
        </p>
        <h1 className="font-serif text-4xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gold">
          Collection
        </h1>
        <p className="text-sm text-white/60 mt-1">
          {products.length} products
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto px-6 py-4 scrollbar-none">
        {filters.map((f) => {
          const active = f === selected;
          return (
            <button
              key={f}
              onClick={() => setSelected(f)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold border transition duration-200 ${
                active
                  ? 'bg-gradient-to-r from-maroon-dark to-maroon text-white border-transparent shadow-sm'
                  : 'bg-white text-text-secondary border-divider hover:bg-cream-deep'
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Grid of products */}
      <div className="px-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner label="Loading collection…" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-text-secondary">
            <p className="text-lg font-serif">No products found</p>
            <p className="text-sm mt-1">Try selecting another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
