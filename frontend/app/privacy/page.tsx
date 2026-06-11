'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream px-4 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">
        {/* Back navigation */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-semibold text-maroon hover:text-maroon-dark transition-colors duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Go Back
          </button>
        </div>

        {/* Page Header */}
        <div className="border-b border-divider pb-6 text-center md:text-left space-y-2">
          <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-text-secondary md:text-base">
            Last Updated: June 11, 2026
          </p>
        </div>

        {/* Policy Content Card */}
        <div className="card p-6 md:p-10 space-y-8">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-maroon md:text-2xl">
              1. Introduction
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Swastik Fashion ("we", "our", or "us") operates the wholesale buyer web platform. We are committed to protecting the privacy and security of our buyers and administrators. This Privacy Policy details how we collect, process, and protect your information when you register, log in, or interact with our wholesale ordering application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-maroon md:text-2xl">
              2. Information We Collect
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              To facilitate efficient wholesale order creation and real-time updates, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm md:text-base">
              <li>
                <strong>Account Information:</strong> Your business name, email address, password hash, and phone number when registering manually or logging in via Google OAuth.
              </li>
              <li>
                <strong>Google Profile Data:</strong> When signing in with Google, we securely receive your name, email, and authentication tokens to automatically create or access your profile.
              </li>
              <li>
                <strong>Order & Cart Logs:</strong> Selected sarees, suits, cart quantities, order history, and total checkout amounts.
              </li>
              <li>
                <strong>Push Notification Tokens:</strong> Firebase Cloud Messaging (FCM) tokens required to deliver real-time stock updates, new product notifications, and order status alerts to your device.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-maroon md:text-2xl">
              3. How We Use Your Information
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              We utilize the collected information to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm md:text-base">
              <li>Authenticate users and secure wholesale accounts from unauthorized access.</li>
              <li>Provide seamless order generation and display customized price quotes.</li>
              <li>Send WhatsApp checkout templates pre-loaded with selected product descriptions and image URLs.</li>
              <li>Deliver real-time push alerts featuring product imagery and stock alerts even when your browser runs in the background.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-maroon md:text-2xl">
              4. Data Sharing & Third Parties
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              We respect your data privacy and do not sell or lease your business details. Information is shared only under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm md:text-base">
              <li>
                <strong>WhatsApp Checkout:</strong> When submitting an order, your cart details are formatted into a message that you send directly to our administrator's WhatsApp.
              </li>
              <li>
                <strong>Google Identity Services:</strong> We verify your authentication token directly with Google APIs to validate your credentials.
              </li>
              <li>
                <strong>Firebase Cloud Messaging:</strong> Push notification tokens are registered with Google Firebase servers to dispatch device alerts.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-maroon md:text-2xl">
              5. Data Retention & Security
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              We maintain standard security protocols to store and protect your credentials and orders. Sessions are protected via JWT tokens stored in your browser's secure cookies. You can manage or revoke access to your background notification settings directly from your system preferences.
            </p>
          </section>

          <section className="space-y-3 border-t border-divider pt-6">
            <h2 className="font-serif text-xl font-semibold text-maroon md:text-2xl">
              6. Contact & Data Deletion
            </h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              If you wish to view, update, or request the complete deletion of your account and personal details from our records, please reach out to us at{' '}
              <a
                href="mailto:support@swastikfashion.example.com"
                className="font-semibold text-gold hover:underline"
              >
                support@swastikfashion.example.com
              </a>{' '}
              or message our administrator directly.
            </p>
            <div className="pt-2">
              <Link
                href="/data-deletion"
                className="inline-flex items-center gap-2 rounded-full border-2 border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 hover:border-red-300"
              >
                🗑️ Request Data Deletion
              </Link>
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Swastik Fashion. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
