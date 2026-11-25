# QR Generator

Generador de códigos QR gratuito para **enlaces, WhatsApp, WiFi, email, texto y contactos (vCard)**. Puedes personalizar colores y logo, y descargarlo en **PNG de alta resolución** o **SVG**. Sin registro ni marcas de agua, y nada sale de tu navegador.

**Demo:** https://qr-a.netlify.app

## Características

- **6 tipos de QR:**
  - **Enlace:** solo acepta `http://` y `https://`, y si escribes `ejemplo.com` agrega `https://` automáticamente.
  - **WhatsApp:** abre el chat con un mensaje ya escrito (`wa.me`).
  - **WiFi:** conecta a la red sin escribir la contraseña. Soporta WPA, WEP, redes abiertas y ocultas.
  - **Email:** `mailto:` con asunto y mensaje.
  - **Texto libre.**
  - **Contacto:** vCard 3.0 con nombre, teléfono, email, empresa y sitio web.
- **Vista previa en vivo** mientras escribes.
- **Colores personalizados**, con aviso si el contraste es bajo o los colores están invertidos.
- **Logo al centro** (PNG, JPG, WebP o SVG) con corrección de errores **H**, para que el QR siga leyéndose.
- Descarga en **PNG de 512, 1024 o 2048 px** o en **SVG** (escalable, ideal para imprenta).
- Nombre de archivo según el contenido (`qr-ejemplo-com.png`, `qr-wifi-casa.svg`…).
- **Historial local** de los últimos 10 QR. Las contraseñas WiFi nunca se guardan.
- **Una página por tipo** (`/qr-whatsapp`, `/qr-wifi`, `/qr-email`, `/qr-contacto`, `/qr-texto`). Cada una tiene su título, descripción, imagen Open Graph y preguntas frecuentes. Las pestañas son enlaces entre páginas y el contenido y el estilo se conservan al cambiar de tipo.
- **Diseño minimalista:** los errores aparecen al salir del formulario, no mientras escribes, y las preguntas frecuentes están plegadas.
- **Datos estructurados** (JSON-LD con `WebApplication`, `FAQPage` y `BreadcrumbList`), `robots.txt` y `sitemap.xml`.
- **PWA instalable y sin conexión:** manifest, íconos (incluido el maskable) y service worker.
- Accesible: formularios semánticos, errores anunciados con `aria-live` y `aria-invalid`.
- Sin backend, base de datos ni variables de entorno.

## Tecnologías

- [Next.js 16](https://nextjs.org) (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- [qrcode.react](https://github.com/zpao/qrcode.react)

## Requisitos

- Node.js 20.9 o superior
- npm

## Instalación y uso

```bash
git clone https://github.com/xicaaay/generatorQR.git
cd generatorQR
npm install
npm run dev
```

Abre http://localhost:3000.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests unitarios (Vitest) |
| `npm run build` | Tests + build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | Revisión con ESLint |

## Estructura

```txt
generatorQR/
├─ app/
│  ├─ layout.tsx            # Metadata global, fuentes, idioma, registro del SW
│  ├─ page.tsx              # Inicio (QR de enlace)
│  ├─ [slug]/               # Páginas por tipo (estáticas) + su imagen Open Graph
│  ├─ manifest.ts           # Manifest de la PWA
│  ├─ icon.svg · apple-icon.png
│  ├─ opengraph-image.tsx
│  ├─ robots.ts
│  └─ sitemap.ts
├─ public/
│  ├─ sw.js                 # Service worker (uso sin conexión)
│  └─ icons/                # Íconos PWA 192, 512 y maskable
├─ components/
│  ├─ SeoLanding.tsx        # Plantilla de página: generador, FAQ, JSON-LD, footer
│  ├─ ServiceWorker.tsx     # Registra el SW en producción
│  ├─ QrGenerator.tsx       # Tipos, estilo, vista previa, descargas e historial
│  └─ QrFields.tsx          # Formulario de cada tipo de QR
├─ lib/
│  ├─ payloads.ts           # Contenido de cada tipo (WIFI:, wa.me, mailto:, vCard…)
│  ├─ url.ts                # Validación y normalización de enlaces
│  ├─ color.ts              # Contraste WCAG y avisos de legibilidad
│  ├─ history.ts            # Historial en localStorage (useSyncExternalStore)
│  ├─ seo-pages.ts          # Contenido SEO de cada página
│  ├─ session.ts            # Estado compartido entre páginas de tipo (en memoria)
│  ├─ og.tsx                # Plantilla de imágenes Open Graph
│  ├─ site.ts               # URL pública y nombre del sitio
│  └─ *.test.ts             # Tests
└─ package.json
```

## Cómo funciona

1. `buildPayload()` (`lib/payloads.ts`) arma el contenido según el tipo: escapa `; , : " \` en WiFi, codifica el mensaje de WhatsApp, usa `%20` en `mailto:` y escapa la vCard. También rechaza el contenido que supera la capacidad de un QR con corrección H.
2. La vista previa se dibuja con `QRCodeSVG` en cada cambio.
3. Para el PNG se renderiza un `QRCodeCanvas` oculto con la resolución elegida y se exporta con `canvas.toDataURL()`.
4. Para el SVG se serializa el `<svg>` de la vista previa con `XMLSerializer`. Si hay logo, va incrustado como data URL.

## Agregar una página nueva

1. Agrega la entrada en `SEO_PAGES` (`lib/seo-pages.ts`).
2. Agrega su ruta a `PAGES` en `public/sw.js`.

Un test verifica que ambos estén sincronizados y que cada tipo de QR tenga su página. La ruta, la pestaña, el sitemap y la imagen Open Graph se generan solos.

## Sin conexión (PWA)

El service worker solo se registra en producción. Usa red primero para las páginas (y la versión guardada si no hay conexión) y caché primero para los recursos con hash. Si haces un cambio incompatible en la caché, sube `VERSION` en `public/sw.js`.

## Deploy

El sitio está desplegado en **Netlify** (https://qr-a.netlify.app). Si cambias de dominio, actualiza `SITE_URL` en `lib/site.ts`: de ese valor dependen las URLs canónicas, Open Graph y el sitemap.

## Roadmap

- Generación masiva desde CSV con descarga en ZIP.
- Puntos y esquinas redondeadas.
- Analítica sin cookies (Plausible o Umami).

## Privacidad

La aplicación no envía nada a ningún servidor: todo el QR se genera en el navegador. El historial y el logo se quedan en tu dispositivo, y las contraseñas WiFi nunca se guardan.
