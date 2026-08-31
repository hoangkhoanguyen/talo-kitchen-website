"use client";

import React from "react";
import { Button } from "@/components/admin/ui/button/Button";

const IFRAME_ID = "bill-print-frame";

export default function PrintBillButton({
  orderId,
  className,
}: {
  orderId: number;
  className?: string;
}) {
  const handlePrint = () => {
    // Xoá iframe cũ nếu còn
    document.getElementById(IFRAME_ID)?.remove();

    const iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.style.cssText =
      "position:fixed;width:0;height:0;border:0;right:0;bottom:0;";
    iframe.src = `/admin/print/orders/${orderId}`;

    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) return;

      // Dọn iframe sau khi in xong
      win.addEventListener("afterprint", () => {
        window.setTimeout(() => iframe.remove(), 500);
      });

      // BillReceipt tự đo chiều cao & set @page khít nội dung, rồi bắn
      // sự kiện "bill-ready". Chờ tín hiệu đó mới in để giấy không bị dư.
      let printed = false;
      const startPrint = () => {
        if (printed) return;
        printed = true;
        win.print();
      };
      const w = win as Window & { __billReady?: boolean };
      if (w.__billReady) {
        startPrint();
      } else {
        win.addEventListener("bill-ready", startPrint, { once: true });
        // Fallback: lỡ không nhận được tín hiệu thì vẫn in sau 1.5s
        window.setTimeout(startPrint, 1500);
      }
    };

    document.body.appendChild(iframe);
  };

  return (
    <Button color="primary" className={className} onClick={handlePrint}>
      In bill
    </Button>
  );
}
