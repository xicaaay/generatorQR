import { describe, expect, it } from "vitest";
import { normalizeUrl } from "@/lib/url";

describe("normalizeUrl", () => {
  it.each([
    ["ejemplo.com", "https://ejemplo.com/"],
    ["  www.x.org ", "https://www.x.org/"],
    ["https://google.com/a?b=1", "https://google.com/a?b=1"],
    ["ejemplo.com:8080/x", "https://ejemplo.com:8080/x"],
    ["localhost:3000", "https://localhost:3000/"],
    ["WWW.Site.COM/Path", "https://www.site.com/Path"],
  ])("acepta %s", (input, expected) => {
    expect(normalizeUrl(input)).toEqual({ ok: true, url: expected });
  });

  it.each(["", "foo", "http://", "javascript:alert(1)", "JavaScript:x", "data:text/html,x", "ftp://x.com", "mailto:a@b.com", "hola:mundo"])(
    "rechaza %j",
    (input) => {
      expect(normalizeUrl(input).ok).toBe(false);
    },
  );
});
