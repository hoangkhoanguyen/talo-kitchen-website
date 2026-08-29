import { create } from "zustand";

export type NewOrderNotice = {
  id: number;
  code: string;
  customerName: string;
  totalPrice: number;
  /** ISO string (đã serialize từ timestamp) */
  createdAt: string;
};

interface NewOrdersState {
  /** đã lấy id đơn mới nhất lúc mở trang để làm mốc chưa */
  initialized: boolean;
  /** con trỏ id lớn nhất đã poll tới (dùng làm `since` cho lần poll sau) */
  lastFetchedId: number | null;
  /** danh sách đơn chưa xem đang gom trong popup */
  unseenOrders: NewOrderNotice[];
  isPopupOpen: boolean;

  /** khởi tạo mốc lần đầu — chỉ chạy 1 lần, tránh thông báo cho đơn cũ */
  initCursor: (latestId: number) => void;
  /** thêm đơn mới vào popup; trả về số đơn thực sự mới (để quyết định phát beep) */
  pushOrders: (orders: NewOrderNotice[]) => number;
  /** admin đóng popup = đã xem hết list hiện tại */
  dismiss: () => void;
}

export const useNewOrdersStore = create<NewOrdersState>()((set, get) => ({
  initialized: false,
  lastFetchedId: null,
  unseenOrders: [],
  isPopupOpen: false,

  initCursor: (latestId) => {
    if (get().initialized) return;
    set({ initialized: true, lastFetchedId: latestId });
  },

  pushOrders: (orders) => {
    if (!orders.length) return 0;

    const state = get();
    const existingIds = new Set(state.unseenOrders.map((o) => o.id));
    const fresh = orders.filter((o) => !existingIds.has(o.id));

    const maxId = orders.reduce(
      (m, o) => (o.id > m ? o.id : m),
      state.lastFetchedId ?? 0,
    );

    if (!fresh.length) {
      // không có đơn mới thực sự, chỉ cần đẩy con trỏ
      set({ lastFetchedId: maxId, initialized: true });
      return 0;
    }

    const merged = [...fresh, ...state.unseenOrders].sort(
      (a, b) => b.id - a.id,
    );

    set({
      unseenOrders: merged,
      lastFetchedId: maxId,
      isPopupOpen: true,
      initialized: true,
    });

    return fresh.length;
  },

  dismiss: () => set({ unseenOrders: [], isPopupOpen: false }),
}));
