import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for server-side usage (Server Components, Server
 * Actions, Route Handlers).
 *
 * Uses the public URL and the publishable key only — no secret/service-role
 * key is used. Cookies are wired through the Next.js `cookies()` store using
 * the `getAll`/`setAll` adapter required by the current `@supabase/ssr` API.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` was called from a Server Component, where cookies are
            // read-only. Safe to ignore — session refresh is handled elsewhere
            // (e.g. proxy/middleware) once authentication is introduced.
          }
        },
      },
    },
  );
}
