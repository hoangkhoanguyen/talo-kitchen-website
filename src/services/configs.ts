import { getDb } from "@/db/drizzle";
import { ConfigDB, configs, NewConfigDB } from "@/db/schemas";
import { and, eq } from "drizzle-orm";

export async function getConfigsByKey(key: string, configType: string) {
  const db = getDb();

  const config = await db.query.configs.findFirst({
    where(fields, { and, eq }) {
      return and(eq(fields.key, key), eq(fields.config_type, configType));
    },
  });

  return config;
}

export async function initConfig(data: NewConfigDB) {
  const db = getDb();

  const existingConfig = await getConfigsByKey(data.key, data.config_type);

  if (existingConfig) {
    throw new Error("Config already exists");
  }

  await db.insert(configs).values(data);
}

export async function updateConfigByKey({
  value,
  key,
  config_type,
}: {
  key: string;
  value: ConfigDB["value"];
  config_type: string;
}) {
  const db = getDb();

  const existingConfig = await getConfigsByKey(key, config_type);

  if (!existingConfig) {
    throw new Error("Config not found");
  }

  await db
    .update(configs)
    .set({ value, updatedAt: new Date() })
    .where(and(eq(configs.key, key), eq(configs.config_type, config_type)));
}

export async function getUIConfigsByKey(key: string) {
  return getConfigsByKey(key, "ui");
}

export async function getAppConfigsByKey(key: string) {
  return getConfigsByKey(key, "app");
}
