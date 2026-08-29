"use client";

import React from "react";
import { Button } from "@/components/admin/ui/button/Button";

export default function PrintBillButton({ orderId }: { orderId: number }) {
  return (
    <Button
      color="primary"
      onClick={() => window.open(`/admin/print/orders/${orderId}`, "_blank")}
    >
      In bill
    </Button>
  );
}
