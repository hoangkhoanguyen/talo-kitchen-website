import React, {
  ComponentProps,
  FC,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { Modal } from "./Modal";
import { Drawer } from "./Drawer";

export interface LayoutRef {
  open(): void;
  close(): void;
}

interface Props
  extends Omit<
    ComponentProps<typeof Modal | typeof Drawer>,
    "isOpen" | "onClose"
  > {
  beforeOpen?(): void;
  afterClose?(): void;
  Component: FC<{
    isOpen: boolean;
    onClose(): void;
  }>;
}

export const LayoutWithRef = forwardRef<LayoutRef, Props>(
  ({ afterClose, beforeOpen, Component, ...rest }, ref) => {
    const [isOpen, setOpen] = useState(false);

    const openModal = useCallback(() => {
      beforeOpen?.();
      setOpen(true);
    }, [beforeOpen]);

    const closeModal = useCallback(() => {
      setOpen(false);
      afterClose?.();
    }, [afterClose]);

    useImperativeHandle(
      ref,
      () => ({
        close: closeModal,
        open: openModal,
      }),
      [closeModal, openModal],
    );

    return <Component isOpen={isOpen} onClose={closeModal} {...rest} />;
  },
);

LayoutWithRef.displayName = "LayoutWithRef";
