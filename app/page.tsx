"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [error, setError] = useState("");

  const qrContainerRef = useRef<HTMLDivElement>(null);

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerateQR = () => {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError("Debes ingresar un enlace.");
      setQrValue("");
      return;
    }

    if (!isValidUrl(cleanUrl)) {
      setError("Ingresa un enlace válido. Ejemplo: https://ejemplo.com");
      setQrValue("");
      return;
    }

    setError("");
    setQrValue(cleanUrl);
  };

  const handleDownloadQR = () => {
    const canvas = qrContainerRef.current?.querySelector("canvas");

    if (!canvas) {
      return;
    }

    const pngUrl = canvas.toDataURL("image/png");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "codigo-qr.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <main className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 md:p-8">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-neutral-500 mb-2">
            Generador gratuito
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Crea tu código QR
          </h1>

          <p className="text-neutral-500 mt-3">
            Pega cualquier enlace y genera un QR listo para descargar.
          </p>
        </div>

        <div className="space-y-4">
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
              placeholder="https://ejemplo.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleGenerateQR();
                }
              }}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 outline-none transition focus:border-neutral-900"
            />

            {error && (
              <p className="text-sm text-red-600 mt-2">
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleGenerateQR}
            className="w-full rounded-xl bg-neutral-900 text-white py-3 font-semibold transition hover:bg-neutral-700"
          >
            Generar QR
          </button>
        </div>

        {qrValue && (
          <div className="mt-8 border-t pt-8">
            <div className="flex flex-col items-center">
              <div
                ref={qrContainerRef}
                className="bg-white border rounded-2xl p-5"
              >
                <QRCodeCanvas
                  value={qrValue}
                  size={260}
                  level="H"
                  includeMargin
                />
              </div>

              <p className="text-sm text-neutral-500 mt-4 break-all text-center">
                {qrValue}
              </p>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="mt-5 w-full rounded-xl border border-neutral-900 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-100"
              >
                Descargar PNG
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}