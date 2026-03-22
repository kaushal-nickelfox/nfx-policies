import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/providers/Providers';

export const metadata: Metadata = {
  title: 'NFX Policies - HR Policy Management',
  description: 'Enterprise HR Policy Acknowledgement System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
