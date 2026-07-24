import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { googleOAuthClientId: process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] || "" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
