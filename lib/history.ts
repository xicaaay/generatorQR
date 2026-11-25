import type { QrFields, QrType } from "@/lib/payloads";

export interface HistoryEntry<T extends QrType = QrType> {
  id: string;
  type: T;
  fields: QrFields[T];
  label: string;
  fg: string;
  bg: string;
  createdAt: string;
}

const STORAGE_KEY = "qr-generator:history";
export const MAX_HISTORY = 10;
const EMPTY: HistoryEntry[] = [];

/** Nunca se guardan contraseñas WiFi en el navegador. */
export function sanitize(entry: HistoryEntry): HistoryEntry {
  if (entry.type !== "wifi") return entry;
  const fields = entry.fields as QrFields["wifi"];
  return { ...entry, fields: { ...fields, password: "" } };
}

/** Agrega al inicio, quita duplicados del mismo contenido y limita a MAX_HISTORY. */
export function mergeEntry(entries: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const clean = sanitize(entry);
  const key = JSON.stringify([clean.type, clean.fields]);
  return [
    clean,
    ...entries.filter((item) => JSON.stringify([item.type, item.fields]) !== key),
  ].slice(0, MAX_HISTORY);
}

// --- Store externo para useSyncExternalStore -------------------------------

let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function read(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]).slice(0, MAX_HISTORY) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(entries: HistoryEntry[]): void {
  cache = entries;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Almacenamiento no disponible (modo privado, bloqueado): el historial es opcional.
  }
  listeners.forEach((listener) => listener());
}

export const historyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): HistoryEntry[] {
    cache ??= read();
    return cache;
  },
  getServerSnapshot(): HistoryEntry[] {
    return EMPTY;
  },
  add(entry: HistoryEntry) {
    write(mergeEntry(historyStore.getSnapshot(), entry));
  },
  clear() {
    write(EMPTY);
  },
};
