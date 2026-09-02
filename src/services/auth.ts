import { getDb } from "@/db/drizzle";
import { refreshTokens, refreshTokenRotations, users } from "@/db/schemas";
import {
  NewRefreshTokenDB,
  NewUserDB,
  RefreshTokenDB,
  UserDB,
} from "@/db/schemas";
import { eq, and, or, ilike, sql, gt } from "drizzle-orm";
import bcrypt from "bcrypt";
import {
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth";
import { getEnv } from "@/lib/env";

// Interface cho login credentials
export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

// Interface cho register user
export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  secretCode: string;
}

// Interface cho register response
export interface RegisterResponse {
  success: boolean;
  user?: Omit<UserDB, "password">;
  error?: string;
  code?: string;
}

// Interface cho login response
export interface LoginResponse {
  success: boolean;
  user?: Omit<UserDB, "password">;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  code?: string;
}

// Hàm login chính
export async function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  try {
    const { emailOrUsername, password } = credentials;

    // 1. Validate input
    if (!emailOrUsername || !password) {
      return {
        success: false,
        error: "Email/username và mật khẩu không được để trống",
        code: "MISSING_CREDENTIALS",
      };
    }

    // 2. Tìm user theo email hoặc username
    const user = await getUserByEmailOrUsername(emailOrUsername);
    if (!user) {
      return {
        success: false,
        error: "Email/username hoặc mật khẩu không đúng",
        code: "INVALID_CREDENTIALS",
      };
    }

    // 3. Verify password với bcrypt
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Email/username hoặc mật khẩu không đúng",
        code: "INVALID_CREDENTIALS",
      };
    }

    // 4. Check user status
    if (!user.isActive) {
      return {
        success: false,
        error: "Tài khoản đã bị vô hiệu hóa",
        code: "ACCOUNT_DISABLED",
      };
    }

    // 5. Generate tokens với JWT
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role,
      isActive: user.isActive,
    });

    const refreshTokenStr = await signRefreshToken({
      userId: user.id,
    });

    // 6. Save refresh token to database
    await createRefreshToken({
      userId: user.id,
      refreshToken: refreshTokenStr,
      isValid: true,
    });

    // 7. Return success response (exclude password from user data)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshTokenStr,
    };
  } catch (error) {
    console.error("Error during login:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi trong quá trình đăng nhập",
      code: "INTERNAL_ERROR",
    };
  }
}

// Interface cho refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Interface cho refresh token response
export interface RefreshTokenResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  code?: string;
}

