import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Return and Refund Policy | Swastik Fashion',
  description: 'Learn about our quality check protocols, transit damage claims, unboxing video requirements, and store credit processing at Swastik Fashion.',
};

export default function RefundPolicyPage() {
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
            Return & Refund Policy
          </h1>
          <p className="text-sm text-text-secondary md:text-base">
            Detailed information on how returns, replacements, and refunds are managed.
          </p>
        </div>

        {/* Refund Policy details */}
        <div className="card p-6 md:p-10 space-y-6">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">1. Quality Checks & Verification</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              At Swastik Fashion, every piece goes through high-standard visual inspection and packing validation before leaving our manufacturing warehouse. Because our client base is strictly wholesale, we do not support returns based on change of mind once a transaction is successfully finalized.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">2. Damaged or Defective Consignments</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              If any item in your consignment has material fabric defects or manufacturing weaving errors, you are eligible for an immediate replacement or store credit. You must report these defects within **7 days** of delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">3. Damage Claim Process</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              To submit a replacement or damage claim, please follow this process:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-text-secondary text-sm md:text-base">
              <li>Record a clear, unedited video of unpacking the parcel showing the transport package bill and the damage area.</li>
              <li>Send this video clip along with the Invoice copy to your account manager on WhatsApp.</li>
              <li>Once verified, our team will coordinate the return shipping labels and ship your replacements at no extra charge.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">4. Refunds and Store Credit</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              For verified product claims where a duplicate design is unavailable, we will process store credit matching the damaged item value. This store credit can be fully adjusted in your subsequent wholesale catalog order bookings. Cash refunds are issued only under exceptional circumstances.
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
