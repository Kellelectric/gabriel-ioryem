import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = [
  "../index.html",
  "../projects/index.html",
  "../engineering-tools/index.html",
  "../projects/residential-electrical-installation/index.html",
  "../projects/hybrid-solar-battery-storage/index.html",
  "../projects/commercial-electrical-upgrade/index.html",
  "../projects/industrial-machinery-power/index.html",
  "../projects/cctv-access-control/index.html",
  "../projects/electrical-fault-power-quality/index.html",
  "../projects/smart-building-automation/index.html",
  "../projects/generator-automatic-transfer/index.html",
  "../projects/earthing-surge-protection/index.html",
  "../projects/ev-charging-infrastructure/index.html"
];

const contentOf = (html, attribute, key) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<meta\\s+${attribute}="${escaped}"\\s+content="([^"]*)"\\s*>`, "i"));
  return match?.[1] ?? null;
};

for (const pagePath of pages) {
  test(`social metadata is complete and canonical: ${pagePath}`, async () => {
    const html = await readFile(new URL(pagePath, import.meta.url), "utf8");
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description = contentOf(html, "name", "description");
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];

    assert.ok(title, "document title is present");
    assert.ok(description, "meta description is present");
    assert.ok(canonical, "canonical URL is present");
    assert.equal(contentOf(html, "property", "og:type"), "website");
    assert.equal(contentOf(html, "property", "og:url"), canonical);
    assert.ok(contentOf(html, "property", "og:title"), "Open Graph title is present");
    assert.ok(contentOf(html, "property", "og:description"), "Open Graph description is present");
    assert.equal(contentOf(html, "property", "og:site_name"), "Gabriel Ioryem");
    assert.equal(contentOf(html, "name", "twitter:card"), "summary");
    assert.ok(contentOf(html, "name", "twitter:title"), "Twitter title is present");
    assert.ok(contentOf(html, "name", "twitter:description"), "Twitter description is present");
  });
}
