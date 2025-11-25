'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { useApiQuery } from '@/hooks/use-api';
import { useEventsStore } from '@/store/events';
import { useEventsStream } from '@/hooks/use-events-stream';
import type { Camera, PlateEvent } from '@/lib/types';
import { useHealthStatus } from '@/hooks/use-health';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [cameraFilter, setCameraFilter] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<PlateEvent | null>(null);
  const { events, setEvents } = useEventsStore();

  const { data: health, isLoading: healthLoading } = useHealthStatus();
  const {
    data: eventData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useApiQuery<PlateEvent[]>(['events'], '/events');
  const { data: cameras } = useApiQuery<Camera[]>(['cameras'], '/config/cameras');

  useEffect(() => {
    if (eventData) setEvents(eventData);
  }, [eventData, setEvents]);

  const fallbackFetch = useCallback(() => {
    refetchEvents();
  }, [refetchEvents]);

  useEventsStream(fallbackFetch);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchPlate = evt.plate.toLowerCase().includes(search.toLowerCase());
      const matchCamera = cameraFilter ? evt.camera_id === Number(cameraFilter) : true;
      return matchPlate && matchCamera;
    });
  }, [events, search, cameraFilter]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Backend status</p>
              <h3 className="text-2xl font-semibold">{health?.status ?? 'Checking...'}</h3>
            </div>
            {healthLoading ? <Spinner /> : <Badge variant={health?.status === 'ok' ? 'success' : 'destructive'}>{health?.status ?? 'n/a'}</Badge>}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Events loaded</p>
              <h3 className="text-2xl font-semibold">{events.length}</h3>
            </div>
            <Badge variant="outline">live</Badge>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active cameras</p>
              <h3 className="text-2xl font-semibold">{cameras?.length ?? 0}</h3>
            </div>
            <Badge variant="success">ready</Badge>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Plate event feed</h2>
            <p className="text-sm text-slate-600">Live events from edge worker stream.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Search plate" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44" />
            <Select value={cameraFilter} onChange={(e) => setCameraFilter(e.target.value)} className="w-40">
              <option value="">All cameras</option>
              {cameras?.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </Select>
            <Button variant="outline" onClick={() => refetchEvents()}>
              Refresh
            </Button>
          </div>
        </div>
        {eventsLoading && !events.length ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-600">
            No events yet. Keep the edge worker running to see new plates.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate</TableHead>
                <TableHead>Camera</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((evt) => (
                <TableRow key={evt.id} className="cursor-pointer" onClick={() => setSelectedEvent(evt)}>
                  <TableCell className="font-semibold">{evt.plate}</TableCell>
                  <TableCell>{cameras?.find((c) => c.id === evt.camera_id)?.name ?? 'Unknown'}</TableCell>
                  <TableCell>{evt.zone_id ?? '—'}</TableCell>
                  <TableCell>{new Date(evt.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event details">
        {selectedEvent && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Plate</span>
              <Badge>{selectedEvent.plate}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Camera</span>
              <span>{cameras?.find((c) => c.id === selectedEvent.camera_id)?.name ?? 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Zone</span>
              <span>{selectedEvent.zone_id ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Timestamp</span>
              <span>{new Date(selectedEvent.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <p className="font-semibold">Metadata</p>
              <pre className="mt-1 rounded bg-slate-100 p-2 text-xs text-slate-700">{JSON.stringify(selectedEvent.meta, null, 2)}</pre>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}
