import Header from "@/components/admin/shared/header/Header";
import { adminRoutes } from "@/constants/route";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div>
      <Header title="Cài đặt" />
      <div className="container py-5">
        <div className="grid grid-cols-2 gap-5">
          <Link
            href={adminRoutes.settings("ui")}
            className="card bg-white p-5 hover:text-primary hover:shadow duration-500"
          >
            <div className="card-header">
              <h3 className="text-sm text-center font-semibold">
                Cấu hình giao diện
              </h3>
            </div>
          </Link>

          <Link
            href={adminRoutes.settings("app")}
            className="card bg-white p-5 hover:text-primary hover:shadow duration-500"
          >
            <div className="card-header">
              <h3 className="text-sm text-center font-semibold">
                Cấu hình ứng dụng
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
