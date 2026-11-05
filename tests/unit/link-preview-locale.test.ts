/**
 * Link preview (Zalo/Facebook/...) phải ra đúng ngôn ngữ theo URL, không bị
 * redirect theo Accept-Language/cookie. Khách thật vẫn được tự nhận diện.
 * Run with: npx tsx --test tests/unit/link-preview-locale.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { isLinkPreviewBot } from "@/lib/link-preview-bot";
import { proxy } from "@/proxy";

const BASE = "https://www.talokitchenhg.com";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const BOT_UAS = [
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "Mozilla/5.0 (compatible; Zalo/1.0; +https://zalo.me)",
  "ZaloPC-win32-24v617",
  "TelegramBot (like TwitterBot)",
  "Twitterbot/1.0",
  "WhatsApp/2.23.20.0",
  "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
  "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
];

function req(path: string, ua: string, acceptLanguage?: string, cookie?: string) {
  const headers: Record<string, string> = { "user-agent": ua };
  if (acceptLanguage) headers["accept-language"] = acceptLanguage;
  if (cookie) headers.cookie = cookie;
  return new NextRequest(new URL(path, BASE), { headers });
}

test("isLinkPreviewBot: nhận diện các bot preview phổ biến", () => {
  for (const ua of BOT_UAS) assert.equal(isLinkPreviewBot(ua), true, ua);
});

test("isLinkPreviewBot: trình duyệt thường / UA rỗng không phải bot", () => {
  assert.equal(isLinkPreviewBot(BROWSER_UA), false);
  assert.equal(isLinkPreviewBot(""), false);
  assert.equal(isLinkPreviewBot(null), false);
  assert.equal(isLinkPreviewBot(undefined), false);
});

test("bot + Accept-Language vi + /menu/all → KHÔNG redirect, render en", async () => {
  for (const ua of BOT_UAS) {
    const res = await proxy(req("/menu/all", ua, "vi-VN,vi;q=0.9"));
    assert.equal(res.headers.get("location"), null, ua);
    assert.match(res.headers.get("x-middleware-rewrite") ?? "", /\/en\/menu\/all$/, ua);
  }
});

test("bot + cookie NEXT_LOCALE=vi + /menu/all → vẫn en", async () => {
  const res = await proxy(req("/menu/all", BOT_UAS[0], "vi", "NEXT_LOCALE=vi"));
  assert.equal(res.headers.get("location"), null);
  assert.match(res.headers.get("x-middleware-rewrite") ?? "", /\/en\/menu\/all$/);
});

test("bot + /vi/menu/all → render vi kể cả Accept-Language en", async () => {
  const res = await proxy(req("/vi/menu/all", BOT_UAS[1], "en-US"));
  assert.equal(res.headers.get("location"), null);
  const rewrite = res.headers.get("x-middleware-rewrite");
  // next-intl không rewrite khi path đã đúng locale → pass-through (null) hoặc /vi/...
  assert.ok(rewrite === null || /\/vi\/menu\/all$/.test(rewrite), String(rewrite));
});

test("trình duyệt thường + Accept-Language vi + /menu/all → vẫn redirect /vi (giữ hành vi cũ)", async () => {
  const res = await proxy(req("/menu/all", BROWSER_UA, "vi-VN,vi;q=0.9"));
  assert.match(res.headers.get("location") ?? "", /\/vi\/menu\/all$/);
});

test("trình duyệt thường + Accept-Language en + /menu/all → en, không redirect", async () => {
  const res = await proxy(req("/menu/all", BROWSER_UA, "en-US"));
  assert.equal(res.headers.get("location"), null);
});
