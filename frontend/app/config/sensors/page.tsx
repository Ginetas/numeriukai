'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApiMutation, useApiQuery } from '@/hooks/use-api';
import type { Sensor, Camera, Zone } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select } from '@/components/ui/select';

const sensorTypes = ['TPMS', 'LOOP', 'RFID'];

export default function SensorsPage() {
  const { data: sensors, isLoading } = useApiQuery<Sensor[]>(['sensors'], '/config/sensors');
  const { data: cameras } = useApiQuery<Camera[]>(['cameras'], '/config/cameras');
  const { data: zones } = useApiQuery<Zone[]>(['zones'], '/config/zones');
  const [form, setForm] = useState<Omit<Sensor, 'id'>>({ name: '', type: 'TPMS', config: '{}', camera_id: undefined, zone_id: undefined });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const createSensor = useApiMutation<Sensor>({ path: '/config/sensors', method: 'post', invalidateKeys: [['sensors']], successMessage: 'Sensor saved' });
  const updateSensor = useApiMutation<Sensor>({ path: `/config/sensors/${editingId ?? ''}`, method: 'put', invalidateKeys: [['sensors']], successMessage: 'Sensor updated' });
  const deleteSensor = useApiMutation<{ status: string }>({ path: '', method: 'delete', invalidateKeys: [['sensors']], successMessage: 'Sensor deleted' });

  useEffect(() => {
    if (!dialogOpen) {
      setForm({ name: '', type: 'TPMS', config: '{}', camera_id: undefined, zone_id: undefined });
      setEditingId(null);
    }
  }, [dialogOpen]);

  const handleSubmit = async () => {
    if (editingId) {
      await updateSensor.mutateAsync(form);
    } else {
      await createSensor.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sensors</h1>
        <Button onClick={() => setDialogOpen(true)}>Add sensor</Button>
      </div>
      <Card>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Camera</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sensors || []).map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell className="font-semibold">{sensor.name}</TableCell>
                  <TableCell>{sensor.type}</TableCell>
                  <TableCell>{cameras?.find((c) => c.id === sensor.camera_id)?.name ?? '—'}</TableCell>
                  <TableCell>{zones?.find((z) => z.id === sensor.zone_id)?.name ?? '—'}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(sensor.id); setForm({ name: sensor.name, type: sensor.type, config: sensor.config, camera_id: sensor.camera_id, zone_id: sensor.zone_id }); setDialogOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteSensor.mutateAsync(undefined, { mutationKey: ['/config/sensors', sensor.id] } as any)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? 'Edit sensor' : 'Add sensor'}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-semibold">Type</label>
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {sensorTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-semibold">Config (JSON)</label>
            <Textarea value={form.config} onChange={(e) => setForm((f) => ({ ...f, config: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Camera</label>
              <Select value={form.camera_id ? String(form.camera_id) : ''} onChange={(e) => setForm((f) => ({ ...f, camera_id: e.target.value ? Number(e.target.value) : undefined }))}>
                <option value="">Unassigned</option>
                {cameras?.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">Zone</label>
              <Select value={form.zone_id ? String(form.zone_id) : ''} onChange={(e) => setForm((f) => ({ ...f, zone_id: e.target.value ? Number(e.target.value) : undefined }))}>
                <option value="">Unassigned</option>
                {zones?.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingId ? 'Save changes' : 'Create'}</Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
