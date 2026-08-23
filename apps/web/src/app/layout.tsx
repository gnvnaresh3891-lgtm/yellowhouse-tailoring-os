import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '../components/toast-context';

export const metadata: Metadata = {
  title: 'YellowHouse Tailoring OS | Enterprise Bespoke Tailoring Platform',
  description: 'Multi-tenant SaaS platform for men\'s and women\'s bespoke tailoring, boutique management, measurement engineering, and Karigar workshop tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