// Hàm refresh access token
export async function refreshAccessToken(
  request: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  try {
    const { refreshToken } = request;

    // 1. Validate input
    if (!refreshToken) {
      return {
        success: false,
        error: "Refresh token không được để trống",
        code: "MISSING_REFRESH_TOKEN",
      };
    }

    // 2. Verify refresh token signature
    const verificationResult = await verifyRefreshToken(refreshToken);
    if (!verificationResult.isValid || !verificationResult.payload) {
      return {
        success: false,
        error: verificationResult.isExpired
          ? "Refresh token đã hết hạn"
          : "Refresh token không hợp lệ",
        code: verificationResult.isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      };
    }

    const userId = verificationResult.payload.userId;

    // 3. Get user info trước (cần cho cả 2 nhánh success bên dưới)
    const user = await getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: "Người dùng không tồn tại",
        code: "USER_NOT_FOUND",
      };
    }

    // 4. Check user status
    if (!user.isActive) {
      return {
        success: false,
        error: "Tài khoản đã bị vô hiệu hóa",
        code: "ACCOUNT_DISABLED",
      };
    }

    // 5. Generate new access + refresh token (for token rotation)
    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role,
      isActive: user.isActive,
    });

    const newRefreshToken = await signRefreshToken({
      userId: user.id,
    });

    // 6. Xoay token bằng compare-and-swap 1 câu: chỉ xoay nếu refreshToken
    // hiện tại trong DB vẫn đúng bằng token client gửi lên (chưa bị request
    // nào khác xoay trước). Tránh race condition khi 2 luồng refresh chạy
    // gần như đồng thời (client polling + server action) cùng dùng 1 cookie.
    const rotated = await rotateRefreshToken(
      refreshToken,
      userId,
      newRefreshToken,
    );

    if (rotated) {
      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    }

    // 7. CAS thất bại (0 row) — token không còn khớp isValid=true.
    // Có thể do: (a) race — token vừa bị 1 request khác xoay ra vài giây
    // trước, vẫn còn trong grace window; hoặc (b) token thực sự bị revoke/
    // không tồn tại.
    const racedRecord = await getRecordByPreviousToken(refreshToken, userId);
    if (racedRecord) {
      // Đây là "loser" của race: trả về cặp token HIỆN HÀNH (đã được
      // "winner" xoay ra), không xoay thêm để tránh tạo thêm race.
      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: racedRecord.refreshToken,
      };
    }

    // 8. Không tìm thấy token (đã hết grace window hoặc chưa từng tồn tại)
    const existingRecord = await getTokenInfoByToken(refreshToken, userId);
    if (!existingRecord) {
      return {
        success: false,
        error: "Refresh token không tồn tại hoặc không thuộc về user này",
        code: "TOKEN_NOT_FOUND",
      };
    }

    // Token tồn tại nhưng isValid=false → thực sự bị revoke
    return {
      success: false,
      error: "Refresh token đã bị vô hiệu hóa",
      code: "TOKEN_REVOKED",
    };
  } catch (error) {
    console.error("Error during token refresh:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi trong quá trình làm mới token",
      code: "INTERNAL_ERROR",
    };
  }
}

// Helper function để tìm user theo email hoặc username
export async function getUserByEmailOrUsername(
  emailOrUsername: string,
): Promise<UserDB | null> {
  try {
    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.email, emailOrUsername),
          eq(users.username, emailOrUsername),
        ),
      )
      .limit(1);

    return user[0] || null;
  } catch (error) {
    throw new Error(`Lỗi khi tìm user: ${error}`);
  }
}

// Tạo user mới
export async function createUser(userData: NewUserDB) {
  try {
    const db = getDb();
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
      })
      .returning();

    return newUser;
  } catch (error) {
    throw new Error(`Lỗi khi tạo user: ${error}`);
  }
}

