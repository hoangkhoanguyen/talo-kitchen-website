import { adminRoutes } from "@/constants/route";
import { ReservationDB } from "@/db/schemas";
import adminApi from "@/lib/api/axios";
import { useQuery } from "@tanstack/react-query";

const useFetchReservation = (query: any) => {
  return useQuery({
    queryKey: ["admin", "reservations", query],
    queryFn: (): Promise<{ reservations: ReservationDB[]; total: number }> =>
      adminApi.get(adminRoutes.reservationApi(query)),
  });
};

export default useFetchReservation;
