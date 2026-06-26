import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Swastik Fashion | B2B Wholesale Sarees Marketplace Surat',
  description: 'Buy premium wholesale sarees directly from Swastik Fashion in Surat. Explore the best quality catalog of designer sarees, print sarees, and bridal wear for retail shops at wholesale rates.',
  keywords: ['wholesale sarees', 'surat saree market', 'B2B saree marketplace', 'Swastik Fashion sarees', 'designer sarees wholesale'],
  openGraph: {
    title: 'Swastik Fashion | B2B Wholesale Sarees Marketplace Surat',
    description: 'Buy premium wholesale sarees directly from Swastik Fashion in Surat. Explore the best quality catalog of designer sarees, print sarees, and bridal wear for retail shops at wholesale rates.',
    url: 'https://swastikfashion.com/home',
    siteName: 'Swastik Fashion',
    images: [
      {
        url: '/logo.jpg',
        width: 800,
        height: 600,
        alt: 'Swastik Fashion wholesale sarees logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swastik Fashion | B2B Wholesale Sarees Marketplace Surat',
    description: 'Buy premium wholesale sarees directly from Swastik Fashion in Surat.',
    images: ['/logo.jpg'],
  },
};

export default function Page() {
  return <HomeClient />;
}
