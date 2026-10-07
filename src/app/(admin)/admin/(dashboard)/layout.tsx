import Content from "@/components/admin/shared/Content";
import Sidebar from "@/components/admin/shared/sidebar/Sidebar";
import NewOrderNotifier from "@/components/admin/features/notifications/NewOrderNotifier";
import { CurrentUserProvider } from "@/providers/current-user-provider";
import { verifyAdminAuthSimple } from "@/services/auth";
import React, { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = async ({ children }) => {
  const { user } = await verifyAdminAuthSimple();

  return (
    <CurrentUserProvider
      user={
        user
          ? {
              username: user.username,
              displayName: [user.firstName, user.lastName]
                .filter(Boolean)
                .join(" "),
            }
          : null
      }
    >
      <Sidebar />
      <Content>{children}</Content>
      <NewOrderNotifier />
    </CurrentUserProvider>
  );
};

export default Layout;
