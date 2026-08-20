import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";
import {
  listUniversitiesForAdmin,
  type AdminUniversityRecord,
} from "@/lib/db/admin/universities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage universities",
  description: "View and manage universities on BD CGPA.",
  robots: { index: false, follow: false },
};

const STATUS_MESSAGES: Record<string, string> = {
  created: "University added.",
  updated: "University updated.",
};

export default async function AdminUniversitiesPage({
  searchParams,
}: PageProps<"/admin/universities">) {
  await requireAdmin();

  const params = await searchParams;
  const rawStatus = params.created
    ? "created"
    : params.updated
      ? "updated"
      : undefined;
  const statusMessage = rawStatus ? STATUS_MESSAGES[rawStatus] : undefined;

  let universities: AdminUniversityRecord[] = [];
  let loadError: string | null = null;
  try {
    universities = await listUniversitiesForAdmin();
  } catch (error) {
    console.error("Failed to list universities for admin:", error);
    loadError = "Universities could not be loaded. Please try again.";
  }

  return (
    <AdminShell>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              href="/admin"
              className="text-sm text-zinc-500 underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-zinc-400 dark:hover:text-foreground"
            >
              Back to admin
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Universities
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Add and edit universities shown on the public site.
            </p>
          </div>
          <Link
            href="/admin/universities/new"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-foreground px-4 text-base font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Add University
          </Link>
        </div>

        {statusMessage ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300"
          >
            {statusMessage}
          </p>
        ) : null}

        {loadError ? (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          >
            {loadError}
          </p>
        ) : universities.length === 0 ? (
          <p className="rounded-xl border border-dashed border-black/[.15] bg-white/50 px-6 py-10 text-center text-sm text-zinc-500 dark:border-white/[.18] dark:bg-white/[.02] dark:text-zinc-400">
            No universities have been added yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3">
            {universities.map((university) => (
              <li key={university.id}>
                <article className="flex flex-col gap-4 rounded-2xl border border-black/[.08] bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[.145] dark:bg-black">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="text-base font-semibold text-foreground">
                      {university.name}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {university.shortName} · {university.city} ·{" "}
                      {university.division} ·{" "}
                      {university.type === "public" ? "Public" : "Private"}
                    </p>
                    <p className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                      /{university.slug}
                    </p>
                  </div>
                  <Link
                    href={`/admin/universities/${university.slug}/edit`}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-black/[.12] bg-white px-4 text-sm font-medium text-foreground transition-colors hover:border-black/[.3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/[.18] dark:bg-black dark:hover:border-white/[.3]"
                  >
                    Edit
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AdminShell>
  );
}
