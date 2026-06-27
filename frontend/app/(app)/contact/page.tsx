import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | Swastik Fashion',
  description: 'Get in touch with Swastik Fashion\'s official customer support and sales managers. Contact Daxeshbhai and Dineshbhai for orders, custom catalog prices, and address details.',
};

export default function ContactUsPage() {
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
            Contact Us
          </h1>
          <p className="text-sm text-text-secondary md:text-base">
            Get in touch with the Swastik Fashion support and sales management teams.
          </p>
        </div>

        {/* Support contacts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Manager 1 */}
          <div className="card p-6 space-y-4 border border-divider">
            <div>
              <div className="text-xs uppercase tracking-widest text-text-secondary">Sales & Ordering</div>
              <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">Dineshbhai</h2>
              <p className="text-text-secondary text-sm">Managing direct bulk ordering, design custom catalog pricing, and custom fabrics.</p>
            </div>
            <div className="pt-2">
              <span className="block font-semibold text-text-primary text-sm mb-3">📞 +91 88495 02490</span>
              <div className="flex gap-2">
                <a
                  href="tel:+918849502490"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-maroon text-white hover:bg-maroon-dark text-xs font-bold rounded-xl text-center transition"
                >
                  Call Now
                </a>
                <a
                  href="https://wa.me/918849502490"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-green-600 text-white hover:bg-green-700 text-xs font-bold rounded-xl text-center transition"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Manager 2 */}
          <div className="card p-6 space-y-4 border border-divider">
            <div>
              <div className="text-xs uppercase tracking-widest text-text-secondary">Operations & Support</div>
              <h2 className="font-serif text-2xl font-bold text-text-primary mt-1">Daxeshbhai</h2>
              <p className="text-text-secondary text-sm">Handling order statuses, dispatch details, transport tracking, and payment receipts.</p>
            </div>
            <div className="pt-2">
              <span className="block font-semibold text-text-primary text-sm mb-3">📞 +91 99228 238292</span>
              <div className="flex gap-2">
                <a
                  href="tel:+9199228238292"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-maroon text-white hover:bg-maroon-dark text-xs font-bold rounded-xl text-center transition"
                >
                  Call Now
                </a>
                <a
                  href="https://wa.me/9199228238292"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-green-600 text-white hover:bg-green-700 text-xs font-bold rounded-xl text-center transition"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Address & Details */}
        <div className="card p-6 md:p-10 space-y-6">
          <h2 className="font-serif text-xl font-bold text-maroon">Office & Showroom Details</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">📍 Store Address</span>
                <p className="text-text-primary text-sm md:text-base leading-relaxed mt-1">
                  <strong>Swastik Fashion</strong><br />
                  Surat & Ahmedabad Textile Markets,<br />
                  Gujarat, India.
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">✉️ Email Support</span>
                <a
                  href="mailto:support@swastikfashion.com"
                  className="text-gold hover:underline text-sm md:text-base block mt-1"
                >
                  support@swastikfashion.com
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">⏰ Business Hours</span>
                <p className="text-text-primary text-sm md:text-base mt-1">
                  Monday to Saturday: 10:00 AM - 8:00 PM IST<br />
                  Sunday: Closed
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-cream-deep hover:bg-divider border border-divider px-4 py-2.5 text-xs font-bold text-text-primary transition"
                >
                  📍 Open in Google Maps
                </a>
              </div>
            </div>
          </div>
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
