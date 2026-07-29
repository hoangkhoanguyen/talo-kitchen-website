"use server";
import { adminRoutes } from "@/constants/route";
import {
  updateOrderInternalNote,
  updateOrderStatus,
  checkOrderExists,
  canEditOrderNote,
} from "@/services/orders";
import { verifyAdminAuthSimple } from "@/services/auth";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction({
  orderId,
  status,
}: {
  orderId: number;
  status: "processing" | "completed" | "cancelled";
}) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/orders");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    // 1. Check if order exists
    const order = await checkOrderExists(orderId);
    if (!order) {
      return {
        success: false,
        error: "Đơn hàng không tồn tại",
        code: "ORDER_NOT_FOUND",
      };
    }

    // 2. Check if status is already the same
    if (order.status === status) {
      return {
        success: false,
        error: "Đơn hàng đã ở trạng thái này",
        code: "SAME_STATUS",
      };
    }

    // 3. Update order status
    const updatedOrder = await updateOrderStatus(orderId, status, order.status);

    revalidatePath(adminRoutes.order(orderId));
    return {
      success: true,
      data: { updatedOrder },
    };
  } catch (error) {
    console.log("Error updating order status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái đơn hàng",
    };
  }
}

export async function updateOrderInternalNoteAction({
  orderId,
  internalNote,
}: {
  orderId: number;
  internalNote: string;
}) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/orders");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    // 1. Check if order exists
    const order = await checkOrderExists(orderId);
    if (!order) {
      return {
        success: false,
        error: "Đơn hàng không tồn tại",
        code: "ORDER_NOT_FOUND",
      };
    }

    // 2. Check if order can be edited
    if (!canEditOrderNote(order)) {
      return {
        success: false,
        error: "Không thể cập nhật ghi chú cho đơn hàng này",
        code: "CANNOT_EDIT_ORDER",
      };
    }

    // 3. Update order internal note
    const updatedOrder = await updateOrderInternalNote(orderId, internalNote);

    revalidatePath(adminRoutes.order(orderId));
    return {
      success: true,
      data: { updatedOrder },
    };
  } catch (error) {
    console.log("Error updating order internal note:", error);
    return {
      success: false,
      error: "Không thể cập nhật ghi chú đơn hàng",
    };
  }
}
