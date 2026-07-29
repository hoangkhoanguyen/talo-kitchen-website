import { NextRequest, NextResponse } from "next/server";
import { createUnauthorizedResponse } from "@/lib/auth-responses";
import { adminRoutes } from "@/constants/route";
import { AUTH_COOKIE_KEYS } from "@/constants/auth";

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

  // For non-admin routes, proceed normally
  return NextResponse.next();
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
