/**
 * Utility to safely execute database operations during build time
 * Falls back to default values when database is not available
 */
export async function safeBuildExecution<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string = "database operation",
): Promise<T> {
  // Skip database operations entirely during build if requested
  if (process.env.SKIP_BUILD_DB_OPERATIONS === "true") {
    console.warn(
      `Build-time: Skipping ${operationName} due to SKIP_BUILD_DB_OPERATIONS flag`,
    );
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    // During build time, database might not be available
    // Log warning and return fallback
    console.warn(
      `Build-time: Failed to execute ${operationName}, using fallback:`,
      error,
    );
    return fallback;
  }
}

/**
 * Safe wrapper for config operations
 */
export async function safeConfigOperation<T>(
  operation: () => Promise<T | null>,
  fallback: T,
  configKey: string,
): Promise<T> {
  return safeBuildExecution(
    async () => {
      const result = await operation();
      return result || fallback;
    },
    fallback,
    `config operation for ${configKey}`,
  );
}
