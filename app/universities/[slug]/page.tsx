import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GradingPolicyTable } from "@/components/university/GradingPolicyTable";
import { SourceInformation } from "@/components/university/SourceInformation";
import { UniversityHeader } from "@/components/university/UniversityHeader";
import { getUniversityBySlug } from "@/lib/db/universities";
import { formatScaleMax } from "@/lib/grading";
import { absoluteUrl } from "@/lib/site";
import { getActiveGradingPolicy } from "@/lib/universities";

export async function generateMetadata({
  params,
}: PageProps<"/universities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const university = await getUniversityBySlug(slug);

  if (!university) {
    return {
      title: "University not found",
      description: "This university is not available on BD CGPA.",
      robots: { index: false, follow: false },
    };
  }

  const activePolicy = getActiveGradingPolicy(university);
  const canonical = absoluteUrl(`/universities/${university.slug}`);
  const title = `${university.shortName} Grading Policy`;
  const description = activePolicy
    ? `The official grading policy of ${university.name} (${university.shortName}), ${university.city}: letter grades, marks ranges and grade points on a ${formatScaleMax(activePolicy.scaleMax)} scale, published with its official source and verification date.`
    : `${university.name} (${university.shortName}) in ${university.city}, ${university.division}. No verified grading policy has been published for this university yet.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: `${university.name} (${university.shortName}) Grading Policy`,
      description,
      url: canonical,
    },
  };
}

export default async function UniversityPage({
  params,
}: PageProps<"/universities/[slug]">) {
  const { slug } = await params;
  const university = await getUniversityBySlug(slug);

  if (!university) {
    notFound();
  }

  const activePolicy = getActiveGradingPolicy(university);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
        <nav aria-label="Breadcrumb">
          <Link
            href="/"
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-zinc-400 dark:hover:text-foreground"
          >
            Back to all universities
          </Link>
        </nav>

        <UniversityHeader university={university} />

        <section
          aria-labelledby="grading-policy"
          className="flex flex-col gap-5"
        >
          <h2
            id="grading-policy"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            Grading policy
          </h2>

          {activePolicy ? (
            <>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-medium text-foreground">
                  {activePolicy.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Graded on a {formatScaleMax(activePolicy.scaleMax)} scale.
                </p>
              </div>

              <GradingPolicyTable
                gradeBands={activePolicy.gradeBands}
                caption={`${university.shortName} ${activePolicy.name}`}
              />

              {activePolicy.notes ? (
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {activePolicy.notes}
                </p>
              ) : null}

              <SourceInformation
                source={activePolicy}
                subject={`the ${university.shortName} ${activePolicy.name}`}
              />
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-black/[.15] bg-white/50 px-6 py-10 text-center text-sm text-zinc-500 dark:border-white/[.18] dark:bg-white/[.02] dark:text-zinc-400">
              No verified grading policy has been published for{" "}
              {university.shortName} yet. Policies appear here once they have
              been sourced from an official document and verified.
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
