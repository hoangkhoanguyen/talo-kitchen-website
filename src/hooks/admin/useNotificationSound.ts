"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Phát tiếng "pip" thông báo bằng Web Audio API (không cần file audio).
 *
 * Trình duyệt chặn autoplay âm thanh cho tới khi có tương tác đầu tiên của người
 * dùng. Hook tự lắng nghe pointerdown/keydown để "mở khoá" (resume) AudioContext;
 * nếu chưa mở khoá được thì `playBeep()` im lặng bỏ qua thay vì lỗi.
 */
export function useNotificationSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  const unlock = useCallback(() => {
    const ctx = getCtx();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }, [getCtx]);

  const playBeep = useCallback(() => {
    const ctx = getCtx();
    // autoplay còn bị khoá → im lặng, không ném lỗi
    if (!ctx || ctx.state !== "running") return;

    const beepAt = (start: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    };

    const now = ctx.currentTime;
    beepAt(now); // "pip"
    beepAt(now + 0.25); // "pip"
  }, [getCtx]);

  useEffect(() => {
    const handler = () => unlock();
    window.addEventListener("pointerdown", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [unlock]);

  return { playBeep, unlock };
}
