import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoLanding from "@/components/SeoLanding";
import { SEO_PAGES, getSeoPage } from "@/lib/seo-pages";

// Solo existen las páginas definidas en SEO_PAGES; cualquier otra ruta da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_PAGES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = getSeoPage((await params).slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: `/${page.slug}`,
      title: page.title,
      description: page.description,
    },
    twitter: { card: "summary_large_image", title: page.title, description: page.description },
  };
}

export default async function SeoTypePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = getSeoPage((await params).slug);
  if (!page) notFound();

  return <SeoLanding page={page} />;
}
