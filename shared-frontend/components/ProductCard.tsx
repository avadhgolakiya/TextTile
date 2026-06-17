import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';
import { getFullImageUrl } from '@/lib/image';

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card block overflow-hidden lg:hover:-translate-y-1 lg:hover:shadow-lg border border-divider">
      <div className="relative aspect-[3/4] bg-cream-deep">
        {product.imageUrl ? (
          <Image
            src={getFullImageUrl(product.imageUrl)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 240px"
          />
        ) : null}
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
            {product.price ? formatInr(product.price) : 'Price on Request'}
          </span>
          {product.originalPrice ? (
            <span className="text-xs text-text-secondary line-through">
              {formatInr(product.originalPrice)}
            </span>
          ) : null}
        </div>
        {product.stock === 0 ? (
          <p className="text-xs font-bold text-red-600">Out of Stock</p>
        ) : (product.stock !== undefined && product.stock > 0 && product.stock <= 10) ? (
          <p className="text-[10px] font-bold text-red-600 bg-red-50 inline-block px-2 py-0.5 rounded">
            Only {product.stock} left!
          </p>
        ) : null}
      </div>
    </div>
  );
}
