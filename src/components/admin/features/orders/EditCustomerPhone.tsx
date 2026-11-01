"use client";
import React, { FC, useRef, useState } from "react";
import { Button, IconButton } from "../../ui/button";
import { Input } from "../../ui/form";
import { LayoutRef, LayoutWithRef, Modal } from "../../ui/layout";
import useUpdateOrderCustomerPhone from "@/hooks/admin/features/orders/useUpdateOrderCustomerPhone";
import { useSetLoading } from "@/hooks/admin/loading";
import { customerPhoneSchema } from "@/validations/checkout";

const EditCustomerPhone: FC<{ orderId: number; phone: string }> = ({
  orderId,
  phone,
}) => {
  const ref = useRef<LayoutRef>(null);
  const [value, setValue] = useState(phone);
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useUpdateOrderCustomerPhone();

  useSetLoading(isPending);

  const onSave = () => {
    const parsed = customerPhoneSchema.safeParse(value.trim());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid phone number");
      return;
    }
    if (parsed.data === phone) {
      ref.current?.close();
      return;
    }
    mutate(
      { orderId, customerPhone: parsed.data },
      {
        onSuccess: (res) => {
          if (res.success) ref.current?.close();
        },
      },
    );
  };

  return (
    <>
      <IconButton
        icon="tabler:edit"
        size="xs"
        aria-label="Sửa số điện thoại"
        onClick={() => ref.current?.open()}
      />
      <LayoutWithRef
        ref={ref}
        Component={Modal}
        beforeOpen={() => {
          setValue(phone);
          setError(null);
        }}
      >
        <div className="card p-5 bg-white w-xs sm:w-sm md:w-md">
          <h2 className="card-title mb-2">Sửa số điện thoại khách</h2>
          <Input
            type="tel"
            value={value}
            maxLength={20}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            placeholder="Nhập số điện thoại"
          />
          {error && <p className="text-error text-xs mt-1">{error}</p>}
          <div className="card-actions justify-end mt-4">
            <Button disabled={isPending} onClick={() => ref.current?.close()}>
              Đóng
            </Button>
            <Button color="primary" disabled={isPending} onClick={onSave}>
              Lưu
            </Button>
          </div>
        </div>
      </LayoutWithRef>
    </>
  );
};

export default EditCustomerPhone;
