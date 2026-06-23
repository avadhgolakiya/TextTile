import { cookies } from 'next/headers';
import { authApi } from '@/lib/api-client';
import { AppBottomNav } from '@/components/AppBottomNav';
import { AppSidebar } from '@/components/AppSidebar';
import { CartFab } from '@/components/CartFab';
import { NotificationSetup } from '@/components/NotificationSetup';
import { BlockChecker } from '@/components/BlockChecker';
import { Footer } from '@/components/Footer';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let isAdmin = false;
  let isLoggedIn = false;
  if (token) {
    isLoggedIn = true;
    try {
      const { user } = await authApi.me(token);
      isAdmin = user.isAdmin ?? false;
    } catch (err) {
      console.error('Failed to fetch user profile in AppLayout:', err);
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-20 lg:pb-0">
      <AppSidebar isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="lg:mx-auto lg:max-w-7xl lg:px-10 lg:py-8 flex-1 w-full">
          <CartFab />
          <NotificationSetup />
          <BlockChecker />
          {children}
        </main>
        <Footer />
      </div>
      <AppBottomNav isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
    </div>
  );
}