// Đăng ký user mới với validation
export async function registerUser(
  userData: RegisterUserData,
): Promise<RegisterResponse> {
  try {
    const { username, email, password, firstName, lastName, secretCode } =
      userData;

    // 1. Validate input
    if (
      !username ||
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !secretCode
    ) {
      return {
        success: false,
        error: "Tất cả các trường đều bắt buộc",
        code: "MISSING_FIELDS",
      };
    }

    // 2. Validate secret code
    const env = getEnv();
    if (secretCode !== env.REGISTER_SECRET_CODE) {
      return {
        success: false,
        error: "Secret code không đúng",
        code: "INVALID_SECRET_CODE",
      };
    }

    // 3. Kiểm tra email đã tồn tại
    const existingEmailUser = await getUserByEmail(email);
    if (existingEmailUser) {
      return {
        success: false,
        error: "Email đã được sử dụng",
        code: "EMAIL_EXISTS",
      };
    }

    // 4. Kiểm tra username đã tồn tại
    const existingUsernameUser = await getUserByUsername(username);
    if (existingUsernameUser) {
      return {
        success: false,
        error: "Username đã được sử dụng",
        code: "USERNAME_EXISTS",
      };
    }

    // 5. Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 6. Tạo user mới
    const newUser = await createUser({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "admin", // Mặc định role là admin
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 7. Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Error in registerUser:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi khi tạo tài khoản",
      code: "INTERNAL_ERROR",
    };
  }
}

// Lấy user theo ID
export async function getUserById(id: number) {
  try {
    const db = getDb();
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    return user[0] || null;
  } catch (error) {
    throw new Error(`Lỗi khi lấy user theo ID: ${error}`);
  }
}

// Lấy user theo email
export async function getUserByEmail(email: string) {
  try {
    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    throw new Error(`Lỗi khi lấy user theo email: ${error}`);
  }
}

// Lấy user theo username
export async function getUserByUsername(username: string) {
  try {
    const db = getDb();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    throw new Error(`Lỗi khi lấy user theo username: ${error}`);
  }
}

// Cập nhật user
export async function updateUser(
  id: number,
  userData: Partial<
    Pick<
      UserDB,
      | "avatar"
      | "firstName"
      | "lastName"
      | "email"
      | "password"
      | "phone"
      | "isActive"
      | "role"
    >
  >,
) {
  try {
    const db = getDb();
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  } catch (error) {
    throw new Error(`Lỗi khi cập nhật user: ${error}`);
  }
}

// Lấy danh sách users với phân trang và tìm kiếm
export async function getUsers(
  options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {},
) {
  try {
    const { page = 1, limit = 10, search, role, isActive } = options;
    const offset = (page - 1) * limit;

    // Tạo điều kiện where
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(users.username, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
        ),
      );
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (typeof isActive === "boolean") {
      conditions.push(eq(users.isActive, isActive));
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Lấy users
    const db = getDb();
    const usersList = await db
      .select()
      .from(users)
      .where(whereCondition)
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    // Đếm tổng số users
    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(whereCondition);

    return {
      users: usersList,
      total: Number(totalCount.count),
      page,
      limit,
      totalPages: Math.ceil(Number(totalCount.count) / limit),
    };
  } catch (error) {
    throw new Error(`Lỗi khi lấy danh sách users: ${error}`);
  }
}

export async function createRefreshToken(data: NewRefreshTokenDB) {
  try {
    const db = getDb();
    const [newToken] = await db
      .insert(refreshTokens)
      .values({
        ...data,
      })
      .returning();

    return newToken;
  } catch (error) {
    throw new Error(`Lỗi khi insert refresh token: ${error}`);
  }
}

export async function getTokenInfoByToken(token: string, userId?: number) {
  try {
    const db = getDb();

    // Nếu có userId, thêm điều kiện để tăng bảo mật
    const whereConditions = [eq(refreshTokens.refreshToken, token)];
    if (userId !== undefined) {
      whereConditions.push(eq(refreshTokens.userId, userId));
    }

    const [tokenInfo] = await db
      .select()
      .from(refreshTokens)
      .where(and(...whereConditions))
      .limit(1);

    return tokenInfo || null;
  } catch (error) {
    throw new Error(`Lỗi khi lấy refresh token: ${error}`);
  }
}

export async function updateRefreshToken(
  id: number,
  data: Partial<Pick<RefreshTokenDB, "isValid" | "refreshToken">>,
) {
  try {
    const db = getDb();
    const [updatedRefreshToken] = await db
      .update(refreshTokens)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(refreshTokens.id, id))
      .returning();

    return updatedRefreshToken;
  } catch (error) {
    throw new Error(`Lỗi khi cập nhật refresh token: ${error}`);
  }
}

// Grace window: khoảng thời gian sau khi 1 refresh token bị xoay, request
// "thua" trong race vẫn được coi là hợp lệ nếu tới trong khoảng này.
const REFRESH_TOKEN_ROTATION_GRACE_WINDOW_MS = 30 * 1000;

/**
 * Xoay refresh token bằng compare-and-swap (1 câu UPDATE có điều kiện).
 * Chỉ update nếu `oldToken` vẫn đúng là giá trị hiện tại trong DB và
 * isValid = true. Trả về record mới nếu xoay thành công, null nếu có
 * request khác đã xoay trước đó (race) hoặc token không hợp lệ.
 */
