"use client";
import { useCallback, useEffect, useRef } from "react";

/**
 * Phát âm báo động đơn mới bằng Web Audio API (không cần file audio).
 *
 * Nhà hàng thường mở nhạc nền nên âm báo được thiết kế to & chói (sawtooth layer
 * 2 tần số, đẩy qua limiter để to nhất mà không vỡ tiếng), gồm 3 hồi "beep-beep"
 * cao-thấp liên tiếp cho dễ nhận biết.
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

    const now = ctx.currentTime;

    // Master + limiter: cho phép đẩy âm lượng kịch mà tránh vỡ tiếng khó chịu
    const master = ctx.createGain();
    master.gain.setValueAtTime(1, now);
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-4, now);
    limiter.knee.setValueAtTime(0, now);
    limiter.ratio.setValueAtTime(20, now);
    limiter.attack.setValueAtTime(0.002, now);
    limiter.release.setValueAtTime(0.1, now);
    master.connect(limiter);
    limiter.connect(ctx.destination);

    // 1 tiếng: layer 2 oscillator sawtooth (tần số gốc + bội) cho to & chói
    const tone = (start: number, freq: number, dur: number) => {
      [
        { f: freq, peak: 0.95 },
        { f: freq * 1.5, peak: 0.55 },
      ].forEach(({ f, peak }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
        gain.gain.setValueAtTime(peak, start + dur - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      });
    };

    // 1 hồi = 2 tiếng cao-thấp gấp gáp ("beep-beep")
    const burst = (start: number) => {
      tone(start, 1200, 0.14);
      tone(start + 0.16, 900, 0.14);
    };

    // 3 hồi liên tiếp
    const BURSTS = 3;
    const BURST_GAP = 0.42;
    for (let i = 0; i < BURSTS; i++) {
      burst(now + i * BURST_GAP);
    }
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
