import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import path from "path";
import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { createInvalidInputs, createResponse } from "@/lib/api/response";
import { AccessTokenPayload } from "@/lib/auth";
import { getR2Client } from "@/lib/r2";
import { getEnv } from "@/lib/env";

const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

function buildKey(fileName: string): string {
  return fileName;
}

function uniqueFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const randomStr = crypto.randomBytes(4).toString("hex");
  return `${base}-${randomStr}${ext}`;
}

async function uploadImage(payload: AccessTokenPayload, req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    throw createInvalidInputs("No file uploaded");
  }

  const fileName = uniqueFileName(file.name);
  const key = buildKey(fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getEnv().R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return NextResponse.json({
    message: "Upload thành công",
    url: `${getEnv().R2_PUBLIC_URL}/${key}`,
    size: buffer.length,
  });
}

async function getAllImages(payload: AccessTokenPayload) {
  const env = getEnv();

  const result = await getR2Client().send(
    new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
    }),
  );

  const images = (result.Contents ?? [])
    .filter((obj) => obj.Key && ALLOWED_EXTENSIONS.test(obj.Key))
    .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0))
    .map((obj) => `${env.R2_PUBLIC_URL}/${obj.Key}`);

  return createResponse({ images });
}

export const POST = withError(withAuth(uploadImage));
export const GET = withError(withAuth(getAllImages));
