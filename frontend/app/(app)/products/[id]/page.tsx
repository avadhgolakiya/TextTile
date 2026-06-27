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
        
        const titleStr = `Buy ${product.name} | Swastik Fashion`;
        const descStr = `Buy premium ${product.name.toLowerCase()} online from Swastik Fashion. ${
          product.description || product.subtitle || `Available in high-quality materials and wholesale quantities with fast delivery across India.`
        }`;

        return {
          title: titleStr,
          description: descStr,
          openGraph: {
            title: titleStr,
            description: descStr,
            url: `https://swastikfashion.com/products/${product.id}`,
            images: fullImageUrl ? [{ url: fullImageUrl, alt: product.name }] : [],
          },
          twitter: {
            card: 'summary_large_image',
            title: titleStr,
            description: descStr,
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
    description: 'Buy premium clothing online from Swastik Fashion. Quality products at best prices.',
  };
}

export default async function Page({ params }: Props) {
  const id = params.id;
  const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://texttile.onrender.com';
  
  let product: any = null;
  try {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      product = data.product;
    }
  } catch (err) {
    console.error('Error fetching product for schema:', err);
  }

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.name,
              "image": product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API_BASE}${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`) : undefined,
              "description": product.description || product.subtitle || `Buy ${product.name} wholesale online from Swastik Fashion. Available across India.`,
              "sku": product.id,
              "offers": {
                "@type": "Offer",
                "priceCurrency": "INR",
                "price": product.price || 0,
                "availability": product.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                "url": `https://swastikfashion.com/products/${product.id}`
              }
            })
          }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
