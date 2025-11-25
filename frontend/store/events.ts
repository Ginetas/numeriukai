import { create } from 'zustand';

export type PlateEvent = {
  id?: number;
  plate: string;
  camera_id?: number;
  timestamp?: string;
};

type EventStore = {
  events: PlateEvent[];
  addEvent: (event: PlateEvent) => void;
};

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 50) })),
}));
