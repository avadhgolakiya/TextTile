import type { CartLine } from './types';
import { formatInr } from './formatting/inr';
import { ShopContact } from './constants/shop-contact';

/** Port of lib/core/whatsapp/whatsapp_order_service.dart */
export function buildCartMessage(options: {
  lines: CartLine[];
  buyerName: string;
  buyerPhone?: string | null;
}): string {
  const { lines, buyerName, buyerPhone } = options;
  const parts: string[] = [];

  parts.push(`🧵 *New Order — ${ShopContact.businessName}*`, '');
  parts.push(`👤 *Buyer:* ${buyerName}`);
  if (buyerPhone?.trim()) {
    parts.push(`📞 *Phone:* ${buyerPhone.trim()}`);
  }
  parts.push('', '*Items Ordered:*', '━━━━━━━━━━━━━━━━━━━');

  let runningTotal = 0;
  lines.forEach((line, index) => {
    const lineTotal = line.product.price * line.quantity;
    runningTotal += lineTotal;

    parts.push(`${index + 1}. *${line.product.name}*`);
    parts.push(`   Code: ${line.product.id}`);
    if (line.product.subtitle) {
      parts.push(`   Details: ${line.product.subtitle}`);
    }
    parts.push(
      `   Qty: ${line.quantity} × ${formatInr(line.product.price)}`,
    );
    parts.push(`   Subtotal: ${formatInr(lineTotal)}`);
    if (line.product.imageUrl) {
      parts.push(`   📷 Photo: ${line.product.imageUrl}`);
    }
    parts.push('');
  });

  const discounted = Math.round(runningTotal * 0.9);
  parts.push(
    '━━━━━━━━━━━━━━━━━━━',
    `🛒 *Total: ${formatInr(runningTotal)}*`,
    `💰 *After 10% discount: ${formatInr(discounted)}*`,
    '',
    'Please confirm my order. I will visit your shop for pickup.',
  );

  return parts.join('\n');
}

export function whatsappCartUrl(options: {
  lines: CartLine[];
  buyerName: string;
  buyerPhone?: string | null;
}): string {
  const text = buildCartMessage(options);
  return `https://wa.me/${ShopContact.whatsappOrderDigits}?text=${encodeURIComponent(text)}`;
}

export function openWhatsAppCart(options: {
  lines: CartLine[];
  buyerName: string;
  buyerPhone?: string | null;
}): void {
  window.open(whatsappCartUrl(options), '_blank', 'noopener,noreferrer');
}

export function openWhatsAppSingleOrder(options: {
  product: any;
  quantity: number;
  buyerName: string;
  note?: string;
}): void {
  const { product, quantity, buyerName, note } = options;
  const parts: string[] = [];
  parts.push(`🧵 *New Order — ${ShopContact.businessName}*`, '');
  parts.push(`👤 *Buyer:* ${buyerName}`);
  parts.push('', '*Item Ordered:*', '━━━━━━━━━━━━━━━━━━━');
  parts.push(`*${product.name}*`);
  parts.push(`Code: ${product.id}`);
  if (product.subtitle) {
    parts.push(`Details: ${product.subtitle}`);
  }
  parts.push(`Qty: ${quantity} × ${formatInr(product.price)}`);
  parts.push(`Subtotal: ${formatInr(product.price * quantity)}`);
  if (note?.trim()) {
    parts.push(`Note: ${note.trim()}`);
  }
  if (product.imageUrl) {
    parts.push(`📷 Photo: ${product.imageUrl}`);
  }
  parts.push('━━━━━━━━━━━━━━━━━━━', `🛒 *Total: ${formatInr(product.price * quantity)}*`);
  parts.push('', 'Please confirm my order. I will visit your shop for pickup.');
  const text = parts.join('\n');
  window.open(`https://wa.me/${ShopContact.whatsappOrderDigits}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

