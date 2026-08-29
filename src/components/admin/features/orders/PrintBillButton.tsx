"use client";

import React from "react";
import { Button } from "@/components/admin/ui/button/Button";

export default function PrintBillButton({
  orderId,
  className,
}: {
  orderId: number;
  className?: string;
}) {
  return (
    <Button
      color="primary"
      className={className}
      onClick={() => window.open(`/admin/print/orders/${orderId}`, "_blank")}
    >
      In bill
    </Button>
  );
}
