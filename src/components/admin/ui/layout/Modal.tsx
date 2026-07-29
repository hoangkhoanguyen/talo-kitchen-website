"use client";
import { cn } from "@/lib/utils";
import { Dialog, DialogPanel } from "@headlessui/react";
import React, { FC, PropsWithChildren } from "react";

export const Modal: FC<
  PropsWithChildren<{
    isOpen: boolean;
    onClose(): void;
    className?: string;
  }>
> = ({ isOpen, children, onClose, className = "" }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      transition
      data-theme="light"
      className="fixed inset-0 z-50 p-5 flex w-screen items-center justify-center bg-black/30 transition duration-200 ease-out data-closed:opacity-0"
    >
      <DialogPanel
        transition
        className={cn(
          "duration-200 transition data-closed:invisible data-closed:opacity-0 data-closed:-translate-y-5",
          className,
        )}
      >
        {children}
      </DialogPanel>
    </Dialog>
  );
};
