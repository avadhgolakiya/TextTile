import type { Metadata } from 'next';
import FaqClient from './FaqClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Swastik Fashion',
  description: 'Find answers to common queries regarding wholesale minimum order quantities, catalog orders, design stitching, payment safety, and logistics at Swastik Fashion.',
};

export default function Page() {
  return <FaqClient />;
}
