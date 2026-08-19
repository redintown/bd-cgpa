import type { MetadataRoute } from "next";
import { getUniversitySlugs } from "@/lib/universities";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Empty while there is no verified university data; each slug becomes a
  // `/universities/[slug]` entry once universities are added.
  const universityRoutes: MetadataRoute.Sitemap = getUniversitySlugs().map(
    (slug) => ({
      url: `${siteUrl}/universities/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...universityRoutes];
}
