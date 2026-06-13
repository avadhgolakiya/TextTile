import type { Metadata } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/Toaster';
import { PwaInstaller } from '@/components/PwaInstaller';
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
  title: 'Swastik Fashion — Wholesale Sarees',
  description: 'Wholesale buyer app for Swastik Fashion',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${poppins.variable}`}>
        <ErrorBoundary>
          {children}
          <Toaster />
          <PwaInstaller />
        </ErrorBoundary>
      </body>
    </html>
  );
}
