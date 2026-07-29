import { NextResponse } from "next/server";

export function withError<
  T extends (...args: any[]) => Promise<NextResponse> | NextResponse,
>(handler: T) {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err: any) {
      if (err instanceof NextResponse) {
        return err;
      }

      console.log("err", err);

      return NextResponse.json(
        { code: -1, message: err?.message ?? "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
