'use client';

import { useEffect } from 'react';
import { API_BASE } from '@/lib/api-client';
import { PlateEvent } from '@/lib/types';
import { useEventsStore } from '@/store/events';
import { useToast } from '@/components/ui/toast';

export function useEventsStream(fallbackFetch: () => void) {
  const { addEvent } = useEventsStore();
  const { push } = useToast();

  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallback: NodeJS.Timeout | null = null;

    try {
      ws = new WebSocket(`${API_BASE.replace('http', 'ws')}/events/stream`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.plate) {
            addEvent({ ...(data as PlateEvent), timestamp: data.timestamp ?? new Date().toISOString(), meta: data.meta || {} });
          }
        } catch (err) {
          console.error('Failed to parse event', err);
        }
      };
      ws.onclose = () => {
        push({ title: 'WebSocket closed', description: 'Falling back to polling' });
        fallback = setInterval(fallbackFetch, 10000);
      };
    } catch (error) {
      push({ title: 'WebSocket error', description: 'Using polling mode', variant: 'destructive' });
      fallback = setInterval(fallbackFetch, 10000);
    }

    return () => {
      if (ws) ws.close();
      if (fallback) clearInterval(fallback);
    };
  }, [addEvent, fallbackFetch, push]);
}
