import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "BD CGPA admin area.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <AdminShell>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Admin area
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            You are signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>.
          </p>
        </div>

        <nav aria-label="Admin sections">
          <Link
            href="/admin/universities"
            className="flex max-w-xl flex-col gap-1 rounded-2xl border border-black/[.08] bg-white p-6 transition-colors hover:border-black/[.2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/[.145] dark:bg-black dark:hover:border-white/[.3]"
          >
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Manage Universities
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              View, add, and edit universities shown on the public site.
            </span>
          </Link>
        </nav>
      </main>
    </AdminShell>
  );
}
