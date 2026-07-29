import { create } from "zustand";

interface QuickCartModalState {
  isOpen: boolean;
  productId: number | null;
  openModal: (id: number) => void;
  closeModal: () => void;
}

export const useQuickCartModalStore = create<QuickCartModalState>((set) => ({
  isOpen: false,
  productId: null,
  openModal: (id) => set({ isOpen: true, productId: id }),
  closeModal: () => set({ isOpen: false, productId: null }),
}));
