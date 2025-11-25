'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_GEOMETRY,
  Geometry,
  Point,
  parseGeometry,
  serializeGeometry,
  validatePolygon,
} from '../helpers/geometry';

export type ZoneType = 'Entry' | 'Exit' | 'Control';

interface ZoneDesignerState {
  name: string;
  type: ZoneType;
  points: Point[];
  hoverPoint: Point | null;
  scale: number;
  translation: Point;
}

interface UseZoneDesignerOptions {
  initialName?: string;
  initialType?: ZoneType;
  initialGeometry?: Geometry | string | null;
}

export function useZoneDesigner(options?: UseZoneDesignerOptions) {
  const parsedGeometry = useMemo(
    () => parseGeometry(options?.initialGeometry ?? null) ?? DEFAULT_GEOMETRY,
    [options?.initialGeometry]
  );

  const [state, setState] = useState<ZoneDesignerState>({
    name: options?.initialName ?? '',
    type: options?.initialType ?? 'Entry',
    points: parsedGeometry.points ?? [],
    hoverPoint: null,
    scale: parsedGeometry.scale ?? 1,
    translation: parsedGeometry.translation ?? { x: 0, y: 0 },
  });

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      name: options?.initialName ?? prev.name,
      type: options?.initialType ?? prev.type,
      points: parsedGeometry.points ?? [],
      scale: parsedGeometry.scale ?? 1,
      translation: parsedGeometry.translation ?? { x: 0, y: 0 },
    }));
  }, [options?.initialName, options?.initialType, parsedGeometry]);

  const addPoint = useCallback((point: Point) => {
    setState((prev) => ({ ...prev, points: [...prev.points, point] }));
  }, []);

  const undo = useCallback(() => {
    setState((prev) => ({ ...prev, points: prev.points.slice(0, -1) }));
  }, []);

  const clear = useCallback(() => {
    setState((prev) => ({ ...prev, points: [], hoverPoint: null }));
  }, []);

  const setHoverPoint = useCallback((point: Point | null) => {
    setState((prev) => ({ ...prev, hoverPoint: point }));
  }, []);

  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }));
  }, []);

  const setType = useCallback((type: ZoneType) => {
    setState((prev) => ({ ...prev, type }));
  }, []);

  const setScale = useCallback((scale: number) => {
    setState((prev) => ({ ...prev, scale }));
  }, []);

  const setTranslation = useCallback((translation: Point) => {
    setState((prev) => ({ ...prev, translation }));
  }, []);

  const geometry: Geometry = useMemo(
    () => ({
      type: 'Polygon',
      points: state.points,
      scale: state.scale,
      translation: state.translation,
    }),
    [state.points, state.scale, state.translation]
  );

  const validation = useMemo(() => validatePolygon(state.points), [state.points]);

  const serializedGeometry = useMemo(() => serializeGeometry(geometry), [geometry]);

  const screenToWorld = useCallback(
    (point: Point): Point => ({
      x: (point.x - state.translation.x) / state.scale,
      y: (point.y - state.translation.y) / state.scale,
    }),
    [state.translation, state.scale]
  );

  const zoomAtPoint = useCallback(
    (delta: number, origin: Point) => {
      setState((prev) => {
        const scaleFactor = 1 - delta * 0.001;
        const newScale = Math.min(Math.max(prev.scale * scaleFactor, 0.2), 5);
        const worldX = (origin.x - prev.translation.x) / prev.scale;
        const worldY = (origin.y - prev.translation.y) / prev.scale;
        const newTranslation = {
          x: origin.x - worldX * newScale,
          y: origin.y - worldY * newScale,
        };
        return { ...prev, scale: newScale, translation: newTranslation };
      });
    },
    []
  );

  const panBy = useCallback((delta: Point) => {
    setState((prev) => ({
      ...prev,
      translation: {
        x: prev.translation.x + delta.x,
        y: prev.translation.y + delta.y,
      },
    }));
  }, []);

  return {
    ...state,
    geometry,
    serializedGeometry,
    validation,
    addPoint,
    undo,
    clear,
    setHoverPoint,
    setName,
    setType,
    setScale,
    setTranslation,
    screenToWorld,
    zoomAtPoint,
    panBy,
  };
}
