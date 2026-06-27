import type { Metadata } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/Toaster';
import { PwaInstaller } from '@/components/PwaInstaller';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: 'Swastik Fashion – Wholesale Sarees & Ethnic Wear',
    template: '%s | Swastik Fashion',
  },
  description:
    'Swastik Fashion is a leading wholesale supplier of sarees, lehengas, salwar suits & ethnic wear. Buy in bulk at best prices.',
  keywords: [
    'swastik fashion',
    'swastikfashion',
    'wholesale sarees',
    'wholesale ethnic wear',
    'saree wholesale supplier',
    'lehenga wholesale',
    'salwar suit wholesale',
    'indian ethnic wear bulk',
    'swastik fashion sarees',
  ],
  metadataBase: new URL('https://swastikfashion.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Swastik Fashion – Wholesale Sarees & Ethnic Wear',
    description: 'Leading wholesale supplier of sarees & ethnic wear.',
    url: 'https://swastikfashion.com',
    siteName: 'Swastik Fashion',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swastik Fashion – Wholesale Sarees & Ethnic Wear',
    description: 'Leading wholesale supplier of sarees & ethnic wear.',
    images: ['/logo.png'],
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'Zvv_VSBHeZvtnX_jl2Df_V3CMM8-Kug9k70xzP2M-CQ',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Swastik Fashion',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${poppins.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>
            {children}
            <Toaster />
            <PwaInstaller />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
