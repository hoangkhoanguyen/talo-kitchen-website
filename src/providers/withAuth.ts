import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, AccessTokenPayload } from "@/lib/auth";
import { AUTH_COOKIE_KEYS } from "@/constants/auth";
import {
  createUnauthorizedResponse,
  createAccessTokenExpiredResponse,
} from "@/lib/auth-responses";

type Handler<T = any> = (
  payload: AccessTokenPayload,
  ...args: any[]
) => Promise<NextResponse<T>>;

export function withAuth(handler: Handler) {
  return async (...args: any[]) => {
    const req = args[0] as NextRequest;

    // 1. Lấy access token từ cookies
    const accessToken = req.cookies.get(AUTH_COOKIE_KEYS.ACCESS_TOKEN)?.value;

    // 2. Kiểm tra xem có token không
    if (!accessToken) {
      throw createUnauthorizedResponse("Không tìm thấy access token");
    }

    // 3. Verify access token
    const verifyResult = await verifyAccessToken(accessToken);

    // 4. Kiểm tra kết quả verify
    if (!verifyResult.isValid) {
      if (verifyResult.isExpired) {
        throw createAccessTokenExpiredResponse();
      } else {
        throw createUnauthorizedResponse("Access token không hợp lệ");
      }
    }

    // 5. Nếu verify thành công, pass payload vào handler
    if (!verifyResult.payload) {
      throw createUnauthorizedResponse("Không thể lấy thông tin từ token");
    }

    return await handler(verifyResult.payload, ...args);
  };
}
