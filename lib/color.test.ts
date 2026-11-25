import { describe, expect, it } from "vitest";
import { contrastRatio, getColorWarning } from "@/lib/color";

describe("contrastRatio", () => {
  it("negro sobre blanco es 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("es simétrico", () => {
    expect(contrastRatio("#1d4ed8", "#ffffff")).toBeCloseTo(contrastRatio("#ffffff", "#1d4ed8"), 10);
  });
});

describe("getColorWarning", () => {
  it("sin advertencia para oscuro sobre claro", () => {
    expect(getColorWarning("#000000", "#ffffff")).toBeNull();
    expect(getColorWarning("#1e3a8a", "#fef3c7")).toBeNull();
  });

  it("advierte si el QR es más claro que el fondo", () => {
    expect(getColorWarning("#ffffff", "#000000")).toBe("inverted");
  });

  it("advierte si hay poco contraste", () => {
    expect(getColorWarning("#999999", "#ffffff")).toBe("low-contrast");
  });
});
