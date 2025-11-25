'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Dialog } from '../../../components/ui/dialog';
import { ToastProvider, Toaster, useToast } from '../../../components/ui/use-toast';
import { ZoneDesigner, ZoneDesignerHandle } from '../../../components/zone-designer/ZoneDesigner';
import { parseGeometry, Geometry } from '../../../components/zone-designer/helpers/geometry';
import { ZoneType } from '../../../components/zone-designer/hooks/useZoneDesigner';

type ZoneRecord = {
  id: number;
  name: string;
  type: ZoneType;
  geometry: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function ZonesPageContent() {
  const { push } = useToast();
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneRecord | null>(null);
  const designerRef = useRef<ZoneDesignerHandle>();

  const fetchZones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/config/zones`);
      const data = await response.json();
      setZones(data);
    } catch (error) {
      push({ title: 'Failed to load zones', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSave = async (payload: { name: string; type: ZoneType; geometry: string }) => {
    try {
      const method = editingZone ? 'PUT' : 'POST';
      const url = editingZone
        ? `${API_BASE}/config/zones/${editingZone.id}`
        : `${API_BASE}/config/zones`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to save zone');
      }
      push({ title: 'Zone saved successfully' });
      setDialogOpen(false);
      setEditingZone(null);
      fetchZones();
    } catch (error) {
      push({ title: 'Unable to save zone', variant: 'destructive' });
    }
  };

  const handleDelete = async (zone: ZoneRecord) => {
    const confirmed = window.confirm(`Delete zone "${zone.name}"?`);
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_BASE}/config/zones/${zone.id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete zone');
      }
      push({ title: 'Zone deleted' });
      fetchZones();
    } catch (error) {
      push({ title: 'Unable to delete zone', variant: 'destructive' });
    }
  };

  const openCreate = () => {
    setEditingZone(null);
    setDialogOpen(true);
  };

  const openEdit = (zone: ZoneRecord) => {
    setEditingZone(zone);
    setDialogOpen(true);
  };

  const currentGeometry: Geometry | null = useMemo(
    () => parseGeometry(editingZone?.geometry),
    [editingZone]
  );

  const tableRows = zones.map((zone) => {
    const geometry = parseGeometry(zone.geometry);
    return {
      ...zone,
      pointCount: geometry?.points?.length ?? 0,
    };
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Zones</h2>
          <p className="text-slate-600">Define spatial zones to bind cameras and alerts.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          Create zone
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-lg font-semibold">Configured zones</h3>
            <p className="text-sm text-slate-600">List of saved entry, exit and control polygons.</p>
          </div>
          <Button variant="outline" onClick={fetchZones} disabled={loading}>
            Refresh
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Type</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Points</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableRows.map((zone) => (
                <tr key={zone.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">{zone.name}</td>
                  <td className="px-4 py-2">{zone.type}</td>
                  <td className="px-4 py-2">{zone.pointCount}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Button variant="outline" onClick={() => openEdit(zone)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(zone)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {tableRows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                    {loading ? 'Loading zones...' : 'No zones defined yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingZone(null);
        }}
        title={editingZone ? 'Edit zone' : 'Create zone'}
        description="Draw polygon points, pan/zoom the canvas, and save to persist."
        size="xl"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => designerRef.current?.save()}>
              Save
            </Button>
          </div>
        }
      >
        <ZoneDesigner
          ref={designerRef}
          initialName={editingZone?.name}
          initialType={editingZone?.type}
          initialGeometry={currentGeometry ?? undefined}
          onSave={handleSave}
          onCancel={() => setDialogOpen(false)}
        />
      </Dialog>
    </section>
  );
}

export default function ZonesPage() {
  return (
    <ToastProvider>
      <ZonesPageContent />
      <Toaster />
    </ToastProvider>
  );
}
