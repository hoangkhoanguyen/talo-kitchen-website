"use client";
import Image from "next/image";
import React from "react";
import { Menu } from "./Menu";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useLogout } from "@/hooks/admin/features/auth/useLogout";
import { useAdminConfigs } from "@/store";
import { Dialog, DialogPanel } from "@headlessui/react";

const Sidebar = () => {
  const isOpenSidebar = useAdminConfigs((state) => state.isSidebarOpen);
  const onClose = useAdminConfigs((state) => state.closeSidebar);
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout();
  };

  const renderSidebar = () => (
    <div className="bg-slate-900 dark:bg-gray-900 flex flex-col h-full w-64">
      <div className={cn("flex items-center gap-4 pt-4 duration-200 px-5")}>
        <Image
          src={"/assets/static/square-logo.png"}
          width={28}
          height={28}
          alt="TALO Kitchen & Lounge"
          className="rounded-full"
        />
        <p
          className={cn(
            "text-xl font-semibold text-white duration-200 flex-1 truncate",
          )}
        >
          TALO Admin
        </p>
      </div>

      {/* Menu items - takes remaining space */}
      <div className="flex-1">
        <Menu />
      </div>

      {/* Logout button at bottom */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
            "text-white hover:bg-slate-800 dark:hover:bg-gray-800",
            "transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          <Icon
            icon={
              isPending
                ? "svg-spinners:8-dots-rotate"
                : "material-symbols:logout"
            }
            className="text-xl"
          />
          <span className="text-sm font-medium">
            {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={
          "fixed z-40 top-0 bottom-0 start-0 duration-200 -translate-x-full rtl:translate-x-full lg:translate-x-0"
        }
      >
        {renderSidebar()}
      </div>

      <Dialog
        open={isOpenSidebar}
        onClose={onClose}
        transition
        className="fixed inset-0 z-40 flex w-screen items-center justify-start bg-black/30 transition duration-200 ease-out data-closed:opacity-0 lg:hidden"
      >
        <DialogPanel
          transition
          data-theme="light"
          className={cn(
            "h-screen bg-white duration-200 transition data-closed:-translate-x-full rtl:data-closed:translate-x-full ",
          )}
        >
          {renderSidebar()}
        </DialogPanel>
      </Dialog>
    </>
  );
};
export default Sidebar;
