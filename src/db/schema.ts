import { pgSchema } from "drizzle-orm/pg-core";

// Schema do env quyết định (DB_SCHEMA), fallback "prod".
// Đọc process.env trực tiếp vì file này được cả Next.js runtime lẫn
// drizzle-kit CLI import — không dùng getEnv() (server-only).
export const dbSchema = pgSchema(process.env.DB_SCHEMA || "prod");
