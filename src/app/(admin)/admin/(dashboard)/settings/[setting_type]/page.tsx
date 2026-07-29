import Header from "@/components/admin/shared/header/Header";
import { adminRoutes } from "@/constants/route";
import { adminConfigs } from "@/constants/settings";
import Link from "next/link";
import React from "react";

const page = async ({
  params,
}: {
  params: Promise<{ setting_type: string }>;
}) => {
  const { setting_type } = await params;

  const settings = adminConfigs[setting_type as keyof typeof adminConfigs];

  if (!settings) {
    return <div>Invalid setting type {setting_type}</div>;
  }
  return (
    <div>
      <Header title="Cấu hình website" />
      <div className="container py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {settings.items.map((item) => (
            <Link
              href={adminRoutes.settings(setting_type, item.key)}
              key={item.key}
              className="card bg-white p-5 hover:text-primary hover:shadow duration-500"
            >
              <div className="card-header">
                <h3 className="text-sm text-center font-semibold">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
