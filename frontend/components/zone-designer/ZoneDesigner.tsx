'use client';

import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { Button } from '../ui/button';
import { Toaster, ToastProvider, useToast } from '../ui/use-toast';
import { Geometry, validatePolygon } from './helpers/geometry';
import { useZoneDesigner, ZoneType } from './hooks/useZoneDesigner';
import { ZoneCanvas } from './ZoneCanvas';
import { ZonePreview } from './ZonePreview';
import { ZoneToolbar } from './ZoneToolbar';

export interface ZoneDesignerProps {
  imageUrl?: string;
  initialName?: string;
  initialType?: ZoneType;
  initialGeometry?: Geometry | string | null;
  onSave: (payload: { name: string; type: ZoneType; geometry: string }) => void;
  onCancel?: () => void;
}

export interface ZoneDesignerHandle {
  save: () => void;
}

const DesignerContent = forwardRef<ZoneDesignerHandle | undefined, ZoneDesignerProps>(
  (props, ref) => {
    const { push } = useToast();
    const zone = useZoneDesigner({
      initialName: props.initialName,
      initialType: props.initialType,
      initialGeometry: props.initialGeometry,
    });

    const handleFinish = useCallback(() => {
      const validation = validatePolygon(zone.points);
      if (!validation.valid) {
        push({ title: validation.error || 'Polygon invalid', variant: 'destructive' });
      } else {
        push({ title: 'Polygon closed', description: 'You can now save the zone.' });
      }
    }, [push, zone.points]);

    const handleSave = useCallback(() => {
      const validation = validatePolygon(zone.points);
      if (!validation.valid) {
        push({ title: validation.error || 'Polygon invalid', variant: 'destructive' });
        return;
      }
      props.onSave({
        name: zone.name,
        type: zone.type,
        geometry: zone.serializedGeometry,
      });
    }, [props, push, zone.name, zone.type, zone.serializedGeometry, zone.points]);

    useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave]);

    return (
      <div className="space-y-4">
        <ZoneToolbar
          name={zone.name}
          type={zone.type}
          onNameChange={zone.setName}
          onTypeChange={zone.setType}
          onUndo={zone.undo}
          onClear={zone.clear}
          onFinish={handleFinish}
          onSave={handleSave}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ZoneCanvas
              points={zone.points}
              hoverPoint={zone.hoverPoint}
              scale={zone.scale}
              translation={zone.translation}
              imageUrl={props.imageUrl}
              zoneType={zone.type}
              onAddPoint={zone.addPoint}
              onHover={zone.setHoverPoint}
              onFinish={handleFinish}
              onZoom={zone.zoomAtPoint}
              onPan={zone.panBy}
              toWorld={zone.screenToWorld}
            />
          </div>
          <div className="space-y-4">
            <ZonePreview name={zone.name} type={zone.type} geometry={zone.geometry} />
            {props.onCancel && (
              <Button variant="ghost" className="w-full" onClick={props.onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
        <Toaster />
      </div>
    );
  }
);

export const ZoneDesigner = forwardRef<ZoneDesignerHandle | undefined, ZoneDesignerProps>(
  (props, ref) => (
    <ToastProvider>
      <DesignerContent {...props} ref={ref} />
    </ToastProvider>
  )
);

ZoneDesigner.displayName = 'ZoneDesigner';
