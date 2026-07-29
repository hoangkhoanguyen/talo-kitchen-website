import { getDb } from "@/db/drizzle";
import {
  reservations,
  NewReservationDB,
  reservationStatusHistory,
  ReservationStatus,
} from "@/db/schemas";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
// Disabled cache imports - using direct DB calls now
// import { createDynamicCachedFunction } from "@/lib/cache-utils";
// import { CACHE_TAGS } from "@/constants/cache";

export function createReservation(data: NewReservationDB) {
  const db = getDb();
  return db.insert(reservations).values(data).returning();
}

export function getReservationByUuid(uuid: string) {
  const db = getDb();
  return db.query.reservations.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });
}

export async function getAdminReservationTable({
  limit = 20,
  page = 1,
  search,
  status,
}: {
  limit?: number;
  page?: number;
  search: string | null;
  status: string[];
}) {
  try {
    const db = getDb();
    const offset = limit * (page - 1);

    const buildWhereConditions = (fields: any, operators: any) => {
      const conditions = [];
      const { or, ilike, inArray, and } = operators;

      if (search) {
        conditions.push(
          or(
            ilike(fields.code, `%${search}%`),
            ilike(fields.customerFullName, `%${search}%`),
            ilike(fields.customerPhone, `%${search}%`),
          ),
        );
      }

      if (status.length) {
        conditions.push(inArray(fields.status, status as any));
      }

      return and(...conditions);
    };

    const [reservationsList, [{ count: totalCount }]] = await Promise.all([
      db.query.reservations.findMany({
        where: buildWhereConditions,
        limit,
        offset,
        orderBy: [desc(reservations.createdAt)],
      }),
      db
        .select({ count: count(reservations.id) })
        .from(reservations)
        .where(
          buildWhereConditions(reservations, {
            or,
            ilike,
            inArray,
            and,
          }),
        ),
    ]);

    return {
      reservations: reservationsList,
      total: totalCount,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching admin reservation table:", error);
    throw new Error("Failed to fetch admin reservation table");
  }
}

export async function getAdminReservationById(id: number) {
  const db = getDb();
  const reservation = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
    with: {
      statusHistory: { orderBy: [reservationStatusHistory.createdAt] },
    },
  });

  return reservation;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if reservation exists by ID
 * @param reservationId - The reservation ID to check
 * @returns The reservation object if found, null if not found
 */
export async function checkReservationExists(reservationId: number) {
  const db = getDb();

  const reservation = await db.query.reservations.findFirst({
    where: eq(reservations.id, reservationId),
  });

  return reservation;
}

/**
 * Check if reservation can be edited (internal note)
 * @param reservation - The reservation object to check
 * @returns true if reservation can be edited, false otherwise
 */
export function canEditReservationNote(reservation: {
  status: ReservationStatus;
}) {
  return (
    reservation.status !== "cancelled" && reservation.status !== "completed"
  );
}

// ==================== UPDATE FUNCTIONS ====================

export async function updateReservationStatus(
  reservationId: number,
  status: ReservationStatus,
  previousStatus: ReservationStatus,
) {
  const db = getDb();

  return await db.transaction(async (tx) => {
    // 1. Update the reservation status
    const [updatedReservation] = await tx
      .update(reservations)
      .set({ status, updatedAt: new Date() })
      .where(eq(reservations.id, reservationId))
      .returning();

    // 2. Insert a new record into the reservation status history
    await tx.insert(reservationStatusHistory).values({
      reservationId,
      newStatus: status,
      previousStatus,
      createdAt: new Date(),
    });

    return updatedReservation;
  });
}

export async function updateReservationInternalNote(
  reservationId: number,
  internalNote: string,
) {
  const db = getDb();

  const [updatedReservation] = await db
    .update(reservations)
    .set({ internalNote, updatedAt: new Date() })
    .where(eq(reservations.id, reservationId))
    .returning();

  return updatedReservation;
}

// ==================== CACHED VERSIONS (DISABLED) ====================
// Note: These cached functions are disabled to simplify the system
// All functions now use direct database calls for real-time data

/*
export const getReservationByUuidCached = createDynamicCachedFunction(
  getReservationByUuid,
  (uuid) => ["reservations", "uuid", uuid],
  (uuid) => [CACHE_TAGS.RESERVATIONS.BY_UUID(uuid)],
);

export const getAdminReservationByIdCached = createDynamicCachedFunction(
  getAdminReservationById,
  (id) => ["reservations", "admin", "item", id.toString()],
  (id) => [CACHE_TAGS.RESERVATIONS.BY_ID(id)],
);

// ==================== ADMIN CACHED VERSIONS (DISABLED) ====================

export const getAdminReservationTableCached = createDynamicCachedFunction(
  getAdminReservationTable,
  (params) => [
    "admin",
    "reservations",
    "table",
    (params.limit || 20).toString(),
    (params.page || 1).toString(),
    params.search || "null",
    (params.status || []).join(",") || "null",
  ],
  () => [CACHE_TAGS.RESERVATIONS.ADMIN_LIST],
);
*/
