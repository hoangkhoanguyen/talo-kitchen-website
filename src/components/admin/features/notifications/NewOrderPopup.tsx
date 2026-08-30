"use client";
import { Icon } from "@iconify/react";
import { formatDateVN } from "@/lib/date";
import { adminRoutes } from "@/constants/route";
import { formatCurrency } from "@/lib/utils";
import { useNewOrdersStore } from "@/store/new-orders";

const NewOrderPopup = () => {
  const isOpen = useNewOrdersStore((s) => s.isPopupOpen);
  const orders = useNewOrdersStore((s) => s.unseenOrders);
  const dismiss = useNewOrdersStore((s) => s.dismiss);

  if (!isOpen || orders.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-green-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:bell-ring-outline" className="text-lg" />
          <span className="font-semibold">
            Đơn hàng mới ({orders.length})
          </span>
        </div>
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={dismiss}
          className="rounded-md p-1 transition hover:bg-white/20"
        >
          <Icon icon="mdi:close" className="text-lg" />
        </button>
      </div>

      {/* List */}
      <ul className="max-h-[60vh] divide-y divide-gray-100 overflow-y-auto">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-gray-900">
                  #{order.code}
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatDateVN(order.createdAt, "HH:mm")}
                </span>
              </div>
              <div className="truncate text-sm text-gray-600">
                {order.customerName}
              </div>
              <div className="text-sm font-medium text-green-700">
                {formatCurrency(order.totalPrice)}
              </div>
            </div>

            <a
              href={adminRoutes.order(order.id)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Mở chi tiết đơn ${order.code}`}
              title="Mở chi tiết đơn (tab mới)"
              className="shrink-0 rounded-md p-2 text-green-600 transition hover:bg-green-50"
            >
              <Icon icon="mdi:open-in-new" className="text-xl" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewOrderPopup;
