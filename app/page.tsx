import QrGenerator from "@/components/QrGenerator";

const faqs = [
  {
    q: "¿Es gratis?",
    a: "Sí. Puedes generar y descargar todos los códigos QR que quieras, sin registro ni marcas de agua.",
  },
  {
    q: "¿Guardan mis enlaces?",
    a: "No. El código QR se genera directamente en tu navegador; el enlace nunca se envía a ningún servidor.",
  },
  {
    q: "¿Qué formato me conviene?",
    a: "PNG para redes sociales, presentaciones o WhatsApp. SVG para imprenta y diseño: se puede escalar a cualquier tamaño sin perder calidad.",
  },
  {
    q: "¿El QR caduca?",
    a: "No. Es un QR estático: contiene el enlace directamente y funcionará mientras ese enlace exista.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center px-4 py-10 gap-10">
      <QrGenerator />

      <section
        aria-labelledby="faq-title"
        className="w-full max-w-xl text-neutral-700"
      >
        <h2 id="faq-title" className="text-xl font-bold text-neutral-900 mb-4">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q}>
              <dt className="font-semibold text-neutral-900">{q}</dt>
              <dd className="text-neutral-600 mt-1">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
