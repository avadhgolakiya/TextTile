import type { CartLine } from './types';
import { formatInr } from './formatting/inr';
import { ShopContact } from './constants/shop-contact';
import { getFullImageUrl, getWhatsAppThumbnailUrl } from './image';

/** Port of lib/core/whatsapp/whatsapp_order_service.dart */
export function buildCartMessage(options: {
  lines: CartLine[];
  buyerName: string;
  buyerPhone?: string | null;
  buyerAddress?: string | null;
}): string {
  const { lines, buyerName, buyerPhone, buyerAddress } = options;
  const parts: string[] = [];

  parts.push(`🧵 *New Order — ${ShopContact.businessName}*`, '');
  parts.push(`👤 *Buyer:* ${buyerName}`);
  if (buyerPhone?.trim()) {
    parts.push(`📞 *Phone:* ${buyerPhone.trim()}`);
  }
  if (buyerAddress?.trim()) {
    parts.push(`📍 *Delivery Address:* ${buyerAddress.trim()}`);
  }
  parts.push('', '*Items Ordered:*', '━━━━━━━━━━━━━━━━━━━');

  let runningTotal = 0;
  lines.forEach((line, index) => {
    const lineTotal = (line.product.price || 0) * line.quantity;
    runningTotal += lineTotal;

    parts.push(`${index + 1}. *${line.product.name}*`);
    parts.push(`   Code: ${line.product.id}`);
    if (line.product.subtitle) {
      parts.push(`   Details: ${line.product.subtitle}`);
    }
    parts.push(
      `   ${line.product.sareeSet ? 'Sets' : 'Qty'}: ${line.quantity}`
    );
    if (line.product.imageUrl) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://text-tile.vercel.app';
      parts.push(`   🔗 View Product: ${origin}/products/${encodeURIComponent(line.product.id)}`);
    }

    parts.push('');
  });

  parts.push(
    '━━━━━━━━━━━━━━━━━━━',
    'thank you for shooping have a nice day ',
  );

  return parts.join('\n');
}

export function whatsappCartUrl(options: {
  lines: CartLine[];
  buyerName: string;
  buyerPhone?: string | null;
  buyerAddress?: string | null;
}): string {
  const text = buildCartMessage(options);
  return `https://wa.me/${ShopContact.whatsappOrderDigits}?text=${encodeURIComponent(text)}`;
}

/**
 * Fetches image URLs as File objects for sharing.
 * Skips any image that fails to fetch.
 */
async function fetchImageFiles(imageUrls: string[], productName: string): Promise<File[]> {
  const files: File[] = [];
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const res = await fetch(imageUrls[i]);
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      files.push(new File([blob], `${productName.replace(/\s+/g, '_')}_${i + 1}.${ext}`, { type: blob.type }));
    } catch {
      // skip failed image
    }
  }
  return files;
}

/**
 * Opens a WhatsApp order for the cart.
 * On mobile: uses Web Share API to attach actual photos + text.
 * On desktop: opens wa.me link (text only).
 */
export async function openWhatsAppCart(options: {
  lines: CartLine[];
  buyerName: string;
  buyerPhone?: string | null;
  buyerAddress?: string | null;
}): Promise<void> {
  const text = buildCartMessage(options);

  // Collect all unique image URLs from all cart lines
  const allImageUrls: string[] = [];
  for (const line of options.lines) {
    const urls =
      line.product.imageUrls && line.product.imageUrls.length > 0
        ? line.product.imageUrls
        : line.product.imageUrl
          ? [line.product.imageUrl]
          : [];
    for (const url of urls) {
      const full = getFullImageUrl(url);
      if (!allImageUrls.includes(full)) allImageUrls.push(full);
    }
  }

  // Open wa.me text link directly
  window.open(whatsappCartUrl(options), '_blank', 'noopener,noreferrer');
}

/**
 * Opens a WhatsApp order for a single product.
 * On mobile: uses Web Share API to attach actual photos + text.
 * On desktop: opens wa.me link (text only).
 */
export async function openWhatsAppSingleOrder(options: {
  product: any;
  quantity: number;
  buyerName: string;
  buyerPhone?: string | null;
  buyerAddress?: string | null;
  note?: string;
  imageUrls?: string[];
}): Promise<void> {
  const { product, quantity, buyerName, buyerPhone, buyerAddress, note, imageUrls } = options;

  // Build order message
  const parts: string[] = [];
  parts.push(`🧵 *New Order — ${ShopContact.businessName}*`, '');
  parts.push(`👤 *Buyer:* ${buyerName}`);
  if (buyerPhone?.trim()) {
    parts.push(`📞 *Phone:* ${buyerPhone.trim()}`);
  }
  if (buyerAddress?.trim()) {
    parts.push(`📍 *Delivery Address:* ${buyerAddress.trim()}`);
  }
  parts.push('', '*Item Ordered:*', '━━━━━━━━━━━━━━━━━━━');
  parts.push(`*${product.name}*`);
  parts.push(`Code: ${product.id}`);
  if (product.subtitle) {
    parts.push(`Details: ${product.subtitle}`);
  }
  parts.push(`${product.sareeSet ? 'Sets' : 'Qty'}: ${quantity}`);
  if (note?.trim()) {
    parts.push(`Note: ${note.trim()}`);
  }

  // Resolve image URLs
  const allImages: string[] =
    imageUrls && imageUrls.length > 0
      ? imageUrls
      : product.imageUrl
        ? [getFullImageUrl(product.imageUrl)]
        : [];

  if (allImages.length > 0) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://text-tile.vercel.app';
    parts.push('', `🔗 *View Product:* ${origin}/products/${encodeURIComponent(product.id)}`);
  }

  parts.push('━━━━━━━━━━━━━━━━━━━', 'thank you for shooping have a nice day 🙂');

  const text = parts.join('\n');

  // Open wa.me text link directly
  window.open(
    `https://wa.me/${ShopContact.whatsappOrderDigits}?text=${encodeURIComponent(text)}`,
    '_blank',
    'noopener,noreferrer',
  );
}
