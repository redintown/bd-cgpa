import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/db/connection-test";

// Always run at request time so the check reflects live configuration and is
// never evaluated during the build.
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await testSupabaseConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
