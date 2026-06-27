'use client';

import { useState } from 'react';
import Link from 'next/link';

type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqClient() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "Are prices listed on the site wholesale or retail?",
      answer: "All catalog prices displayed on our portal are wholesale prices. We are primarily a manufacturer and wholesale clothing publisher serving business owners, boutiques, and bulk buyers across India."
    },
    {
      question: "What is the minimum order quantity (MOQ) policy?",
      answer: "We support low wholesale startup thresholds. Buyers can purchase individual Saree/Suit sets or design bundles (usually comprising 4 to 8 color variants of a design) as displayed in each product listing. Price quotes depend directly on the volumes ordered."
    },
    {
      question: "How do I place an order and pay?",
      answer: "Browse our catalogs, add selected items to your cart, and click checkout. The portal generates a structured purchase summary that you send directly to our managers on WhatsApp. Our managers will verify active stock, add actual transport costs, and send you the tax invoice with bank transfer coordinates for payment."
    },
    {
      question: "Do you provide custom design stitching or private branding?",
      answer: "Yes, for larger custom orders (usually above 100 sets per design), we offer customized textile manufacturing, design stitching, and custom private label packaging. Please reach out to Dineshbhai directly to discuss commercial volume requirements."
    },
    {
      question: "Can I inspect the products physically before purchasing?",
      answer: "Yes, you are welcome to visit our wholesale markets and showroom centers in Ahmedabad and Surat, Gujarat, to evaluate fabric quality and explore our latest seasonal drops."
    },
    {
      question: "What happens if a product is received in damaged condition?",
      answer: "If any item arrives with manufacturing defects or transit damage, please record an unboxing video and send it to our operations manager, Daxeshbhai, within 7 days of delivery. We will arrange return pick-up and issue store credits or replacements."
    }
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">
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
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-text-secondary md:text-base">
            Answers to common questions about wholesale shopping, accounts, and shipping.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="card border border-divider overflow-hidden transition-all duration-300 bg-white/80"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between p-5 text-left font-serif font-bold text-text-primary hover:text-maroon transition duration-200 focus:outline-none"
                >
                  <span className="text-base md:text-lg">{faq.question}</span>
                  <span className="text-xl text-maroon ml-4 transition-transform duration-300 transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                    ▼
                  </span>
                </button>
                
                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: isOpen ? '300px' : '0px',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <div className="p-5 pt-0 text-text-secondary text-sm md:text-base border-t border-divider/40 leading-relaxed bg-cream-deep/20">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
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
