"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import QrFieldsForm from "@/components/QrFields";
import { DEFAULT_BG, DEFAULT_FG, getColorWarning } from "@/lib/color";
import { historyStore, type HistoryEntry } from "@/lib/history";
import { QR_TYPES, buildPayload, isPristine, type QrFields, type QrType } from "@/lib/payloads";
import { hrefFor } from "@/lib/seo-pages";
import { PNG_SIZES, saveSession, session, type Logo, type PngSize } from "@/lib/session";

const PREVIEW_SIZE = 240;

/** El logo ocupa como máximo el 22 % del lado: con corrección H el QR sigue leyéndose. */
const LOGO_RATIO = 0.22;
const MAX_LOGO_BYTES = 1024 * 1024;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

const linkButton =
  "text-sm text-neutral-500 underline-offset-2 transition hover:text-neutral-900 hover:underline";

const colorInput =
  "size-7 cursor-pointer rounded-full border border-neutral-200 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0";

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
        resolve({ src, name: file.name, aspect: image.naturalWidth / image.naturalHeight || 1 });
      image.src = src;
    };
    reader.readAsDataURL(file);
  });
}

interface QrGeneratorProps {
  type: QrType;
  heading: string;
  intro: string;
}

export default function QrGenerator({ type, heading, intro }: QrGeneratorProps) {
  const router = useRouter();
  // Cada tipo es una página; el estado se recupera de la sesión al navegar.
  const [fields, setFields] = useState<QrFields>(() => session.fields);
  const [fg, setFg] = useState(() => session.fg);
  const [bg, setBg] = useState(() => session.bg);
  const [logo, setLogo] = useState<Logo | null>(() => session.logo);
  const [pngSize, setPngSize] = useState<PngSize>(() => session.pngSize);
  const [notice, setNotice] = useState("");
  // Los errores se muestran al salir del formulario, no mientras se escribe.
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    saveSession({ fields, fg, bg, logo, pngSize });
  }, [fields, fg, bg, logo, pngSize]);

  const history = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    historyStore.getServerSnapshot,
  );

  const exportCanvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const errorId = useId();
  const logoId = useId();

  const activeFields = fields[type];
  const payload = useMemo(() => buildPayload(type, activeFields), [type, activeFields]);
  const error = touched && !payload.ok && !isPristine(type, activeFields) ? payload.error : "";
  const colorWarning = getColorWarning(fg, bg);
  const customColors = fg !== DEFAULT_FG || bg !== DEFAULT_BG;

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
      setNotice("Este logo no se puede exportar a PNG en tu navegador. Usa SVG.");
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

    if (!LOGO_TYPES.includes(file.type) || file.size > MAX_LOGO_BYTES) {
      setNotice("El logo debe ser PNG, JPG, WebP o SVG de hasta 1 MB.");
      return;
    }

    try {
      setLogo(await readLogo(file));
      setNotice("");
    } catch {
      setNotice("No se pudo leer la imagen.");
    }
  };

  const restore = (entry: HistoryEntry) => {
    const nextFields = { ...fields, [entry.type]: entry.fields };
    setFields(nextFields);
    setFg(entry.fg);
    setBg(entry.bg);

    if (entry.type !== type) {
      saveSession({ fields: nextFields, fg: entry.fg, bg: entry.bg });
      router.push(hrefFor(entry.type), { scroll: false });
    } else if (entry.type === "wifi") {
      setNotice("Vuelve a escribir la contraseña: no se guarda.");
    }
  };

  return (
    <section className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">{heading}</h1>
        <p className="mt-2 text-neutral-500">{intro}</p>
      </header>

      <nav
        aria-label="Tipo de código QR"
        className="mb-8"
      >
        <ul className="-mx-1 flex flex-wrap gap-1">
          {QR_TYPES.map((item) => {
            const active = item.id === type;
            return (
              <li key={item.id} className="shrink-0">
                <Link
                  href={hrefFor(item.id)}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="space-y-8">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              setTouched(true);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setTouched(true);
            }}
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
              className="text-sm text-red-600 empty:hidden"
            >
              {error}
            </p>
          </form>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-neutral-100 pt-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="color"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                className={colorInput}
              />
              Color
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
              <input
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className={colorInput}
              />
              Fondo
            </label>

            <input
              id={logoId}
              type="file"
              accept={LOGO_TYPES.join(",")}
              onChange={handleLogoChange}
              className="sr-only"
            />
            {logo ? (
              <span className="flex items-center gap-2 text-sm text-neutral-700">
                <span className="max-w-32 truncate">{logo.name}</span>
                <button type="button" onClick={() => setLogo(null)} className={linkButton}>
                  Quitar
                </button>
              </span>
            ) : (
              <label
                htmlFor={logoId}
                className="cursor-pointer text-sm text-neutral-700 underline-offset-2 hover:underline has-focus-visible:underline"
              >
                + Logo
              </label>
            )}

            {customColors && (
              <button
                type="button"
                onClick={() => {
                  setFg(DEFAULT_FG);
                  setBg(DEFAULT_BG);
                }}
                className={`${linkButton} ml-auto`}
              >
                Restablecer
              </button>
            )}
          </div>

          {(colorWarning || notice) && (
            <p className="text-sm text-amber-700" role="status">
              {notice ||
                (colorWarning === "inverted"
                  ? "Usa un color más oscuro que el fondo: muchas cámaras no leen QR invertidos."
                  : "Poco contraste: puede que el QR no se lea bien.")}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 md:w-[264px]">
          <div
            ref={svgRef}
            className="rounded-2xl p-3 ring-1 ring-neutral-200"
            style={{ backgroundColor: bg }}
          >
            {payload.ok ? (
              <QRCodeSVG
                value={payload.value}
                size={PREVIEW_SIZE}
                level="H"
                marginSize={2}
                fgColor={fg}
                bgColor={bg}
                imageSettings={logoSettings(logo, PREVIEW_SIZE)}
                title={`Código QR: ${payload.label}`}
              />
            ) : (
              <div
                className="grid place-items-center rounded-xl bg-neutral-50 text-sm text-neutral-400"
                style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
              >
                Tu QR aparecerá aquí
              </div>
            )}
          </div>

          {payload.ok && (
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
          )}

          <div className="grid w-full grid-cols-[1fr_1fr_auto] gap-2">
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={!payload.ok}
              className="rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              PNG
            </button>
            <button
              type="button"
              onClick={handleDownloadSVG}
              disabled={!payload.ok}
              className="rounded-xl py-2.5 text-sm font-semibold text-neutral-900 ring-1 ring-neutral-300 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              SVG
            </button>
            <select
              aria-label="Resolución del PNG"
              value={pngSize}
              onChange={(e) => setPngSize(Number(e.target.value) as PngSize)}
              className="rounded-xl bg-white px-2 text-sm text-neutral-600 ring-1 ring-neutral-300"
            >
              {PNG_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <details className="group mt-10 border-t border-neutral-100 pt-6">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-neutral-700">
            Recientes ({history.length})
            <span className="text-neutral-400 transition group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <ul className="mt-4 space-y-1">
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => restore(entry)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-neutral-50"
                >
                  <span className="w-16 shrink-0 text-neutral-400">
                    {QR_TYPES.find((t) => t.id === entry.type)?.label}
                  </span>
                  <span className="truncate text-neutral-800">{entry.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={historyStore.clear} className={`${linkButton} mt-3 px-2`}>
            Borrar historial
          </button>
        </details>
      )}
    </section>
  );
}
