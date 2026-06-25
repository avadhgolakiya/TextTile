'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/language-store';
import { ShopContact } from '@/lib/constants/shop-contact';

export function Footer() {
  const { t } = useTranslation();
  const [showContactModal, setShowContactModal] = useState(false);

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
          <form className="flex flex-col sm:flex-row max-w-md w-full gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 min-w-0 w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto whitespace-nowrap bg-gold hover:bg-gold-muted text-maroon-dark font-bold px-6 py-3 rounded-xl transition duration-200 text-sm"
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
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">Our Story</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="hover:text-gold transition text-left focus:outline-none"
                >
                  Contact Us
                </button>
              </li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">Careers</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold font-bold mb-4 uppercase tracking-wider text-xs">Help & Support</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link href="/profile" className="hover:text-gold transition">Track Order</Link></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">Returns & Exchanges</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">Shipping Info</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gold font-bold mb-4 uppercase tracking-wider text-xs">Policies</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">Terms & Conditions</a></li>
              <li><Link href="/privacy" className="hover:text-gold transition">Privacy Policy</Link></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">Shipping Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold transition">Refund Policy</a></li>
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
                  <span>📍</span> Shop Location
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} {ShopContact.businessName}. All Rights Reserved.
          </p>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-surface text-text-primary rounded-[24px] border border-divider shadow-xl overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-text-primary">
                Contact Us
              </h3>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-deep hover:bg-divider transition text-text-secondary font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                If you have any questions or need assistance, feel free to reach out:
              </p>
              
              <div className="space-y-4">
                {/* Dineshbhai */}
                <div className="p-4 rounded-2xl border border-divider bg-cream-deep space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-text-primary">Dineshbhai</div>
                      <div className="text-sm text-text-secondary">+91 88495 02490</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="tel:+918849502490"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-maroon text-white hover:bg-maroon-dark text-xs font-semibold rounded-xl text-center transition"
                    >
                      📞 Call
                    </a>
                    <a
                      href="https://wa.me/918849502490"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-green-600 text-white hover:bg-green-700 text-xs font-semibold rounded-xl text-center transition"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>

                {/* Daxeshbhai */}
                <div className="p-4 rounded-2xl border border-divider bg-cream-deep space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-text-primary">Daxeshbhai</div>
                      <div className="text-sm text-text-secondary">+91 99228 238292</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="tel:+9199228238292"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-maroon text-white hover:bg-maroon-dark text-xs font-semibold rounded-xl text-center transition"
                    >
                      📞 Call
                    </a>
                    <a
                      href="https://wa.me/9199228238292"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-green-600 text-white hover:bg-green-700 text-xs font-semibold rounded-xl text-center transition"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
