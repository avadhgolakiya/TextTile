import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Consignment Shipping Policy | Swastik Fashion',
  description: 'Read our wholesale shipping policy. Learn about packing standards, transport agency partnerships, dispatch timelines, and delivery times across India.',
};

export default function ShippingPolicyPage() {
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
            Shipping Policy
          </h1>
          <p className="text-sm text-text-secondary md:text-base">
            Understand how wholesale consignment shipping and logistics operate.
          </p>
        </div>

        {/* Shipping details */}
        <div className="card p-6 md:p-10 space-y-6">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">1. Order Processing & Dispatch Timelines</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Once an order is confirmed and invoice payment has cleared, the consignment will be securely packed and dispatched from our warehouse within **24 to 48 hours** (except Sundays and national holidays). Tracking bills will be sent to you via email or WhatsApp.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">2. Logistics Partners & Packaging</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Wholesale shipments are wrapped in heavy-duty weatherproof tarpaulin or double-corrugated cardboard boxes to prevent moisture or dust ingress. We ship via leading road transport companies (VRL, TCI, SafeExpress) and express couriers (Delhivery, BlueDart) to ensure safe handling.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">3. Estimated Delivery Times</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Delivery timelines vary depending on distance and transportation methods:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-secondary text-sm md:text-base">
              <li><strong>Within Gujarat:</strong> 2 to 3 Business Days</li>
              <li><strong>Metro Cities & Major Commercial Hubs:</strong> 4 to 6 Business Days</li>
              <li><strong>Rest of India (Interior regions & North-East):</strong> 7 to 10 Business Days</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-maroon">4. Shipping Charges & Taxes</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              All wholesale transport and shipping charges are paid by the buyer, calculated based on package weight and dimensions. Packing costs are covered by Swastik Fashion. Necessary GST invoices and E-Way bills are generated and shipped along with the consignment as required by Indian customs rules.
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