export async function rotateRefreshToken(
  oldToken: string,
  userId: number,
  newToken: string,
) {
  try {
    const db = getDb();

    const [updated] = await db
      .update(refreshTokens)
      .set({
        refreshToken: newToken,
        isValid: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(refreshTokens.refreshToken, oldToken),
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.isValid, true),
        ),
      )
      .returning();

    if (updated) {
      // Ghi log rotation để 1 request "thua" race (đến sau vài giây, vẫn
      // cầm oldToken) có thể tự nhận ra và lấy lại cặp token hiện hành
      // thay vì bị coi là TOKEN_NOT_FOUND.
      const graceExpiresAt = new Date(
        Date.now() + REFRESH_TOKEN_ROTATION_GRACE_WINDOW_MS,
      );
      await db.insert(refreshTokenRotations).values({
        userId,
        oldRefreshToken: oldToken,
        refreshTokenId: updated.id,
        expiresAt: graceExpiresAt,
      });
    }

    return updated || null;
  } catch (error) {
    throw new Error(`Lỗi khi xoay refresh token: ${error}`);
  }
}

/**
 * Tìm record hiện hành mà `token` chính là refresh token VỪA BỊ xoay ra
 * (còn trong grace window). Dùng để phân biệt race condition (loser vẫn
 * hợp lệ) với token thực sự bị revoke/không tồn tại.
 */
export async function getRecordByPreviousToken(token: string, userId: number) {
  try {
    const db = getDb();
    const [rotation] = await db
      .select()
      .from(refreshTokenRotations)
      .where(
        and(
          eq(refreshTokenRotations.oldRefreshToken, token),
          eq(refreshTokenRotations.userId, userId),
          gt(refreshTokenRotations.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!rotation) {
      return null;
    }

    const [record] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.id, rotation.refreshTokenId),
          eq(refreshTokens.isValid, true),
        ),
      )
      .limit(1);

    return record || null;
  } catch (error) {
    throw new Error(`Lỗi khi tra cứu previous refresh token: ${error}`);
  }
}

// ===== TOKEN VERIFICATION SERVICE =====

import {
  verifyAccessToken,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  setAuthCookies,
  deleteAuthCookies,
} from "@/lib/auth";
import { adminRoutes } from "@/constants/route";
import { redirect } from "next/navigation";

// Interface cho kết quả verify token
export interface TokenVerificationResult {
  isValid: boolean;
  user?: Omit<UserDB, "password">;
  error?: string;
}

// Interface cho options của verification
export interface VerifyTokenOptions {
  clearTokensOnFail?: boolean; // Xóa tokens khi fail
  redirectOnFail?: boolean; // Redirect về login khi fail
  redirectPath?: string; // Custom redirect path
  currentPath?: string; // Current path để làm callback URL
}

/**
 * Service xác thực token tự động:
 * 1. Kiểm tra access token từ cookie
 * 2. Nếu không có token → trả false (+ clear/redirect nếu có option)
 * 3. Nếu token hợp lệ → trả true với thông tin user
 * 4. Nếu token hết hạn → tự động refresh và lưu cookie mới
 * 5. Nếu refresh fail → trả false (+ clear/redirect nếu có option)
 */
