"use client";

import { useRegister, useRegisterForm } from "@/hooks/admin/features/auth";
import { InputWithLabel } from "@/components/admin/ui/form/InputWithLabel";
import InputWithStatus from "@/components/admin/ui/form/InputWithStatus";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/constants/route";

export function RegisterForm() {
  const register = useRegister();
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    isLoading,
    isValid,
  } = useRegisterForm({
    onSubmit: async (data) => {
      await register.mutateAsync(data, {
        onSuccess(data) {
          if (data.success) router.push(adminRoutes.login());
        },
      });
    },
  });

  const isSubmitting = isLoading || register.isPending;

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Tạo tài khoản mới</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel label="Tên" required className="form-control">
              <InputWithStatus
                type="text"
                placeholder="Nhập tên"
                error={!!errors.firstName}
                {...registerField("firstName")}
              />
              {errors.firstName && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {errors.firstName.message}
                  </span>
                </div>
              )}
            </InputWithLabel>

            <InputWithLabel label="Họ" required className="form-control">
              <InputWithStatus
                type="text"
                placeholder="Nhập họ"
                error={!!errors.lastName}
                {...registerField("lastName")}
              />
              {errors.lastName && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {errors.lastName.message}
                  </span>
                </div>
              )}
            </InputWithLabel>
          </div>

          {/* Row 2: Username & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel label="Username" required className="form-control">
              <InputWithStatus
                type="text"
                placeholder="Nhập username"
                error={!!errors.username}
                {...registerField("username")}
              />
              {errors.username && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {errors.username.message}
                  </span>
                </div>
              )}
            </InputWithLabel>

            <InputWithLabel label="Email" required className="form-control">
              <InputWithStatus
                type="email"
                placeholder="Nhập email"
                error={!!errors.email}
                {...registerField("email")}
              />
              {errors.email && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {errors.email.message}
                  </span>
                </div>
              )}
            </InputWithLabel>
          </div>

          {/* Row 3: Secret Code */}
          <InputWithLabel label="Secret Code" required className="form-control">
            <InputWithStatus
              type="password"
              placeholder="Nhập secret code"
              error={!!errors.secretCode}
              {...registerField("secretCode")}
            />
            {errors.secretCode && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {errors.secretCode.message}
                </span>
              </div>
            )}
          </InputWithLabel>

          {/* Row 4: Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithLabel label="Mật khẩu" required className="form-control">
              <InputWithStatus
                type="password"
                placeholder="Nhập mật khẩu"
                error={!!errors.password}
                {...registerField("password")}
              />
              {errors.password && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                </div>
              )}
            </InputWithLabel>

            <InputWithLabel
              label="Xác nhận mật khẩu"
              required
              className="form-control"
            >
              <InputWithStatus
                type="password"
                placeholder="Nhập lại mật khẩu"
                error={!!errors.confirmPassword}
                {...registerField("confirmPassword")}
              />
              {errors.confirmPassword && (
                <div className="label">
                  <span className="label-text-alt text-error">
                    {errors.confirmPassword.message}
                  </span>
                </div>
              )}
            </InputWithLabel>
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Đang tạo tài khoản...
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
