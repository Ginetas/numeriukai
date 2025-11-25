import './globals.css';
import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'ANPR Dashboard',
  description: 'Edge to cloud ANPR platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex h-screen">
          <aside className="w-64 bg-white shadow-lg p-6 space-y-4">
            <h1 className="text-xl font-bold">ANPR</h1>
            <nav className="flex flex-col space-y-2">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/config/cameras">Cameras</Link>
              <Link href="/config/zones">Zones</Link>
              <Link href="/config/models">Models</Link>
              <Link href="/config/sensors">Sensors</Link>
              <Link href="/integrations">Integrations</Link>
            </nav>
          </aside>
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
