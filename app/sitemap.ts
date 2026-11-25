import type { MetadataRoute } from "next";
import { ALL_PAGES } from "@/lib/seo-pages";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ALL_PAGES.map(({ slug }) => ({
    url: slug ? `${SITE_URL}/${slug}` : SITE_URL,
    changeFrequency: "monthly",
    priority: slug ? 0.8 : 1,
  }));
}
