import OrderInformation from "@/components/admin/features/orders/OrderInformation";
import DeliveryInformation from "@/components/admin/features/orders/DeliveryInformation";
import OrderStatuss from "@/components/admin/features/orders/OrderStatuses";
import Header from "@/components/admin/shared/header/Header";
import { getAdminOrderById } from "@/services/orders";
import React from "react";
import OrderSummary from "@/components/admin/features/orders/OrderSummary";
import OrderItems from "@/components/admin/features/orders/OrderItems";
import { AdminOrderAddon, OrderStatus } from "@/types/orders";
import OrderInternalNote from "@/components/admin/features/orders/OrderInternalNote";
import { EShippingMethod } from "@/types/app-configs";
import moment from "moment";

const OrderDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const id = (await params).id;

  const order = await getAdminOrderById(Number(id));

  if (!order) {
    return <div>Order not found</div>;
  }

  const historyStatus = order.statusHistory.map(
    (item) => item.previousStatus as OrderStatus,
  );

  return (
    <div>
      <Header title="Order Details" />
      <div className="container py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_320px] gap-5">
          <div className="col-span-1">
            <div className="grid gap-5">
              <OrderStatuss
                historyStatus={historyStatus}
                status={order.status as OrderStatus}
                orderId={order.id}
              />
              <OrderInformation
                data={{
                  customerName: order.firstName + " " + order.lastName,
                  customerPhone: order.customerPhone,
                  code: order.code,
                  orderTypeLabel: order.orderTypeLabel || "",
                  note: order.note,
                }}
              />
              {order.orderType === EShippingMethod.door2door && (
                <DeliveryInformation
                  data={{
                    deliveryAddress: order.deliveryAddress,
                    addressNote: order.addressNote,
                  }}
                />
              )}
              <OrderItems
                items={order.items.map((item) => ({
                  id: item.id,
                  productName: item.productName,
                  quantity: item.quantity,
                  price: item.price,
                  totalPrice: item.totalPrice,
                  note: item.note,
                  image: item.product.images[0]?.url || null,
                  productId: item.productId,
                  addons: item.addons.map(
                    (addon): AdminOrderAddon => ({
                      id: addon.id,
                      addonId: addon.addonId,
                      name: addon.addonName,
                      quantity: addon.quantity,
                      price: addon.price,
                      totalPrice: addon.totalPrice,
                    }),
                  ),
                }))}
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
              <OrderSummary
                data={{
                  totalPrice: order.totalPrice,
                  shippingFee: order.shippingFee,
                  paymentMethod: order.paymentMethod,
                  createdAt: moment(order.createdAt).format(
                    "YYYY-MM-DD hh:mm A",
                  ),
                }}
              />
              <div className="card p-5 border border-orange-300 bg-white">
                <h2 className="card-title text-orange-500">Order Note</h2>
                <p className="mt-2 text-sm text-orange-700">
                  {order.note || "--/--"}
                </p>
              </div>
              <OrderInternalNote
                data={{
                  internalNote: order.internalNote,
                  id: order.id,
                  status: order.status as OrderStatus,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
