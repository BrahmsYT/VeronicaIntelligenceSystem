import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProvider } from '@/components/providers/app-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'AZCON Smart Transit AI — Intelligent Public Transport Operations',
  description: 'Predictive flow intelligence, operator command center and passenger-first recommendations for modern public transit.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' data-theme='dark' className={inter.variable}>
      <body className='font-sans'>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
