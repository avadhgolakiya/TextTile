import type { Metadata } from 'next';
import DataDeletionPage from './DataDeletionClient';

export const metadata: Metadata = {
  title: 'Data Deletion Request | Swastik Fashion',
  description: 'Request the permanent deletion of your Swastik Fashion wholesale B2B account and all associated profile, order, and device data.',
};

export default function Page() {
  return <DataDeletionPage />;
}
