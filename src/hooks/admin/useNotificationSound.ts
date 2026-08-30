"use client";
import { useCallback, useEffect, useRef } from "react";

/** File âm báo đơn mới trong public/ */
const SOUND_URL = "/assets/universfield-new-notification-036-485897.mp3";
/** Số lần phát liên tiếp mỗi khi có đơn mới */
const REPEAT = 3;
/** Khuếch đại to hơn mức 100% của file để xuyên nhạc nền nhà hàng */
const GAIN = 2.5;

/**
 * Phát âm báo đơn mới từ file mp3 trong public/, lặp 3 lần liên tiếp.
 *
 * Âm thanh được đẩy qua Web Audio (GainNode + limiter) để to hơn mức gốc của
 * file mà không vỡ tiếng. Trình duyệt chặn autoplay cho tới khi có tương tác đầu
 * tiên của người dùng, nên hook tự lắng nghe pointerdown/keydown để "mở khoá"
 * (resume AudioContext); nếu chưa mở khoá được thì `playBeep()` bỏ qua im lặng.
 */
export function useNotificationSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playsLeftRef = useRef(0);

  const setup = useCallback((): HTMLAudioElement | null => {
    if (typeof window === "undefined") return null;

    if (!audioRef.current) {
      const audio = new Audio(SOUND_URL);
      audio.preload = "auto";
      audio.volume = 1;
      // phát lại cho đủ REPEAT lần liên tiếp
      audio.addEventListener("ended", () => {
        if (playsLeftRef.current > 0) {
          playsLeftRef.current -= 1;
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      });
      audioRef.current = audio;

      // Khuếch đại qua Web Audio nếu trình duyệt hỗ trợ
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AC) {
          const ctx = new AC();
          const source = ctx.createMediaElementSource(audio);
          const gain = ctx.createGain();
          gain.gain.value = GAIN;
          const limiter = ctx.createDynamicsCompressor();
          limiter.threshold.value = -3;
          limiter.knee.value = 0;
          limiter.ratio.value = 20;
          limiter.attack.value = 0.002;
          limiter.release.value = 0.1;
          source.connect(gain);
          gain.connect(limiter);
          limiter.connect(ctx.destination);
          ctxRef.current = ctx;
        }
      } catch {
        // không khuếch đại được → vẫn phát file ở mức 100%
      }
    }

    return audioRef.current;
  }, []);

  const unlock = useCallback(() => {
    setup();
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }, [setup]);

  const playBeep = useCallback(() => {
    const audio = setup();
    if (!audio) return;

    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    playsLeftRef.current = REPEAT - 1; // lần đầu phát ngay dưới đây
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [setup]);

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
