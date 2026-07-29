"use client";
import { cn } from "@/lib/utils";
import { Dialog, DialogPanel } from "@headlessui/react";
import React, { FC, PropsWithChildren } from "react";

interface Props {
  isOpen: boolean;
  onClose(): void;
  className?: string;
}

export const Drawer: FC<PropsWithChildren<Props>> = ({
  children,
  isOpen,
  onClose,
  className,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      transition
      className="fixed inset-0 z-50 flex w-screen items-center justify-end bg-black/30 transition duration-200 ease-out data-closed:opacity-0"
    >
      <DialogPanel
        transition
        data-theme="light"
        className={cn(
          "w-xs h-screen bg-white duration-200 transition data-closed:translate-x-full rtl:data-closed:-translate-x-full ",
          className,
        )}
      >
        {children}
      </DialogPanel>
    </Dialog>
  );
};
