import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = [
  { path: "../index.html", types: ["Person"] },
  { path: "../cv/index.html", types: ["ProfilePage", "Person"] },
  { path: "../engineering-tools/index.html", types: ["WebPage"] },
  { path: "../projects/index.html", types: ["CollectionPage"] },
  { path: "../projects/residential-electrical-installation/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/hybrid-solar-battery-storage/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/commercial-electrical-upgrade/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/industrial-machinery-power/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/cctv-access-control/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/electrical-fault-power-quality/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/smart-building-automation/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/generator-automatic-transfer/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/earthing-surge-protection/index.html", types: ["WebPage", "BreadcrumbList"] },
  { path: "../projects/ev-charging-infrastructure/index.html", types: ["WebPage", "BreadcrumbList"] }
];

const collectTypes = (value, result = []) => {
  if (Array.isArray(value)) {
    value.forEach(item => collectTypes(item, result));
  } else if (value && typeof value === "object") {
    const type = value["@type"];
    if (typeof type === "string") result.push(type);
    if (Array.isArray(type)) result.push(...type);
    Object.values(value).forEach(item => collectTypes(item, result));
  }
  return result;
};

for (const page of pages) {
  test(`structured data is valid for ${page.path}`, async () => {
    const html = await readFile(new URL(page.path, import.meta.url), "utf8");
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    assert.ok(canonical, "canonical URL is present");
    assert.ok(blocks.length > 0, "JSON-LD block is present");

    const parsed = blocks.map(match => JSON.parse(match[1]));
    const types = parsed.flatMap(value => collectTypes(value));
    const serialized = JSON.stringify(parsed);

    for (const expectedType of page.types) {
      assert.ok(types.includes(expectedType), `expected schema type ${expectedType}`);
    }
    assert.ok(serialized.includes(canonical), "structured data references the canonical page URL");
  });
}
