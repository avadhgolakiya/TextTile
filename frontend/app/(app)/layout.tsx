import { cookies } from 'next/headers';
import { authApi } from '@/lib/api-client';
import { AppBottomNav } from '@/components/AppBottomNav';
import { AppSidebar } from '@/components/AppSidebar';
import { CartFab } from '@/components/CartFab';
import { NotificationSetup } from '@/components/NotificationSetup';

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
      <div className="lg:pl-64">
        <main className="lg:mx-auto lg:max-w-7xl lg:px-10 lg:py-8">
          <CartFab />
          <NotificationSetup />
          {children}
        </main>
      </div>
      <AppBottomNav isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
    </div>
  );
}
