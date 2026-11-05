/**
 * Nhận diện bot lấy preview link (Zalo, Facebook/Messenger, Telegram, ...).
 *
 * Bot không mang ngôn ngữ của người gửi link, nên với bot ta KHÔNG tự đoán
 * ngôn ngữ (cookie / Accept-Language) mà để chính URL quyết định:
 * `/menu/all` → en (locale mặc định), `/vi/menu/all` → vi.
 * Pure function — không import `server-only`, dùng được trong unit test.
 */
const LINK_PREVIEW_BOT_UA =
  /facebookexternalhit|facebookcatalog|meta-externalagent|zalo|twitterbot|telegrambot|slackbot|whatsapp|discordbot|linkedinbot|skypeuripreview|pinterest|redditbot|applebot|embedly|vkshare|line-poker|kakaotalk-scrap|viber|snapchat|iframely|google-pagerenderer/i;

export function isLinkPreviewBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return LINK_PREVIEW_BOT_UA.test(userAgent);
}
