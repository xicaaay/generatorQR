# QR Generator

Generador de códigos QR gratuito: pegas un enlace y descargas el QR en **PNG de alta resolución** o **SVG**. Sin registro ni marcas de agua, y el enlace nunca sale de tu navegador.

**Demo:** https://qr-a.netlify.app

## Características

- Validación estricta: solo se aceptan enlaces `http://` y `https://`. Si escribes `ejemplo.com`, se agrega `https://` automáticamente.
- Vista previa vectorial (SVG) del QR.
- Descarga en **PNG de 512, 1024 o 2048 px** o en **SVG** (escalable, ideal para imprenta).
- Nombre de archivo según el dominio (`qr-ejemplo-com.png`).
- Corrección de errores nivel **H** (30 %): el QR sigue leyéndose aunque se dañe o se le ponga un logo encima.
- SEO listo: metadata en español, Open Graph con imagen generada, `robots.txt` y `sitemap.xml`.
- Accesible: formulario semántico, errores anunciados por lectores de pantalla (`aria-live`) y `aria-invalid`.
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
| `npm run build` | Build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | Revisión con ESLint |

## Estructura

```txt
generatorQR/
├─ app/
│  ├─ layout.tsx            # Metadata global, fuentes, idioma
│  ├─ page.tsx              # Página (Server Component) + preguntas frecuentes
│  ├─ globals.css
│  ├─ icon.svg              # Favicon
│  ├─ opengraph-image.tsx   # Imagen para compartir en redes (generada)
│  ├─ robots.ts
│  └─ sitemap.ts
├─ components/
│  └─ QrGenerator.tsx       # Formulario, vista previa y descargas (Client Component)
├─ lib/
│  ├─ site.ts               # URL pública y nombre del sitio
│  └─ url.ts                # Validación y normalización de enlaces
└─ package.json
```

## Cómo funciona

1. `normalizeUrl()` (`lib/url.ts`) limpia el texto, agrega `https://` si falta y rechaza esquemas peligrosos como `javascript:`, `data:` o `file:`.
2. La vista previa se dibuja con `QRCodeSVG`.
3. Para el PNG se renderiza un `QRCodeCanvas` oculto con la resolución elegida y se exporta con `canvas.toDataURL()`.
4. Para el SVG se serializa el `<svg>` de la vista previa con `XMLSerializer`.

## Deploy

El sitio está desplegado en **Netlify** (https://qr-a.netlify.app). Si cambias de dominio, actualiza `SITE_URL` en `lib/site.ts`: de ese valor dependen las URLs canónicas, Open Graph y el sitemap.

## Roadmap

- Colores personalizados y logo al centro.
- Tipos de QR: WiFi, WhatsApp, vCard, email, texto y ubicación.
- Generación masiva desde CSV con descarga en ZIP.
- Historial local.

## Privacidad

La aplicación no almacena ni envía los enlaces. Todo el QR se genera en el navegador.
