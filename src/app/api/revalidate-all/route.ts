import { NextResponse } from "next/server";
import { revalidateAll, revalidateConfigUpdate } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  revalidateAll();
  revalidateConfigUpdate("homepage");
  revalidateConfigUpdate("menu_page");
  revalidateConfigUpdate("reservation_page");
  return NextResponse.json({ ok: true });
}
