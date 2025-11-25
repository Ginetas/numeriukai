'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/uiStore';
import { useHealthStatus } from '@/hooks/use-health';
import { Badge } from '../ui/badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/config/cameras', label: 'Cameras' },
  { href: '/config/zones', label: 'Zones' },
  { href: '/config/models', label: 'Models' },
  { href: '/config/sensors', label: 'Sensors' },
  { href: '/integrations', label: 'Integrations' },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100',
            pathname.startsWith(item.href) ? 'bg-slate-900 text-white hover:bg-slate-900' : 'text-slate-700'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { data: health } = useHealthStatus();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-64 shrink-0 border-r bg-white px-4 py-6 shadow-sm lg:block">
        <div className="mb-6 space-y-1">
          <p className="text-xs uppercase text-slate-500">ANPR variklis</p>
          <h1 className="text-xl font-bold">Control Center</h1>
        </div>
        <Navigation />
      </aside>
      <Sheet open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase text-slate-500">ANPR variklis</p>
            <h1 className="text-xl font-bold">Control Center</h1>
          </div>
          <Navigation onNavigate={() => setSidebarOpen(false)} />
        </div>
      </Sheet>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
              ☰
            </Button>
            <div>
              <p className="text-xs uppercase text-slate-500">ANPR</p>
              <h2 className="text-lg font-semibold">Monitoring Console</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={health?.status === 'ok' ? 'success' : 'destructive'}>
              Backend: {health?.status === 'ok' ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
