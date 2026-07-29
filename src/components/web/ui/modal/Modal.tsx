import { cn } from "@/lib/utils";
import { Dialog, DialogPanel } from "@headlessui/react";
import React, { PropsWithChildren } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const Modal = ({
  isOpen,
  children,
  onClose,
  className,
}: PropsWithChildren<Props>) => {
  return (
    <Dialog
      open={isOpen}
      as="div"
      transition
      className="relative z-50 focus:outline-none duration-200 data-closed:opacity-0"
      onClose={onClose}
    >
      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center bg-black/50">
          <DialogPanel
            transition
            className={cn(
              "duration-200 data-closed:transform-[scale(95%)] data-closed:opacity-0",
              className,
            )}
          >
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
