import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("homepage navigation exposes working desktop, mobile and sliding section links", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");
  for (const id of ["about", "expertise", "approach", "references", "studies", "tools", "contact"]) {
    assert.match(html, new RegExp('id="' + id + '"'), "section exists: " + id);
    assert.ok(html.includes('href="#' + id + '"'), "section has a navigation link: " + id);
  }
  assert.match(html, /id="menu-toggle"[^>]*aria-controls="mobile-navigation"/);
  assert.match(html, /id="mobile-navigation"/);
  assert.match(html, /data-scroll="prev"/);
  assert.match(html, /data-scroll="next"/);
  assert.match(js, /event\.key === "Escape"/, "mobile menu closes on Escape");
  assert.match(js, /scrollBy\(/, "Explore strip arrows scroll the navigation");
});

test("contact flow prepares an email draft without claiming a message was sent", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const js = await readFile(new URL("../assets/portfolio.js", import.meta.url), "utf8");
  assert.match(html, /id="lead-mailto"/);
  assert.match(html, /This website does not transmit your enquiry/);
  assert.match(js, /encodeURIComponent\(subject\)/);
  assert.match(js, /encodeURIComponent\(body\)/);
  assert.doesNotMatch(js, /FORMSPREE\s*=\s*null/);
  assert.doesNotMatch(js, /Your message has been received/);
});
