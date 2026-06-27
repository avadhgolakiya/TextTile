import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Swastik Fashion',
  description: 'Discover the story of Swastik Fashion. Learn how we manufacture and curate premium sarees, ethnic wear, and wholesale garments with superior quality and competitive pricing across India.',
};

export default function AboutUsPage() {
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
            About Swastik Fashion
          </h1>
          <p className="text-sm text-text-secondary md:text-base">
            Crafting premium Indian fashion for over two decades.
          </p>
        </div>

        {/* Content Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6 md:p-8 space-y-4">
            <span className="text-3xl">✦</span>
            <h2 className="font-serif text-2xl font-bold text-maroon">Our Story</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Established in Ahmedabad, Gujarat, <strong>Swastik Fashion</strong> has grown from a local boutique house into one of India’s most trusted wholesale and retail destinations for premium fashion. We specialize in bringing together traditional craftsmanship and contemporary designs, delivering exceptional quality ethnic wear, western apparel, and wholesale designer garments across India.
            </p>
          </div>

          <div className="card p-6 md:p-8 space-y-4">
            <span className="text-3xl">🧵</span>
            <h2 className="font-serif text-2xl font-bold text-maroon">Our Craftsmanship</h2>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Every garment in our catalog is curated with meticulous attention to detail. We work closely with master weavers, skilled tailors, and textile printers to offer premium sarees, traditional kurtas, and elegant western wear that showcase the rich diversity of Indian fabrics. Our commitment to fabric authenticity is our brand’s core hallmark.
            </p>
          </div>
        </div>

        <div className="card p-6 md:p-10 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-maroon text-center">Why Retailers & Buyers Trust Us</h2>
          
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-maroon text-2xl font-bold">100% Quality</div>
              <p className="text-text-secondary text-xs md:text-sm">Rigorous physical checks on all wholesale batches before dispatch.</p>
            </div>
            <div className="text-center space-y-2 border-y sm:border-y-0 sm:border-x border-divider py-4 sm:py-0">
              <div className="text-maroon text-2xl font-bold">Best Price</div>
              <p className="text-text-secondary text-xs md:text-sm">Direct factory prices that ensure healthy markup margins for retail partners.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-maroon text-2xl font-bold">Pan-India Delivery</div>
              <p className="text-text-secondary text-xs md:text-sm">Reliable logistics partners providing safe, rapid shipping to all pincodes.</p>
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
