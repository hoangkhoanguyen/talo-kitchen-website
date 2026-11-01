"use server";
import { adminRoutes } from "@/constants/route";
import {
  updateOrderInternalNote,
  updateOrderStatus,
  checkOrderExists,
  canEditOrderNote,
  updateOrderEnabled,
  updateOrderItemEnabled,
  addOrderItem,
  updateOrderItemQuantity,
  removeOrderItem,
  updateOrderCustomerPhone,
  getOrderProductOptions,
  OrderEditErrorCode,
} from "@/services/orders";
import {
  addOrderItemSchema,
  removeOrderItemSchema,
  updateOrderCustomerPhoneSchema,
  updateOrderItemQuantitySchema,
} from "@/validations/order-edit";
import z from "zod";
import { verifyAdminAuthSimple } from "@/services/auth";
import { revalidatePath } from "next/cache";
import { isTaloKitchen } from "@/lib/order-visibility";
import { canEditOrder } from "@/lib/order-edit";

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

export async function toggleOrderItemEnabledAction({
  itemId,
  isEnabled,
}: {
  itemId: number;
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

    // Chỉ talo_kitchen mới được bật/tắt item
    if (!isTaloKitchen(authResult.user?.username)) {
      return {
        success: false,
        error: "Bạn không có quyền thực hiện thao tác này",
        code: "FORBIDDEN",
      };
    }

    const updatedItem = await updateOrderItemEnabled(itemId, isEnabled);
    if (!updatedItem) {
      return {
        success: false,
        error: "Sản phẩm trong đơn không tồn tại",
        code: "ORDER_ITEM_NOT_FOUND",
      };
    }

    revalidatePath(adminRoutes.order(updatedItem.orderId));
    return {
      success: true,
      data: { updatedItem },
    };
  } catch (error) {
    console.log("Error toggling order item enabled:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái bật/tắt sản phẩm",
    };
  }
}

// ==================== SỬA ĐƠN (pending / processing) ====================

const EDIT_ERROR_MESSAGES: Record<OrderEditErrorCode, string> = {
  ORDER_NOT_FOUND: "Đơn hàng không tồn tại",
  CANNOT_EDIT_ORDER: "Chỉ có thể sửa đơn hàng đang chờ hoặc đang xử lý",
  ORDER_ITEM_NOT_FOUND: "Sản phẩm trong đơn không tồn tại",
  PRODUCT_NOT_FOUND: "Sản phẩm không tồn tại hoặc đã ngừng bán",
  ADDON_NOT_FOUND: "Add-on không hợp lệ hoặc đã ngừng bán",
  LAST_ITEM: "Đơn hàng phải còn ít nhất 1 sản phẩm",
};

type ActionFailure = { success: false; error: string; code?: string };
type ActionResult<T> = ActionFailure | { success: true; data: T };

const INVALID_INPUT: ActionFailure = {
  success: false,
  error: "Dữ liệu không hợp lệ",
  code: "INVALID_INPUT",
};

/**
 * Xác thực + kiểm tra đơn tồn tại/được phép xem (đơn tắt chỉ talo_kitchen thấy)
 * + còn ở trạng thái sửa được. Service kiểm tra lại lần nữa trong transaction.
 */
async function authorizeOrderEdit(orderId: number) {
  const authResult = await verifyAdminAuthSimple("/admin/orders");
  if (!authResult.isValid) {
    return {
      ok: false,
      response: {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      },
    } as const;
  }

  const includeDisabled = isTaloKitchen(authResult.user?.username);
  const order = await checkOrderExists(orderId, includeDisabled);
  if (!order) {
    return {
      ok: false,
      response: {
        success: false,
        error: EDIT_ERROR_MESSAGES.ORDER_NOT_FOUND,
        code: "ORDER_NOT_FOUND",
      },
    } as const;
  }
  if (!canEditOrder(order)) {
    return {
      ok: false,
      response: {
        success: false,
        error: EDIT_ERROR_MESSAGES.CANNOT_EDIT_ORDER,
        code: "CANNOT_EDIT_ORDER",
      },
    } as const;
  }
  return { ok: true, includeDisabled } as const;
}

