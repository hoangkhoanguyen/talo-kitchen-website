/**
 * Engine phát âm báo đơn mới — singleton cấp module để component thông báo và ô
 * cài đặt âm lượng dùng chung một AudioContext/Audio element.
 *
 * Âm thanh đi qua Web Audio (GainNode + limiter) để chỉnh/khuếch đại âm lượng.
 * `volume` là 0..1 (do admin chỉnh), gain thực = volume * MAX_GAIN nên có thể to
 * hơn mức gốc của file để xuyên nhạc nền. Trình duyệt chặn autoplay tới khi có
 * tương tác đầu tiên → gọi `unlock()` trong lần tương tác đó.
 */

const SOUND_URL = "/assets/universfield-new-notification-036-485897.mp3";
/** hệ số khuếch đại tối đa khi volume = 1 (100%) */
const MAX_GAIN = 3;

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let gainNode: GainNode | null = null;
let playsLeft = 0;

let volume = 0.8; // 0..1
let muted = false;

function applyVolume() {
  const eff = muted ? 0 : volume;
  if (gainNode) {
    gainNode.gain.value = eff * MAX_GAIN;
    if (audio) audio.volume = 1; // gain node lo phần âm lượng
  } else if (audio) {
    audio.volume = Math.min(1, eff); // fallback khi không có Web Audio
  }
}

function ensure(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  if (!audio) {
    const el = new Audio(SOUND_URL);
    el.preload = "auto";
    el.addEventListener("ended", () => {
      if (playsLeft > 0) {
        playsLeft -= 1;
        el.currentTime = 0;
        el.play().catch(() => {});
      }
    });
    audio = el;

    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AC) {
        ctx = new AC();
        const source = ctx.createMediaElementSource(el);
        gainNode = ctx.createGain();
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -3;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.002;
        limiter.release.value = 0.1;
        source.connect(gainNode);
        gainNode.connect(limiter);
        limiter.connect(ctx.destination);
      }
    } catch {
      // không dựng được Web Audio → phát file ở mức âm lượng element
    }

    applyVolume();
  }

  return audio;
}

export const notificationSound = {
  /** mở khoá autoplay — gọi trong lần tương tác đầu của người dùng */
  unlock() {
    ensure();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  },

  /** phát âm báo `repeat` lần liên tiếp */
  play(repeat = 1) {
    const el = ensure();
    if (!el) return;
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    playsLeft = Math.max(0, repeat - 1);
    el.currentTime = 0;
    el.play().catch(() => {});
  },

  setVolume(v: number) {
    volume = Math.max(0, Math.min(1, v));
    applyVolume();
  },

  setMuted(m: boolean) {
    muted = m;
    applyVolume();
  },
};
