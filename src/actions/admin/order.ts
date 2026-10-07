"use server";
import { adminRoutes } from "@/constants/route";
import {
  updateOrderInternalNote,
  updateOrderStatus,
  checkOrderExists,
  canEditOrderNote,
  updateOrderEnabled,
} from "@/services/orders";
import { verifyAdminAuthSimple } from "@/services/auth";
import { revalidatePath } from "next/cache";
import { isTaloKitchen } from "@/lib/order-visibility";

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
    const order = await checkOrderExists(
      orderId,
      isTaloKitchen(authResult.user?.username),
    );
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
    const order = await checkOrderExists(
      orderId,
      isTaloKitchen(authResult.user?.username),
    );
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

export async function toggleOrderEnabledAction({
  orderId,
  isEnabled,
}: {
  orderId: number;
  isEnabled: boolean;
}) {
  try {
    const authResult = await verifyAdminAuthSimple("/admin/orders");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    // Chỉ talo_kitchen mới được bật/tắt đơn
    if (!isTaloKitchen(authResult.user?.username)) {
      return {
        success: false,
        error: "Bạn không có quyền thực hiện thao tác này",
        code: "FORBIDDEN",
      };
    }

    const order = await checkOrderExists(orderId, true);
    if (!order) {
      return {
        success: false,
        error: "Đơn hàng không tồn tại",
        code: "ORDER_NOT_FOUND",
      };
    }

    const updatedOrder = await updateOrderEnabled(orderId, isEnabled);

    revalidatePath(adminRoutes.order(orderId));
    return {
      success: true,
      data: { updatedOrder },
    };
  } catch (error) {
    console.log("Error toggling order enabled:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái bật/tắt đơn hàng",
    };
  }
}
