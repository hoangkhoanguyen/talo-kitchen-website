"use client";

import { useLogin, useLoginForm } from "@/hooks/admin/features/auth";
import { InputWithLabel } from "@/components/admin/ui/form/InputWithLabel";
import InputWithStatus from "@/components/admin/ui/form/InputWithStatus";
import { useSetLoading } from "@/hooks/admin/loading";
import { Button } from "../../ui/button";

export function LoginForm() {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    isLoading,
    isValid,
  } = useLoginForm({
    onSubmit: async (data) => {
      await login.mutateAsync(data);
    },
  });

  const isSubmitting = isLoading || login.isPending;

  useSetLoading(isSubmitting);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Đăng nhập</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputWithLabel
            label="Email hoặc Username"
            required
            className="form-control"
          >
            <InputWithStatus
              type="text"
              placeholder="Nhập email hoặc username"
              error={!!errors.emailOrUsername}
              {...register("emailOrUsername")}
            />
            {errors.emailOrUsername && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {errors.emailOrUsername.message}
                </span>
              </div>
            )}
          </InputWithLabel>

          <InputWithLabel label="Mật khẩu" required className="form-control">
            <InputWithStatus
              type="password"
              placeholder="Nhập mật khẩu"
              error={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <div className="label">
                <span className="label-text-alt text-error">
                  {errors.password.message}
                </span>
              </div>
            )}
          </InputWithLabel>

          <div className="form-control mt-6">
            <Button
              type="submit"
              className="w-full"
              size={"md"}
              color="primary"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
