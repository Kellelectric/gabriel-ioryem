import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const pages = [
  "index.html",
  "cv/index.html",
  "projects/index.html",
  "engineering-tools/index.html",
  "projects/residential-electrical-installation/index.html",
  "projects/hybrid-solar-battery-storage/index.html",
  "projects/commercial-electrical-upgrade/index.html",
  "projects/industrial-machinery-power/index.html",
  "projects/cctv-access-control/index.html",
  "projects/electrical-fault-power-quality/index.html",
  "projects/smart-building-automation/index.html",
  "projects/generator-automatic-transfer/index.html",
  "projects/earthing-surge-protection/index.html",
  "projects/ev-charging-infrastructure/index.html"
];

const attribute = (source, name) => source.match(new RegExp("\\b" + name + "=[\"']([^\"']+)[\"']", "i"))?.[1];
const textOf = source => source.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

for (const pagePath of pages) {
  test(`form controls have accessible names: ${pagePath}`, async () => {
    const html = await readFile(new URL(`../${pagePath}`, import.meta.url), "utf8");
    const ids = new Set([...html.matchAll(/<[a-z][^>]*\bid=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]));
    const labels = [...html.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/gi)].map(match => ({
      forId: attribute(match[1], "for"),
      body: match[2],
      text: textOf(match[2])
    }));
    const controls = [...html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)];

    for (const control of controls) {
      const tag = control[1].toLowerCase();
      const attrs = control[2];
      if (tag === "input" && attribute(attrs, "type")?.toLowerCase() === "hidden") continue;

      const id = attribute(attrs, "id");
      const ariaLabel = attribute(attrs, "aria-label");
      const labelledBy = attribute(attrs, "aria-labelledby");
      const explicitLabel = labels.some(label => id && label.forId === id && label.text.length > 0);
      const wrappedLabel = labels.some(label => id && label.body.includes(`id="${id}"`) && label.text.length > 0);
      const labelledByExists = labelledBy && labelledBy.split(/\s+/).every(labelId => ids.has(labelId));

      assert.ok(
        Boolean(ariaLabel || labelledByExists || explicitLabel || wrappedLabel),
        `Unlabelled ${tag} control in ${pagePath}: ${attrs}`
      );
    }
  });
}
