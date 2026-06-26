'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'info' | 'confirm' | 'submitted';

export default function DataDeletionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('submitted');
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-2xl space-y-8 animate-slide-up">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-semibold text-maroon hover:text-maroon-dark transition-colors duration-200 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="mr-2"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Go Back
        </button>

        {/* Header */}
        <div className="border-b border-divider pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🗑️</span>
            <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
              Data Deletion Request
            </h1>
          </div>
          <p className="text-sm text-text-secondary md:text-base mt-1">
            We respect your right to privacy. Submit a request below and we will permanently delete your account and all associated data within 30 days.
          </p>
        </div>

        {/* Step: Info */}
        {step === 'info' && (
          <div className="space-y-6">
            {/* What gets deleted */}
            <div className="card p-6 md:p-8 space-y-4">
              <h2 className="font-serif text-xl font-semibold text-maroon">What will be deleted</h2>
              <ul className="space-y-3">
                {[
                  { icon: '👤', label: 'Your account profile', sub: 'Business name, email, phone number' },
                  { icon: '📦', label: 'Your order history', sub: 'All past orders and cart data' },
                  { icon: '🔖', label: 'Your saved products', sub: 'All wishlist / saved items' },
                  { icon: '🔔', label: 'Push notification tokens', sub: 'FCM device registration tokens' },
                  { icon: '🔑', label: 'Login credentials', sub: 'Password hash or linked Google account' },
                ].map((item) => (
                  <li key={item.icon} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{item.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warning */}
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <div>
                <p className="font-bold text-red-800 text-sm">This action is permanent</p>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  Once submitted, your data cannot be recovered. Any active orders at the time of deletion will be cancelled.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('confirm')}
              className="w-full rounded-full border-2 border-red-300 bg-surface py-4 text-sm font-bold text-red-700 transition hover:bg-red-50 hover:border-red-400 cursor-pointer"
            >
              Continue to Deletion Request →
            </button>
          </div>
        )}

        {/* Step: Confirm / Form */}
        {step === 'confirm' && (
          <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
            <h2 className="font-serif text-xl font-semibold text-maroon">Confirm your identity</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Enter the email address associated with your account. We will process your deletion request within <strong>30 business days</strong>.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary" htmlFor="del-email">
                Account Email *
              </label>
              <input
                id="del-email"
                className="input-field"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary" htmlFor="del-reason">
                Reason for deletion (optional)
              </label>
              <textarea
                id="del-reason"
                className="input-field min-h-[100px] resize-none"
                placeholder="E.g. No longer using the service, privacy concerns…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            {/* Final confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" required className="mt-1 accent-maroon" />
              <span className="text-sm text-text-secondary leading-relaxed group-hover:text-text-primary transition">
                I understand this will permanently delete my Swastik Fashion account and all associated data. This action cannot be undone.
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="flex-1 rounded-full border border-divider bg-surface py-3 text-sm font-semibold text-text-secondary transition hover:bg-cream-deep cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-full bg-red-700 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Submitting…' : 'Submit Deletion Request'}
              </button>
            </div>
          </form>
        )}

        {/* Step: Submitted */}
        {step === 'submitted' && (
          <div className="card p-8 md:p-12 text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
              ✅
            </div>
            <h2 className="font-serif text-2xl font-bold text-text-primary">Request Received</h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
              Your data deletion request for <strong>{email}</strong> has been submitted. We will permanently delete your account and all data within <strong>30 business days</strong> and send a confirmation to your email.
            </p>
            <div className="rounded-2xl bg-cream-deep px-5 py-4 text-left space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Reference</p>
              <p className="text-xs text-text-primary font-mono break-all">
                DEL-{Date.now()}-{email.split('@')[0].toUpperCase().slice(0, 6)}
              </p>
            </div>
            <Link
              href="/home"
              className="inline-block mt-2 text-sm font-semibold text-maroon hover:text-maroon-dark transition"
            >
              Return to home →
            </Link>
          </div>
        )}

        {/* Footer links */}
        <div className="text-center text-xs text-text-secondary space-x-3">
          <Link href="/privacy" className="hover:text-maroon transition font-semibold">Privacy Policy</Link>
          <span>·</span>
          <span>&copy; {new Date().getFullYear()} Swastik Fashion</span>
        </div>

      </div>
    </div>
  );
}
