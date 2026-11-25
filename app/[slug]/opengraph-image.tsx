import { SEO_PAGES, getSeoPage } from "@/lib/seo-pages";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Generador de códigos QR gratis";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return SEO_PAGES.map(({ slug }) => ({ slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const page = getSeoPage((await params).slug);
  return renderOgImage(
    page?.heading ?? "Crea tu código QR",
    "Gratis · Con tu logo · PNG HD y SVG · 100% en tu navegador",
  );
}
