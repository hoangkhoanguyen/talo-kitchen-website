import { RegisterForm } from "@/components/admin/features/auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            L&apos;Telle Eatery
          </h1>
          <p className="text-base-content/70 mt-2">
            Tạo tài khoản nhân viên mới
          </p>
        </div>

        <RegisterForm />

        <div className="text-center mt-6">
          <p className="text-sm text-base-content/60">
            © 2025 L&apos;Telle Eatery. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
