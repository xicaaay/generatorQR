"use client";

import { useId, useMemo, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import QrFieldsForm from "@/components/QrFields";
import { DEFAULT_BG, DEFAULT_FG, getColorWarning } from "@/lib/color";
import { historyStore, type HistoryEntry } from "@/lib/history";
import {
  EMPTY_FIELDS,
  QR_TYPES,
  buildPayload,
  isPristine,
  type QrFields,
  type QrType,
} from "@/lib/payloads";

const PREVIEW_SIZE = 260;
const PNG_SIZES = [512, 1024, 2048] as const;
type PngSize = (typeof PNG_SIZES)[number];

/** El logo ocupa como máximo el 22 % del lado: con corrección H el QR sigue leyéndose. */
const LOGO_RATIO = 0.22;
const MAX_LOGO_BYTES = 1024 * 1024;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

interface Logo {
  src: string;
  name: string;
  /** ancho / alto */
  aspect: number;
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function logoSettings(logo: Logo | null, size: number) {
  if (!logo) return undefined;

  const box = Math.round(size * LOGO_RATIO);
  const width = logo.aspect >= 1 ? box : Math.round(box * logo.aspect);
  const height = logo.aspect >= 1 ? Math.round(box / logo.aspect) : box;

  return { src: logo.src, width, height, excavate: true };
}

function readLogo(file: File): Promise<Logo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const src = String(reader.result);
      const image = new Image();
      image.onerror = () => reject(new Error("decode"));
      image.onload = () =>
        resolve({
          src,
          name: file.name,
          aspect: image.naturalWidth / image.naturalHeight || 1,
        });
      image.src = src;
    };
    reader.readAsDataURL(file);
  });
}

interface QrGeneratorProps {
  initialType?: QrType;
  heading?: string;
  intro?: string;
}

