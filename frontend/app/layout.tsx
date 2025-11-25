import './globals.css';
import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'ANPR Dashboard',
  description: 'Edge to cloud ANPR platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
