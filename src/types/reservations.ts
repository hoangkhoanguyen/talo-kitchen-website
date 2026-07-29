export enum EReservationStatus {
  scheduled = "scheduled", // Đã đặt thành công
  confirmed = "confirmed", // Đã xác nhận lại
  seated = "seated", // Đã nhận bàn
  completed = "completed", // Hoàn thành
  cancelled = "cancelled", // Đã hủy
  no_show = "no_show", // Không đến
}

export interface AdminReservationTable {
  id: number;
  code: string;
  customerName: string;
  customerPhone: string;
  arrivalTime: string;
  arrivalDate: string;
  status: EReservationStatus;
  createdAt: string;
  note: string;
}
