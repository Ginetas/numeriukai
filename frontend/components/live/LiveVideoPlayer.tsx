'use client';
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

type Props = {
  cameraId: string;
  backendUrl: string;
};

export const LiveVideoPlayer: React.FC<Props> = ({ cameraId, backendUrl }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    const hls = new Hls();
    hls.loadSource(`${backendUrl}/streams/${cameraId}/hls/index.m3u8`);
    hls.attachMedia(videoRef.current);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoRef.current?.play();
      setIsPlaying(true);
    });
    return () => {
      hls.destroy();
    };
  }, [backendUrl, cameraId]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const enterFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <video ref={videoRef} className="w-full rounded border" controls muted />
      <div className="flex gap-2">
        <button onClick={togglePlay} className="px-3 py-1 bg-blue-600 text-white rounded">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={enterFullscreen} className="px-3 py-1 bg-gray-700 text-white rounded">
          Fullscreen
        </button>
      </div>
    </div>
  );
};

export default LiveVideoPlayer;
