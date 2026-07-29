// import { env } from "@/lib/env";
import { pgSchema } from "drizzle-orm/pg-core";

export const dbSchema = pgSchema(
  // env.NODE_ENV === "production" ? "production" : "dev",
  "prod",
);
