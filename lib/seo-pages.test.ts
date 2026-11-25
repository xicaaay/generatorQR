import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { QR_TYPES } from "@/lib/payloads";
import { ALL_PAGES, SEO_PAGES } from "@/lib/seo-pages";

describe("páginas SEO", () => {
  it("cada tipo de QR tiene exactamente una página", () => {
    const types = ALL_PAGES.map((page) => page.type).sort();
    expect(types).toEqual(QR_TYPES.map((type) => type.id).sort());
  });

  it("los slugs son únicos y en formato URL", () => {
    const slugs = SEO_PAGES.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("títulos y descripciones tienen un largo adecuado para buscadores", () => {
    for (const page of ALL_PAGES) {
      expect(page.title.length, page.title).toBeLessThanOrEqual(70);
      expect(page.description.length, page.description).toBeGreaterThanOrEqual(70);
      expect(page.faqs.length, page.slug).toBeGreaterThan(0);
      expect(page.description.length, page.description).toBeLessThanOrEqual(170);
    }
  });

  it("el service worker precarga todas las páginas", () => {
    const sw = readFileSync(join(process.cwd(), "public/sw.js"), "utf8");
    const match = /const PAGES = (\[[^\]]*\]);/.exec(sw);
    expect(match).not.toBeNull();
    const precached = JSON.parse(match![1]!) as string[];
    expect(precached.sort()).toEqual(
      ALL_PAGES.map((page) => (page.slug ? `/${page.slug}` : "/")).sort(),
    );
  });
});
