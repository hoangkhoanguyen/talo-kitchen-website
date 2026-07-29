import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { getEnv } from "@/lib/env";

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!client) {
    const env = getEnv();
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}
