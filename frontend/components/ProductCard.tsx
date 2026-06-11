'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';
import { useSavedStore } from '@/lib/saved-store';
import { isValidImageUrl } from '@/lib/image';

/** Port of lib/widgets/product_card.dart */
export function ProductCard({ product }: { product: Product }) {
  const toggleSaved = useSavedStore((s) => s.toggle);
  const isSaved = useSavedStore((s) => s.isSaved(product.id));

  const images = (product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : []
  ).filter(isValidImageUrl);

  return (
    <Link
      href={`/products/${product.id}`}
      className="card block overflow-hidden group lg:hover:-translate-y-1 lg:hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] bg-cream-deep">
        {images.length > 0 ? (
          <>
            <Image
              src={images[0]}
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-500 ease-in-out ${
                images.length > 1 ? 'group-hover:opacity-0' : ''
              }`}
              sizes="(max-width: 768px) 50vw, 240px"
              priority
            />
            {images.length > 1 && (
              <Image
                src={images[1]}
                alt={`${product.name} alternate view`}
                fill
                className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                sizes="(max-width: 768px) 50vw, 240px"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary text-2xl">
            🧵
          </div>
        )}
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-text-primary z-10">
            {product.badge}
          </span>
        ) : null}
        
        {/* Floating Heart bookmark button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved(product);
          }}
          className="absolute right-3 top-3 z-20 rounded-full bg-white/75 p-2 text-text-primary hover:text-maroon shadow-md transition backdrop-blur-sm active:scale-90 flex items-center justify-center cursor-pointer"
          title={isSaved ? 'Remove from saved' : 'Save product'}
        >
          <svg
            className={`h-4.5 w-4.5 transition-colors duration-200 ${
              isSaved ? 'fill-maroon text-maroon' : 'fill-none text-text-secondary hover:text-maroon'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      <div className="space-y-1 p-4 lg:p-5">
        <h3 className="font-serif text-base font-semibold leading-snug lg:text-lg">
          {product.name}
        </h3>
        {product.subtitle ? (
          <p className="line-clamp-2 text-xs text-text-secondary">
            {product.subtitle}
          </p>
        ) : null}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-sm font-bold text-maroon">
            {formatInr(product.price)}
          </span>
          {product.originalPrice ? (
            <span className="text-xs text-text-secondary line-through">
              {formatInr(product.originalPrice)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
