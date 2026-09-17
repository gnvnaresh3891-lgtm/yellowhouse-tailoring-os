import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ToastProvider } from '../components/toast-context';
import { CurrencyProvider } from '../components/currency-context';

export const metadata: Metadata = {
  title: 'YellowHouse Tailoring OS | Enterprise Bespoke Tailoring Platform',
  description:
    "Multi-tenant SaaS platform for men's and women's bespoke tailoring, atelier management, 2D CAD measurement engineering, and Karigar workshop tracking.",
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#07090E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark selection:bg-yellow-500/25 selection:text-yellow-200">
      <body className="bg-[#07090E] text-slate-100 antialiased font-sans min-h-screen">
        <CurrencyProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
