'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApiMutation, useApiQuery } from '@/hooks/use-api';
import type { Zone } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const zoneTypes = ['ENTRY', 'EXIT', 'CONTROL'];

export default function ZonesPage() {
  const { data: zones, isLoading } = useApiQuery<Zone[]>(['zones'], '/config/zones');
  const [form, setForm] = useState<Omit<Zone, 'id'>>({ name: '', type: 'ENTRY', polygon: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const createZone = useApiMutation<Zone>({ path: '/config/zones', method: 'post', invalidateKeys: [['zones']], successMessage: 'Zone saved' });
  const updateZone = useApiMutation<Zone>({ path: `/config/zones/${editingId ?? ''}`, method: 'put', invalidateKeys: [['zones']], successMessage: 'Zone updated' });
  const deleteZone = useApiMutation<{ status: string }>({ path: '', method: 'delete', invalidateKeys: [['zones']], successMessage: 'Zone deleted' });

  useEffect(() => {
    if (!dialogOpen) {
      setForm({ name: '', type: 'ENTRY', polygon: '' });
      setEditingId(null);
    }
  }, [dialogOpen]);

  const handleSubmit = async () => {
    if (editingId) {
      await updateZone.mutateAsync(form);
    } else {
      await createZone.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Zones</h1>
        <Button onClick={() => setDialogOpen(true)}>Add zone</Button>
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
                <TableHead>Polygon</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(zones || []).map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-semibold">{zone.name}</TableCell>
                  <TableCell>{zone.type}</TableCell>
                  <TableCell className="text-slate-600">{zone.polygon}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(zone.id); setForm({ name: zone.name, type: zone.type, polygon: zone.polygon }); setDialogOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteZone.mutateAsync(undefined, { mutationKey: ['/config/zones', zone.id] } as any)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? 'Edit zone' : 'Add zone'}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-semibold">Type</label>
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              {zoneTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm font-semibold">Geometry (WKT/JSON)</label>
            <Input value={form.polygon} onChange={(e) => setForm((f) => ({ ...f, polygon: e.target.value }))} />
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
