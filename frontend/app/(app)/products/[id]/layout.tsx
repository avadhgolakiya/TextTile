import { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
};

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
