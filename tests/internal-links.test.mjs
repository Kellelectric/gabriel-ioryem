import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const origin = "https://gabriel-ioryem.vercel.app";
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

const localFile = path => {
  const clean = decodeURIComponent(path).replace(/^\/+/, "");
  const normalized = clean === "" ? "index.html" : clean.endsWith("/") ? clean + "index.html" : clean;
  if (normalized.split("/").some(part => part === "..")) {
    throw new Error(`Internal URL escapes the site root: ${path}`);
  }
  return new URL(`../${normalized}`, import.meta.url);
};

for (const pagePath of pages) {
  test(`internal links resolve from ${pagePath}`, async () => {
    const html = await readFile(new URL(`../${pagePath}`, import.meta.url), "utf8");
    const basePath = pagePath.replace(/(^|\/)index\.html$/, "$1");
    const pageUrl = new URL(basePath, origin + "/");
    const hrefs = [...html.matchAll(/\bhref=["']([^"']+)["']/g)].map(match => match[1]);

    for (const href of hrefs) {
      if (!href || href === "#" || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
      const target = new URL(href, pageUrl);
      if (target.origin !== origin) continue;

      const targetUrl = localFile(target.pathname);
      let targetContent;
      try {
        targetContent = await readFile(targetUrl, "utf8");
      } catch {
        assert.fail(`Broken internal link in ${pagePath}: ${href} (expected ${target.pathname})`);
      }

      if (target.hash && /\.html?$|\/$/i.test(target.pathname)) {
        const id = decodeURIComponent(target.hash.slice(1));
        const idPattern = new RegExp(`\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`);
        assert.match(targetContent, idPattern, `Missing anchor #${id} linked from ${pagePath}`);
      }
    }
  });
}
