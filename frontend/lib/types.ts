export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  imageUrls: string[];
  badge?: string | null;
  categoryKey?: string | null;
  isVisible: boolean;
};

export type CartLine = {
  product: Product;
  quantity: number;
};

export type OrderSummary = {
  subtotal: number;
  discountPercent: number;
  shippingLabel: string;
  shippingAmount: number;
  discountAmount: number;
  total: number;
};

export type OrderStatus = 'pending' | 'processing' | 'inTransit' | 'delivered';

export type OrderItem = {
  id: string;
  dateLabel: string;
  title: string;
  itemCountLabel: string;
  total: number;
  thumbnailUrl: string;
  status: OrderStatus;
};

export type AppUser = {
  id: string;
  email: string;
  businessName: string;
  phone?: string | null;
  isAdmin: boolean;
};

export type CategoryItem = {
  label: string;
  icon: string;
};

export function productAllImages(product: Product): string[] {
  if (product.imageUrls.length > 0) return product.imageUrls;
  if (product.imageUrl) return [product.imageUrl];
  return [];
}

export function cartLineTotal(line: CartLine): number {
  return line.product.price * line.quantity;
}
