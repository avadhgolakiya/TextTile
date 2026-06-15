'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { authApi } from '@/lib/api-client';
import { useTranslation } from '@/lib/language-store';

/** Port of lib/features/auth/login_screen.dart */
export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/home';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(identifier, password);
      // Save token in cookie (30 days expiry)
      document.cookie = `token=${res.accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      router.replace(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Incorrect credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen lg:bg-cream">
      <AuthBrandPanel />

      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md space-y-6 lg:max-w-lg lg:space-y-8">
        <div className="text-center lg:text-left">
          <h1 className="font-serif text-3xl font-semibold lg:text-4xl">{t('loginTitle')}</h1>
          <p className="mt-2 text-sm text-text-secondary lg:text-base">
            {t('loginSubtitle')}
          </p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6 lg:p-8">
          {/* Email or Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Email or Mobile Number
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. user@example.com or 9876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <input
            className="input-field"
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '...' : t('signIn')}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary lg:text-left lg:text-base">
          {t('dontHaveAccount')}{' '}
          <Link href="/signup" className="font-semibold text-maroon hover:text-maroon-dark">
            {t('registerNow')}
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
