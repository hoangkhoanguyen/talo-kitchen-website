import { getAdminOrderById } from "@/services/orders";
import { notFound } from "next/navigation";
import moment from "moment";
import { Poppins } from "next/font/google";
import BillReceipt, {
  BillData,
} from "@/components/admin/features/orders/BillReceipt";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
    dateTime: moment(order.createdAt).format("MM/DD/YYYY   HH:mm:ss"),
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
    shippingFee: order.shippingFee,
    total: order.totalPrice,
  };

  return <BillReceipt data={data} fontClassName={poppins.className} />;
};

export default PrintOrderBillPage;
