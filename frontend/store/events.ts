import { create } from 'zustand';
import type { PlateEvent } from '@/lib/types';

type EventStore = {
  events: PlateEvent[];
  addEvent: (event: PlateEvent) => void;
  setEvents: (events: PlateEvent[]) => void;
};

export const useEventsStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 200) })),
  setEvents: (events) => set({ events }),
}));
