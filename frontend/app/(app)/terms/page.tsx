import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Swastik Fashion',
  description: 'Review the official terms of service, wholesale buyer agreements, and portal rules for purchasing sarees, kurtas, and ethnic wear in bulk from Swastik Fashion.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8 animate-slide-up">
        {/* Back Navigation */}
        <div>
          <Link
            href="/home"
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
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-divider pb-6 space-y-2">
          <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
            Terms & Conditions
          </h1>
          <p className="text-sm text-text-secondary md:text-base">
            Please read these terms carefully before using the Swastik Fashion buyer portal.
          </p>
        </div>

        {/* Terms Content */}
        <div className="card p-6 md:p-10 space-y-6">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">1. Agreement to Terms</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              By accessing or using the Swastik Fashion wholesale platform, you agree to comply with and be bound by these Terms & Conditions. If you represent a registered business or purchasing entity, your agreement binds the business to these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">2. Registration & Account Security</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Purchases are restricted to authenticated commercial buyers. You agree to provide accurate business registration details, contact numbers, and delivery addresses during signup. You are solely responsible for maintaining the confidentiality of your credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">3. Catalog Ordering & Price Quotes</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              All listed product pricing is wholesale-oriented. Products sold in "Saree Sets" or bulk design bundles must be ordered in full set multiples unless specified. We reserve the right to cancel orders arising from catalog listing errors, sudden supply shocks, or pricing inaccuracies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">4. Payment Terms</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Orders are generated on the portal and formatted into a direct message to our managers via WhatsApp. Final invoices (including packaging, freight, and applicable GST charges) will be sent to you by our managers. Orders will be released for transport dispatch only after full receipt of the invoiced bank transfer or digital deposit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">5. Intellectual Property</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              All design catalogs, photographs, logo marks, graphics, and descriptions on this portal are the property of Swastik Fashion. Registered retail clients are permitted to use product images for marketing and selling purposes related to inventory purchased directly from us.
            </p>
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
