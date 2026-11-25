import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QR Generator · Generador de códigos QR",
    short_name: SITE_NAME,
    description:
      "Crea códigos QR para enlaces, WhatsApp, WiFi, email o contactos. Funciona sin conexión.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#f5f5f5",
    categories: ["utilities", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "QR de WiFi", url: "/qr-wifi" },
      { name: "QR de WhatsApp", url: "/qr-whatsapp" },
      { name: "QR de contacto", url: "/qr-contacto" },
    ],
  };
}
