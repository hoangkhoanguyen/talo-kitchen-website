"use client";

import React, { useEffect } from "react";

export interface BillAddon {
  name: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface BillItem {
  name: string;
  qty: number;
  unitPrice: number;
  amount: number;
  addons: BillAddon[];
}

export interface BillData {
  code: string;
  dateTime: string;
  items: BillItem[];
  total: number;
}

const RESTAURANT = {
  name: "TALONKITCHENHG",
  addressLine1: "69 Nguyen Thai Hoc Street - Ha Giang 2 Ward",
  addressLine2: "Tuyen Quang Province -  Vietnam",
  tel: "Tel: +84 98 082 138",
  website: "talokitchenhg.com",
};

const fmt = (n: number) => Math.round(n).toLocaleString("vi-VN");

export default function BillReceipt({
  data,
  fontClassName = "",
}: {
  data: BillData;
  fontClassName?: string;
}) {
  useEffect(() => {
    // Khi nhúng trong iframe (nút "In bill"), iframe cha lo việc in → không tự in ở đây
    if (window.self !== window.top) return;

    let printed = false;
    const doPrint = () => {
      if (printed) return;
      printed = true;
      window.print();
    };

    const fonts = (
      document as Document & { fonts?: { ready?: Promise<unknown> } }
    ).fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => window.setTimeout(doPrint, 50));
    } else {
      window.setTimeout(doPrint, 400);
    }

    // Tự đóng tab in (chỉ hiệu lực khi tab được mở bằng window.open)
    const handleAfterPrint = () => window.close();
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  return (
    <>
      <style>{printStyles}</style>
      <div className={`bill-root ${fontClassName}`}>
        <div className="bill">
          {/* Header */}
          <div className="bill-center">
            <div className="bill-shop-name">{RESTAURANT.name}</div>
            <div className="bill-shop-line">{RESTAURANT.addressLine1}</div>
            <div className="bill-shop-line">{RESTAURANT.addressLine2}</div>
            <div className="bill-shop-line">{RESTAURANT.tel}</div>
          </div>

          <div className="bill-center bill-title">PAYMENT RECEIPT</div>

          <div className="bill-center bill-meta">{data.dateTime}</div>
          <div className="bill-center bill-meta">Receipt #: {data.code}</div>

          {/* Items */}
          <table className="bill-table">
            <thead>
              <tr>
                <th className="col-name">Name</th>
                <th className="col-qty">Qty</th>
                <th className="col-unit">Unit Price</th>
                <th className="col-amt">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <React.Fragment key={i}>
                  <tr className="row-item">
                    <td className="col-name">{item.name}</td>
                    <td className="col-qty">{item.qty}</td>
                    <td className="col-unit">{fmt(item.unitPrice)}</td>
                    <td className="col-amt">{fmt(item.amount)}</td>
                  </tr>
                  {item.addons.map((addon, j) => (
                    <tr className="row-addon" key={`${i}-${j}`}>
                      <td className="col-name">+{addon.name}</td>
                      <td className="col-qty">{addon.qty}</td>
                      <td className="col-unit">{fmt(addon.unitPrice)}</td>
                      <td className="col-amt">{fmt(addon.amount)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="bill-total">
            <span className="bill-total-label">Total</span>
            <span className="bill-total-value">{fmt(data.total)}</span>
          </div>

          {/* Footer */}
          <div className="bill-center bill-thanks">THANK YOU FOR YOUR VISIT !</div>
          <div className="bill-center bill-thanks">PLEASE COME AGAIN</div>
          <div className="bill-center bill-website">{RESTAURANT.website}</div>
        </div>
      </div>
    </>
  );
}

const printStyles = `
@page { size: 80mm auto; margin: 0; }

.bill-root {
  background: #f3f4f6;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  color: #000;
}

.bill {
  width: 80mm;
  box-sizing: border-box;
  padding: 5mm 4mm;
  background: #fff;
  color: #000;
  font-size: 12px;
  line-height: 1.4;
}

.bill-center { text-align: center; }

.bill-shop-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.bill-shop-line { font-size: 12px; font-weight: 500; }

.bill-title {
  font-size: 18px;
  font-weight: 700;
  margin: 12px 0 8px;
}

.bill-meta { font-size: 12px; font-weight: 500; }

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  table-layout: fixed;
}

.bill-table th {
  font-weight: 700;
  font-size: 12px;
  padding-bottom: 4px;
  border-bottom: 1px dashed #000;
}

.bill-table td {
  font-size: 12px;
  padding: 2px 0;
  vertical-align: top;
  word-break: break-word;
}

.col-name { text-align: left; width: 45%; }
.col-qty { text-align: center; width: 12%; }
.col-unit { text-align: right; width: 21%; }
.col-amt { text-align: right; width: 22%; }

.row-item td.col-name { font-weight: 500; }
.row-addon td { font-size: 11px; }
.row-addon td.col-name { padding-left: 6px; }

.bill-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-top: 1px dashed #000;
  margin-top: 6px;
  padding-top: 8px;
}

.bill-total-label { font-size: 16px; font-weight: 700; }
.bill-total-value { font-size: 18px; font-weight: 700; }

.bill-thanks {
  font-size: 15px;
  font-weight: 600;
  margin-top: 4px;
}
.bill-thanks:first-of-type { margin-top: 18px; }

.bill-website {
  font-size: 13px;
  font-weight: 600;
  margin-top: 16px;
  padding-bottom: 2px;
}

@media print {
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
  /* Chỉ in phần bill, ẩn mọi thứ khác (toaster, loading...) */
  body { visibility: hidden; }
  .bill-root, .bill-root * { visibility: visible; }
  .bill-root {
    background: #fff;
    padding: 0;
    margin: 0;
    min-height: 0;
    height: auto;
    display: block;
    position: absolute;
    left: 0;
    top: 0;
  }
  /* padding-bottom 40mm: chừa ~4cm để xé/cắt giấy */
  .bill { width: 80mm; padding: 3mm 3mm 40mm; }
}
`;
