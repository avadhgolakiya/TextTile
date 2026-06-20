import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Restricted | Swastik Fashion',
};

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <div className="w-full max-w-md rounded-3xl border border-divider bg-surface p-10 shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl text-red-500">
          🔒
        </div>
        <h1 className="mb-4 font-serif text-2xl font-bold text-text-primary">
          Access Restricted
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-text-secondary">
          You are blocked by admin. Your access to this application has been restricted. If you believe this is a mistake, please reach out to support.
        </p>
        <a
          href="https://wa.me/917984143368"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
        >
          Contact on WhatsApp
        </a>
      </div>
    </div>
  );
}
