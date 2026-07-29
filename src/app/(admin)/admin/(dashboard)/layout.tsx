import Content from "@/components/admin/shared/Content";
import Sidebar from "@/components/admin/shared/sidebar/Sidebar";
import React, { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Sidebar />
      <Content>{children}</Content>
    </>
  );
};

export default Layout;
