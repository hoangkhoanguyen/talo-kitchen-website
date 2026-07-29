import { LoginForm } from "@/components/admin/features/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            L&apos;Telle Eatery
          </h1>
          <p className="text-base-content/70 mt-2">
            Hệ thống quản trị nhà hàng
          </p>
        </div>

        <LoginForm />

        <div className="text-center mt-6">
          <p className="text-sm text-base-content/60">
            © 2025 L&apos;Telle Eatery. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
