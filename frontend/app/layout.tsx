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
  title: 'Swastik Fashion — Wholesale Sarees',
  description: 'Wholesale buyer app for Swastik Fashion',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Swastik Fashion',
  },
  verification: {
    google: 'Zvv_VSBHeZvtnX_jl2Df_V3CMM8-Kug9k70xzP2M-CQ',
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
