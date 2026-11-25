export type NormalizeResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
// "esquema:" que NO va seguido de un puerto (ejemplo.com:8080 no es un esquema)
const HAS_SCHEME = /^[a-z][a-z\d+\-.]*:(?!\d)/i;

/**
 * Valida y normaliza un enlace para codificarlo en un QR.
 * - Acepta solo http/https (bloquea javascript:, data:, file:, etc.).
 * - Si el usuario no escribe esquema ("ejemplo.com"), agrega https://.
 * - Exige un dominio con punto o "localhost".
 */
export function normalizeUrl(input: string): NormalizeResult {
  const value = input.trim();

  if (!value) {
    return { ok: false, error: "Debes ingresar un enlace." };
  }

  const candidate = HAS_SCHEME.test(value) ? value : `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      ok: false,
      error: "Ingresa un enlace válido. Ejemplo: https://ejemplo.com",
    };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return {
      ok: false,
      error: "Solo se permiten enlaces que empiecen con http:// o https://.",
    };
  }

  const host = parsed.hostname;
  if (!host || (host !== "localhost" && !host.includes("."))) {
    return {
      ok: false,
      error: "El enlace debe incluir un dominio. Ejemplo: ejemplo.com",
    };
  }

  return { ok: true, url: parsed.href };
}
