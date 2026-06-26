import type { Metadata } from 'next';
import PrivacyPolicyPage from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | Swastik Fashion',
  description: 'Read the privacy policy of Swastik Fashion B2B wholesale saree marketplace to understand how we collect and secure account and business details.',
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
