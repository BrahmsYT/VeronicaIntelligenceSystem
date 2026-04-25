import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/components/providers/app-provider';

export const metadata: Metadata = {
  title: 'AZCON Smart Transit AI',
  description: 'AI-powered transport flow and resource management MVP'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
