import postgres from "postgres";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schemas";
import { getEnv } from "@/lib/env";
import { PgTransaction } from "drizzle-orm/pg-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

let db: PostgresJsDatabase<typeof schema>;

export function getDb() {
  if (!db) {
    const env = getEnv();

    const client = postgres(env.DATABASE_URL, { prepare: false });
    db = drizzle(client, { schema });
  }

  return db;
}

type Schema = typeof schema;

export type TransactionType = PgTransaction<
  any,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

export type DB = typeof db | TransactionType;
