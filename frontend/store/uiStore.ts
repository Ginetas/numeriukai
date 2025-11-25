import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  selectedEventId?: number;
  setSidebarOpen: (open: boolean) => void;
  setSelectedEventId: (id?: number) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  selectedEventId: undefined,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedEventId: (id) => set({ selectedEventId: id }),
}));
