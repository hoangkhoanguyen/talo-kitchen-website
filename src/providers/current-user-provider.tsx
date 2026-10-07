"use client";
import { isTaloKitchen } from "@/lib/order-visibility";
import React, { createContext, FC, PropsWithChildren, useContext } from "react";

export interface CurrentUser {
  username: string;
  // Tên hiển thị (họ + tên), rỗng nếu tài khoản chưa nhập
  displayName: string;
}

const CurrentUserContext = createContext<CurrentUser | null>(null);

export const CurrentUserProvider: FC<
  PropsWithChildren<{ user: CurrentUser | null }>
> = ({ user, children }) => (
  <CurrentUserContext.Provider value={user}>
    {children}
  </CurrentUserContext.Provider>
);

/**
 * Thông tin user admin đang đăng nhập (được layout server truyền xuống).
 * Chỉ dùng để ẩn/hiện UI — quyền thật vẫn được kiểm tra ở server.
 */
export const useCurrentUser = () => {
  const user = useContext(CurrentUserContext);
  return {
    user,
    // Tên hiển thị, fallback về username nếu chưa có họ tên
    name: user?.displayName || user?.username || "",
    isTaloKitchen: isTaloKitchen(user?.username),
  };
};
