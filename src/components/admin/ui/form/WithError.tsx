import { Editor } from "@/types/common";
import React, { FC, PropsWithChildren } from "react";

const WithError: FC<PropsWithChildren<Pick<Editor, "error">>> = ({
  children,
  error,
}) => {
  return (
    <>
      {children}
      {error?.message && (
        <p className="text-xs text-error mt-1">{error.message}</p>
      )}
    </>
  );
};

export default WithError;
