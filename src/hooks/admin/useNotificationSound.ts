"use client";
import { useCallback, useEffect } from "react";
import { notificationSound } from "@/lib/notification-sound";

/**
 * Wrapper React quanh engine âm báo (singleton `notificationSound`).
 * Lắng nghe tương tác đầu tiên để mở khoá autoplay; `playBeep()` phát 1 lần.
 * Âm lượng/tắt tiếng do `useNotificationSettings` điều khiển qua engine.
 */
export function useNotificationSound() {
  useEffect(() => {
    const handler = () => notificationSound.unlock();
    window.addEventListener("pointerdown", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  const playBeep = useCallback(() => {
    notificationSound.play(1);
  }, []);

  return { playBeep };
}
