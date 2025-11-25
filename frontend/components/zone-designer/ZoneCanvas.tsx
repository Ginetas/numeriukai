'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Point } from './helpers/geometry';
import { ZoneType } from './hooks/useZoneDesigner';

interface ZoneCanvasProps {
  points: Point[];
  hoverPoint: Point | null;
  scale: number;
  translation: Point;
  imageUrl?: string;
  zoneType: ZoneType;
  onAddPoint: (point: Point) => void;
  onHover: (point: Point | null) => void;
  onFinish: () => void;
  onZoom: (deltaY: number, origin: Point) => void;
  onPan: (delta: Point) => void;
  toWorld: (point: Point) => Point;
}

const typeColors: Record<ZoneType, string> = {
  Entry: '#16a34a',
  Exit: '#dc2626',
  Control: '#2563eb',
};

export function ZoneCanvas({
  points,
  hoverPoint,
  scale,
  translation,
  imageUrl,
  zoneType,
  onAddPoint,
  onHover,
  onFinish,
  onZoom,
  onPan,
  toWorld,
}: ZoneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPosition, setLastPosition] = useState<Point | null>(null);
  const [background, setBackground] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setBackground(null);
      return;
    }
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setBackground(img);
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    context.save();
    context.scale(dpr, dpr);
    context.clearRect(0, 0, rect.width, rect.height);

    context.save();
    context.translate(translation.x, translation.y);
    context.scale(scale, scale);

    if (background) {
      context.drawImage(background, 0, 0, background.width, background.height);
    } else {
      context.fillStyle = '#f8fafc';
      context.fillRect(0, 0, rect.width, rect.height);
    }

    const drawPoints: Point[] = hoverPoint ? [...points, hoverPoint] : points;

    if (drawPoints.length > 0) {
      context.beginPath();
      context.moveTo(drawPoints[0].x, drawPoints[0].y);
      for (let i = 1; i < drawPoints.length; i++) {
        context.lineTo(drawPoints[i].x, drawPoints[i].y);
      }
      if (drawPoints.length > 2) {
        context.closePath();
        context.fillStyle = `${typeColors[zoneType]}22`;
        context.fill();
      }
      context.strokeStyle = typeColors[zoneType];
      context.lineWidth = 2;
      context.stroke();

      drawPoints.forEach((point) => {
        context.beginPath();
        context.arc(point.x, point.y, 4 / scale, 0, Math.PI * 2);
        context.fillStyle = typeColors[zoneType];
        context.fill();
        context.strokeStyle = '#0f172a';
        context.lineWidth = 1 / scale;
        context.stroke();
      });
    }

    context.restore();
    context.restore();
  }, [points, hoverPoint, scale, translation, background, zoneType]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const screenPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const worldPoint = toWorld(screenPoint);
    onAddPoint(worldPoint);
  };

  const handleMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const screenPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (isPanning && lastPosition) {
      onPan({ x: screenPoint.x - lastPosition.x, y: screenPoint.y - lastPosition.y });
      setLastPosition(screenPoint);
      return;
    }
    onHover(toWorld(screenPoint));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 2) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setIsPanning(true);
      setLastPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setLastPosition(null);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const origin = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    onZoom(event.deltaY, origin);
  };

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-lg border bg-white shadow-inner">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={onFinish}
        onContextMenu={(e) => e.preventDefault()}
        onWheel={handleWheel}
      />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-white/90 px-3 py-1 text-xs text-slate-600 shadow">
        <p>Scroll to zoom · Right click + drag to pan</p>
      </div>
    </div>
  );
}
