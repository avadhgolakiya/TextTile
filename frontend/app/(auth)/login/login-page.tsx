'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { authApi } from '@/lib/api-client';

/** Port of lib/features/auth/login_screen.dart */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/home';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(email.trim(), password);
      // Save token in cookie (30 days expiry)
      document.cookie = `token=${res.accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      
      router.replace(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to place wholesale orders
          </p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          New buyer?{' '}
          <Link href="/signup" className="font-semibold text-maroon">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
