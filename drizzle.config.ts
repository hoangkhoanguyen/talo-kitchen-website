import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local", override: true });
config({ path: ".env" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schemas",
  out: "./src/db/migration",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  migrations: {
    schema: "prod",
  },
  verbose: true,
  strict: true,
});