function editFailure(code: OrderEditErrorCode): ActionFailure {
  return { success: false, error: EDIT_ERROR_MESSAGES[code], code };
}

export async function getOrderProductOptionsAction() {
  try {
    const authResult = await verifyAdminAuthSimple("/admin/orders");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }
    return { success: true, data: await getOrderProductOptions() };
  } catch (error) {
    console.log("Error fetching order product options:", error);
    return { success: false, error: "Không thể tải danh sách sản phẩm" };
  }
}

export async function addOrderItemAction(
  input: z.input<typeof addOrderItemSchema>,
): Promise<ActionResult<{ orderId: number; itemId: number }>> {
  try {
    const parsed = addOrderItemSchema.safeParse(input);
    if (!parsed.success) return INVALID_INPUT;
    const { orderId, ...itemInput } = parsed.data;

    const auth = await authorizeOrderEdit(orderId);
    if (!auth.ok) return auth.response;

    const result = await addOrderItem(orderId, itemInput, auth.includeDisabled);
    if (!result.ok) return editFailure(result.code);

    revalidatePath(adminRoutes.order(orderId));
    return { success: true, data: { orderId, itemId: result.itemId } };
  } catch (error) {
    console.log("Error adding order item:", error);
    return { success: false, error: "Không thể thêm sản phẩm vào đơn hàng" };
  }
}

export async function updateOrderItemQuantityAction(
  input: z.input<typeof updateOrderItemQuantitySchema>,
): Promise<ActionResult<{ orderId: number; itemId: number }>> {
  try {
    const parsed = updateOrderItemQuantitySchema.safeParse(input);
    if (!parsed.success) return INVALID_INPUT;
    const { orderId, itemId, quantity } = parsed.data;

    const auth = await authorizeOrderEdit(orderId);
    if (!auth.ok) return auth.response;

    const result = await updateOrderItemQuantity(
      orderId,
      itemId,
      quantity,
      auth.includeDisabled,
    );
    if (!result.ok) return editFailure(result.code);

    revalidatePath(adminRoutes.order(orderId));
    return { success: true, data: { orderId, itemId } };
  } catch (error) {
    console.log("Error updating order item quantity:", error);
    return { success: false, error: "Không thể cập nhật số lượng sản phẩm" };
  }
}

export async function removeOrderItemAction(
  input: z.input<typeof removeOrderItemSchema>,
): Promise<ActionResult<{ orderId: number; itemId: number }>> {
  try {
    const parsed = removeOrderItemSchema.safeParse(input);
    if (!parsed.success) return INVALID_INPUT;
    const { orderId, itemId } = parsed.data;

    const auth = await authorizeOrderEdit(orderId);
    if (!auth.ok) return auth.response;

    const result = await removeOrderItem(orderId, itemId, auth.includeDisabled);
    if (!result.ok) return editFailure(result.code);

    revalidatePath(adminRoutes.order(orderId));
    return { success: true, data: { orderId, itemId } };
  } catch (error) {
    console.log("Error removing order item:", error);
    return { success: false, error: "Không thể xoá sản phẩm khỏi đơn hàng" };
  }
}

export async function updateOrderCustomerPhoneAction(
  input: z.input<typeof updateOrderCustomerPhoneSchema>,
): Promise<ActionResult<{ orderId: number; customerPhone: string }>> {
  try {
    const parsed = updateOrderCustomerPhoneSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Số điện thoại phải từ 10 đến 20 ký tự",
        code: "INVALID_INPUT",
      };
    }
    const { orderId, customerPhone } = parsed.data;

    const auth = await authorizeOrderEdit(orderId);
    if (!auth.ok) return auth.response;

    const result = await updateOrderCustomerPhone(
      orderId,
      customerPhone,
      auth.includeDisabled,
    );
    if (!result.ok) return editFailure(result.code);

    revalidatePath(adminRoutes.order(orderId));
    revalidatePath(adminRoutes.orders());
    return { success: true, data: { orderId, customerPhone } };
  } catch (error) {
    console.log("Error updating order customer phone:", error);
    return { success: false, error: "Không thể cập nhật số điện thoại" };
  }
}
