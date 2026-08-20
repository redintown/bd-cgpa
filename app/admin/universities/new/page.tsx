import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { UniversityForm } from "@/components/admin/UniversityForm";
import { requireAdmin } from "@/lib/auth/admin";
import { createUniversityAction } from "@/app/admin/universities/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add university",
  description: "Add a university to BD CGPA.",
  robots: { index: false, follow: false },
};

export default async function NewUniversityPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <Link
            href="/admin/universities"
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-zinc-400 dark:hover:text-foreground"
          >
            Back to universities
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Add university
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This university will appear in public search once saved.
          </p>
        </div>

        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
          <UniversityForm
            action={createUniversityAction}
            submitLabel="Add university"
            pendingLabel="Saving…"
          />
        </div>
      </main>
    </AdminShell>
  );
}
