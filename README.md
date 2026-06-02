# QR Generator - Next.js

Aplicación web gratuita para generar códigos QR a partir de enlaces.
El usuario solo debe pegar una URL válida, generar el QR y descargarlo como imagen PNG.

## Tabla de contenido

* [Descripción](#descripción)
* [Tecnologías utilizadas](#tecnologías-utilizadas)
* [Características](#características)
* [Requisitos previos](#requisitos-previos)
* [Instalación](#instalación)
* [Ejecución local](#ejecución-local)
* [Estructura del proyecto](#estructura-del-proyecto)
* [Funcionamiento general](#funcionamiento-general)
* [Librería de QR](#librería-de-qr)
* [Deploy](#deploy)
* [Mejoras futuras](#mejoras-futuras)
* [Comandos útiles](#comandos-útiles)

## Descripción

Este proyecto permite generar códigos QR desde una aplicación web construida con Next.js.

La aplicación funciona completamente desde el frontend, por lo que no necesita backend, base de datos ni API externa para generar los códigos QR.

El flujo principal es:

1. El usuario ingresa un enlace.
2. La aplicación valida que sea una URL válida.
3. Se genera un código QR en pantalla.
4. El usuario puede descargar el QR como imagen PNG.

## Tecnologías utilizadas

* Next.js
* React
* TypeScript
* Tailwind CSS
* qrcode.react

## Características

* Generación gratuita de códigos QR.
* Validación básica de enlaces.
* Vista previa del QR generado.
* Descarga del QR en formato PNG.
* Diseño responsive.
* Funcionamiento sin backend.
* No requiere base de datos.
* No requiere variables de entorno.

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

* Node.js 18 o superior
* npm, yarn, pnpm o bun

Puedes validar tu versión de Node.js con:

```bash
node -v
```

Y tu versión de npm con:

```bash
npm -v
```

## Instalación

Clona el repositorio:

```bash
git clone <https://github.com/xicaaay/generatorQR.git>
```

Entra a la carpeta del proyecto:

```bash
cd qr-generator
```

Instala las dependencias:

```bash
npm install
```

## Ejecución local

Para levantar el proyecto en ambiente local, ejecuta:

```bash
npm run dev
```

Luego abre en el navegador:

```bash
http://localhost:3000
```

Production:

```bash
https://qr-a.netlify.app/
```

## Estructura del proyecto

La estructura principal del proyecto es:

```txt
qr-generator/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  └─ globals.css
├─ public/
├─ package.json
├─ tailwind.config.ts
├─ tsconfig.json
└─ README.md
```

## Funcionamiento general

La página principal se encuentra en:

```txt
src/app/page.tsx
```

Esta página contiene toda la lógica del generador QR.

El usuario escribe un enlace en el input:

```tsx
<input
  type="url"
  placeholder="https://ejemplo.com"
  value={url}
  onChange={(event) => setUrl(event.target.value)}
/>
```

Luego, al presionar el botón de generar, se valida la URL:

```tsx
const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};
```

Si la URL es válida, se guarda el valor y se muestra el QR:

```tsx
<QRCodeCanvas
  value={qrValue}
  size={260}
  level="H"
  includeMargin
/>
```

Finalmente, el botón de descarga convierte el QR generado en un archivo PNG:

```tsx
const pngUrl = canvas.toDataURL("image/png");
```

## Librería de QR

Este proyecto utiliza la librería:

```bash
qrcode.react
```

Instalación:

```bash
npm install qrcode.react
```

Uso básico:

```tsx
import { QRCodeCanvas } from "qrcode.react";

<QRCodeCanvas value="https://ejemplo.com" size={260} />
```

## Deploy

Este proyecto puede desplegarse fácilmente en plataformas como:

* Vercel
* Netlify
* Railway

La opción recomendada es Vercel, ya que el proyecto está construido con Next.js.

### Deploy en Vercel

1. Subir el proyecto a GitHub.
2. Entrar a Vercel.
3. Seleccionar `New Project`.
4. Importar el repositorio.
5. Hacer clic en `Deploy`.

No se necesitan variables de entorno para esta versión.

## Mejoras futuras

Algunas mejoras que se pueden agregar más adelante:

* Cambiar color del QR.
* Cambiar color de fondo.
* Seleccionar tamaño del QR.
* Descargar en SVG.
* Agregar logo al centro del QR.
* Agregar nombre personalizado al archivo.
* Agregar historial local de códigos generados.
* Agregar modo oscuro.
* Agregar soporte para texto, WhatsApp, emails o ubicación.
* Agregar diseño de landing page pública.

## Comandos útiles

Instalar dependencias:

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Generar build de producción:

```bash
npm run build
```

Ejecutar build de producción:

```bash
npm start
```

Ejecutar revisión de lint:

```bash
npm run lint
```

## Notas importantes

Esta aplicación no almacena los enlaces ingresados por los usuarios.

Todo el proceso de generación del QR ocurre directamente en el navegador, por lo que es una solución simple, rápida y gratuita.

## Licencia

Este proyecto puede ser utilizado y modificado libremente según las necesidades del equipo o del cliente.
