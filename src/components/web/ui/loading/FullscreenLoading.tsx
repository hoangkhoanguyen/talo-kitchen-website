"use client";
import Icon from "@/components/common/Icon";
import { useIsLoading } from "@/hooks/web/ui/loading";
import React from "react";

export const FullscreenLoading = () => {
  const isLoading = useIsLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <Icon
        icon={"line-md:loading-twotone-loop"}
        className="text-6xl text-primary"
      />
    </div>
  );
};
