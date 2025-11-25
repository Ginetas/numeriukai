'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApiMutation, useApiQuery } from '@/hooks/use-api';
import type { Camera, Zone } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

type CameraFormState = Omit<Camera, 'id'>;

const emptyForm: CameraFormState = {
  name: '',
  rtsp_url: '',
  zone_id: undefined,
  fps: 15,
  enabled: true,
};

export default function CamerasPage() {
  const { data: cameras, isLoading } = useApiQuery<Camera[]>(['cameras'], '/config/cameras');
  const { data: zones } = useApiQuery<Zone[]>(['zones'], '/config/zones');
  const [form, setForm] = useState<CameraFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { push } = useToast();

  const createCamera = useApiMutation<Camera>({
    path: '/config/cameras',
    method: 'post',
    invalidateKeys: [['cameras']],
    successMessage: 'Camera saved',
  });

  const updateCamera = useApiMutation<Camera>({
    path: `/config/cameras/${editingId ?? ''}`,
    method: 'put',
    invalidateKeys: [['cameras']],
    successMessage: 'Camera updated',
  });

  const deleteCamera = useApiMutation<{ status: string }>({
    path: '',
    method: 'delete',
    invalidateKeys: [['cameras']],
    successMessage: 'Camera deleted',
  });

  useEffect(() => {
    if (!dialogOpen) {
      setForm(emptyForm);
      setEditingId(null);
    }
  }, [dialogOpen]);

  const handleSubmit = async () => {
    if (!form.name || !form.rtsp_url) {
      push({ title: 'Name and RTSP URL are required', variant: 'destructive' });
      return;
    }
    if (editingId) {
      await updateCamera.mutateAsync(form);
    } else {
      await createCamera.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const startEdit = (cam: Camera) => {
    setEditingId(cam.id);
    setForm({
      name: cam.name,
      rtsp_url: cam.rtsp_url,
      zone_id: cam.zone_id,
      fps: cam.fps ?? 15,
      enabled: cam.enabled,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCamera.mutateAsync(undefined, { mutationKey: ['/config/cameras', id] } as any);
    push({ title: 'Camera removed' });
  };

  const zoneLookup = useMemo(() => Object.fromEntries((zones || []).map((z) => [z.id, z.name])), [zones]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cameras</h1>
        <Button onClick={() => setDialogOpen(true)}>Add camera</Button>
      </div>
      <Card>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>RTSP</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>FPS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(cameras || []).map((cam) => (
                <TableRow key={cam.id}>
                  <TableCell className="font-semibold">{cam.name}</TableCell>
                  <TableCell className="truncate text-slate-600">{cam.rtsp_url}</TableCell>
                  <TableCell>{cam.zone_id ? zoneLookup[cam.zone_id] : '—'}</TableCell>
                  <TableCell>{cam.fps ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={cam.enabled ? 'success' : 'destructive'}>{cam.enabled ? 'Enabled' : 'Disabled'}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(cam)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cam.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? 'Edit camera' : 'Add camera'}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-semibold">RTSP URL</label>
            <Input value={form.rtsp_url} onChange={(e) => setForm((f) => ({ ...f, rtsp_url: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Zone</label>
              <Select
                value={form.zone_id ? String(form.zone_id) : ''}
                onChange={(e) => setForm((f) => ({ ...f, zone_id: e.target.value ? Number(e.target.value) : undefined }))}
              >
                <option value="">Unassigned</option>
                {zones?.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">FPS</label>
              <Input
                type="number"
                value={form.fps ?? 15}
                onChange={(e) => setForm((f) => ({ ...f, fps: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">Enabled</label>
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            />
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
