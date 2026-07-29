import React, { FC, PropsWithChildren } from "react";

const Content: FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="bg-slate-100 min-h-screen ms-0 lg:ms-64 duration-200">
      {children}
    </main>
  );
};

export default Content;
