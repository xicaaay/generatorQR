import type { QrType } from "@/lib/payloads";

export interface Faq {
  q: string;
  a: string;
}

export interface SeoPage {
  /** Ruta sin barra inicial. Vacía para la página principal. */
  slug: string;
  type: QrType;
  /** Nombre corto para enlaces y migas de pan. */
  name: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  faqs: Faq[];
}

export const HOME_PAGE: SeoPage = {
  slug: "",
  type: "url",
  name: "QR de enlace",
  title: "Generador de códigos QR gratis · WiFi, WhatsApp, logo y SVG",
  description:
    "Crea códigos QR gratis para enlaces, WhatsApp, WiFi, email o contactos. Personaliza colores y logo y descárgalos en PNG HD o SVG. Sin registro y 100% en tu navegador.",
  heading: "Crea tu código QR",
  intro: "Gratis, sin registro y sin salir de tu navegador.",
  faqs: [
    {
      q: "¿El QR caduca?",
      a: "No. Es un QR estático: la información va dentro del código y funciona para siempre.",
    },
    {
      q: "¿PNG o SVG?",
      a: "PNG para pantallas y redes. SVG para imprenta: se escala sin perder calidad.",
    },
    {
      q: "¿Puedo poner mi logo?",
      a: "Sí. Se usa corrección de errores alta para que el QR siga leyéndose. Funciona mejor con colores oscuros sobre fondo claro.",
    },
  ],
};

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "qr-whatsapp",
    type: "whatsapp",
    name: "WhatsApp",
    title: "Generador de QR para WhatsApp gratis · Con mensaje predefinido",
    description:
      "Crea un código QR que abre un chat de WhatsApp con tu número y un mensaje ya escrito. Gratis, con tu logo y en PNG o SVG.",
    heading: "QR de WhatsApp",
    intro: "Abre un chat contigo con el mensaje ya escrito.",
    faqs: [
      {
        q: "¿Necesito WhatsApp Business?",
        a: "No. Funciona con cualquier número de WhatsApp.",
      },
      {
        q: "¿Por qué el código de país?",
        a: "WhatsApp usa el formato internacional. Sin el código (502, 52, 57…) el chat no se abre.",
      },
    ],
  },
  {
    slug: "qr-wifi",
    type: "wifi",
    name: "WiFi",
    title: "Generador de QR para WiFi gratis · Comparte tu red sin contraseña",
    description:
      "Crea un código QR para que tus invitados o clientes se conecten a tu WiFi con solo escanearlo. Gratis, sin registro y tu contraseña nunca sale del navegador.",
    heading: "QR de WiFi",
    intro: "Conecta a tu red con la cámara, sin dictar la contraseña.",
    faqs: [
      {
        q: "¿Funciona en iPhone y Android?",
        a: "Sí. La cámara de ambos reconoce el QR y ofrece conectarse.",
      },
      {
        q: "¿Qué pasa si cambio la contraseña?",
        a: "El QR deja de funcionar. Genera uno nuevo con la contraseña actual.",
      },
    ],
  },
  {
    slug: "qr-email",
    type: "email",
    name: "Email",
    title: "Generador de QR para email gratis · Con asunto y mensaje",
    description:
      "Crea un código QR que abre un correo con destinatario, asunto y mensaje ya escritos. Gratis y en PNG o SVG.",
    heading: "QR de email",
    intro: "Abre un correo con destinatario, asunto y mensaje listos.",
    faqs: [
      {
        q: "¿Envía el correo automáticamente?",
        a: "No. Lo deja redactado; solo hay que tocar «Enviar».",
      },
    ],
  },
  {
    slug: "qr-contacto",
    type: "vcard",
    name: "Contacto",
    title: "Generador de QR de contacto (vCard) gratis · Tarjeta digital",
    description:
      "Crea un código QR con tu nombre, teléfono, email y empresa para que te guarden como contacto al escanearlo. Ideal para tarjetas de presentación.",
    heading: "QR de contacto",
    intro: "Tu tarjeta de presentación: se guarda como contacto al escanearla.",
    faqs: [
      {
        q: "¿Puedo incluir mi foto?",
        a: "No cabe en un QR estático, pero sí puedes poner tu logo al centro.",
      },
    ],
  },
  {
    slug: "qr-texto",
    type: "text",
    name: "Texto",
    title: "Generador de QR de texto gratis · Mensajes sin internet",
    description:
      "Crea un código QR con cualquier texto: instrucciones, códigos, mensajes o notas. Se lee sin conexión a internet.",
    heading: "QR de texto",
    intro: "Cualquier texto, legible sin conexión a internet.",
    faqs: [
      {
        q: "¿Cuánto texto cabe?",
        a: "Hasta 900 caracteres. Con más texto el QR es más denso: imprímelo grande.",
      },
    ],
  },
];

export const ALL_PAGES: SeoPage[] = [HOME_PAGE, ...SEO_PAGES];

export function getSeoPage(slug: string): SeoPage | undefined {
  return SEO_PAGES.find((page) => page.slug === slug);
}

export function hrefFor(type: QrType): string {
  const page = ALL_PAGES.find((item) => item.type === type);
  return page?.slug ? `/${page.slug}` : "/";
}
