import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';
import { getFullImageUrl } from '@/lib/image';
import Link from 'next/link';
import { toast } from '@/lib/toast';

export function ProductCard({ product }: { product: Product }) {
  const [isClient, setIsClient] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.imageUrl) return;
    try {
      const activeImgUrl = getFullImageUrl(product.imageUrl);
      const res = await fetch(activeImgUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      link.download = `${product.name.replace(/\s+/g, '_')}_1.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download image');
    }
  }

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/product/${product.id}`;
    const text = `✨ *${product.name}*\nCode: ${product.id}\nPrice: ${product.price ? formatInr(product.price) : 'On Request'}\n\nCheck it out!`;

    const canShareFiles = typeof navigator.canShare === 'function';

    if (navigator.share && canShareFiles && product.imageUrl) {
      try {
        const imgUrl = getFullImageUrl(product.imageUrl);
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        const file = new File([blob], `${product.name.replace(/\s+/g, '_')}.${ext}`, { type: blob.type });

        const shareData: ShareData = {
          title: product.name,
          text,
          files: [file],
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (err) {
        console.error('File share failed, falling back:', err);
      }
    }

    // Fallback: share link
    try {
      await navigator.share({
        title: product.name,
        text,
        url,
      });
    } catch (err) {
      console.log('Share failed or was canceled', err);
    }
  }

  return (
    <div className="relative group">
      <Link
        href={`/product/${product.id}`}
        className="card block overflow-hidden lg:hover:-translate-y-1 lg:hover:shadow-lg border border-divider"
      >
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
      </Link>

      <button
        onClick={handleDownload}
        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm border border-divider shadow-sm flex items-center justify-center transition-all z-10 lg:opacity-0 lg:group-hover:opacity-100 text-text-secondary hover:text-maroon"
        title="Download Image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>

      {isClient && canShare && (
        <button
          onClick={handleShare}
          className="absolute top-12 right-2 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm border border-divider shadow-sm flex items-center justify-center transition-all z-10 lg:opacity-0 lg:group-hover:opacity-100 text-text-secondary hover:text-maroon"
          title="Share Product"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      )}
    </div>
  );
}
