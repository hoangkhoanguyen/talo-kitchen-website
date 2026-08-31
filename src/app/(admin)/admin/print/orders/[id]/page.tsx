import { getAdminOrderById } from "@/services/orders";
import { notFound } from "next/navigation";
import { formatDateVN } from "@/lib/date";
import { Poppins } from "next/font/google";
import QRCode from "qrcode";
import BillReceipt, {
  BillData,
} from "@/components/admin/features/orders/BillReceipt";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Link Google Maps để khách quét QR đánh giá TALO
const REVIEW_URL = "https://maps.app.goo.gl/EYzMXo5j7sacPYYs5";

async function buildReviewQrSvg() {
  try {
    return await QRCode.toString(REVIEW_URL, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#00000000" },
    });
  } catch {
    return "";
  }
}

const PrintOrderBillPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const id = (await params).id;
  const order = await getAdminOrderById(Number(id));

  if (!order) {
    notFound();
  }

  const data: BillData = {
    code: order.code,
    dateTime: formatDateVN(order.createdAt, "MM/DD/YYYY   HH:mm:ss"),
    items: order.items.map((item) => ({
      name: item.productName,
      qty: item.quantity,
      unitPrice: item.price,
      amount: item.price * item.quantity,
      addons: item.addons.map((addon) => ({
        name: addon.addonName,
        qty: addon.quantity,
        unitPrice: addon.price,
        amount: addon.price * addon.quantity,
      })),
    })),
    // Bill không tính phí ship → trừ phí ship ra khỏi tổng (ship = 0 thì giữ nguyên)
    total: order.totalPrice - order.shippingFee,
  };

  const qrSvg = await buildReviewQrSvg();

  return (
    <BillReceipt data={data} qrSvg={qrSvg} fontClassName={poppins.className} />
  );
};

export default PrintOrderBillPage;
