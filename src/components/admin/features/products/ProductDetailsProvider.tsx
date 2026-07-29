"use client";
import useUpdateProduct from "@/hooks/admin/features/products/useUpdateProduct";
import useUpdateProductForm from "@/hooks/admin/features/products/useUpdateProductForm";
import { useSetLoading } from "@/hooks/admin/loading";
import { AdminEditProductForm } from "@/types/products";
import React, { PropsWithChildren, useCallback, useEffect } from "react";
import { Control } from "react-hook-form";

const Context = React.createContext<{
  id: number;
  onReset(): void;
  onSubmit(): void;
  isPending?: boolean;
  isDirty?: boolean;
  control: Control<AdminEditProductForm>;
} | null>(null);

export default function ProductDetailsProvider({
  initProduct,
  children,
  id,
}: PropsWithChildren<{ initProduct: AdminEditProductForm; id: number }>) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useUpdateProductForm();

  const { mutate, isPending } = useUpdateProduct();

  const onUpdateFormData = useCallback(
    (data: AdminEditProductForm) => {
      reset({
        ...data,
      });
    },
    [reset],
  );

  const onSubmit = handleSubmit(({ ...rest }) => {
    mutate({
      id,
      data: {
        ...rest,
      },
    });
  });

  const onReset = useCallback(() => {
    onUpdateFormData(initProduct);
  }, [onUpdateFormData, initProduct]);

  useEffect(() => {
    onUpdateFormData(initProduct);
  }, [onUpdateFormData, initProduct]);

  useSetLoading(isPending);

  return (
    <Context.Provider
      value={{
        id,
        control,
        onReset,
        onSubmit,
        isPending,
        isDirty,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useProductDetailsContext = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      "useProductDetails must be used within a ProductDetailsProvider",
    );
  }
  return context;
};
