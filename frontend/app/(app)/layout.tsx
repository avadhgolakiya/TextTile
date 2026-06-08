import { cookies } from 'next/headers';
import { authApi } from '@/lib/api-client';
import { AppBottomNav } from '@/components/AppBottomNav';
import { CartFab } from '@/components/CartFab';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  let isAdmin = false;
  if (token) {
    try {
      const { user } = await authApi.me(token);
      isAdmin = user.isAdmin ?? false;
    } catch (err) {
      console.error('Failed to fetch user profile in AppLayout:', err);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <CartFab />
      {children}
      <AppBottomNav isAdmin={isAdmin} />
    </div>
  );
}
