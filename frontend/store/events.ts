import { create } from 'zustand';

export type PlateEvent = {
  id?: number;
  plate: string;
  camera_id?: number;
  camera_name?: string;
  zone_id?: number;
  zone_name?: string;
  confidence?: number;
  thumbnail_url?: string;
  timestamp?: string;
};

type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

type EventStore = {
  events: PlateEvent[];
  connectionStatus: ConnectionStatus;
  connectionError?: string;
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void;
  setEvents: (events: PlateEvent[]) => void;
  addEvent: (event: PlateEvent) => void;
  clearEvents: () => void;
};

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  connectionStatus: 'idle',
  connectionError: undefined,
  setConnectionStatus: (status, error) => set({ connectionStatus: status, connectionError: error }),
  setEvents: (events) => set({ events }),
  addEvent: (event) =>
    set((state) => {
      const existingIndex = state.events.findIndex((item) => item.id && item.id === event.id);
      const nextEvents = [...state.events];
      if (existingIndex >= 0) {
        nextEvents[existingIndex] = { ...nextEvents[existingIndex], ...event };
      } else {
        nextEvents.unshift(event);
      }
      return { events: nextEvents.slice(0, 200) };
    }),
  clearEvents: () => set({ events: [] }),
}));
