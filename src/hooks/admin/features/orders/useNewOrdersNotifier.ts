"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import adminApi from "@/lib/api/axios";
import { adminRoutes } from "@/constants/route";
import { NewOrderNotice, useNewOrdersStore } from "@/store/new-orders";
import { useNotificationSound } from "@/hooks/admin/useNotificationSound";

type NewOrdersResponse = { orders: NewOrderNotice[]; latestId: number };

/** khoảng thời gian poll (ms) — 10 giây */
const POLL_INTERVAL = 10_000;

/**
 * Poll API đơn mới định kỳ. Lần đầu (chưa có con trỏ) chỉ lấy `latestId` để làm
 * mốc; các lần sau hỏi các đơn có id > con trỏ, đẩy vào store và phát beep khi
 * có đơn mới. `since` đọc trực tiếp từ store trong queryFn để không phải đưa vào
 * queryKey (tránh restart interval mỗi lần con trỏ đổi).
 */
export function useNewOrdersNotifier() {
  const { playBeep } = useNotificationSound();

  const { data } = useQuery({
    queryKey: ["admin", "new-orders"],
    queryFn: (): Promise<NewOrdersResponse> => {
      const since = useNewOrdersStore.getState().lastFetchedId;
      return adminApi.get(adminRoutes.newOrdersApi(since));
    },
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (!data) return;

    const store = useNewOrdersStore.getState();

    if (!store.initialized) {
      store.initCursor(data.latestId);
      return;
    }

    if (data.orders.length) {
      const added = store.pushOrders(data.orders);
      if (added > 0) playBeep();
    }
  }, [data, playBeep]);
}
