'use client';

import { useEffect, useState } from 'react';
import { apiFetch, API_BASE } from '@/lib/api';

export default function DashboardPage() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await apiFetch('/healthz');
        if (res?.status === 'ok') {
          setStatus('ok');
          setMessage('Backend reachable');
        } else {
          setStatus('error');
          setMessage('Unexpected response');
        }
      } catch (err) {
        setStatus('error');
        setMessage((err as Error).message);
      }
    };

    fetchHealth();
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-2">Live Feed</h2>
      <div className="border border-dashed border-slate-300 rounded-lg p-6 text-slate-700 space-y-2">
        <p className="font-semibold">Backend status ({API_BASE})</p>
        <p>
          Status:{' '}
          <span className={status === 'ok' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-slate-500'}>
            {status}
          </span>
        </p>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </div>
      <div className="border border-dashed border-slate-300 rounded-lg p-6 text-slate-500">
        RTSP preview and plate events will appear here.
      </div>
    </section>
  );
}
