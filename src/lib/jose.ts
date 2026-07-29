import { JWTPayload, SignJWT, jwtVerify } from "jose";

// Chuyển secret thành Uint8Array

export async function signToken<T extends JWTPayload>(
  payload: T,
  expiresIn: string,
  secret: Uint8Array
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
