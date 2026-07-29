"use server";

import { loginUser, registerUser } from "@/services/auth";
import { setAuthCookies, deleteAuthCookies } from "@/lib/auth";
import type { LoginFormData, RegisterFormData } from "@/validations/auth";

export interface LoginActionResult {
  success: boolean;
  user?: any;
  accessToken?: string;
  error?: string;
  code?: string;
}

export interface RegisterActionResult {
  success: boolean;
  user?: any;
  error?: string;
  code?: string;
}

export async function loginAction(
  formData: LoginFormData,
): Promise<LoginActionResult> {
  try {
    const { emailOrUsername, password } = formData;

    // Call service function (validation đã có trong service)
    const result = await loginUser({ emailOrUsername, password });

    if (result.success) {
      // Set both access and refresh tokens as HttpOnly cookies
      await setAuthCookies(result.accessToken!, result.refreshToken!);

      return {
        success: true,
        user: result.user,
      };
    } else {
      // Map service error codes to user-friendly messages
      let errorMessage = result.error || "Đăng nhập thất bại";

      switch (result.code) {
        case "MISSING_CREDENTIALS":
          errorMessage = "Email/username và mật khẩu là bắt buộc";
          break;
        case "INVALID_CREDENTIALS":
          errorMessage = "Email/username hoặc mật khẩu không đúng";
          break;
        case "ACCOUNT_DISABLED":
          errorMessage = "Tài khoản đã bị vô hiệu hóa";
          break;
        case "INTERNAL_ERROR":
          errorMessage = "Đã xảy ra lỗi hệ thống";
          break;
      }

      return {
        success: false,
        error: errorMessage,
        code: result.code,
      };
    }
  } catch (error) {
    console.error("Error in login action:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi server",
      code: "INTERNAL_ERROR",
    };
  }
}

// Register action
export async function registerAction(
  formData: RegisterFormData,
): Promise<RegisterActionResult> {
  try {
    const { username, email, password, firstName, lastName, secretCode } =
      formData;

    // Call service function
    const result = await registerUser({
      username,
      email,
      password,
      firstName,
      lastName,
      secretCode,
    });

    if (result.success) {
      return {
        success: true,
        user: result.user,
      };
    } else {
      // Map service error codes to user-friendly messages
      let errorMessage = result.error || "Tạo tài khoản thất bại";

      switch (result.code) {
        case "MISSING_FIELDS":
          errorMessage = "Tất cả các trường đều bắt buộc";
          break;
        case "INVALID_SECRET_CODE":
          errorMessage = "Secret code không đúng";
          break;
        case "EMAIL_EXISTS":
          errorMessage = "Email đã được sử dụng";
          break;
        case "USERNAME_EXISTS":
          errorMessage = "Username đã được sử dụng";
          break;
        case "INTERNAL_ERROR":
          errorMessage = "Đã xảy ra lỗi hệ thống";
          break;
      }

      return {
        success: false,
        error: errorMessage,
        code: result.code,
      };
    }
  } catch (error) {
    console.error("Error in register action:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi server",
      code: "INTERNAL_ERROR",
    };
  }
}

// Logout action
export async function logoutAction() {
  try {
    // Remove both access and refresh token cookies
    await deleteAuthCookies();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in logout action:", error);
    return {
      success: false,
    };
  }
}
