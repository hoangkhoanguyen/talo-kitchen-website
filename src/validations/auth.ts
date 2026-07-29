import { z } from "zod";

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: "Email hoặc username là bắt buộc" })
    .max(255, { message: "Email hoặc username quá dài" }),
  password: z
    .string()
    .min(1, { message: "Mật khẩu là bắt buộc" })
    .max(255, { message: "Mật khẩu quá dài" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username phải ít nhất 3 ký tự" })
      .max(50, { message: "Username không được quá 50 ký tự" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username chỉ chứa chữ, số và dấu gạch dưới",
      }),
    email: z
      .string()
      .email({ message: "Email không hợp lệ" })
      .max(255, { message: "Email quá dài" }),
    password: z
      .string()
      .min(6, { message: "Mật khẩu phải ít nhất 6 ký tự" })
      .max(255, { message: "Mật khẩu quá dài" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Xác nhận mật khẩu là bắt buộc" }),
    firstName: z
      .string()
      .min(1, { message: "Tên là bắt buộc" })
      .max(100, { message: "Tên quá dài" }),
    lastName: z
      .string()
      .min(1, { message: "Họ là bắt buộc" })
      .max(100, { message: "Họ quá dài" }),
    secretCode: z
      .string()
      .min(1, { message: "Secret code là bắt buộc" })
      .max(50, { message: "Secret code quá dài" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .max(255, {
        error: "Mật khẩu quá dài",
      })
      .min(6, { error: "Mật khẩu phải ít nhất 6 kí tự" }),
    newPassword: z
      .string()
      .max(255, {
        error: "Mật khẩu quá dài",
      })
      .min(6, { error: "Mật khẩu phải ít nhất 6 kí tự" }),
    confirmNewPassword: z
      .string()
      .max(255, {
        error: "Mật khẩu quá dài",
      })
      .min(6, { error: "Mật khẩu phải ít nhất 6 kí tự" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });
