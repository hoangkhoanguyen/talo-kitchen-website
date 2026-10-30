import { notFound } from "next/navigation";

// Đăng ký admin đã đóng: trang luôn render 404, không có form
const RegisterPage = () => {
  notFound();
};

export default RegisterPage;
