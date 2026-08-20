import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Result of resolving the current admin session on the server.
 *
 * - `user` is the authenticated Supabase user (verified against the auth
 *   server via `getUser()`), or `null` when there is no valid session.
 * - `isAdmin` is only ever `true` when the authenticated user has a matching
 *   row in the database-backed `public.admins` allowlist.
 */
export interface AdminSession {
  user: User | null;
  isAdmin: boolean;
}

/**
 * Resolves the current admin session for use in Server Components, Server
 * Actions, and Route Handlers.
 *
 * Authorization is database-backed: a Supabase user is treated as an admin
 * only when a row for their id exists in `public.admins`. Being authenticated
 * is never sufficient on its own. This is the authoritative check; it is meant
 * to be backed by RLS so it holds even if application code is bypassed.
 *
 * All database/auth errors are logged server-side and collapsed into
 * `isAdmin: false` so that internal error details are never leaked to callers.
 */
export async function getAdminSession(): Promise<AdminSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, isAdmin: false };
  }

  try {
    const { data: adminRow, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error(
        "Admin authorization lookup failed:",
        adminError.message,
      );
      return { user, isAdmin: false };
    }

    return { user, isAdmin: adminRow !== null };
  } catch (error) {
    console.error("Admin authorization lookup threw:", error);
    return { user, isAdmin: false };
  }
}
