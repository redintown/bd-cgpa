"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Signs the admin out via Supabase Auth (clears the session cookies) and sends
 * them back to the login page.
 */
export function AdminSignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-10 items-center justify-center rounded-lg border border-black/[.12] bg-white px-4 text-sm font-medium text-foreground transition-colors hover:border-black/[.3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[.18] dark:bg-black dark:hover:border-white/[.3]"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
