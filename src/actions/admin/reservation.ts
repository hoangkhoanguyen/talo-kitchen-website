"use server";
import { ReservationStatus } from "@/db/schemas";
import { adminRoutes } from "@/constants/route";
import { revalidatePath } from "next/cache";
import {
  updateReservationInternalNote,
  updateReservationStatus,
  checkReservationExists,
  canEditReservationNote,
} from "@/services/reservations";
import { verifyAdminAuthSimple } from "@/services/auth";

export async function updateReservationStatusAction({
  reservationId,
  status,
}: {
  reservationId: number;
  status: ReservationStatus;
}) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/reservations");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    // 1. Check if reservation exists
    const reservation = await checkReservationExists(reservationId);
    if (!reservation) {
      return {
        success: false,
        error: "Đặt bàn không tồn tại",
        code: "RESERVATION_NOT_FOUND",
      };
    }

    // 2. Check if status is already the same
    if (reservation.status === status) {
      return {
        success: false,
        error: "Đặt bàn đã ở trạng thái này",
        code: "SAME_STATUS",
      };
    }

    // 3. Update reservation status
    const updatedReservation = await updateReservationStatus(
      reservationId,
      status,
      reservation.status,
    );

    revalidatePath(adminRoutes.reservation(reservationId));
    return {
      success: true,
      data: { updatedReservation },
    };
  } catch (error) {
    console.log("Error updating reservation status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái đặt bàn",
    };
  }
}
export async function updateReservationInternalNoteAction({
  reservationId,
  internalNote,
}: {
  reservationId: number;
  internalNote: string;
}) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/reservations");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    // 1. Check if reservation exists
    const reservation = await checkReservationExists(reservationId);
    if (!reservation) {
      return {
        success: false,
        error: "Đặt bàn không tồn tại",
        code: "RESERVATION_NOT_FOUND",
      };
    }

    // 2. Check if reservation can be edited
    if (!canEditReservationNote(reservation)) {
      return {
        success: false,
        error: "Không thể cập nhật ghi chú cho đặt bàn này",
        code: "CANNOT_EDIT_RESERVATION",
      };
    }

    // 3. Update reservation internal note
    const updatedReservation = await updateReservationInternalNote(
      reservationId,
      internalNote,
    );

    revalidatePath(adminRoutes.reservation(reservationId));
    return {
      success: true,
      data: { updatedReservation },
    };
  } catch (error) {
    console.log("Error updating reservation internal note:", error);
    return {
      success: false,
      error: "Không thể cập nhật ghi chú đặt bàn",
    };
  }
}
