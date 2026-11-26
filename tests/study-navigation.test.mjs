import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Order in which the studies are listed on /projects/.
const order = [
  "residential-electrical-installation", "hybrid-solar-battery-storage", "commercial-electrical-upgrade",
  "industrial-machinery-power", "cctv-access-control", "electrical-fault-power-quality",
  "smart-building-automation", "generator-automatic-transfer", "earthing-surge-protection", "ev-charging-infrastructure"
];
const home = await readFile(new URL("../index.html", import.meta.url), "utf8");
const parts = new Set([...home.matchAll(/class="lead-option" data-value="[^"]+" data-part="([^"]+)"/g)].map(match => match[1]));
const directory = await readFile(new URL("../projects/index.html", import.meta.url), "utf8");

test("directory lists the studies in the order the previous and next links follow", () => {
  const listed = [...directory.matchAll(/<a class="project-card"[^>]*href="\/projects\/([a-z-]+)\/"/g)].map(match => match[1]);
  assert.deepEqual(listed, order);
});

for (const [index, slug] of order.entries()) {
  test("study navigation and brief link: " + slug, async () => {
    const html = await readFile(new URL("../projects/" + slug + "/index.html", import.meta.url), "utf8");
    const pager = html.match(/<nav class="study-pager" aria-label="More engineering studies">([\s\S]*?)<\/nav>/);
    assert.ok(pager, "pager is present");
    const previous = pager[1].match(/class="pager-prev"(?: rel="prev")? href="([^"]+)"/)[1];
    const next = pager[1].match(/class="pager-next"(?: rel="next")? href="([^"]+)"/)[1];
    assert.equal(previous, index === 0 ? "/projects/" : "/projects/" + order[index - 1] + "/");
    assert.equal(next, index === order.length - 1 ? "/projects/" : "/projects/" + order[index + 1] + "/");
    const brief = html.match(/<a class="cta-ghost" href="\/\?system=([a-z]+)#contact">Start a brief about this<\/a>/);
    assert.ok(brief, "study offers a brief with the matching system pre-selected");
    assert.ok(parts.has(brief[1]), brief[1] + " is a system the homepage brief understands");
    assert.ok(html.indexOf('class="cta-ghost"') < html.indexOf("</main>"), "link sits inside the page content");
  });
}

test("homepage reads the system from the link and presses the matching brief option", async () => {
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");
  assert.match(js, /new URLSearchParams\(window\.location\.search\)\.get\("system"\)/);
  assert.match(js, /CSS\.escape\(preset\)/, "the value is escaped before it is used in a selector");
});
