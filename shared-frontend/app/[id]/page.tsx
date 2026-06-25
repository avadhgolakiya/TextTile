import type { Metadata } from 'next';
import SharedCollectionClient from './SharedCollectionClient';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://texttile.onrender.com';
  
  try {
    const res = await fetch(`${API_BASE}/api/collections/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      const products = data.products || [];
      if (products.length > 0) {
        const firstProduct = products[0];
        const imageUrl = firstProduct.imageUrl;
        let fullImageUrl = imageUrl;
        
        if (imageUrl && !imageUrl.startsWith('http')) {
          const uploadsIdx = imageUrl.indexOf('/uploads/');
          if (uploadsIdx !== -1) {
            const filename = imageUrl.substring(uploadsIdx + '/uploads/'.length);
            fullImageUrl = `${API_BASE}/uploads/${filename}`;
          } else {
            fullImageUrl = `${API_BASE}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }
        }
        
        return {
          title: `Shared Products Collection`,
          description: `Check out these ${products.length} products from Swastik Fashion!`,
          openGraph: {
            title: `Shared Products Collection`,
            description: `Check out these ${products.length} products from Swastik Fashion!`,
            images: fullImageUrl ? [{ url: fullImageUrl }] : [],
          },
          twitter: {
            card: 'summary_large_image',
            title: `Shared Products Collection`,
            description: `Check out these ${products.length} products from Swastik Fashion!`,
            images: fullImageUrl ? [fullImageUrl] : [],
          }
        };
      }
    }
  } catch (err) {
    console.error('Error generating metadata:', err);
  }
  
  return {
    title: 'Shared Collection',
    description: 'Carefully selected items from Swastik Fashion',
  };
}

export default function Page({ params }: Props) {
  return <SharedCollectionClient id={params.id} />;
}
