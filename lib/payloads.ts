import { normalizeUrl } from "@/lib/url";

export type QrType = "url" | "whatsapp" | "wifi" | "email" | "text" | "vcard";

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export interface QrFields {
  url: { url: string };
  whatsapp: { phone: string; message: string };
  wifi: {
    ssid: string;
    password: string;
    encryption: WifiEncryption;
    hidden: boolean;
  };
  email: { to: string; subject: string; body: string };
  text: { text: string };
  vcard: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    company: string;
    website: string;
  };
}

export const EMPTY_FIELDS: QrFields = {
  url: { url: "" },
  whatsapp: { phone: "", message: "" },
  wifi: { ssid: "", password: "", encryption: "WPA", hidden: false },
  email: { to: "", subject: "", body: "" },
  text: { text: "" },
  vcard: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    website: "",
  },
};

export const QR_TYPES: { id: QrType; label: string }[] = [
  { id: "url", label: "Enlace" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "wifi", label: "WiFi" },
  { id: "email", label: "Email" },
  { id: "text", label: "Texto" },
  { id: "vcard", label: "Contacto" },
];

export const MAX_TEXT_LENGTH = 900;
/** Capacidad de un QR versión 40 con corrección H en modo byte: 1273 bytes. */
export const MAX_PAYLOAD_BYTES = 1200;

export type PayloadResult =
  | { ok: true; value: string; label: string; filename: string }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function fail(error: string): PayloadResult {
  return { ok: false, error };
}

/** Escapa los caracteres especiales del formato WIFI: \ ; , : " */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

/** Escapa texto para vCard 3.0: \ , ; y saltos de línea. */
export function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** Solo dígitos. Acepta formatos como "+502 5555-1234" o "(502) 5555 1234". */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function buildUrl({ url }: QrFields["url"]): PayloadResult {
  const result = normalizeUrl(url);
  if (!result.ok) return fail(result.error);

  const host = new URL(result.url).hostname.replace(/^www\./, "");
  return {
    ok: true,
    value: result.url,
    label: result.url,
    filename: `qr-${slugify(host) || "enlace"}`,
  };
}

function buildWhatsapp({ phone, message }: QrFields["whatsapp"]): PayloadResult {
  const digits = normalizePhone(phone);

  if (!digits) return fail("Ingresa el número de WhatsApp.");
  if (digits.length < 8 || digits.length > 15) {
    return fail("El número debe incluir el código de país. Ejemplo: 502 5555 1234");
  }

  const text = message.trim();
  const value = `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  return {
    ok: true,
    value,
    label: `WhatsApp +${digits}`,
    filename: `qr-whatsapp-${digits}`,
  };
}

function buildWifi({ ssid, password, encryption, hidden }: QrFields["wifi"]): PayloadResult {
  if (!ssid) return fail("Ingresa el nombre de la red (SSID).");
  if (encryption !== "nopass" && !password) {
    return fail("Ingresa la contraseña o elige «Sin contraseña».");
  }
  if (encryption === "WPA" && password.length < 8) {
    return fail("Las contraseñas WPA tienen al menos 8 caracteres.");
  }

  const parts = [`T:${encryption}`, `S:${escapeWifi(ssid)}`];
  if (encryption !== "nopass") parts.push(`P:${escapeWifi(password)}`);
  if (hidden) parts.push("H:true");

  return {
    ok: true,
    value: `WIFI:${parts.join(";")};;`,
    label: `WiFi «${ssid}»`,
    filename: `qr-wifi-${slugify(ssid) || "red"}`,
  };
}

function buildEmail({ to, subject, body }: QrFields["email"]): PayloadResult {
  const address = to.trim();

  if (!address) return fail("Ingresa el correo de destino.");
  if (!EMAIL_PATTERN.test(address)) return fail("Ingresa un correo válido. Ejemplo: hola@ejemplo.com");

  const params = new URLSearchParams();
  if (subject.trim()) params.set("subject", subject.trim());
  if (body.trim()) params.set("body", body.trim());
  // URLSearchParams codifica los espacios como "+", que los clientes de correo
  // muestran literalmente en mailto:. Se usa %20, como en encodeURIComponent.
  const query = params.toString().replace(/\+/g, "%20");

  return {
    ok: true,
    value: `mailto:${address}${query ? `?${query}` : ""}`,
    label: `Email a ${address}`,
    filename: `qr-email-${slugify(address.split("@")[0] ?? "") || "correo"}`,
  };
}

function buildText({ text }: QrFields["text"]): PayloadResult {
  const value = text.trim();

  if (!value) return fail("Escribe el texto del QR.");
  if (value.length > MAX_TEXT_LENGTH) {
    return fail(`El texto admite hasta ${MAX_TEXT_LENGTH} caracteres.`);
  }

  return {
    ok: true,
    value,
    label: value.length > 60 ? `${value.slice(0, 57)}…` : value,
    filename: "qr-texto",
  };
}

function buildVcard(fields: QrFields["vcard"]): PayloadResult {
  const firstName = fields.firstName.trim();
  const lastName = fields.lastName.trim();
  const email = fields.email.trim();
  const phone = fields.phone.trim();
  const company = fields.company.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (!fullName) return fail("Ingresa al menos el nombre.");
  if (email && !EMAIL_PATTERN.test(email)) return fail("El correo no es válido.");

  let website = "";
  if (fields.website.trim()) {
    const result = normalizeUrl(fields.website);
    if (!result.ok) return fail(`Sitio web: ${result.error}`);
    website = result.url;
  }

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcard(lastName)};${escapeVcard(firstName)};;;`,
    `FN:${escapeVcard(fullName)}`,
  ];
  if (company) lines.push(`ORG:${escapeVcard(company)}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${phone.replace(/[^\d+]/g, "")}`);
  if (email) lines.push(`EMAIL:${escapeVcard(email)}`);
  if (website) lines.push(`URL:${website}`);
  lines.push("END:VCARD");

  return {
    ok: true,
    value: lines.join("\r\n"),
    label: `Contacto: ${fullName}`,
    filename: `qr-contacto-${slugify(fullName) || "vcard"}`,
  };
}

export function buildPayload<T extends QrType>(type: T, fields: QrFields[T]): PayloadResult {
  const builders: { [K in QrType]: (f: QrFields[K]) => PayloadResult } = {
    url: buildUrl,
    whatsapp: buildWhatsapp,
    wifi: buildWifi,
    email: buildEmail,
    text: buildText,
    vcard: buildVcard,
  };

  const result = (builders[type] as (f: QrFields[T]) => PayloadResult)(fields);

  if (result.ok && new TextEncoder().encode(result.value).length > MAX_PAYLOAD_BYTES) {
    return fail("Hay demasiado contenido para un solo QR. Acorta el texto.");
  }

  return result;
}

/** Campos de selección: cambiarlos no cuenta como "haber escrito algo". */
const CHOICE_FIELDS = new Set(["encryption"]);

/** true si el usuario aún no escribió nada (para no mostrar errores de entrada). */
export function isPristine<T extends QrType>(_type: T, fields: QrFields[T]): boolean {
  return Object.entries(fields as Record<string, unknown>).every(
    ([key, value]) =>
      typeof value !== "string" || CHOICE_FIELDS.has(key) || value.trim() === "",
  );
}
