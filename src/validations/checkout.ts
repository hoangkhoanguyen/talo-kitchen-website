import { EShippingMethod } from "@/types/app-configs";
import z from "zod";

export const checkoutSchema = z
  .object({
    customerPhone: z
      .string({ error: "Phone number is required" })
      .min(10, "Phone number must be at least 10 digits")
      .max(20, "Phone number must be at most 20 digits"),
    customerFirstName: z
      .string({ error: "First name is required" })
      .min(1, "First name is required")
      .max(100, "First name must be at most 100 characters"),
    customerLastName: z
      .string({ error: "Last name is required" })
      .min(1, "Last name is required")
      .max(100, "Last name must be at most 100 characters"),
    paymentMethod: z.enum(["cash"], {
      error: '"Payment method is required",',
    }),
    shippingMethod: z.enum(Object.values(EShippingMethod), {
      error: "Shipping method is required",
    }),
    deliveryAddress: z
      .string()
      .max(300, "Shipping address must be at most 300 characters")
      .optional(),
    addressNote: z
      .string()
      .max(300, "Address note must be at most 300 characters")
      .optional(),
    note: z.string().max(300, "Note must be at most 300 characters").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod === EShippingMethod.door2door) {
      if (!data.deliveryAddress || data.deliveryAddress.trim().length < 5) {
        ctx.addIssue({
          path: ["deliveryAddress"],
          code: "custom",
          message:
            "Delivery address is required and must be at least 5 characters when choosing door-to-door delivery",
        });
      }
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
