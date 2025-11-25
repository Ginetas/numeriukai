'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApiMutation, useApiQuery } from '@/hooks/use-api';
import type { ModelConfig } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const modelTypes = ['detector', 'ocr', 'tracker'];

export default function ModelsPage() {
  const { data: models, isLoading } = useApiQuery<ModelConfig[]>(['models'], '/config/models');
  const [form, setForm] = useState<Omit<ModelConfig, 'id'>>({ name: '', type: 'detector', version: '', active: true, config: '{}' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const createModel = useApiMutation<ModelConfig>({ path: '/config/models', method: 'post', invalidateKeys: [['models']], successMessage: 'Model saved' });
  const updateModel = useApiMutation<ModelConfig>({ path: `/config/models/${editingId ?? ''}`, method: 'put', invalidateKeys: [['models']], successMessage: 'Model updated' });
  const deleteModel = useApiMutation<{ status: string }>({ path: '', method: 'delete', invalidateKeys: [['models']], successMessage: 'Model deleted' });

  useEffect(() => {
    if (!dialogOpen) {
      setForm({ name: '', type: 'detector', version: '', active: true, config: '{}' });
      setEditingId(null);
    }
  }, [dialogOpen]);

  const handleSubmit = async () => {
    if (editingId) {
      await updateModel.mutateAsync(form);
    } else {
      await createModel.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Models</h1>
        <Button onClick={() => setDialogOpen(true)}>Add model</Button>
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
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(models || []).map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-semibold">{model.name}</TableCell>
                  <TableCell>{model.type}</TableCell>
                  <TableCell>{model.version ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={model.active ? 'success' : 'destructive'}>{model.active ? 'Active' : 'Disabled'}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(model.id); setForm({ name: model.name, type: model.type, version: model.version ?? '', active: model.active, config: model.config }); setDialogOpen(true); }}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteModel.mutateAsync(undefined, { mutationKey: ['/config/models', model.id] } as any)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? 'Edit model' : 'Add model'}>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Name</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Type</label>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {modelTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold">Version</label>
              <Input value={form.version ?? ''} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Params (JSON)</label>
            <Textarea value={form.config} onChange={(e) => setForm((f) => ({ ...f, config: e.target.value }))} />
          </div>
+          <div className="flex items-center gap-3">
+            <label className="text-sm font-semibold">Active</label>
+            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
+          </div>
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
