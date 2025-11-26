'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Camera = {
  id: number;
  name: string;
  rtsp_url: string;
  zone_id?: number;
  fps?: number;
  resolution_width?: number;
  resolution_height?: number;
  enabled: boolean;
};

type Zone = { id: number; name: string };

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [form, setForm] = useState<Partial<Camera>>({ enabled: true });
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const [cams, zoneList] = await Promise.all([api.cameras.list(), api.zones.list()]);
      setCameras(cams);
      setZones(zoneList);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.cameras.create(form);
      setForm({ enabled: true });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete camera?')) return;
    await api.cameras.remove(id);
    load();
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Cameras</h2>
          <p className="text-slate-600">Manage RTSP sources.</p>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <form className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded" onSubmit={submit}>
        <label className="text-sm flex flex-col gap-1">
          Name
          <input className="border rounded px-2 py-1" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="text-sm flex flex-col gap-1">
          RTSP URL
          <input
            className="border rounded px-2 py-1"
            required
            value={form.rtsp_url || ''}
            onChange={(e) => setForm({ ...form, rtsp_url: e.target.value })}
          />
        </label>
        <label className="text-sm flex flex-col gap-1">
          Zone
          <select className="border rounded px-2 py-1" value={form.zone_id || ''} onChange={(e) => setForm({ ...form, zone_id: Number(e.target.value) || undefined })}>
            <option value="">Unassigned</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm flex flex-col gap-1">
          FPS
          <input
            type="number"
            className="border rounded px-2 py-1"
            value={form.fps || ''}
            onChange={(e) => setForm({ ...form, fps: e.target.value ? Number(e.target.value) : undefined })}
          />
        </label>
        <label className="text-sm flex flex-col gap-1">
          Resolution W
          <input
            type="number"
            className="border rounded px-2 py-1"
            value={form.resolution_width || ''}
            onChange={(e) => setForm({ ...form, resolution_width: e.target.value ? Number(e.target.value) : undefined })}
          />
        </label>
        <label className="text-sm flex flex-col gap-1">
          Resolution H
          <input
            type="number"
            className="border rounded px-2 py-1"
            value={form.resolution_height || ''}
            onChange={(e) => setForm({ ...form, resolution_height: e.target.value ? Number(e.target.value) : undefined })}
          />
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={form.enabled ?? true} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          Enabled
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded self-end" type="submit">
          Add camera
        </button>
      </form>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">RTSP URL</th>
              <th className="px-3 py-2 text-left">Zone</th>
              <th className="px-3 py-2 text-left">FPS</th>
              <th className="px-3 py-2 text-left">Enabled</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cameras.map((cam) => (
              <tr key={cam.id}>
                <td className="px-3 py-2 font-semibold">{cam.name}</td>
                <td className="px-3 py-2 break-all">{cam.rtsp_url}</td>
                <td className="px-3 py-2">{zones.find((z) => z.id === cam.zone_id)?.name || '—'}</td>
                <td className="px-3 py-2">{cam.fps ?? '—'}</td>
                <td className="px-3 py-2">{cam.enabled ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2 text-right">
                  <button className="text-red-600" onClick={() => remove(cam.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {cameras.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>
                  No cameras yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
