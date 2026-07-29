"use client";
import { checkCartLengthAction } from "@/actions/web/cart";
import Icon from "@/components/common/Icon";
import { webRoutes } from "@/constants/route";
import { useCartStore } from "@/hooks/web/cart/store";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

const CartButton = () => {
  const cart = useCartStore((state) => state.context.cart);
  const hasFetched = useRef(false);
  const validatedCountRef = useRef<number | null>(null); // Lưu số lượng đã validate
  const initialCartLengthRef = useRef<number | null>(null); // Lưu cart length lúc validate

  const { mutate, data } = useMutation({
    mutationKey: ["check-cart-length"],
    mutationFn: checkCartLengthAction,
    onSuccess: (validCount) => {
      // Lưu lại số lượng đã validate và cart length lúc đó
      validatedCountRef.current = validCount;
      initialCartLengthRef.current = cart.length;
    },
  });

  // Chỉ validate 1 lần khi tải trang
  useEffect(() => {
    if (!hasFetched.current && cart.length > 0) {
      const productIds = cart.map((item) => item.productId);
      mutate({ productIds });
      hasFetched.current = true;
    }
  }, [cart, mutate]);

  // Tính số lượng hiển thị
  const displayCount = useMemo(() => {
    // Chưa validate -> hiển thị từ cart local
    if (validatedCountRef.current === null) {
      return cart.length;
    }

    // Đã validate -> tính toán dựa trên sự thay đổi
    // Số item không hợp lệ = cart length lúc validate - số đã validate
    const invalidCount =
      (initialCartLengthRef.current ?? 0) - validatedCountRef.current;
    // Số hiển thị = cart length hiện tại - số không hợp lệ (đã bị loại bỏ khi validate)
    return Math.max(0, cart.length - invalidCount);
  }, [cart.length, data]);

  return (
    <Link href={webRoutes.cart()} className="relative">
      <Icon icon={"ph:shopping-bag"} className="text-web-content-1 w-11 h-11" />
      <span
        className={cn(
          "absolute -top-1 -right-2",
          "w-8 aspect-square rounded-full flex justify-center items-center",
          "bg-web-secondary-3  text-web-background-1 text-web-h4",
        )}
      >
        {displayCount > 9 ? "9+" : displayCount}
      </span>
    </Link>
  );
};

export default CartButton;
