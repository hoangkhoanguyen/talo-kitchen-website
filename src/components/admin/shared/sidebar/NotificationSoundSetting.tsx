"use client";
import { Icon } from "@iconify/react";
import { notificationSound } from "@/lib/notification-sound";
import { useNotificationSettings } from "@/store/notification-settings";

/**
 * Ô chỉnh âm báo đơn mới trong sidebar admin: bật/tắt tiếng, kéo âm lượng, nghe
 * thử. Lưu theo từng thiết bị (localStorage).
 */
const NotificationSoundSetting = () => {
  const volume = useNotificationSettings((s) => s.volume);
  const muted = useNotificationSettings((s) => s.muted);
  const setVolume = useNotificationSettings((s) => s.setVolume);
  const toggleMuted = useNotificationSettings((s) => s.toggleMuted);

  const percent = Math.round(volume * 100);

  const handleTest = () => {
    // mở khoá autoplay (đây là 1 click của người dùng) rồi phát thử
    notificationSound.unlock();
    notificationSound.play(1);
  };

  return (
    <div className="rounded-lg bg-slate-800/60 px-3 py-3 text-white">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon icon="mdi:bell-ring-outline" className="text-base" />
          Âm báo đơn mới
        </span>
        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
          title={muted ? "Bật tiếng" : "Tắt tiếng"}
          className="rounded-md p-1 transition hover:bg-slate-700"
        >
          <Icon
            icon={muted ? "mdi:volume-off" : "mdi:volume-high"}
            className={`text-lg ${muted ? "text-red-400" : "text-white"}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={percent}
          disabled={muted}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          aria-label="Âm lượng âm báo đơn mới"
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-600 accent-green-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="w-9 shrink-0 text-right text-xs text-slate-300">
          {muted ? "—" : `${percent}%`}
        </span>
      </div>

      <button
        type="button"
        onClick={handleTest}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-slate-700 py-1.5 text-xs font-medium transition hover:bg-slate-600"
      >
        <Icon icon="mdi:play-circle-outline" className="text-sm" />
        Nghe thử
      </button>
    </div>
  );
};

export default NotificationSoundSetting;
