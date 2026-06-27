import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Swastik Fashion | Premium Clothing Store in India',
  description: 'Shop premium men\'s, women\'s and kids fashion online at Swastik Fashion. Best quality clothing with affordable prices across India.',
  keywords: [
    'swastik fashion',
    'swastikfashion',
    'fashion swastik',
    'swastik fashion online',
    'swastik fashion india',
    'official swastik fashion',
    'swastik clothing',
    'swastik boutique supplier',
    'swastik fashion website',
    'wholesale sarees',
    'wholesale sarees surat',
    'wholesale sarees india',
    'saree wholesale market',
    'designer sarees wholesale',
    'surat saree wholesale',
    'wholesale lehenga',
    'wholesale kurtis',
    'wholesale salwar suits',
    'wholesale ethnic wear',
    'bulk clothing supplier india',
    'wholesale garments ahmedabad',
    'premium clothing store india',
    'buy clothes online india',
    'online fashion store india',
    'ethnic wear online',
    'designer clothing bulk',
    'swastik fashion ahmedabad',
    'swastik fashion surat',
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
