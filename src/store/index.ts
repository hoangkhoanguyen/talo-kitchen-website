import { create } from "zustand";
import { createSidebarSlice, SidebarSlice } from "./sidebar";

export const useAdminConfigs = create<SidebarSlice>()((...a) => ({
  ...createSidebarSlice(...a),
}));
