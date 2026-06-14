'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { AuthBrandPanel } from '@/components/AuthBrandPanel';
import { authApi } from '@/lib/api-client';
import { useTranslation } from '@/lib/language-store';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function SignUpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  // Registration form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  
  // GST verification states
  const [gstin, setGstin] = useState('');
  const [gstVerified, setGstVerified] = useState(false);
  const [gstLoading, setGstLoading] = useState(false);
  const [gstError, setGstError] = useState<string | null>(null);
  const [verifiedBusinessName, setVerifiedBusinessName] = useState('');
  
  // Form submission states
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Perform GST verification API call
  async function verifyGstin(value: string) {
    setGstLoading(true);
    setGstError(null);
    setGstVerified(false);
    setVerifiedBusinessName('');

    try {
      const result = await authApi.verifyGst(value);
      if (result.valid && result.businessName) {
        setGstVerified(true);
        setVerifiedBusinessName(result.businessName);
      } else {
        setGstVerified(false);
        setGstError(result.message || 'GST not found or inactive');
      }
    } catch (err: any) {
      setGstVerified(false);
      setGstError(err.message || 'GST verification failed. Please try again.');
    } finally {
      setGstLoading(false);
    }
  }

  // Handle changes in the GST input field
  function handleGstChange(val: string) {
    // Auto-convert to uppercase and limit to 15 chars
    const uppercaseVal = val.toUpperCase().slice(0, 15);
    setGstin(uppercaseVal);

    // If cleared or modified away from 15 characters, reset verification state
    if (uppercaseVal.length < 15) {
      setGstVerified(false);
      setGstLoading(false);
      setGstError(null);
      setVerifiedBusinessName('');
      return;
    }

    // Trigger verification instantly when 15 characters are entered
    if (uppercaseVal.length === 15) {
      if (!GSTIN_REGEX.test(uppercaseVal)) {
        setGstVerified(false);
        setGstError('Invalid GST format');
        return;
      }
      verifyGstin(uppercaseVal);
    }
  }

  // Handle Form Submission
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    
    if (!gstVerified) {
      setFormError('Please verify your GST number before proceeding.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        mobile: mobile.trim(),
        gstin: gstin.trim(),
        businessName: verifiedBusinessName.trim(),
      });

      // Save token in cookie (30 days expiry)
      document.cookie = `token=${res.accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

      router.replace('/home');
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen lg:bg-cream">
      <AuthBrandPanel />

      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2 lg:px-16">
        <div className="w-full max-w-md space-y-6 lg:max-w-lg lg:space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="font-serif text-3xl font-semibold lg:text-4xl text-text-primary">{t('createAccount')}</h1>
            <p className="mt-2 text-sm text-text-secondary lg:text-base">
              {t('registerBuyer')}
            </p>
          </div>

          <form onSubmit={onSubmit} className="card space-y-4 p-6 lg:p-8 border border-divider">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">{t('fullName')}</label>
              <input
                className="input-field"
                placeholder={t('fullName')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">{t('emailAddress')}</label>
              <input
                className="input-field"
                type="email"
                placeholder={t('emailAddress')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">{t('mobileNumber')}</label>
              <input
                className="input-field"
                type="tel"
                placeholder={t('mobileNumber')}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">{t('password')}</label>
              <input
                className="input-field"
                type="password"
                placeholder={t('password')}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* GST Number with auto-verify */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-text-secondary">{t('gstNumber')}</label>
                <span className="text-[10px] text-text-secondary bg-peach px-2 py-0.5 rounded-full font-medium">
                  {gstin.length}/15
                </span>
              </div>
              <div className="relative">
                <input
                  className={`input-field pr-10 ${
                    gstVerified ? 'border-green-600 focus:border-green-600 focus:ring-green-600' : 
                    gstError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  value={gstin}
                  onChange={(e) => handleGstChange(e.target.value)}
                  maxLength={15}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {gstLoading && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-divider border-t-maroon" />
                  )}
                  {!gstLoading && gstVerified && (
                    <span className="text-green-600 font-bold">✅</span>
                  )}
                  {!gstLoading && gstError && (
                    <span className="text-red-500 font-bold">❌</span>
                  )}
                </div>
              </div>

              {/* Status and business name display */}
              {gstVerified && verifiedBusinessName && (
                <div className="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 animate-fadeIn">
                  <div className="font-semibold">Business Name:</div>
                  <div>{verifiedBusinessName}</div>
                </div>
              )}
              {gstError && (
                <p className="mt-1.5 text-xs text-red-600 font-medium animate-fadeIn">
                  ❌ {gstError}
                </p>
              )}
            </div>

            {/* Form Error */}
            {formError ? (
              <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
                {formError}
              </div>
            ) : null}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              disabled={!gstVerified || loading}
            >
              {loading ? '...' : t('createAccount')}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary lg:text-left lg:text-base">
            {t('alreadyRegistered')}{' '}
            <Link href="/login" className="font-semibold text-maroon hover:text-maroon-dark">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
