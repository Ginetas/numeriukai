import React from 'react';
import { Card } from '../ui/card';
import { Geometry } from './helpers/geometry';
import { ZoneType } from './hooks/useZoneDesigner';

interface ZonePreviewProps {
  name: string;
  type: ZoneType;
  geometry: Geometry;
}

export function ZonePreview({ name, type, geometry }: ZonePreviewProps) {
  return (
    <Card>
      <h4 className="mb-2 text-lg font-semibold">Zone preview</h4>
      <div className="space-y-1 text-sm text-slate-700">
        <p>
          <span className="font-medium">Name:</span> {name || 'Untitled zone'}
        </p>
        <p>
          <span className="font-medium">Type:</span> {type}
        </p>
        <p>
          <span className="font-medium">Points:</span> {geometry.points.length}
        </p>
        <p className="text-xs text-slate-500">
          Geometry is saved with scale {geometry.scale.toFixed(2)} and translation (
          {geometry.translation.x.toFixed(1)}, {geometry.translation.y.toFixed(1)}).
        </p>
      </div>
    </Card>
  );
}
