import { getCartProductsByIdsAction } from "@/actions/web/cart";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface UseGetProductsDetailsByIdsProps {
  ids: number[];
  enabled?: boolean; // Chỉ fetch khi enabled = true (sau khi hydrate)
  crossTabSyncVersion?: number; // Trigger refetch khi thay đổi từ tab khác
}

const useGetProductsDetailsByIds = ({
  ids,
  enabled = true,
  crossTabSyncVersion = 0,
}: UseGetProductsDetailsByIdsProps) => {
  const [isReady, setIsReady] = useState(false);
  const hasFetchedOnce = useRef(false);
  const prevIdsLength = useRef<number | null>(null);
  const lastSyncVersion = useRef(crossTabSyncVersion);

  const { mutate, data = [] } = useMutation({
    mutationKey: ["get-cart-products-by-ids"],
    mutationFn: getCartProductsByIdsAction,
    onSuccess: () => {
      setIsReady(true);
    },
    onError: () => {
      setIsReady(true);
    },
  });

  // Refetch khi crossTabSyncVersion thay đổi (cart thay đổi từ tab khác)
  useEffect(() => {
    if (crossTabSyncVersion > lastSyncVersion.current && enabled) {
      lastSyncVersion.current = crossTabSyncVersion;
      if (ids.length > 0) {
        mutate({ ids });
      }
    }
  }, [crossTabSyncVersion, enabled, ids, mutate]);

  useEffect(() => {
    if (!enabled) return;
    if (hasFetchedOnce.current) return;

    if (ids.length > 0) {
      hasFetchedOnce.current = true;
      mutate({ ids });
    } else if (
      prevIdsLength.current !== null &&
      prevIdsLength.current === 0 &&
      ids.length === 0
    ) {
      hasFetchedOnce.current = true;
      setIsReady(true);
    }

    prevIdsLength.current = ids.length;
  }, [enabled, ids, mutate]);

  // Sau một khoảng thời gian ngắn, nếu vẫn rỗng thì set ready
  useEffect(() => {
    if (!enabled || hasFetchedOnce.current) return;

    const timer = setTimeout(() => {
      if (!hasFetchedOnce.current && ids.length === 0) {
        hasFetchedOnce.current = true;
        setIsReady(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [enabled, ids.length]);

  const isLoading = !enabled || !isReady;

  return { data, isLoading };
};

export default useGetProductsDetailsByIds;
