import bcrypt from "bcrypt";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { getEnv } from "./env";
import { AUTH_COOKIE_KEYS, AUTH_COOKIE_OPTIONS } from "@/constants/auth";

export async function hashPassword(
  plainTextPassword: string,
  saltRounds = 10,
): Promise<string> {
  return bcrypt.hash(plainTextPassword, saltRounds);
}

export async function comparePassword(
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}

// Chuyển secret thành Uint8Array
function getSecretAsUint8Array(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signToken<T extends JWTPayload>(
  payload: T,
  expiresIn: string,
  secret: Uint8Array,
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn) // vd: '1h', '7d'
    .sign(secret);
}

export async function verifyToken<T>(token: string, secret: Uint8Array) {
  try {
    const { payload } = await jwtVerify<T>(token, secret);
    return {
      payload,
      isValid: true,
      isExpired: false,
    };
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return {
        payload: null,
        isValid: false,
        isExpired: true,
      };
    }
    return {
      payload: null,
      isValid: false,
      isExpired: false,
    };
  }
}

// ===== ACCESS TOKEN FUNCTIONS =====

// Interface cho Access Token payload
export interface AccessTokenPayload extends JWTPayload {
  userId: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  tokenType: "access";
}

// Input type cho access token (không cần tokenType)
export interface AccessTokenInput {
  userId: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
}

// Sign Access Token
export async function signAccessToken(
  payload: AccessTokenInput,
): Promise<string> {
  const env = getEnv();
  const secret = getSecretAsUint8Array(env.ACCESS_TOKEN_JWT_SECRET);

  const tokenPayload: AccessTokenPayload = {
    userId: payload.userId,
    email: payload.email,
    username: payload.username,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
    isActive: payload.isActive,
    tokenType: "access",
  };

  return await signToken(tokenPayload, env.ACCESS_TOKEN_JWT_EXPIRES_IN, secret);
}

// Verify Access Token
export async function verifyAccessToken(token: string) {
  const env = getEnv();
  const secret = getSecretAsUint8Array(env.ACCESS_TOKEN_JWT_SECRET);

  return await verifyToken<AccessTokenPayload>(token, secret);
}

// ===== REFRESH TOKEN FUNCTIONS =====

// Interface cho Refresh Token payload
export interface RefreshTokenPayload extends JWTPayload {
  userId: number;
  tokenType: "refresh";
}

// Input type cho refresh token (không cần tokenType)
export interface RefreshTokenInput {
  userId: number;
}

// Sign Refresh Token
export async function signRefreshToken(
  payload: RefreshTokenInput,
): Promise<string> {
  const env = getEnv();
  const secret = getSecretAsUint8Array(env.REFRESH_TOKEN_JWT_SECRET);

  const tokenPayload: RefreshTokenPayload = {
    userId: payload.userId,
    tokenType: "refresh",
  };

  return await signToken(
    tokenPayload,
    env.REFRESH_TOKEN_JWT_EXPIRES_IN,
    secret,
  );
}

// Verify Refresh Token
export async function verifyRefreshToken(token: string) {
  const env = getEnv();
  const secret = getSecretAsUint8Array(env.REFRESH_TOKEN_JWT_SECRET);

  return await verifyToken<RefreshTokenPayload>(token, secret);
}

// ===== COOKIE UTILITIES =====

import { cookies } from "next/headers";

// Helper function để parse expiry string thành seconds
function parseExpiryToSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value; // seconds
    case "m":
      return value * 60; // minutes to seconds
    case "h":
      return value * 60 * 60; // hours to seconds
    case "d":
      return value * 24 * 60 * 60; // days to seconds
    case "w":
      return value * 7 * 24 * 60 * 60; // weeks to seconds
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}

// Set both access and refresh token cookies
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
) {
  const cookieStore = await cookies();
  const env = getEnv();

  // Parse refresh token expiry from env
  const refreshTokenExpiry = parseExpiryToSeconds(
    env.REFRESH_TOKEN_JWT_EXPIRES_IN,
  );

  const cookieOptions = {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: refreshTokenExpiry, // Cả 2 cookies đều dùng refresh token expiry
  };

  // Set access token cookie
  cookieStore.set(AUTH_COOKIE_KEYS.ACCESS_TOKEN, accessToken, cookieOptions);

  // Set refresh token cookie
  cookieStore.set(AUTH_COOKIE_KEYS.REFRESH_TOKEN, refreshToken, cookieOptions);
}

// Set only access token cookie (for refresh scenarios)
export async function setAccessTokenCookie(accessToken: string) {
  const cookieStore = await cookies();
  const env = getEnv();

  const refreshTokenExpiry = parseExpiryToSeconds(
    env.REFRESH_TOKEN_JWT_EXPIRES_IN,
  );

  cookieStore.set(AUTH_COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: refreshTokenExpiry,
  });
}

// Delete both auth cookies
export async function deleteAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_KEYS.ACCESS_TOKEN);
  cookieStore.delete(AUTH_COOKIE_KEYS.REFRESH_TOKEN);
}

// Get access token from cookie
export async function getAccessTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_KEYS.ACCESS_TOKEN)?.value;
}

// Get refresh token from cookie
export async function getRefreshTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_KEYS.REFRESH_TOKEN)?.value;
}
