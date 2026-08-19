import type { MetadataRoute } from "next";
import { unstable_rethrow } from "next/navigation";
import { getUniversityRoutes, type UniversityRoute } from "@/lib/db/universities";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Every `/universities/[slug]` entry comes from the database, so adding a
  // verified university publishes its page without a code change.
  const universityRoutes: MetadataRoute.Sitemap = (
    await loadUniversityRoutes()
  ).map((university) => ({
    url: absoluteUrl(`/universities/${university.slug}`),
    lastModified: new Date(university.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...universityRoutes];
}

/**
 * A database outage must not take the whole sitemap down: serving the static
 * routes alone is better than returning an error to a crawler.
 */
async function loadUniversityRoutes(): Promise<UniversityRoute[]> {
  try {
    return await getUniversityRoutes();
  } catch (error) {
    // Reading cookies marks this route dynamic by throwing; that signal belongs
    // to Next.js and must not be swallowed along with database errors.
    unstable_rethrow(error);
    console.error("sitemap: failed to load university routes", error);
    return [];
  }
}
