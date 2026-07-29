import { NextResponse } from "next/server";

// Auth error codes
export const AUTH_ERROR_CODES = {
  UNAUTHORIZED: 1, // General unauthorized (invalid/missing token, etc.)
  ACCESS_TOKEN_EXPIRED: 2, // Specifically access token expired
} as const;

// Auth error messages
export const AUTH_ERROR_MESSAGES = {
  [AUTH_ERROR_CODES.UNAUTHORIZED]: "Không có quyền truy cập",
  [AUTH_ERROR_CODES.ACCESS_TOKEN_EXPIRED]: "Access token đã hết hạn",
} as const;

// Interface for auth error response
interface AuthErrorResponse {
  success: false;
  error: string;
  code: number;
}

// Create 401 response with specific code
export function createAuthErrorResponse(
  code: keyof typeof AUTH_ERROR_CODES,
  customMessage?: string,
): NextResponse<AuthErrorResponse> {
  const errorCode = AUTH_ERROR_CODES[code];
  const message = customMessage || AUTH_ERROR_MESSAGES[errorCode];

  return NextResponse.json(
    {
      success: false,
      error: message,
      code: errorCode,
    },
    { status: 401 },
  );
}

// Specific helpers for common cases
export function createUnauthorizedResponse(
  customMessage?: string,
): NextResponse<AuthErrorResponse> {
  return createAuthErrorResponse("UNAUTHORIZED", customMessage);
}

export function createAccessTokenExpiredResponse(
  customMessage?: string,
): NextResponse<AuthErrorResponse> {
  return createAuthErrorResponse("ACCESS_TOKEN_EXPIRED", customMessage);
}

// Utility to determine error code from refresh token service response
export function getAuthErrorCodeFromServiceCode(
  serviceCode?: string,
): keyof typeof AUTH_ERROR_CODES {
  switch (serviceCode) {
    case "TOKEN_EXPIRED":
      return "ACCESS_TOKEN_EXPIRED";
    case "INVALID_TOKEN":
    case "TOKEN_NOT_FOUND":
    case "TOKEN_REVOKED":
    case "USER_NOT_FOUND":
    case "ACCOUNT_DISABLED":
    case "MISSING_REFRESH_TOKEN":
    default:
      return "UNAUTHORIZED";
  }
}
