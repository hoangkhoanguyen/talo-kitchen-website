import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/services/auth";
import {
  createUnauthorizedResponse,
  getAuthErrorCodeFromServiceCode,
  createAuthErrorResponse,
} from "@/lib/auth-responses";
import { setAuthCookies, deleteAuthCookies } from "@/lib/auth";
import { AUTH_COOKIE_KEYS } from "@/constants/auth";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies instead of body
    const refreshToken = request.cookies.get(
      AUTH_COOKIE_KEYS.REFRESH_TOKEN,
    )?.value;

    // Validate required fields
    if (!refreshToken) {
      await deleteAuthCookies();
      return createUnauthorizedResponse("Refresh token không tìm thấy");
    }

    // Call service function
    const result = await refreshAccessToken({ refreshToken });

    // Return response based on result
    if (result.success) {
      // Set cookies using utility function
      await setAuthCookies(result.accessToken!, result.refreshToken!);

      return NextResponse.json(
        {
          success: true,
          data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
          message: "Làm mới token thành công",
        },
        { status: 200 },
      );
    } else {
      // Lỗi hệ thống (DB chậm/mất kết nối lúc đông khách) KHÔNG phải lỗi đăng
      // nhập → trả 503 để client thử lại, không đá người dùng ra login.
      if (result.code === "INTERNAL_ERROR") {
        return NextResponse.json(
          { success: false, error: result.error, code: -1 },
          { status: 503 },
        );
      }

      // Refresh bị từ chối → xoá cookie để lần tải lại vào thẳng trang login
      // (proxy chuyển /admin/login về dashboard khi còn cookie access token).
      await deleteAuthCookies();

      // Use auth error utility with proper code mapping
      const authErrorCode = getAuthErrorCodeFromServiceCode(result.code);
      return createAuthErrorResponse(authErrorCode, result.error);
    }
  } catch (error) {
    console.error("Error in refresh token API:", error);

    return NextResponse.json(
      { success: false, error: "Đã xảy ra lỗi server", code: -1 },
      { status: 503 },
    );
  }
}

// OPTIONS method for CORS support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
