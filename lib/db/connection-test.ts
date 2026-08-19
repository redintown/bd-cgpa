import { createClient } from "@/lib/supabase/server";

export interface ConnectionTestResult {
  ok: boolean;
  /** Row count of the `universities` table (0 is a valid, successful result). */
  count: number | null;
  error?: string;
}

/**
 * Minimal, read-only connection test.
 *
 * Runs a `HEAD` count query against the `universities` table. It performs no
 * writes and returns no row data. An empty table (count `0`) is a successful
 * result. Any missing configuration or network/DB error is returned as
 * `ok: false` rather than thrown, so callers can report status safely.
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("universities")
      .select("*", { count: "exact", head: true });

    if (error) {
      return { ok: false, count: null, error: error.message };
    }

    return { ok: true, count: count ?? 0 };
  } catch (error) {
    return {
      ok: false,
      count: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
