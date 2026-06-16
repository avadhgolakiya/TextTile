export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price?: number | null;
  originalPrice?: number | null;
  imageUrl: string;
  imageUrls: string[];
  badge?: string | null;
  categoryKey?: string | null;
  isVisible: boolean;
  sareeSet?: string | null;
  stock?: number;
  isFeatured?: boolean;
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

export type OrderProductItem = {
  name: string;
  code: string;
  qty: number;
  price: number;
  imageUrl?: string;
};

export type OrderItem = {
  id: string;
  dateLabel: string;
  title: string;
  itemCountLabel: string;
  total: number;
  thumbnailUrl: string;
  status: OrderStatus;
  buyerName?: string;
  isManual?: boolean;
  items?: OrderProductItem[];
};

export type AppUser = {
  id: string;
  email: string;
  name?: string | null;
  businessName: string;
  phone?: string | null;
  gstin?: string | null;
  address?: string | null;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  isBlocked?: boolean;
};

export type Admin = {
  id: string;
  email: string;
  name: string;
};

export type ActivityLog = {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  details: any;
  createdAt: string;
};

export type CategoryItem = {
  label: string;
  icon: string;
};

export type Category = {
  key: string;
  name: string;
  icon: string;
};

export function productAllImages(product: Product): string[] {
  if (product.imageUrls.length > 0) return product.imageUrls;
  if (product.imageUrl) return [product.imageUrl];
  return [];
}

export function cartLineTotal(line: CartLine): number {
  return (line.product.price || 0) * line.quantity;
}
