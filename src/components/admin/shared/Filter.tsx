import React, { PropsWithChildren, useRef } from "react";
import { Button } from "../ui/button";
import { Drawer, LayoutRef, LayoutWithRef } from "../ui/layout";

export default function Filter({
  children,
  onSubmit,
  onBeforeOpen,
  onReset,
}: PropsWithChildren<{
  onSubmit(): void;
  onBeforeOpen(): void;
  onReset(): void;
}>) {
  const ref = useRef<LayoutRef>(null);

  return (
    <>
      <Button
        color="primary"
        onClick={() => {
          ref.current?.open();
        }}
      >
        Filter
      </Button>
      <LayoutWithRef Component={Drawer} ref={ref} beforeOpen={onBeforeOpen}>
        <div className="p-5 max-h-full flex flex-col">
          <p className="card-title">Filter</p>
          <div className="flex-1 overflow-auto pb-2">{children}</div>
          <div className="card-actions justify-end">
            <Button color="error" variant={"outline"} onClick={onReset}>
              Reset Filter
            </Button>
            <Button
              color="primary"
              onClick={() => {
                onSubmit();
                ref.current?.close();
              }}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </LayoutWithRef>
    </>
  );
}
