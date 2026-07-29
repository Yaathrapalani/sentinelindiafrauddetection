import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SiteHeader } from '@/components/navigation/site-header';
import { SiteFooter } from '@/components/navigation/site-footer';
import { QueryProvider } from '@/components/providers/query-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sentinel India — Behavioral Digital Fraud Prevention',
    template: '%s | Sentinel India',
  },
  description:
    'An AI-assisted behavioral research and education platform that helps users identify, understand, and resist digital fraud.',
  keywords: [
    'digital fraud',
    'scam prevention',
    'cybersecurity',
    'behavioral research',
    'India',
    'phishing',
    'online safety',
  ],
  authors: [{ name: 'Sentinel India Research Team' }],
  openGraph: {
    title: 'Sentinel India — Behavioral Digital Fraud Prevention',
    description:
      'An AI-assisted behavioral research and education platform that helps users identify, understand, and resist digital fraud.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f172a' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <QueryProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
