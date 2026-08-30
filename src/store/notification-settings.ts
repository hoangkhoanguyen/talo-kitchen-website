import { create } from "zustand";
import { notificationSound } from "@/lib/notification-sound";

const VOL_KEY = "admin.newOrderSound.volume";
const MUTE_KEY = "admin.newOrderSound.muted";

const DEFAULT_VOLUME = 0.8;

interface NotificationSettingsState {
  volume: number; // 0..1
  muted: boolean;
  hydrated: boolean;
  /** đọc giá trị đã lưu (localStorage) và đẩy vào engine — gọi 1 lần sau mount */
  hydrate: () => void;
  setVolume: (v: number) => void;
  toggleMuted: () => void;
}

/**
 * Cài đặt âm báo đơn mới — lưu theo TỪNG THIẾT BỊ (localStorage), vì tiếng phát ở
 * máy đang mở webadmin. Không đồng bộ giữa các máy là chủ ý.
 *
 * Khởi tạo bằng giá trị mặc định (tránh lệch hydration SSR), sau đó `hydrate()`
 * đọc localStorage ở client và cập nhật lại.
 */
export const useNotificationSettings = create<NotificationSettingsState>()(
  (set, get) => ({
    volume: DEFAULT_VOLUME,
    muted: false,
    hydrated: false,

    hydrate: () => {
      if (get().hydrated) return;
      let volume = DEFAULT_VOLUME;
      let muted = false;
      try {
        const v = localStorage.getItem(VOL_KEY);
        if (v !== null) {
          const n = parseFloat(v);
          if (!Number.isNaN(n)) volume = Math.max(0, Math.min(1, n));
        }
        muted = localStorage.getItem(MUTE_KEY) === "1";
      } catch {
        // không đọc được localStorage → giữ mặc định
      }
      notificationSound.setVolume(volume);
      notificationSound.setMuted(muted);
      set({ volume, muted, hydrated: true });
    },

    setVolume: (v) => {
      const volume = Math.max(0, Math.min(1, v));
      notificationSound.setVolume(volume);
      try {
        localStorage.setItem(VOL_KEY, String(volume));
      } catch {
        // bỏ qua nếu localStorage không khả dụng
      }
      set({ volume });
    },

    toggleMuted: () => {
      const muted = !get().muted;
      notificationSound.setMuted(muted);
      try {
        localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
      } catch {
        // bỏ qua nếu localStorage không khả dụng
      }
      set({ muted });
    },
  }),
);
