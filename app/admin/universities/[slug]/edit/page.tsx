import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { UniversityForm } from "@/components/admin/UniversityForm";
import { requireAdmin } from "@/lib/auth/admin";
import { getUniversityBySlug } from "@/lib/db/universities";
import { updateUniversityAction } from "@/app/admin/universities/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/admin/universities/[slug]/edit">): Promise<Metadata> {
  const { slug } = await params;
  const university = await getUniversityBySlug(slug);

  if (!university) {
    return {
      title: "University not found",
      description: "This university is not available on BD CGPA.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Edit ${university.shortName}`,
    description: `Edit ${university.name} on BD CGPA.`,
    robots: { index: false, follow: false },
  };
}

export default async function EditUniversityPage({
  params,
}: PageProps<"/admin/universities/[slug]/edit">) {
  await requireAdmin();

  const { slug } = await params;
  const university = await getUniversityBySlug(slug);

  if (!university) {
    notFound();
  }

  const updateAction = updateUniversityAction.bind(null, university.id);

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
            Edit university
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Changes are published on the public site as soon as they are saved.
          </p>
        </div>

        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-black">
          <UniversityForm
            action={updateAction}
            defaultValues={{
              name: university.name,
              shortName: university.shortName,
              slug: university.slug,
              city: university.city,
              division: university.division,
              type: university.type,
              website: university.website,
            }}
            submitLabel="Save changes"
            pendingLabel="Saving…"
          />
        </div>
      </main>
    </AdminShell>
  );
}
