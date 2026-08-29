import Content from "@/components/admin/shared/Content";
import Sidebar from "@/components/admin/shared/sidebar/Sidebar";
import NewOrderNotifier from "@/components/admin/features/notifications/NewOrderNotifier";
import React, { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Sidebar />
      <Content>{children}</Content>
      <NewOrderNotifier />
    </>
  );
};

export default Layout;
