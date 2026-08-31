import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createUnauthorizedResponse } from "@/lib/auth-responses";
import { adminRoutes } from "@/constants/route";
import { AUTH_COOKIE_KEYS } from "@/constants/auth";
import { routing } from "@/i18n/routing";

/**
 * next-intl middleware cho các route web user.
 * Detect locale theo thứ tự: path prefix > cookie NEXT_LOCALE > Accept-Language > defaultLocale
 * (RULE-03). `localePrefix: 'as-needed'`: locale mặc định (en) KHÔNG có prefix trong URL,
 * chỉ locale không mặc định (vi) mới có prefix. Path `/en/...` bị redirect bỏ prefix về `/...`.
 */
const intlMiddleware = createIntlMiddleware(routing);

/**
 * Đường dẫn trỏ tới file tĩnh / metadata route (có phần mở rộng ở segment cuối):
 * `/robots.txt`, `/sitemap.xml`, `/site.webmanifest`, ...
 * Đây KHÔNG phải page nên tuyệt đối không được gắn prefix locale (RULE-09, RI-05).
 * Matcher bên dưới chỉ loại trừ một danh sách cố định các đuôi ảnh/font, nên các
 * đuôi còn lại được lọc ở đây. An toàn với route web user vì slug/category luôn
 * được chuẩn hoá về `[a-z0-9-]` (xem `slugify` trong `src/lib/utils.ts`).
 */
const STATIC_FILE_PATHNAME = /\.[^/]+$/;

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Special case: Check if user is accessing login page while already authenticated
  if (pathname === adminRoutes.login()) {
    const accessToken = request.cookies.get(
      AUTH_COOKIE_KEYS.ACCESS_TOKEN,
    )?.value;

    if (accessToken) {
      // User has token, redirect to callback URL or dashboard
      const callbackUrl = searchParams.get("callback_url");
      if (callbackUrl) {
        // Redirect to the original intended page
        return NextResponse.redirect(
          new URL(decodeURIComponent(callbackUrl), request.url),
        );
      } else {
        // Redirect to dashboard
        return NextResponse.redirect(
          new URL(adminRoutes.dashboard(), request.url),
        );
      }
    }
    // If no token, allow access to login page
    return NextResponse.next();
  }

  // Check if the path is an admin route (excluding auth routes)
  if (
    pathname.startsWith(adminRoutes.root()) &&
    !pathname.startsWith(adminRoutes.login()) &&
    !pathname.startsWith(adminRoutes.register())
  ) {
    // Get access token from cookies
    const accessToken = request.cookies.get(
      AUTH_COOKIE_KEYS.ACCESS_TOKEN,
    )?.value;

    if (!accessToken) {
      // Handle different response based on route type
      if (pathname.startsWith("/admin/api")) {
        // For API routes: return 401 error
        return createUnauthorizedResponse("Chưa xác thực");
      } else {
        // For page routes: redirect to login with callback URL
        const fullPath = pathname + request.nextUrl.search;
        const callbackUrl = encodeURIComponent(fullPath);
        const loginUrl = new URL(
          `${adminRoutes.login()}?callback_url=${callbackUrl}`,
          request.url,
        );
        return NextResponse.redirect(loginUrl);
      }
    }

    // Token exists, allow the request to proceed
    return NextResponse.next();
  }

  // Any remaining admin path (e.g. /admin/register, /admin itself) keeps the
  // previous behaviour: pass through untouched and NEVER reach next-intl,
  // so admin URLs are never prefixed with a locale (RULE-09, RULE-10, RI-01).
  if (pathname.startsWith(adminRoutes.root())) {
    return NextResponse.next();
  }

  // Web user API routes (app/(web)/api → runtime path /api/...) are excluded
  // from i18n: no locale prefix is inserted, response stays as-is
  // (RULE-09, EC-04, RI-02).
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Static files / metadata routes (robots.txt, sitemap.xml, site.webmanifest, ...)
  // và internal Next.js paths: pass through, không i18n (RULE-09, RI-05).
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    STATIC_FILE_PATHNAME.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Everything else = web user routes → next-intl middleware (AC-02.1, EC-01, EC-02)
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets folder)
     * - images, fonts (static resources)
     * - files with extensions: svg, png, jpg, jpeg, gif, webp, ico, woff, woff2, ttf, otf
     */
    "/((?!_next/static|_next/image|favicon.ico|assets|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
};
