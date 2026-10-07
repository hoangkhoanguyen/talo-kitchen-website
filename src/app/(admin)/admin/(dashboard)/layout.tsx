import Content from "@/components/admin/shared/Content";
import Sidebar from "@/components/admin/shared/sidebar/Sidebar";
import NewOrderNotifier from "@/components/admin/features/notifications/NewOrderNotifier";
import TokenRefresher from "@/components/admin/shared/TokenRefresher";
import { CurrentUserProvider } from "@/providers/current-user-provider";
import { getCurrentAdminFromCookie } from "@/lib/auth";
import React, { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = async ({ children }) => {
  // Chỉ đọc cookie (không refresh/redirect được trong layout)
  const { user, expired } = await getCurrentAdminFromCookie();

  return (
    <CurrentUserProvider user={user}>
      {expired && <TokenRefresher />}
      <Sidebar />
      <Content>{children}</Content>
      <NewOrderNotifier />
    </CurrentUserProvider>
  );
};

export default Layout;
