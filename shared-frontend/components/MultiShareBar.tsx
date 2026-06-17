import { useState } from 'react';
import { useSelectionStore } from '@/lib/selection-store';
import { collectionApi } from '@/lib/api-client';
import { toast } from '@/lib/toast';

export function MultiShareBar() {
  const isSelectionMode = useSelectionStore((s) => s.isSelectionMode);
  const selectedProductsMap = useSelectionStore((s) => s.selectedProducts);
  const selectedProducts = Object.values(selectedProductsMap);
  const exitSelectionMode = useSelectionStore((s) => s.exitSelectionMode);
  const [isSharing, setIsSharing] = useState(false);

  if (!isSelectionMode) return null;

  async function handleShare() {
    if (selectedProducts.length === 0) return;
    
    setIsSharing(true);
    try {
      // Create collection on backend
      const { id } = await collectionApi.create(selectedProducts.map(p => p.id));
      
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://text-tile.vercel.app';
      const url = `${origin}/shared/${id}`;
      const text = `✨ *Checkout these products!*\n\nI've selected ${selectedProducts.length} items for you to see. Tap the link below to view the entire collection!`;

      // Try Web Share API first
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: 'Shared Products Collection',
            text,
            url,
          });
          exitSelectionMode();
          return;
        } catch (err: any) {
          console.error('Share failed:', err);
          if (err.name === 'AbortError') {
            return; // User cancelled
          }
        }
      }

      // Desktop fallback: generate WhatsApp link
      const waLink = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
      window.open(waLink, '_blank', 'noopener,noreferrer');
      exitSelectionMode();
    } catch (err) {
      console.log('Share failed', err);
      toast.error('Failed to create share link. Please try again.');
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="fixed bottom-[80px] lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-surface border border-divider shadow-2xl rounded-2xl p-3 flex items-center justify-between transition-all animate-in slide-in-from-bottom-10 fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={exitSelectionMode}
          className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-text-secondary hover:bg-cream-deep transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="font-serif font-bold text-text-primary">
          {selectedProducts.length} selected
        </span>
      </div>
      <button
        onClick={handleShare}
        disabled={selectedProducts.length === 0 || isSharing}
        className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
          selectedProducts.length > 0
            ? 'bg-gradient-to-r from-maroon-dark to-maroon text-white shadow-md'
            : 'bg-cream-deep text-text-secondary cursor-not-allowed'
        }`}
      >
        {isSharing ? (
          <span className="animate-spin text-lg inline-block">⏳</span>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )}
        Share
      </button>
    </div>
  );
}
