'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/language-store';
import { ShopContact } from '@/lib/constants/shop-contact';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-maroon-dark text-white pt-12 pb-24 lg:pb-12 mt-12 border-t border-maroon">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Newsletter Section */}
        <div className="border-b border-white/20 pb-10 mb-10 lg:flex lg:justify-between lg:items-center">
          <div className="mb-6 lg:mb-0 lg:max-w-md">
            <h3 className="text-2xl font-serif font-bold text-gold mb-2">Subscribe to our Newsletter</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Sign up for our newsletter and receive updates on new drops, exclusive wholesale deals, and more.
            </p>
          </div>
          <form className="flex max-w-md w-full gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition"
              required
            />
            <button
              type="submit"
              className="bg-gold hover:bg-gold-muted text-maroon-dark font-bold px-6 py-3 rounded-xl transition duration-200 text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="text-gold font-bold mb-4 uppercase tracking-wider text-xs">About Us</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/about" className="hover:text-gold transition">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition">Contact Us</Link></li>
              <li><Link href="/careers" className="hover:text-gold transition">Careers</Link></li>
              <li><Link href="/press" className="hover:text-gold transition">Press</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold font-bold mb-4 uppercase tracking-wider text-xs">Help & Support</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/profile" className="hover:text-gold transition">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-gold transition">Returns & Exchanges</Link></li>
              <li><Link href="/shipping" className="hover:text-gold transition">Shipping Info</Link></li>
              <li><Link href="/faq" className="hover:text-gold transition">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold font-bold mb-4 uppercase tracking-wider text-xs">Policies</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/terms" className="hover:text-gold transition">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-gold transition">Privacy Policy</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-gold transition">Shipping Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-gold transition">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold font-bold mb-4 uppercase tracking-wider text-xs">Follow Us</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a href={ShopContact.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold transition">
                  <span>📸</span> Instagram
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${ShopContact.whatsappOrderDigits}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold transition">
                  <span>💬</span> WhatsApp
                </a>
              </li>
              <li>
                <a href={ShopContact.locationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold transition">
                  <span>📍</span> Store Location
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} {ShopContact.businessName}. All Rights Reserved.
          </p>
          <div className="flex gap-4 opacity-70 grayscale">
            <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
            <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">MC</div>
            <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">UPI</div>
            <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">COD</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
