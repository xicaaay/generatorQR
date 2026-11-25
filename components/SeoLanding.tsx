import QrGenerator from "@/components/QrGenerator";
import type { SeoPage } from "@/lib/seo-pages";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const KEYGEN_URL = "https://api-token-generator.netlify.app/";

function pageUrl(page: SeoPage) {
  return page.slug ? `${SITE_URL}/${page.slug}` : SITE_URL;
}

/** Datos estructurados (schema.org) para buscadores y asistentes de IA. */
function jsonLd(page: SeoPage) {
  const url = pageUrl(page);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebApplication",
      name: page.slug ? `QR de ${page.name} · ${SITE_NAME}` : SITE_NAME,
      url,
      description: page.description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Cualquiera (navegador web)",
      inLanguage: "es",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: page.faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ];

  if (page.slug) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: `QR de ${page.name}`, item: url },
      ],
    });
  }

  // Se escapa "<" para que el contenido no pueda cerrar la etiqueta <script>.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\\u003c",
  );
}

export default function SeoLanding({ page }: { page: SeoPage }) {
  return (
    <>
      <main className="flex flex-1 flex-col items-center gap-12 px-4 py-10 md:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(page) }} />

        <QrGenerator type={page.type} heading={page.heading} intro={page.intro} />

        <section aria-labelledby="faq-title" className="w-full max-w-3xl px-2">
          <h2 id="faq-title" className="sr-only">
            Preguntas frecuentes
          </h2>
          {page.faqs.map(({ q, a }) => (
            <details key={q} className="group border-b border-neutral-200 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-neutral-900">
                {q}
                <span
                  className="text-neutral-400 transition group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-2 text-neutral-600">{a}</p>
            </details>
          ))}
        </section>
      </main>

      <footer className="px-4 pb-8 text-center text-sm text-neutral-500">
        ¿Necesitas una API key?{" "}
        <a href={KEYGEN_URL} className="text-neutral-900 underline-offset-2 hover:underline">
          Prueba Keygen
        </a>
      </footer>
    </>
  );
}
