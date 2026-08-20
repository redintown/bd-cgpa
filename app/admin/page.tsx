import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { getAdminSession } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "BD CGPA admin area.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Authoritative server-side gate (defense in depth alongside the proxy and,
  // eventually, database RLS): require an authenticated user who is also on the
  // database-backed admin allowlist.
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/admin/login?error=not_authorized");
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="w-full border-b border-black/[.08] dark:border-white/[.145]">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            BD CGPA{" "}
            <span className="text-zinc-500 dark:text-zinc-400">Admin</span>
          </span>
          <AdminSignOutButton />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Admin area
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            You are signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>.
          </p>
        </div>

        <p className="max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          This is the protected admin foundation. Management features will be
          added here in a later step.
        </p>
      </main>
    </div>
  );
}
