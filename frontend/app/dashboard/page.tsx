'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, API_BASE } from '@/lib/api';
import { PlateEvent, useEventStore } from '@/store/events';

function useQueryParams() {
  const params = useSearchParams();
  return useMemo(() => new URLSearchParams(params.toString()), [params]);
}

const DEFAULT_LIMIT = 25;

const rangePresets = [
  { label: '15m', hours: 0.25 },
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '12h', hours: 12 },
  { label: '1d', hours: 24 },
  { label: '3d', hours: 72 },
  { label: '30d', hours: 24 * 30 },
];

const confidencePresets = [
  { label: '50%', value: 0.5 },
  { label: '70%', value: 0.7 },
  { label: '90%', value: 0.9 },
];

export default function DashboardPage() {
  const router = useRouter();
  const query = useQueryParams();
  const [cameras, setCameras] = useState<{ id: number; name: string }[]>([]);
  const [zones, setZones] = useState<{ id: number; name: string }[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isStreamingEnabled, setStreamingEnabled] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<PlateEvent | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const {
    events,
    setEvents,
    addEvent,
    clearEvents,
    connectionStatus,
    connectionError,
    setConnectionStatus,
  } = useEventStore();

  const cameraMap = useMemo(
    () => Object.fromEntries(cameras.map((camera) => [camera.id, camera.name])),
    [cameras],
  );
  const zoneMap = useMemo(() => Object.fromEntries(zones.map((zone) => [zone.id, zone.name])), [zones]);

  const updateQuery = (key: string, value: string) => {
    const next = new URLSearchParams(query.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (!next.get('limit')) next.set('limit', DEFAULT_LIMIT.toString());
    router.replace(`/dashboard?${next.toString()}`);
  };

  const fetchEvents = async () => {
    const params = new URLSearchParams(query.toString());
    if (!params.get('limit')) params.set('limit', DEFAULT_LIMIT.toString());
    try {
      const res = await api.events.search(params);
      const parsedEvents: PlateEvent[] = (Array.isArray(res?.results) ? res.results : res || []).map(
        (event: any) => ({
          id: event.id,
          plate: event.plate_text || event.plate,
          confidence: event.confidence,
          camera_id: event.camera_id,
          zone_id: event.zone_id,
          timestamp: event.timestamp,
          camera_name: cameraMap[event.camera_id],
          zone_name: zoneMap[event.zone_id],
          thumbnail_url: event.thumbnail_url,
        }),
      );
      setEvents(parsedEvents);
      setStatus('ok');
      setHasMore((res?.results || res)?.length >= Number(params.get('limit')));
    } catch (error) {
      setStatus('error');
      setMessage((error as Error).message);
    }
  };

  const quickRange = (hours: number) => {
    const from = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    updateQuery('from_ts', from);
  };

  const exportCsv = () => {
    const header = ['Plate', 'Confidence', 'Camera', 'Zone', 'Timestamp'];
    const rows = events.map((event) => [
      event.plate,
      event.confidence ? (event.confidence * 100).toFixed(1) : '',
      event.camera_name || event.camera_id || '',
      event.zone_name || event.zone_id || '',
      event.timestamp || '',
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plate-events.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    api
      .health()
      .then(() => setStatus('ok'))
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
    api.cameras
      .list()
      .then(setCameras)
      .catch(() => null);
    api.zones
      .list()
      .then(setZones)
      .catch(() => null);
  }, []);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.toString(), cameraMap, zoneMap]);

  useEffect(() => {
    if (!isStreamingEnabled) return;
    const params = new URLSearchParams();
    ['camera_id', 'zone_id', 'plate', 'min_confidence'].forEach((key) => {
      const value = query.get(key);
      if (value) params.set(key, value);
    });

    setConnectionStatus('connecting');
    const source = api.events.stream(params);
    source.onopen = () => setConnectionStatus('open');
    source.onerror = () => {
      setConnectionStatus('error', 'Stream disconnected');
      source.close();
    };
    source.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        const event: PlateEvent = {
          id: data.id,
          plate: data.plate_text || data.plate,
          confidence: data.confidence,
          camera_id: data.camera_id,
          zone_id: data.zone_id,
          timestamp: data.timestamp,
          camera_name: cameraMap[data.camera_id],
          zone_name: zoneMap[data.zone_id],
          thumbnail_url: data.thumbnail_url,
        };
        addEvent(event);
      } catch (err) {
        console.error('Failed to parse event', err);
      }
    };

    return () => {
      setConnectionStatus('closed');
      source.close();
    };
  }, [query, addEvent, cameraMap, zoneMap, setConnectionStatus, isStreamingEnabled]);

  const paginatedParams = (direction: 'next' | 'prev') => {
    const limit = Number(query.get('limit') || DEFAULT_LIMIT);
    const offset = Number(query.get('offset') || 0);
    const nextOffset = Math.max(0, offset + (direction === 'next' ? limit : -limit));
    updateQuery('offset', nextOffset.toString());
    updateQuery('page', Math.floor(nextOffset / limit + 1).toString());
  };

  const filtersActive = ['plate', 'camera_id', 'zone_id', 'from_ts', 'to_ts', 'min_confidence'].some((key) =>
    Boolean(query.get(key)),
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Live events</h2>
          <p className="text-slate-600 text-sm">Backend base: {API_BASE}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span
              className={
                {
                  connecting: 'bg-amber-400',
                  open: 'bg-emerald-500',
                  closed: 'bg-slate-400',
                  error: 'bg-rose-500',
                  idle: 'bg-slate-400',
                }[connectionStatus]
              + ' inline-block h-3 w-3 rounded-full'
              }
            />
            <span>{connectionStatus === 'open' ? 'Live' : connectionStatus}</span>
          </div>
          <button
            className="border px-2 py-1 rounded"
            onClick={() => setStreamingEnabled((prev) => !prev)}
          >
            {isStreamingEnabled ? 'Pause stream' : 'Resume stream'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm items-center">
        {filtersActive && <span className="text-slate-600">Filters:</span>}
        {['plate', 'camera_id', 'zone_id', 'from_ts', 'to_ts', 'min_confidence'].map((key) => {
          const value = query.get(key);
          if (!value) return null;
          return (
            <button
              key={key}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 hover:bg-slate-200"
              onClick={() => updateQuery(key, '')}
            >
              <span className="font-medium">{key}</span>
              <span>{value}</span>
              <span className="text-slate-500">×</span>
            </button>
          );
        })}
        {filtersActive && (
          <button
            className="rounded-full bg-rose-50 px-3 py-1 text-rose-600 hover:bg-rose-100"
            onClick={() => {
              ['plate', 'camera_id', 'zone_id', 'from_ts', 'to_ts', 'min_confidence', 'offset', 'page'].forEach((key) =>
                updateQuery(key, ''),
              );
              clearEvents();
            }}
          >
            Clear all
          </button>
        )}
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
        <label className="flex flex-col text-sm gap-1">
          Confidence ≥
          <div className="flex gap-2 flex-wrap">
            {confidencePresets.map((preset) => (
              <button
                key={preset.value}
                className={`rounded-full px-3 py-1 border ${
                  query.get('min_confidence') === preset.value.toString()
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'border-slate-200 text-slate-700'
                }`}
                onClick={() => updateQuery('min_confidence', preset.value.toString())}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 text-sm items-center">
        <span className="text-slate-600">Range presets:</span>
        {rangePresets.map((preset) => (
          <button
            key={preset.label}
            className="border px-2 py-1 rounded"
            onClick={() => quickRange(preset.hours)}
          >
            Last {preset.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2">
          From
          <input
            type="datetime-local"
            className="border rounded px-2 py-1"
            value={query.get('from_ts') ? query.get('from_ts')!.slice(0, 16) : ''}
            onChange={(e) => updateQuery('from_ts', e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
        </label>
        <label className="flex items-center gap-2">
          To
          <input
            type="datetime-local"
            className="border rounded px-2 py-1"
            value={query.get('to_ts') ? query.get('to_ts')!.slice(0, 16) : ''}
            onChange={(e) => updateQuery('to_ts', e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          Sort by
          <select
            className="border rounded px-2 py-1"
            value={query.get('sort') || 'timestamp'}
            onChange={(e) => updateQuery('sort', e.target.value)}
          >
            <option value="timestamp">Timestamp</option>
            <option value="confidence">Confidence</option>
            <option value="plate">Plate</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Order
          <select
            className="border rounded px-2 py-1"
            value={query.get('order') || 'desc'}
            onChange={(e) => updateQuery('order', e.target.value)}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Page size
          <input
            className="border rounded px-2 py-1 w-20"
            type="number"
            min={1}
            max={200}
            value={query.get('limit') || DEFAULT_LIMIT}
            onChange={(e) => updateQuery('limit', e.target.value)}
          />
        </label>
        <div className="ml-auto flex gap-2">
          <button className="border px-3 py-1 rounded" onClick={() => paginatedParams('prev')}>
            Previous
          </button>
          <button className="border px-3 py-1 rounded" onClick={() => paginatedParams('next')} disabled={!hasMore}>
            Next
          </button>
          <button className="border px-3 py-1 rounded" onClick={exportCsv}>
            Export CSV
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
              <th className="px-4 py-2 text-left">Thumbnail</th>
              <th className="px-4 py-2 text-left">Time</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <tr key={`${event.id}-${event.timestamp}`} className="hover:bg-slate-50">
                <td className="px-4 py-2 font-semibold">{event.plate}</td>
                <td className="px-4 py-2">
                  {event.confidence ? `${(event.confidence * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="px-4 py-2">{event.camera_name || event.camera_id || '—'}</td>
                <td className="px-4 py-2">{event.zone_name || event.zone_id || '—'}</td>
                <td className="px-4 py-2">
                  {event.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.thumbnail_url}
                      alt={`Plate ${event.plate}`}
                      className="h-12 w-20 object-cover rounded border"
                    />
                  ) : (
                    <span className="text-slate-400">No image</span>
                  )}
                </td>
                <td className="px-4 py-2">{event.timestamp ? new Date(event.timestamp).toLocaleString() : '—'}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-slate-100 px-2 py-1"
                      onClick={() => setSelectedEvent(event)}
                    >
                      Details
                    </button>
                    <button
                      className="rounded bg-emerald-50 px-2 py-1"
                      onClick={() => addEvent(event)}
                    >
                      Pin
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                  {status === 'loading' ? 'Loading events...' : 'No events yet'}
                </td>
              </tr>
            )}
            {status === 'error' && (
              <tr>
                <td className="px-4 py-6 text-center text-rose-600" colSpan={7}>
                  Failed to load events: {message}
                  <button className="ml-3 rounded bg-rose-50 px-2 py-1" onClick={fetchEvents}>
                    Retry
                  </button>
                </td>
              </tr>
            )}
            {connectionStatus === 'error' && (
              <tr>
                <td className="px-4 py-4 text-center text-amber-700" colSpan={7}>
                  Live stream interrupted. {connectionError}
                  <button className="ml-2 underline" onClick={() => setStreamingEnabled(true)}>
                    Reconnect
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Event detail</h3>
              <button className="text-slate-500" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500">Plate</div>
                <div className="font-semibold">{selectedEvent.plate}</div>
              </div>
              <div>
                <div className="text-slate-500">Confidence</div>
                <div className="font-semibold">
                  {selectedEvent.confidence ? `${(selectedEvent.confidence * 100).toFixed(1)}%` : '—'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Camera</div>
                <div className="font-semibold">{selectedEvent.camera_name || selectedEvent.camera_id || '—'}</div>
              </div>
              <div>
                <div className="text-slate-500">Zone</div>
                <div className="font-semibold">{selectedEvent.zone_name || selectedEvent.zone_id || '—'}</div>
              </div>
              <div>
                <div className="text-slate-500">Time</div>
                <div className="font-semibold">
                  {selectedEvent.timestamp ? new Date(selectedEvent.timestamp).toLocaleString() : '—'}
                </div>
              </div>
            </div>
            {selectedEvent.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedEvent.thumbnail_url}
                alt="Event thumbnail"
                className="w-full h-56 object-cover rounded border"
              />
            ) : (
              <div className="text-slate-400 text-sm">No thumbnail available.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
