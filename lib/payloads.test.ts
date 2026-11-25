import { describe, expect, it } from "vitest";
import {
  EMPTY_FIELDS,
  MAX_TEXT_LENGTH,
  buildPayload,
  escapeVcard,
  escapeWifi,
  isPristine,
} from "@/lib/payloads";

const ok = (result: ReturnType<typeof buildPayload>) => {
  if (!result.ok) throw new Error(`Esperaba ok, recibió: ${result.error}`);
  return result;
};

describe("url", () => {
  it("normaliza y nombra el archivo según el dominio", () => {
    const result = ok(buildPayload("url", { url: "www.Ejemplo.com/promo" }));
    expect(result.value).toBe("https://www.ejemplo.com/promo");
    expect(result.filename).toBe("qr-ejemplo-com");
  });

  it("rechaza esquemas peligrosos", () => {
    expect(buildPayload("url", { url: "javascript:alert(1)" }).ok).toBe(false);
  });
});

describe("whatsapp", () => {
  it("genera un enlace wa.me con solo dígitos y mensaje codificado", () => {
    const result = ok(
      buildPayload("whatsapp", { phone: "+502 5555-1234", message: "Hola, ¿precio?" }),
    );
    expect(result.value).toBe(
      `https://wa.me/50255551234?text=${encodeURIComponent("Hola, ¿precio?")}`,
    );
  });

  it("omite text si no hay mensaje", () => {
    expect(ok(buildPayload("whatsapp", { phone: "50255551234", message: "  " })).value).toBe(
      "https://wa.me/50255551234",
    );
  });

  it("exige un número con código de país", () => {
    expect(buildPayload("whatsapp", { phone: "5555", message: "" }).ok).toBe(false);
  });
});

describe("wifi", () => {
  it("genera el formato WIFI: estándar", () => {
    const result = ok(
      buildPayload("wifi", { ssid: "Casa", password: "secreta123", encryption: "WPA", hidden: false }),
    );
    expect(result.value).toBe("WIFI:T:WPA;S:Casa;P:secreta123;;");
  });

  it("escapa los caracteres especiales", () => {
    expect(escapeWifi('a;b,c:d\\e"f')).toBe('a\\;b\\,c\\:d\\\\e\\"f');
    const result = ok(
      buildPayload("wifi", { ssid: "Mi;Red", password: "p@ss:word", encryption: "WPA", hidden: true }),
    );
    expect(result.value).toBe("WIFI:T:WPA;S:Mi\\;Red;P:p@ss\\:word;H:true;;");
  });

  it("red abierta no incluye contraseña", () => {
    const result = ok(
      buildPayload("wifi", { ssid: "Cafe", password: "ignorada", encryption: "nopass", hidden: false }),
    );
    expect(result.value).toBe("WIFI:T:nopass;S:Cafe;;");
  });

  it("valida la contraseña WPA", () => {
    expect(
      buildPayload("wifi", { ssid: "Casa", password: "corta", encryption: "WPA", hidden: false }).ok,
    ).toBe(false);
  });
});

describe("email", () => {
  it("genera mailto con espacios como %20", () => {
    const result = ok(
      buildPayload("email", { to: "hola@ejemplo.com", subject: "Quiero info", body: "" }),
    );
    expect(result.value).toBe("mailto:hola@ejemplo.com?subject=Quiero%20info");
  });

  it("valida el correo", () => {
    expect(buildPayload("email", { to: "no-es-correo", subject: "", body: "" }).ok).toBe(false);
  });
});

describe("text", () => {
  it("respeta el límite de caracteres", () => {
    expect(buildPayload("text", { text: "a".repeat(MAX_TEXT_LENGTH) }).ok).toBe(true);
    expect(buildPayload("text", { text: "a".repeat(MAX_TEXT_LENGTH + 1) }).ok).toBe(false);
  });

  it("rechaza contenido que no cabe en un QR aunque tenga pocos caracteres", () => {
    // 900 emojis = 3600 bytes en UTF-8: excede la capacidad del QR.
    expect(buildPayload("text", { text: "😀".repeat(450) }).ok).toBe(false);
  });
});

describe("vcard", () => {
  it("genera una vCard 3.0 válida", () => {
    const result = ok(
      buildPayload("vcard", {
        firstName: "Ana",
        lastName: "López",
        phone: "+502 5555-1234",
        email: "ana@ejemplo.com",
        company: "Acme, S.A.",
        website: "ejemplo.com",
      }),
    );

    expect(result.value.split("\r\n")).toEqual([
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:López;Ana;;;",
      "FN:Ana López",
      "ORG:Acme\\, S.A.",
      "TEL;TYPE=CELL:+50255551234",
      "EMAIL:ana@ejemplo.com",
      "URL:https://ejemplo.com/",
      "END:VCARD",
    ]);
    expect(result.filename).toBe("qr-contacto-ana-lopez");
  });

  it("escapa caracteres especiales", () => {
    expect(escapeVcard("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  it("exige el nombre", () => {
    expect(buildPayload("vcard", { ...EMPTY_FIELDS.vcard, phone: "123" }).ok).toBe(false);
  });
});

describe("isPristine", () => {
  it("es true solo si no se escribió nada", () => {
    expect(isPristine("wifi", EMPTY_FIELDS.wifi)).toBe(true);
    expect(isPristine("wifi", { ...EMPTY_FIELDS.wifi, encryption: "nopass" })).toBe(true);
    expect(isPristine("wifi", { ...EMPTY_FIELDS.wifi, ssid: "x" })).toBe(false);
  });
});
