import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Swastik Fashion | Premium Clothing Store in India',
  description: 'Shop premium men\'s, women\'s and kids fashion online at Swastik Fashion. Best quality clothing with affordable prices across India.',
  keywords: [
    'Swastik Fashion',
    'Swastik Fashion India',
    'Swastik Fashion Ahmedabad',
    'Online Clothing Store',
    'Fashion Store India',
    'Men Clothing',
    'Women Clothing',
    'Kids Clothing',
    'Wholesale Garments',
    'Designer Clothes',
    'Ethnic Wear',
    'Western Wear',
    'Fashion Shopping',
    'Buy Clothes Online',
  ],
  openGraph: {
    title: 'Swastik Fashion | Premium Clothing Store in India',
    description: 'Shop premium men\'s, women\'s and kids fashion online at Swastik Fashion. Best quality clothing with affordable prices across India.',
    url: 'https://swastikfashion.com/home',
    siteName: 'Swastik Fashion',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Swastik Fashion logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swastik Fashion | Premium Clothing Store in India',
    description: 'Premium Fashion Store in India',
    images: ['/logo.png'],
  },
};

export default function Page() {
  return <HomeClient />;
}
