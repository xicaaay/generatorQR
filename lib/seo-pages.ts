import type { QrType } from "@/lib/payloads";

export interface Faq {
  q: string;
  a: string;
}

export interface SeoPage {
  /** Ruta sin barra inicial. Vacía para la página principal. */
  slug: string;
  type: QrType;
  /** Nombre corto para enlaces internos. */
  name: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  steps: string[];
  uses: string[];
  faqs: Faq[];
}

const SHARED_FAQS: Faq[] = [
  {
    q: "¿Es gratis?",
    a: "Sí. Puedes generar y descargar todos los códigos QR que quieras, sin registro ni marcas de agua.",
  },
  {
    q: "¿Guardan mis datos?",
    a: "No. El código QR se genera directamente en tu navegador; nada se envía a ningún servidor.",
  },
  {
    q: "¿Qué formato me conviene, PNG o SVG?",
    a: "PNG para redes sociales, presentaciones o WhatsApp. SVG para imprenta y diseño: se puede escalar a cualquier tamaño sin perder calidad.",
  },
  {
    q: "¿El QR caduca?",
    a: "No. Es un QR estático: la información va dentro del código, así que funciona para siempre y no depende de ningún servicio.",
  },
];

export const HOME_PAGE: SeoPage = {
  slug: "",
  type: "url",
  name: "QR de enlace",
  title: "Generador de códigos QR gratis · WiFi, WhatsApp, logo y SVG",
  description:
    "Crea códigos QR gratis para enlaces, WhatsApp, WiFi, email o contactos. Personaliza colores y logo y descárgalos en PNG HD o SVG. Sin registro y 100% en tu navegador.",
  heading: "Crea tu código QR",
  intro:
    "Enlaces, WhatsApp, WiFi, email, texto o contacto. Personaliza colores y logo, y descárgalo en PNG HD o SVG.",
  steps: [
    "Elige el tipo de QR y completa los datos.",
    "Personaliza los colores y, si quieres, agrega tu logo.",
    "Descárgalo en PNG o SVG y compártelo o imprímelo.",
  ],
  uses: [
    "Menús, flyers, tarjetas y empaques",
    "Enlazar a tu sitio web, tienda o redes sociales",
    "Formularios, encuestas y reseñas",
  ],
  faqs: [
    ...SHARED_FAQS,
    {
      q: "¿Puedo poner mi logo?",
      a: "Sí. El logo ocupa hasta el 22 % del QR y se usa corrección de errores alta, así que el código sigue leyéndose. Para mejores resultados usa un color oscuro sobre fondo claro.",
    },
  ],
};

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "qr-whatsapp",
    type: "whatsapp",
    name: "QR de WhatsApp",
    title: "Generador de QR para WhatsApp gratis · Con mensaje predefinido",
    description:
      "Crea un código QR que abre un chat de WhatsApp con tu número y un mensaje ya escrito. Gratis, con tu logo y en PNG o SVG.",
    heading: "Crea un QR de WhatsApp",
    intro:
      "Quien lo escanee abrirá un chat contigo, con el mensaje ya escrito. Ideal para negocios, ventas y atención al cliente.",
    steps: [
      "Escribe tu número con el código de país (por ejemplo, 502 para Guatemala).",
      "Agrega un mensaje opcional, como «Hola, quiero información».",
      "Descarga el QR y colócalo en tu local, empaque o redes.",
    ],
    uses: [
      "Pedidos y reservas desde un flyer o mostrador",
      "Atención al cliente en empaques y facturas",
      "Contacto directo en tarjetas de presentación",
    ],
    faqs: [
      {
        q: "¿Necesito WhatsApp Business?",
        a: "No. Funciona con cualquier número de WhatsApp, personal o Business.",
      },
      {
        q: "¿Por qué debo incluir el código de país?",
        a: "WhatsApp identifica los números en formato internacional. Sin el código de país (502, 52, 57, 34…) el chat no se abrirá.",
      },
      {
        q: "¿Puedo cambiar el mensaje después?",
        a: "El mensaje va dentro del QR. Si quieres otro mensaje, genera un QR nuevo; quien escanee también puede editarlo antes de enviarlo.",
      },
      ...SHARED_FAQS,
    ],
  },
  {
    slug: "qr-wifi",
    type: "wifi",
    name: "QR de WiFi",
    title: "Generador de QR para WiFi gratis · Comparte tu red sin contraseña",
    description:
      "Crea un código QR para que tus invitados o clientes se conecten a tu WiFi con solo escanearlo. Gratis, sin registro y tu contraseña nunca sale del navegador.",
    heading: "Crea un QR de WiFi",
    intro:
      "Tus invitados o clientes se conectan escaneándolo con la cámara: sin dictar ni escribir la contraseña.",
    steps: [
      "Escribe el nombre de la red (SSID) exactamente como aparece.",
      "Elige el tipo de seguridad y escribe la contraseña.",
      "Descarga el QR e imprímelo en la recepción, mesas o habitaciones.",
    ],
    uses: [
      "Restaurantes, cafeterías y hoteles",
      "Oficinas y salas de reuniones",
      "Tu casa, para las visitas",
    ],
    faqs: [
      {
        q: "¿Funciona en iPhone y Android?",
        a: "Sí. La cámara de iPhone (iOS 11 o superior) y la de la mayoría de teléfonos Android reconocen el QR de WiFi y ofrecen conectarse.",
      },
      {
        q: "¿Mi contraseña está segura?",
        a: "El QR se genera en tu navegador y la contraseña no se envía a ningún servidor ni se guarda en el historial. Ten en cuenta que cualquiera que escanee el QR podrá conectarse.",
      },
      {
        q: "¿Qué pasa si cambio la contraseña del WiFi?",
        a: "El QR dejará de funcionar. Genera uno nuevo con la contraseña actualizada.",
      },
      ...SHARED_FAQS,
    ],
  },
  {
    slug: "qr-email",
    type: "email",
    name: "QR de email",
    title: "Generador de QR para email gratis · Con asunto y mensaje",
    description:
      "Crea un código QR que abre un correo con destinatario, asunto y mensaje ya escritos. Gratis y en PNG o SVG.",
    heading: "Crea un QR de email",
    intro: "Al escanearlo se abre la app de correo con el destinatario, el asunto y el mensaje listos para enviar.",
    steps: [
      "Escribe el correo de destino.",
      "Agrega un asunto y un mensaje opcionales.",
      "Descarga el QR y úsalo en carteles, formularios o tarjetas.",
    ],
    uses: [
      "Solicitudes de cotización o soporte",
      "Inscripciones y listas de espera",
      "Contacto en tarjetas de presentación",
    ],
    faqs: [
      {
        q: "¿Envía el correo automáticamente?",
        a: "No. Abre el correo ya redactado; la persona solo tiene que tocar «Enviar».",
      },
      ...SHARED_FAQS,
    ],
  },
  {
    slug: "qr-contacto",
    type: "vcard",
    name: "QR de contacto (vCard)",
    title: "Generador de QR de contacto (vCard) gratis · Tarjeta digital",
    description:
      "Crea un código QR con tu nombre, teléfono, email y empresa para que te guarden como contacto al escanearlo. Ideal para tarjetas de presentación.",
    heading: "Crea un QR de contacto",
    intro: "Al escanearlo, el teléfono ofrece guardar tus datos como contacto. Tu tarjeta de presentación, digital.",
    steps: [
      "Completa tu nombre y los datos que quieras compartir.",
      "Personaliza los colores con los de tu marca.",
      "Descárgalo en SVG para imprimirlo en tus tarjetas.",
    ],
    uses: [
      "Tarjetas de presentación",
      "Gafetes en eventos y ferias",
      "Firmas de correo y presentaciones",
    ],
    faqs: [
      {
        q: "¿Qué es una vCard?",
        a: "Es el formato estándar de contactos. iPhone y Android lo reconocen y permiten guardarlo con un toque.",
      },
      {
        q: "¿Puedo incluir mi foto?",
        a: "No: una foto no cabe dentro de un QR estático. Sí puedes poner tu logo al centro del código.",
      },
      ...SHARED_FAQS,
    ],
  },
  {
    slug: "qr-texto",
    type: "text",
    name: "QR de texto",
    title: "Generador de QR de texto gratis · Mensajes sin internet",
    description:
      "Crea un código QR con cualquier texto: instrucciones, códigos, mensajes o notas. Se lee sin conexión a internet.",
    heading: "Crea un QR de texto",
    intro: "Guarda cualquier texto dentro del QR. Se lee sin internet porque el contenido va en el propio código.",
    steps: [
      "Escribe el texto (hasta 900 caracteres).",
      "Ajusta los colores si lo necesitas.",
      "Descarga el QR en PNG o SVG.",
    ],
    uses: [
      "Instrucciones de uso o montaje",
      "Códigos de inventario y etiquetas",
      "Mensajes ocultos en invitaciones o juegos",
    ],
    faqs: [
      {
        q: "¿Cuánto texto cabe?",
        a: "Hasta 900 caracteres. Cuanto más texto, más denso el QR; para textos largos, imprímelo en tamaño grande.",
      },
      ...SHARED_FAQS,
    ],
  },
];

export const ALL_PAGES: SeoPage[] = [HOME_PAGE, ...SEO_PAGES];

export function getSeoPage(slug: string): SeoPage | undefined {
  return SEO_PAGES.find((page) => page.slug === slug);
}
