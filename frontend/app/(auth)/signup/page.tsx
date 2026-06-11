'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { authApi } from '@/lib/api-client';

/** Port of lib/features/auth/sign_up_screen.dart */
export default function SignUpPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.register({
        businessName: businessName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });

      // Save token in cookie (30 days expiry)
      document.cookie = `token=${res.accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

      router.replace('/home');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
          <h1 className="font-serif text-3xl font-semibold lg:text-4xl">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary lg:text-base">
            Register as a wholesale buyer
          </p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6 lg:p-8">
          <input
            className="input-field"
            placeholder="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
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
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password (min 6 characters)"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="flex flex-col space-y-2 text-center lg:text-left">
          <p className="text-sm text-text-secondary lg:text-base">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-maroon hover:text-maroon-dark">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-text-secondary">
            By registering, you agree to our{' '}
            <Link href="/privacy" className="font-semibold text-maroon hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
