'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { authApi } from '@/lib/api-client';

const FB_APP_ID = '2064272007513102';

/** Port of lib/features/auth/login_screen.dart */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/home';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fbReady, setFbReady] = useState(false);

  // ── Google Identity Services ──────────────────────────────────────────────
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
          width: btnEl.clientWidth || 320,
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

  // ── Facebook SDK ──────────────────────────────────────────────────────────
  useEffect(() => {
    if ((window as any).FB) {
      // SDK already loaded (e.g. hot-reload), just init
      (window as any).FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: 'v20.0' });
      setFbReady(true);
      return;
    }

    // MUST set fbAsyncInit BEFORE injecting the script tag so Facebook
    // SDK calls it immediately after it finishes loading.
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({ appId: FB_APP_ID, cookie: true, xfbml: false, version: 'v20.0' });
      setFbReady(true);
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    // Enable button even if the SDK fails to load (e.g. ad-blocker)
    // – handleFacebookLogin will show a readable error in that case.
    script.onerror = () => setFbReady(true);
    document.body.appendChild(script);
  }, []);

  async function handleFacebookLogin() {
    const FB = (window as any).FB;
    if (!FB) {
      setError('Facebook is not available. Please disable any ad-blocker and refresh the page.');
      return;
    }
    setError(null);
    setLoading(true);

    FB.login(
      async (response: any) => {
        if (!response || response.status !== 'connected' || !response.authResponse?.accessToken) {
          // User cancelled or popup was blocked
          setError('Facebook login was cancelled. Make sure pop-ups are allowed for this site.');
          setLoading(false);
          return;
        }
        try {
          const res = await authApi.facebookLogin(response.authResponse.accessToken);
          document.cookie = `token=${res.accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          router.replace(next);
          router.refresh();
        } catch (err: any) {
          setError(err.message || 'Facebook authentication failed.');
          setLoading(false);
        }
      },
      { scope: 'public_profile,email' }
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(email.trim(), password);
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

            {/* Divider */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-divider"></div>
              </div>
              <span className="relative bg-white px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                or continue with
              </span>
            </div>

            {/* Social login buttons */}
            <div className="flex flex-col gap-3">
              {/* Google */}
              <div className="flex justify-center w-full min-h-[44px]">
                <div id="google-signin-btn" className="w-full flex justify-center"></div>
              </div>

              {/* Facebook */}
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={!fbReady || loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#1877F2] bg-[#1877F2] py-3 px-4 text-sm font-semibold text-white transition hover:bg-[#166fe5] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {/* Facebook icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
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
