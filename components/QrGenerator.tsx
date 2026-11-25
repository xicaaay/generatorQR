"use client";

import { useId, useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { normalizeUrl } from "@/lib/url";

const PREVIEW_SIZE = 260;
const PNG_SIZES = [512, 1024, 2048] as const;
type PngSize = (typeof PNG_SIZES)[number];

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function filenameFor(url: string, extension: string) {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();
  const slug = host.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `qr-${slug || "codigo"}.${extension}`;
}

export default function QrGenerator() {
  const [url, setUrl] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [error, setError] = useState("");
  const [pngSize, setPngSize] = useState<PngSize>(1024);

  const exportCanvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const errorId = useId();

  const handleGenerateQR = () => {
    const result = normalizeUrl(url);

    if (!result.ok) {
      setError(result.error);
      setQrValue("");
      return;
    }

    setError("");
    setUrl(result.url);
    setQrValue(result.url);
  };

  const handleDownloadPNG = () => {
    const canvas = exportCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    triggerDownload(canvas.toDataURL("image/png"), filenameFor(qrValue, "png"));
  };

  const handleDownloadSVG = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;

    const markup = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${markup}`], {
      type: "image/svg+xml;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, filenameFor(qrValue, "svg"));
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <section className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 md:p-8">
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-neutral-500 mb-2">
          Generador gratuito
        </p>

        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          Crea tu código QR
        </h1>

        <p className="text-neutral-500 mt-3">
          Pega cualquier enlace y genera un QR listo para descargar en PNG HD o SVG.
        </p>
      </div>

      <form
        className="space-y-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleGenerateQR();
        }}
      >
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            Enlace
          </label>

          <input
            id="url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://ejemplo.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none transition focus:border-neutral-900 aria-invalid:border-red-500"
          />

          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-sm text-red-600 mt-2 min-h-5 empty:hidden"
          >
            {error}
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-neutral-900 text-white py-3 font-semibold transition hover:bg-neutral-700"
        >
          Generar QR
        </button>
      </form>

      {qrValue && (
        <div className="mt-8 border-t border-neutral-200 pt-8">
          <div className="flex flex-col items-center">
            <div
              ref={svgRef}
              className="bg-white border border-neutral-200 rounded-2xl p-5"
            >
              <QRCodeSVG
                value={qrValue}
                size={PREVIEW_SIZE}
                level="H"
                marginSize={4}
                title={`Código QR para ${qrValue}`}
              />
            </div>

            {/* Canvas oculto en alta resolución, solo para exportar PNG */}
            <div ref={exportCanvasRef} className="hidden" aria-hidden="true">
              <QRCodeCanvas value={qrValue} size={pngSize} level="H" marginSize={4} />
            </div>

            <p className="text-sm text-neutral-500 mt-4 break-all text-center">
              {qrValue}
            </p>

            <fieldset className="mt-6 w-full">
              <legend className="block text-sm font-medium text-neutral-700 mb-2">
                Resolución del PNG
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {PNG_SIZES.map((size) => (
                  <label
                    key={size}
                    className="cursor-pointer rounded-xl border border-neutral-300 py-2 text-center text-sm font-medium text-neutral-700 transition has-checked:border-neutral-900 has-checked:bg-neutral-900 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-neutral-400"
                  >
                    <input
                      type="radio"
                      name="png-size"
                      value={size}
                      checked={pngSize === size}
                      onChange={() => setPngSize(size)}
                      className="sr-only"
                    />
                    {size}px
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="rounded-xl bg-neutral-900 py-3 font-semibold text-white transition hover:bg-neutral-700"
              >
                Descargar PNG
              </button>
              <button
                type="button"
                onClick={handleDownloadSVG}
                className="rounded-xl border border-neutral-900 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-100"
              >
                Descargar SVG
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
