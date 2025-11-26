'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

type Zone = {
  id: number;
  name: string;
  geometry: { points: number[][] };
  type?: string;
  color?: string;
};

type Point = { x: number; y: number };

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('#ff0000');
  const [points, setPoints] = useState<Point[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const data = await api.zones.list();
      setZones(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '55';
    ctx.lineWidth = 2;
    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points, color]);

  const addPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints([...points, { x, y }]);
  };

  const reset = () => setPoints([]);

  const save = async () => {
    if (!name || points.length < 3) {
      setError('Name and at least 3 points required');
      return;
    }
    try {
      await api.zones.create({ name, type: type || undefined, color, geometry: { points: points.map((p) => [p.x, p.y]) } });
      setName('');
      setType('');
      reset();
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete zone?')) return;
    await api.zones.remove(id);
    load();
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Zones</h2>
          <p className="text-slate-600">Draw polygons and save them for cameras.</p>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm flex flex-col gap-1">
            Name
            <input className="border rounded px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-sm flex flex-col gap-1">
            Type
            <input className="border rounded px-2 py-1" value={type} onChange={(e) => setType(e.target.value)} />
          </label>
          <label className="text-sm flex flex-col gap-1">
            Color
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
          <div className="space-x-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save}>
              Save zone
            </button>
            <button className="border px-3 py-1 rounded" onClick={reset}>
              Reset points
            </button>
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-2">Click on the canvas to add polygon points.</p>
          <canvas ref={canvasRef} width={400} height={300} className="border rounded w-full" onClick={addPoint} />
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Points</th>
              <th className="px-3 py-2 text-left">Color</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.map((zone) => (
              <tr key={zone.id}>
                <td className="px-3 py-2 font-semibold">{zone.name}</td>
                <td className="px-3 py-2">{zone.type || '—'}</td>
                <td className="px-3 py-2">{zone.geometry?.points?.length || 0}</td>
                <td className="px-3 py-2">
                  <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: zone.color || '#ccc' }} />
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-red-600" onClick={() => remove(zone.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {zones.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-slate-500" colSpan={5}>
                  No zones yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
