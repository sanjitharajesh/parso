import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReceiptProvider } from '@/contexts/ReceiptContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Parso - Split Bills Instantly',
  description: 'Split receipts with friends using AI-powered parsing and Splitwise integration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReceiptProvider>
          {children}
        </ReceiptProvider>
      </body>
    </html>
  );
}
