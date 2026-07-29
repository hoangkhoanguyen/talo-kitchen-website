"use client";
import useToggleSidebar from "@/hooks/admin/features/ui/useToggleSidebar";
import React from "react";
import { IconButton } from "../../ui/button";

export const ToggleSidebar = () => {
  const handleToggle = useToggleSidebar();
  return (
    <IconButton
      icon="tabler:layout-sidebar-right-filled"
      onClick={handleToggle}
    />
  );
};
