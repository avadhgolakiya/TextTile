import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type Product, productAllImages } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';
import { getFullImageUrl } from '@/lib/image';
import { useSavedStore } from '@/lib/saved-store';
import { useSelectionStore } from '@/lib/selection-store';
import { toast } from '@/lib/toast';

/** Port of lib/widgets/product_card.dart */
export function ProductCard({ product } : { product: Product }) {
  const toggleSaved = useSavedStore((s) => s.toggle);
  const isSaved = useSavedStore((s) => s.isSaved(product.id));
  
  const isSelectionMode = useSelectionStore((s) => s.isSelectionMode);
  const isSelected = useSelectionStore((s) => s.selectedIds.has(product.id));
  const toggleSelection = useSelectionStore((s) => s.toggleProduct);

  const [isClient, setIsClient] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const pathname = usePathname();
  const isSharedRoute = pathname?.startsWith('/shared');

  useEffect(() => {
    setIsClient(true);
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const images = productAllImages(product);
    if (images.length === 0) return;
    
    try {
      toast.success(`Downloading ${images.length} image${images.length > 1 ? 's' : ''}...`);
      
      for (let i = 0; i < images.length; i++) {
        const imgUrl = getFullImageUrl(images[i]);
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        link.download = `${product.name.replace(/\\s+/g, '_')}_${i + 1}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Add a small delay between downloads to prevent browser from blocking them
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      toast.success('Images downloaded!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download images');
    }
  }

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/products/${product.id}`;
    const text = `✨ *${product.name}*\nCode: ${product.id}\nPrice: ${product.price ? formatInr(product.price) : 'On Request'}\n\nCheck it out!`;

    const canShareFiles = typeof navigator.canShare === 'function';

    if (navigator.share && canShareFiles && product.imageUrl) {
      try {
        const imgUrl = getFullImageUrl(product.imageUrl);
        const res = await fetch(imgUrl);
        const blob = await res.blob();
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        const file = new File([blob], `${product.name.replace(/\\s+/g, '_')}.${ext}`, { type: blob.type });

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
    {isSelectionMode ? (
      <div
        onClick={() => toggleSelection(product)}
        className={`card block overflow-hidden cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-maroon shadow-md' : 'lg:hover:-translate-y-1 lg:hover:shadow-lg'
        }`}
      >
        <div className="relative aspect-[3/4] bg-cream-deep">
          {product.imageUrl ? (
            <Image
              src={getFullImageUrl(product.imageUrl)}
              alt={product.name}
              fill
              className={`object-cover transition-opacity ${isSelected ? 'opacity-80' : ''}`}
              sizes="(max-width: 768px) 50vw, 240px"
            />
          ) : null}
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-text-primary">
              {product.badge}
            </span>
          ) : null}
          {/* Checkbox overlay */}
          <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur rounded-full p-0.5">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected ? 'bg-maroon border-maroon text-white' : 'border-gray-400 text-transparent'
            }`}>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
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
    ) : isSharedRoute ? (
      <div className="card block overflow-hidden lg:hover:-translate-y-1 lg:hover:shadow-lg">
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
    ) : (
      <Link
        href={`/products/${product.id}`}
        className="card block overflow-hidden lg:hover:-translate-y-1 lg:hover:shadow-lg"
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
    )}
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(product);
      }}
      className={`absolute top-2 right-2 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm border border-divider shadow-sm flex items-center justify-center transition-all z-10 lg:opacity-0 lg:group-hover:opacity-100 ${isSaved ? 'text-red-500 lg:opacity-100' : 'text-text-secondary hover:text-red-500'}`}
    >
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        {isSaved ? (
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        ) : (
          <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
        )}
      </svg>
    </button>
    <button
      onClick={handleDownload}
      className="absolute top-12 right-2 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm border border-divider shadow-sm flex items-center justify-center transition-all z-10 lg:opacity-0 lg:group-hover:opacity-100 text-text-secondary hover:text-maroon"
      title="Download Image"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </button>
    {isClient && canShare && (
      <button
        onClick={handleShare}
        className="absolute top-[88px] right-2 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm border border-divider shadow-sm flex items-center justify-center transition-all z-10 lg:opacity-0 lg:group-hover:opacity-100 text-text-secondary hover:text-maroon"
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
