import { Metadata } from 'next';

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://texttile.onrender.com';
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(params.id)}`, {
      cache: 'no-store'
    });
    if (!res.ok) return {};
    const { product } = await res.json();
    
    if (!product) return {};

    const imageUrl = product.imageUrls?.[0] || product.imageUrl;

    return {
      title: product.name,
      description: product.subtitle || `Check out ${product.name} at Swastik Fashion`,
      openGraph: {
        title: product.name,
        description: product.subtitle || `Code: ${product.id}`,
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
    };
  } catch (err) {
    console.error('Failed to generate metadata:', err);
    return {};
  }
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
