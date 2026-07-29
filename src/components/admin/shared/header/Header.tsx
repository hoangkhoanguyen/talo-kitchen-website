import React, { ReactNode } from "react";
import { ToggleSidebar } from "../sidebar/ToggleSidebar";

export default function Header({
  title,
  actions,
  center,
}: {
  title: string;
  center?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <div className="fixed z-30 duration-200 start-0 lg:start-64 end-0 top-0 bg-white px-5">
        <div className="flex items-center gap-5">
          <div className="lg:hidden">
            <ToggleSidebar />
          </div>
          <div className="flex-1 flex justify-between items-center gap-5 h-12">
            <p className="text-gray-900 font-semibold">{title}</p>
            {center}
            <div>{actions}</div>
          </div>
        </div>
      </div>
      <div className="h-12"></div>
    </>
  );
}
