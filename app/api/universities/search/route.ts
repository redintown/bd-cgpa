import { NextResponse, type NextRequest } from "next/server";
import { searchUniversities } from "@/lib/db/universities";

// Runs at request time; the search reflects live data and is never prerendered.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const results = await searchUniversities(query);
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // Never surface the underlying database error to the client.
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
