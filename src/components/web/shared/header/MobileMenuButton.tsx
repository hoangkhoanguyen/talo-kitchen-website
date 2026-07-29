"use client";
import Icon from "@/components/common/Icon";
import { useMobileMenu } from "@/hooks/web/ui/mobile-menu";
import React from "react";

const MobileMenuButton = () => {
  const toggleMenu = useMobileMenu((state) => state.onToggle);
  const isOpen = useMobileMenu((state) => state.isOpen);
  return (
    <>
      <button
        className="lg:hidden text-web-content-1 text-[44px]"
        onClick={toggleMenu}
      >
        <Icon icon={isOpen ? "ph:x" : "ph:list"} />
      </button>
    </>
  );
};

export default MobileMenuButton;
