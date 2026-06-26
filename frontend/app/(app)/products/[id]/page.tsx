import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://texttile.onrender.com';
  
  try {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const { product } = await res.json();
      if (product) {
        const imageUrl = product.imageUrl;
        let fullImageUrl = imageUrl;
        if (imageUrl && !imageUrl.startsWith('http')) {
          fullImageUrl = `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        return {
          title: `${product.name} | Swastik Fashion Saree B2B`,
          description: product.description || product.subtitle || `Buy ${product.name} wholesale sarees at best bulk price from Surat. Code: ${product.id}`,
          openGraph: {
            title: `${product.name} | Swastik Fashion Saree B2B`,
            description: product.description || product.subtitle || `Buy ${product.name} wholesale sarees at best bulk price from Surat. Code: ${product.id}`,
            url: `https://swastikfashion.com/products/${product.id}`,
            images: fullImageUrl ? [{ url: fullImageUrl, alt: product.name }] : [],
          },
          twitter: {
            card: 'summary_large_image',
            title: `${product.name} | Swastik Fashion Saree B2B`,
            description: product.description || product.subtitle || `Buy ${product.name} wholesale sarees at best bulk price from Surat. Code: ${product.id}`,
            images: fullImageUrl ? [fullImageUrl] : [],
          }
        };
      }
    }
  } catch (err) {
    console.error('Error generating metadata for product:', err);
  }

  return {
    title: 'Product Details | Swastik Fashion',
    description: 'Wholesale B2B saree details page on Swastik Fashion.',
  };
}

export default function Page() {
  return <ProductDetailClient />;
}
