'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
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

  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    
    const initGoogle = () => {
      const g = (window as any).google;
      if (!g || !g.accounts || !g.accounts.id) return;
      
      g.accounts.id.initialize({
        client_id: '1069466589231-stup0l4vshllutbjudvjq9fogokdpg7s.apps.googleusercontent.com',
        callback: async (response: any) => {
          if (!response || !response.credential) return;
          setError(null);
          setLoading(true);
          try {
            const res = await authApi.googleLogin(response.credential);
            // Save token in cookie (30 days expiry)
            document.cookie = `token=${res.accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
            
            router.replace(next);
            router.refresh();
          } catch (err: any) {
            setError(err.message || 'Google authentication failed.');
            setLoading(false);
          }
        },
      });

      const btnEl = document.getElementById('google-signin-btn');
      if (btnEl) {
        g.accounts.id.renderButton(btnEl, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 320,
        });
      }
    };

    if (!(window as any).google) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, [router, next]);

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
    <div className="flex min-h-screen lg:bg-cream">
      <AuthBrandPanel />

      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md space-y-6 lg:max-w-lg lg:space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="font-serif text-3xl font-semibold lg:text-4xl">Welcome back</h1>
            <p className="mt-2 text-sm text-text-secondary lg:text-base">
              Sign in to place wholesale orders
            </p>
          </div>

          <div className="card p-6 lg:p-8 space-y-4">
            <form onSubmit={onSubmit} className="space-y-4">
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

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-divider"></div>
              </div>
              <span className="relative bg-white px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                or
              </span>
            </div>

            <div className="flex justify-center w-full min-h-[44px]">
              <div id="google-signin-btn" className="w-full flex justify-center"></div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <p className="text-sm text-text-secondary lg:text-base">
              New buyer?{' '}
              <Link href="/signup" className="font-semibold text-maroon hover:text-maroon-dark">
                Create account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <p className="text-xs text-text-secondary">
                <Link href="/privacy" className="font-semibold text-maroon hover:underline">
                  Privacy Policy
                </Link>
              </p>
              <span className="text-xs text-text-secondary">·</span>
              <p className="text-xs text-text-secondary">
                <Link href="/data-deletion" className="font-semibold text-red-600 hover:underline">
                  🗑️ Delete My Data
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
