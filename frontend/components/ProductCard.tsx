import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';

import { isValidImageUrl } from '@/lib/image';

/** Port of lib/widgets/product_card.dart */
export function ProductCard({ product }: { product: Product }) {
  const hasValidImage = isValidImageUrl(product.imageUrl);
  return (
    <Link
      href={`/products/${product.id}`}
      className="card block overflow-hidden lg:hover:-translate-y-1 lg:hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] bg-cream-deep">
        {hasValidImage ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 240px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary text-2xl">
            🧵
          </div>
        )}
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-text-primary">
            {product.badge}
          </span>
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
