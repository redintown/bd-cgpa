import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (formerly "middleware").
 *
 * Responsibilities, scoped to the `/admin` area only (see `config.matcher`):
 *  1. Refresh the Supabase auth session on each admin request following the
 *     current official `@supabase/ssr` cookie pattern (getAll/setAll).
 *  2. Perform an optimistic authentication redirect: unauthenticated visitors
 *     to any `/admin` route (except `/admin/login`) are sent to the login page.
 *
 * This only performs an *authentication* check. Authorization (is this user an
 * admin?) is enforced authoritatively in the `/admin` Server Component via
 * `getAdminSession()` and, ultimately, by database RLS — never here alone.
 *
 * Uses the public URL + publishable key only; no secret/service-role key.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with the Supabase auth server
  // and triggers cookie refresh. Do not add logic between client creation and
  // this call, and always return `supabaseResponse` so refreshed cookies are
  // sent back to the browser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !pathname.startsWith("/admin/login")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  // Run only for the admin area so the public site is completely unaffected.
  matcher: ["/admin", "/admin/:path*"],
};