export default function QrGenerator({
  initialType = "url",
  heading = "Crea tu código QR",
  intro = "Enlaces, WhatsApp, WiFi, email, texto o contacto. Personaliza colores y logo, y descárgalo en PNG HD o SVG.",
}: QrGeneratorProps) {
  const [type, setType] = useState<QrType>(initialType);
  const [fields, setFields] = useState<QrFields>(EMPTY_FIELDS);
  const [fg, setFg] = useState(DEFAULT_FG);
  const [bg, setBg] = useState(DEFAULT_BG);
  const [logo, setLogo] = useState<Logo | null>(null);
  const [pngSize, setPngSize] = useState<PngSize>(1024);
  const [notice, setNotice] = useState("");

  const exportCanvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const panelId = useId();

  // localStorage solo existe en el navegador; en el servidor el historial está vacío.
  const history = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    historyStore.getServerSnapshot,
  );

  const activeFields = fields[type];
  const payload = useMemo(() => buildPayload(type, activeFields), [type, activeFields]);
  const pristine = isPristine(type, activeFields);
  const error = !payload.ok && !pristine ? payload.error : "";
  const colorWarning = getColorWarning(fg, bg);

  const updateFields = <T extends QrType>(next: QrFields[T]) => {
    setFields((current) => ({ ...current, [type]: next }));
    setNotice("");
  };

  const saveToHistory = () => {
    if (!payload.ok) return;
    historyStore.add({
      id: crypto.randomUUID(),
      type,
      fields: activeFields,
      label: payload.label,
      fg,
      bg,
      createdAt: new Date().toISOString(),
    });
  };

  const handleDownloadPNG = () => {
    if (!payload.ok) return;
    const canvas = exportCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    try {
      triggerDownload(canvas.toDataURL("image/png"), `${payload.filename}.png`);
      saveToHistory();
    } catch {
      setNotice("Tu navegador no permite exportar este logo a PNG. Descarga en SVG o usa un logo PNG.");
    }
  };

  const handleDownloadSVG = () => {
    if (!payload.ok) return;
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;

    const markup = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${markup}`], {
      type: "image/svg+xml;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, `${payload.filename}.svg`);
    URL.revokeObjectURL(objectUrl);
    saveToHistory();
  };

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!LOGO_TYPES.includes(file.type)) {
      setNotice("El logo debe ser PNG, JPG, WebP o SVG.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setNotice("El logo debe pesar menos de 1 MB.");
      return;
    }

    try {
      setLogo(await readLogo(file));
      setNotice("");
    } catch {
      setNotice("No se pudo leer la imagen del logo.");
    }
  };

  const restore = (entry: HistoryEntry) => {
    setType(entry.type);
    setFields((current) => ({ ...current, [entry.type]: entry.fields }));
    setFg(entry.fg);
    setBg(entry.bg);
    setNotice(entry.type === "wifi" ? "Por seguridad, vuelve a escribir la contraseña WiFi." : "");
  };

  return (
    <section className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-6 md:p-8">
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-neutral-500 mb-2">Generador gratuito</p>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">{heading}</h1>
        <p className="text-neutral-500 mt-3">{intro}</p>
      </div>

      <div
        role="tablist"
        aria-label="Tipo de código QR"
        className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        {QR_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={type === item.id}
            aria-controls={panelId}
            onClick={() => {
              setType(item.id);
              setNotice("");
            }}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              type === item.id
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <form
            id={panelId}
            role="tabpanel"
            noValidate
            onSubmit={(event) => event.preventDefault()}
            className="space-y-2"
          >
            <QrFieldsForm
              type={type}
              fields={activeFields}
              invalid={Boolean(error)}
              errorId={errorId}
              onChange={updateFields}
            />
            <p
              id={errorId}
              role="alert"
              aria-live="polite"
              className="text-sm text-red-600 min-h-5 empty:hidden"
            >
              {error}
            </p>
          </form>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-neutral-900 mb-3">Estilo</legend>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
                <input
                  type="color"
                  value={fg}
                  onChange={(e) => setFg(e.target.value)}
                  className="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span>
                  Color QR
                  <span className="block font-mono text-xs text-neutral-500">{fg}</span>
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span>
                  Fondo
                  <span className="block font-mono text-xs text-neutral-500">{bg}</span>
                </span>
              </label>
            </div>

            {colorWarning && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
                {colorWarning === "inverted"
                  ? "El QR es más claro que el fondo: muchas cámaras no lo leerán. Usa un color oscuro sobre fondo claro."
                  : "Poco contraste entre el QR y el fondo: puede que no se lea bien."}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept={LOGO_TYPES.join(",")}
                onChange={handleLogoChange}
                className="sr-only"
                id={`${panelId}-logo`}
              />
              <label
                htmlFor={`${panelId}-logo`}
                className="cursor-pointer rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-500 has-focus-visible:ring-2"
              >
                {logo ? "Cambiar logo" : "Agregar logo"}
              </label>
              {logo && (
                <>
                  <span className="max-w-40 truncate text-sm text-neutral-500">{logo.name}</span>
                  <button
                    type="button"
                    onClick={() => setLogo(null)}
                    className="text-sm font-medium text-neutral-700 underline underline-offset-2"
                  >
                    Quitar
                  </button>
                </>
              )}
              {(fg !== DEFAULT_FG || bg !== DEFAULT_BG) && (
                <button
                  type="button"
                  onClick={() => {
                    setFg(DEFAULT_FG);
                    setBg(DEFAULT_BG);
                  }}
                  className="ml-auto text-sm font-medium text-neutral-700 underline underline-offset-2"
                >
                  Restablecer colores
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              PNG, JPG, WebP o SVG de hasta 1 MB. Se mantiene en tu navegador.
            </p>
          </fieldset>

          {notice && (
            <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700" role="status">
              {notice}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div
            ref={svgRef}
            className="rounded-2xl border border-neutral-200 p-3"
            style={{ backgroundColor: bg }}
          >
            {payload.ok ? (
              <QRCodeSVG
                value={payload.value}
                size={PREVIEW_SIZE}
                level="H"
                marginSize={4}
                fgColor={fg}
                bgColor={bg}
                imageSettings={logoSettings(logo, PREVIEW_SIZE)}
                title={`Código QR: ${payload.label}`}
              />
            ) : (
              <div
                className="grid place-items-center rounded-xl border-2 border-dashed border-neutral-200 bg-white p-6 text-center text-sm text-neutral-400"
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
              >
                Completa los datos para ver tu QR
              </div>
            )}
          </div>

          {payload.ok && (
            <>
              {/* Canvas oculto en alta resolución, solo para exportar PNG */}
              <div ref={exportCanvasRef} className="hidden" aria-hidden="true">
                <QRCodeCanvas
                  value={payload.value}
                  size={pngSize}
                  level="H"
                  marginSize={4}
                  fgColor={fg}
                  bgColor={bg}
                  imageSettings={logoSettings(logo, pngSize)}
                />
              </div>

              <p className="mt-3 w-full break-all text-center text-sm text-neutral-500">
                {payload.label}
              </p>
            </>
          )}

          <fieldset className="mt-5 w-full" disabled={!payload.ok}>
            <legend className="block text-sm font-medium text-neutral-700 mb-2">
              Resolución del PNG
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {PNG_SIZES.map((size) => (
                <label
                  key={size}
                  className="cursor-pointer rounded-xl border border-neutral-300 py-2 text-center text-sm font-medium text-neutral-700 transition has-checked:border-neutral-900 has-checked:bg-neutral-900 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-neutral-400 has-disabled:cursor-not-allowed has-disabled:opacity-50"
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

          <div className="mt-3 grid w-full grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={!payload.ok}
              className="rounded-xl bg-neutral-900 py-3 font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              PNG
            </button>
            <button
              type="button"
              onClick={handleDownloadSVG}
              disabled={!payload.ok}
              className="rounded-xl border border-neutral-900 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              SVG
            </button>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-8 border-t border-neutral-200 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Recientes</h2>
            <button
              type="button"
              onClick={historyStore.clear}
              className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
            >
              Borrar historial
            </button>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => restore(entry)}
                  className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2 text-left transition hover:border-neutral-400"
                >
                  <span
                    aria-hidden="true"
                    className="size-6 shrink-0 rounded-md border border-neutral-200"
                    style={{ background: `linear-gradient(135deg, ${entry.fg} 50%, ${entry.bg} 50%)` }}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-neutral-500">
                      {QR_TYPES.find((t) => t.id === entry.type)?.label}
                    </span>
                    <span className="block truncate text-sm text-neutral-900">{entry.label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-neutral-500">
            Se guarda solo en este navegador. Las contraseñas WiFi nunca se guardan.
          </p>
        </div>
      )}
    </section>
  );
}
