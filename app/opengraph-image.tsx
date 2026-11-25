import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Generador de códigos QR gratis · WiFi, WhatsApp, logo y SVG";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage("Crea tu código QR", "WiFi · WhatsApp · Logo · PNG HD y SVG");
}
