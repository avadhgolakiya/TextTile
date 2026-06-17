import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shared Collection',
  description: 'View this shared product collection.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Shared Collection',
  },
};

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
