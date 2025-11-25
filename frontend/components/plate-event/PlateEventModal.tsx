'use client';
import React from 'react';
import PlateEventBoundingBoxView from './PlateEventBoundingBoxView';
import { PlateEvent } from '../../types/plate-event';

type Props = {
  event?: PlateEvent;
  onClose: () => void;
};

export const PlateEventModal: React.FC<Props> = ({ event, onClose }) => {
  if (!event) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-3/4 max-w-3xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Plate {event.plate_text}</h2>
          <button onClick={onClose} className="px-2 py-1 bg-gray-200 rounded">
            Close
          </button>
        </div>
        <PlateEventBoundingBoxView
          imageUrl={event.full_frame_url || ''}
          bbox={{ x: event.bbox.x, y: event.bbox.y, w: event.bbox.w, h: event.bbox.h }}
          plateText={event.plate_text}
        />
      </div>
    </div>
  );
};

export default PlateEventModal;
