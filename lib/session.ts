import { DEFAULT_BG, DEFAULT_FG } from "@/lib/color";
import { EMPTY_FIELDS, type QrFields } from "@/lib/payloads";

export interface Logo {
  src: string;
  name: string;
  /** ancho / alto */
  aspect: number;
}

export const PNG_SIZES = [512, 1024, 2048] as const;
export type PngSize = (typeof PNG_SIZES)[number];

export interface SessionState {
  fields: QrFields;
  fg: string;
  bg: string;
  logo: Logo | null;
  pngSize: PngSize;
}

/**
 * Estado en memoria que sobrevive a la navegación entre tipos de QR (cada tipo
 * es una página). No se persiste: al recargar se empieza de cero.
 */
export const session: SessionState = {
  fields: EMPTY_FIELDS,
  fg: DEFAULT_FG,
  bg: DEFAULT_BG,
  logo: null,
  pngSize: 1024,
};

export function saveSession(next: Partial<SessionState>) {
  Object.assign(session, next);
}
