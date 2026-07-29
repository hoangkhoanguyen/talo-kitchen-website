"use server";
import { createReservation } from "@/services/reservations";
import { CreateReservationType } from "@/validations/reservation";

export async function createReservationAction(data: CreateReservationType) {
  try {
    // Generate a code with 9 characters, starting with "LFW"
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = "LFW" + randomPart.padEnd(6, "0").substring(0, 6);

    const [reservation] = await createReservation({
      code,
      arrivalTime: data.arrivalTime,
      arrivalDate: data.arrivalDate,
      numberOfPeople: data.numberOfPeople,
      customerFullName: data.customerFullName,
      customerPhone: data.customerPhone,
      note: data.note || "",
    });

    return {
      success: true,
      reservation,
    };
  } catch (error) {
    console.error("Error creating reservation:", error);
    return {
      success: false,
      error:
        "An error occurred while creating the reservation. Please try again.",
    };
  }
}
