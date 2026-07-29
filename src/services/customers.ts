import { getDb } from "@/db/drizzle";
import {
  CustomerDB,
  NewCustomerDB,
  UpdateCustomerDB,
  customers,
} from "@/db/schemas";
import { eq } from "drizzle-orm";

export async function createCustomer(
  customerData: NewCustomerDB,
): Promise<CustomerDB> {
  // Implementation to create a new customer
  const db = getDb();
  const [newCustomer] = await db
    .insert(customers)
    .values(customerData)
    .returning();
  return newCustomer;
}

export async function getCustomerByPhone(
  phone: string,
): Promise<CustomerDB | null> {
  // Implementation to get customer by phone number
  const db = getDb();
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, phone))
    .limit(1);

  return customer || null;
}

export async function updateCustomerByPhone(
  phone: string,
  updateData: UpdateCustomerDB,
): Promise<CustomerDB | null> {
  const db = getDb();
  const [updatedCustomer] = await db
    .update(customers)
    .set({ ...updateData, updatedAt: new Date() })
    .where(eq(customers.phone, phone))
    .returning();

  return updatedCustomer || null;
}
