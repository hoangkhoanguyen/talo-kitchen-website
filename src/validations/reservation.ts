import z from "zod";

export const createReservationSchema = z.object({
  arrivalTime: z.string({ error: "Preferred time is required" }).min(1, {
    error: "Preferred time is required",
  }), // time only, required
  arrivalDate: z.string({ error: "Preferred date is required" }).min(1, {
    error: "Preferred date is required",
  }), // date only, required
  numberOfPeople: z
    .string({
      error: "Number of guests is required",
    })
    .min(1, { message: "Number of guests is required" }),
  customerFullName: z
    .string({
      error: "Full name is required",
    })
    .trim()
    .min(2, { message: "Full name must be at least 2 characters long" })
    .max(255, { message: "Full name must be at most 255 characters long" }),
  customerPhone: z
    .string({
      error: "Phone number is required",
    })
    .trim()
    .min(7, { message: "Phone number must be at least 7 characters long" })
    .max(20, { message: "Phone number must be at most 20 characters long" }),
  note: z
    .string()
    .trim()
    .max(1000, { message: "Note must be at most 1000 characters long" })
    .optional()
    .or(z.literal("")),
});

export type CreateReservationType = z.infer<typeof createReservationSchema>;
