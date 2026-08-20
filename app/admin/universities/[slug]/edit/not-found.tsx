import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "University not found",
  description: "This university is not available on BD CGPA.",
  robots: { index: false, follow: false },
};

/** Rendered with a 404 status when the university slug does not exist. */
export default function EditUniversityNotFound() {
  return (
    <AdminShell>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-20">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          University not found
        </h1>
        <p className="max-w-xl text-base text-zinc-600 dark:text-zinc-400">
          There is no university at this address. It may have been moved or not
          added yet.
        </p>
        <Link
          href="/admin/universities"
          className="text-base text-foreground underline underline-offset-4 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Back to universities
        </Link>
      </main>
    </AdminShell>
  );
}
