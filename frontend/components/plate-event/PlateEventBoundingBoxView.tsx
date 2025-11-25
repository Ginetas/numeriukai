'use client';
import React, { useEffect, useRef } from 'react';

type Props = {
  imageUrl: string;
  bbox: { x: number; y: number; w: number; h: number };
  plateText: string;
};

export const PlateEventBoundingBoxView: React.FC<Props> = ({ imageUrl, bbox, plateText }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);
      ctx.fillStyle = 'red';
      ctx.font = '16px sans-serif';
      ctx.fillText(plateText, bbox.x, Math.max(10, bbox.y - 4));
    };
    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }
  }, [bbox, plateText]);

  return (
    <div className="relative">
      <img ref={imgRef} src={imageUrl} alt="frame" className="rounded" />
      <canvas ref={canvasRef} className="absolute left-0 top-0" />
    </div>
  );
};

export default PlateEventBoundingBoxView;
