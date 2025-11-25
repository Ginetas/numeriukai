'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApiMutation, useApiQuery } from '@/hooks/use-api';
import type { Exporter } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

const exporterTypes = ['REST', 'WebSocket', 'MQTT', 'Kafka'];

export default function IntegrationsPage() {
  const { data: exporters, isLoading } = useApiQuery<Exporter[]>(['exporters'], '/config/exporters');
  const [form, setForm] = useState<Omit<Exporter, 'id'>>({ name: '', type: 'REST', endpoint: '', config: '{}', enabled: true, last_status: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { push } = useToast();

  const createExporter = useApiMutation<Exporter>({ path: '/config/exporters', method: 'post', invalidateKeys: [['exporters']], successMessage: 'Exporter saved' });
  const updateExporter = useApiMutation<Exporter>({ path: `/config/exporters/${editingId ?? ''}`, method: 'put', invalidateKeys: [['exporters']], successMessage: 'Exporter updated' });
  const deleteExporter = useApiMutation<{ status: string }>({ path: '', method: 'delete', invalidateKeys: [['exporters']], successMessage: 'Exporter deleted' });

  const testExporter = useApiMutation<{ status: string }>({ path: `/exporters/${editingId ?? ''}/test`, method: 'post', successMessage: 'Test dispatched' });

  useEffect(() => {
    if (!dialogOpen) {
      setForm({ name: '', type: 'REST', endpoint: '', config: '{}', enabled: true, last_status: '' });
      setEditingId(null);
    }
  }, [dialogOpen]);

  const handleSubmit = async () => {
    if (editingId) {
      await updateExporter.mutateAsync(form);
    } else {
      await createExporter.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  const handleTest = async (id: number) => {
    setEditingId(id);
    await testExporter.mutateAsync(undefined);
    push({ title: 'Exporter test triggered' });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <Button onClick={() => setDialogOpen(true)}>Add exporter</Button>
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
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(exporters || []).map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-semibold">{exp.name}</TableCell>
                  <TableCell>{exp.type}</TableCell>
                  <TableCell className="text-slate-600">{exp.endpoint}</TableCell>
                  <TableCell>
                    <Badge variant={exp.enabled ? 'success' : 'destructive'}>{exp.last_status || '—'}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleTest(exp.id)}>
                      Test
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(exp.id); setForm({ name: exp.name, type: exp.type, endpoint: exp.endpoint, config: exp.config, enabled: exp.enabled, last_status: exp.last_status }); setDialogOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteExporter.mutateAsync(undefined, { mutationKey: ['/config/exporters', exp.id] } as any)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? 'Edit exporter' : 'Add exporter'}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Type</label>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {exporterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">Endpoint</label>
              <Input value={form.endpoint ?? ''} onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Headers/Auth (JSON)</label>
            <Textarea value={form.config} onChange={(e) => setForm((f) => ({ ...f, config: e.target.value }))} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">Enabled</label>
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} />
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