export async function verifyTokenWithAutoRefresh(
  options: VerifyTokenOptions = {},
): Promise<TokenVerificationResult> {
  const {
    clearTokensOnFail = false,
    redirectOnFail = false,
    redirectPath = adminRoutes.login(),
    currentPath,
  } = options;

  const handleFailure = async (
    error: string,
  ): Promise<TokenVerificationResult> => {
    if (clearTokensOnFail) {
      try {
        await deleteAuthCookies();
      } catch (err) {
        console.error("Error clearing cookies:", err);
      }
    }

    if (redirectOnFail) {
      let loginUrl = redirectPath;

      // Thêm callback URL nếu có currentPath
      if (currentPath && currentPath !== adminRoutes.login()) {
        const callbackUrl = encodeURIComponent(currentPath);
        const separator = redirectPath.includes("?") ? "&" : "?";
        loginUrl = `${redirectPath}${separator}callback_url=${callbackUrl}`;
      }

      redirect(loginUrl);
    }

    return {
      isValid: false,
      error,
    };
  };
  try {
    // 1. Lấy access token từ cookie
    const accessToken = await getAccessTokenFromCookie();

    if (!accessToken) {
      return await handleFailure("Không tìm thấy access token");
    }

    // 2. Verify access token
    const verifyResult = await verifyAccessToken(accessToken);

    // 3. Nếu token hợp lệ → trả về thông tin user
    if (verifyResult.isValid && verifyResult.payload) {
      // Lấy thông tin user từ database để đảm bảo data mới nhất
      const user = await getUserById(verifyResult.payload.userId);

      if (!user) {
        return await handleFailure("Không tìm thấy user");
      }

      // Loại bỏ password khỏi response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      return {
        isValid: true,
        user: userWithoutPassword,
      };
    }

    // 4. Nếu token hết hạn → thử refresh
    if (verifyResult.isExpired) {
      const refreshToken = await getRefreshTokenFromCookie();

      if (!refreshToken) {
        return await handleFailure("Không tìm thấy refresh token");
      }

      // Thử refresh access token
      const refreshResult = await refreshAccessToken({ refreshToken });

      if (refreshResult.success) {
        // Lưu tokens mới vào cookie
        await setAuthCookies(
          refreshResult.accessToken!,
          refreshResult.refreshToken!,
        );

        // Verify token mới và lấy thông tin user
        const newVerifyResult = await verifyAccessToken(
          refreshResult.accessToken!,
        );

        if (newVerifyResult.isValid && newVerifyResult.payload) {
          const user = await getUserById(newVerifyResult.payload.userId);

          if (!user) {
            return await handleFailure("Không tìm thấy user sau khi refresh");
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...userWithoutPassword } = user;

          return {
            isValid: true,
            user: userWithoutPassword,
          };
        }
      }

      // Refresh thất bại
      return await handleFailure("Không thể làm mới token");
    }

    // 5. Token không hợp lệ (không phải hết hạn)
    return await handleFailure("Access token không hợp lệ");
  } catch (error) {
    console.error("Error in token verification service:", error);
    return await handleFailure("Lỗi xác thực token");
  }
}

/**
 * Helper function cho admin actions - tự động clear tokens và redirect khi fail
 */
export async function verifyAdminAuth(
  currentPath?: string,
): Promise<TokenVerificationResult> {
  return await verifyTokenWithAutoRefresh({
    clearTokensOnFail: true,
    redirectOnFail: true,
    currentPath,
  });
}

/**
 * Helper function đơn giản cho admin actions
 * Tự động clear tokens và redirect về login khi fail
 * @param currentPath - Optional current path để làm callback URL sau khi login
 */
export async function verifyAdminAuthSimple(
  currentPath?: string,
): Promise<TokenVerificationResult> {
  return await verifyTokenWithAutoRefresh({
    clearTokensOnFail: true,
    redirectOnFail: true,
    currentPath,
  });
}

/**
 * Helper function cho middleware/components - với support đầy đủ cho callback URL
 */
export async function verifyAdminAuthWithCallback(request?: {
  url: string;
  nextUrl: { pathname: string; search: string };
}): Promise<TokenVerificationResult> {
  let currentPath: string | undefined;

  if (request) {
    // Lấy full path từ request (pathname + search params)
    currentPath = request.nextUrl.pathname + request.nextUrl.search;
  }

  return await verifyTokenWithAutoRefresh({
    clearTokensOnFail: true,
    redirectOnFail: true,
    currentPath,
  });
}
