import { StateCreator } from "zustand";

export interface SidebarSlice {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

export const createSidebarSlice: StateCreator<
  SidebarSlice,
  [],
  [],
  SidebarSlice
> = (set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },
  closeSidebar: () => {
    set({ isSidebarOpen: false });
  },
  openSidebar: () => {
    set({ isSidebarOpen: true });
  },
});
