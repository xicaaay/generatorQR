import Link from "next/link";
import QrGenerator from "@/components/QrGenerator";
import { ALL_PAGES, type SeoPage } from "@/lib/seo-pages";
import { SITE_NAME, SITE_URL } from "@/lib/site";

function pageUrl(page: SeoPage) {
  return page.slug ? `${SITE_URL}/${page.slug}` : SITE_URL;
}

/** Datos estructurados (schema.org) para buscadores y asistentes de IA. */
function jsonLd(page: SeoPage) {
  const url = pageUrl(page);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebApplication",
      name: page.slug ? `${page.name} · ${SITE_NAME}` : SITE_NAME,
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
        { "@type": "ListItem", position: 2, name: page.name, item: url },
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
  const others = ALL_PAGES.filter((item) => item.slug !== page.slug);

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center px-4 py-10 gap-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(page) }} />

      {page.slug && (
        <nav aria-label="Ruta de navegación" className="w-full max-w-3xl -mb-8 text-sm text-neutral-500">
          <ol className="flex gap-2">
            <li>
              <Link href="/" className="underline underline-offset-2 hover:text-neutral-900">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-neutral-900">
              {page.name}
            </li>
          </ol>
        </nav>
      )}

      {/* key: al navegar entre tipos el generador arranca con el tipo de la página */}
      <QrGenerator key={page.type} initialType={page.type} heading={page.heading} intro={page.intro} />

      <div className="grid w-full max-w-3xl gap-10 text-neutral-700 md:grid-cols-2">
        <section aria-labelledby="how-title">
          <h2 id="how-title" className="text-xl font-bold text-neutral-900 mb-4">
            Cómo hacerlo
          </h2>
          <ol className="list-decimal space-y-2 pl-5">
            {page.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="uses-title">
          <h2 id="uses-title" className="text-xl font-bold text-neutral-900 mb-4">
            Ideas de uso
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            {page.uses.map((use) => (
              <li key={use}>{use}</li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="faq-title" className="w-full max-w-3xl text-neutral-700">
        <h2 id="faq-title" className="text-xl font-bold text-neutral-900 mb-4">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-4">
          {page.faqs.map(({ q, a }) => (
            <div key={q}>
              <dt className="font-semibold text-neutral-900">{q}</dt>
              <dd className="text-neutral-600 mt-1">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-labelledby="more-title" className="w-full max-w-3xl">
        <h2 id="more-title" className="text-xl font-bold text-neutral-900 mb-4">
          Otros generadores de QR
        </h2>
        <ul className="flex flex-wrap gap-2">
          {others.map((item) => (
            <li key={item.slug || "home"}>
              <Link
                href={item.slug ? `/${item.slug}` : "/"}
                className="inline-block rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
