export const DEFAULT_FG = "#000000";
export const DEFAULT_BG = "#ffffff";

const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX_PATTERN.test(value);
}

/** Luminancia relativa WCAG 2.x de un color #rrggbb. */
export function relativeLuminance(hex: string): number {
  const match = HEX_PATTERN.exec(hex);
  if (!match) throw new Error(`Invalid color: ${hex}`);

  const int = parseInt(match[1]!, 16);
  const channels = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

export type ColorWarning = "low-contrast" | "inverted" | null;

/**
 * Los lectores de QR necesitan buen contraste y, en su mayoría, módulos oscuros
 * sobre fondo claro. 4:1 es un umbral práctico y conservador.
 */
export function getColorWarning(fg: string, bg: string): ColorWarning {
  if (!isHexColor(fg) || !isHexColor(bg)) return null;
  if (relativeLuminance(fg) > relativeLuminance(bg)) return "inverted";
  if (contrastRatio(fg, bg) < 4) return "low-contrast";
  return null;
}
