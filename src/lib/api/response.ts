import { NextResponse } from "next/server";

export function createResponse(
  data: { code: number; message: string } | any,
  status: number = 200,
) {
  return NextResponse.json(data, { status });
}

export function createAuthError(data: { code: number; message: string }) {
  return createResponse(data, 401);
}

export function createUnauthenticatedError(
  message: string = "Unauthenticated",
) {
  return createAuthError({
    code: 1,
    message,
  });
}

export function createInvalidInputs(message: string = "Invalid inputs") {
  return createResponse(
    {
      code: -1,
      message,
    },
    400,
  );
}
