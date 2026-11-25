import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { describe, expect, it } from "vitest";
import { MAX_PAYLOAD_BYTES, MAX_TEXT_LENGTH, buildPayload } from "@/lib/payloads";

describe("capacidad del QR", () => {
  it("el contenido máximo permitido cabe en un QR con corrección H", () => {
    // Peor caso permitido: caracteres de 1 byte hasta el límite de bytes.
    const value = "a".repeat(MAX_PAYLOAD_BYTES);
    const render = () =>
      renderToStaticMarkup(createElement(QRCodeSVG, { value, level: "H", marginSize: 4 }));
    expect(render).not.toThrow();
  });

  it("el texto más largo permitido genera un QR", () => {
    const result = buildPayload("text", { text: "á".repeat(MAX_TEXT_LENGTH / 2) });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const markup = renderToStaticMarkup(
      createElement(QRCodeSVG, { value: result.value, level: "H", marginSize: 4 }),
    );
    expect(markup).toContain("<svg");
  });
});
