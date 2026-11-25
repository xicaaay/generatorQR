import { describe, expect, it } from "vitest";
import { EMPTY_FIELDS } from "@/lib/payloads";
import { MAX_HISTORY, mergeEntry, type HistoryEntry } from "@/lib/history";

const entry = (overrides: Partial<HistoryEntry> = {}): HistoryEntry => ({
  id: crypto.randomUUID(),
  type: "url",
  fields: { url: "ejemplo.com" },
  label: "https://ejemplo.com/",
  fg: "#000000",
  bg: "#ffffff",
  createdAt: "2026-11-24T10:00:00Z",
  ...overrides,
});

describe("mergeEntry", () => {
  it("nunca guarda la contraseña WiFi", () => {
    const [saved] = mergeEntry([], entry({
      type: "wifi",
      fields: { ...EMPTY_FIELDS.wifi, ssid: "Casa", password: "secreta123" },
    }));
    expect((saved!.fields as typeof EMPTY_FIELDS.wifi).password).toBe("");
  });

  it("pone lo más reciente primero y quita duplicados", () => {
    const a = entry({ fields: { url: "a.com" } });
    const b = entry({ fields: { url: "b.com" } });
    const result = mergeEntry([b, a], entry({ fields: { url: "a.com" } }));
    expect(result.map((e) => (e.fields as { url: string }).url)).toEqual(["a.com", "b.com"]);
  });

  it(`limita a ${MAX_HISTORY} entradas`, () => {
    let list: HistoryEntry[] = [];
    for (let i = 0; i < 15; i += 1) list = mergeEntry(list, entry({ fields: { url: `${i}.com` } }));
    expect(list).toHaveLength(MAX_HISTORY);
    expect((list[0]!.fields as { url: string }).url).toBe("14.com");
  });
});
