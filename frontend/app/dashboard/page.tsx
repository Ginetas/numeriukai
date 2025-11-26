'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, API_BASE } from '@/lib/api';

type EventRecord = {
  id: number;
  plate_text: string;
  confidence?: number;
  camera_id?: number;
  zone_id?: number;
  timestamp: string;
};

type CameraRecord = { id: number; name: string };
type ZoneRecord = { id: number; name: string };

function useQueryParams() {
  const params = useSearchParams();
  return useMemo(() => new URLSearchParams(params.toString()), [params]);
}

export default function DashboardPage() {
  const router = useRouter();
  const query = useQueryParams();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [cameras, setCameras] = useState<CameraRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const updateQuery = (key: string, value: string) => {
    const next = new URLSearchParams(query.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.replace(`/dashboard?${next.toString()}`);
  };

  const fetchEvents = async () => {
    const params = new URLSearchParams(query.toString());
    if (!params.get('limit')) params.set('limit', '50');
    try {
      const res = await api.events.search(params);
      setEvents(res);
      setStatus('ok');
    } catch (error) {
      setStatus('error');
      setMessage((error as Error).message);
    }
  };

  useEffect(() => {
    api.health().then(() => setStatus('ok')).catch((err) => {
      setStatus('error');
      setMessage(err.message);
    });
    api.cameras.list().then(setCameras).catch(() => null);
    api.zones.list().then(setZones).catch(() => null);
  }, []);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.toString()]);

  const quickRange = (hours: number) => {
    const from = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    updateQuery('from_ts', from);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Live events</h2>
          <p className="text-slate-600 text-sm">Backend base: {API_BASE}</p>
        </div>
        <div className="text-sm text-slate-600">Status: {status}</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <label className="flex flex-col text-sm gap-1">
          Plate filter
          <input
            className="border rounded px-2 py-1"
            defaultValue={query.get('plate') || ''}
            onBlur={(e) => updateQuery('plate', e.target.value)}
            placeholder="ABC123"
          />
        </label>
        <label className="flex flex-col text-sm gap-1">
          Camera
          <select
            className="border rounded px-2 py-1"
            value={query.get('camera_id') || ''}
            onChange={(e) => updateQuery('camera_id', e.target.value)}
          >
            <option value="">All</option>
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm gap-1">
          Zone
          <select
            className="border rounded px-2 py-1"
            value={query.get('zone_id') || ''}
            onChange={(e) => updateQuery('zone_id', e.target.value)}
          >
            <option value="">All</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 items-end text-sm">
          <button className="border px-2 py-1 rounded" onClick={() => quickRange(1)}>
            Last hour
          </button>
          <button className="border px-2 py-1 rounded" onClick={() => quickRange(24)}>
            24h
          </button>
          <button className="border px-2 py-1 rounded" onClick={() => quickRange(24 * 7)}>
            7d
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Plate</th>
              <th className="px-4 py-2 text-left">Confidence</th>
              <th className="px-4 py-2 text-left">Camera</th>
              <th className="px-4 py-2 text-left">Zone</th>
              <th className="px-4 py-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 font-semibold">{event.plate_text}</td>
                <td className="px-4 py-2">{event.confidence ? `${(event.confidence * 100).toFixed(1)}%` : '—'}</td>
                <td className="px-4 py-2">{event.camera_id ?? '—'}</td>
                <td className="px-4 py-2">{event.zone_id ?? '—'}</td>
                <td className="px-4 py-2">{new Date(event.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                  {status === 'loading' ? 'Loading events...' : 'No events yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
