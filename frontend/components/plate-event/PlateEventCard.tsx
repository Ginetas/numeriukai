'use client';
import React from 'react';
import { PlateEvent } from '../../types/plate-event';

interface Props {
  event: PlateEvent;
  onSelect?: (ev: PlateEvent) => void;
}

export const PlateEventCard: React.FC<Props> = ({ event, onSelect }) => {
  return (
    <div
      className="border rounded p-3 hover:shadow cursor-pointer"
      onClick={() => onSelect?.(event)}
      data-testid="plate-event-card"
    >
      <div className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</div>
      <div className="text-lg font-semibold">{event.plate_text}</div>
      <div className="text-xs text-gray-600">Camera: {event.camera_id}</div>
    </div>
  );
};

export default PlateEventCard;
