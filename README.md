# Gabriel Ioryem: Personal Executive Website

Personal digital identity for **Gabriel Ioryem**, Electrical Engineer, Entrepreneur, and Founder & CEO of Kell Electricals Ltd (Abuja, Nigeria).

This is **not** the company website. The corporate site is [kellelectricals.com](https://kellelectricals.com).

## Design system

See `DESIGN.md` for the full visual system (colours, typography, spacing, rationale).

**Core tokens**
- Forest `#13322C`
- Ivory `#F7F4EF`
- Gold `#C4A574`
- Typography: Cormorant Garamond (display) + Inter (UI/body)

## Features

- Editorial single-page layout (Hero → Profile → Expertise → Approach → Guiding principle → Project references → Technical studies → Tools → Contact)
- Signature details: animated AC-waveform statement band, process timeline, pointer-tracked card glow, oversized footer wordmark
- Professional studio portrait
- Multi-step low-friction contact flow (one question at a time)
- Advanced but restrained motion
- Accessibility: skip link, ARIA, focus styles, reduced-motion
- SEO: meta tags, Open Graph share card (`assets/share/`), Person structured data, Apple touch icon
- Performance budgets for CSS and JS are measured gzipped (see `tests/homepage-performance.test.mjs`), so stylesheets stay readable rather than hand-minified
- Responsive

## Local preview

Serve the folder with any static server (for example `python3 -m http.server`) and open http://localhost:8000. The homepage portrait is embedded in `index.html`; share images live in `assets/share/`.

## Contact: project brief

The homepage contact section is a six-step project brief. When it is complete, the visitor sends it
themselves on WhatsApp (Kell Electricals, +234 814 020 5895, set as `WHATSAPP` in `assets/portfolio.js`)
or by email (gabrielioryem@kellelectricals.com). The site has no backend and transmits nothing.

## Fonts

Fonts are self-hosted in `assets/fonts/` (Latin subsets of Cormorant Garamond and Inter, SIL Open
Font License) and declared in `assets/fonts.css`. No requests go to Google Fonts.

## Stylesheets

- `assets/executive.css`: homepage
- `assets/site.css`: shared header, footer, tokens and buttons for every other page
- `assets/study.css`, `assets/directory.css`, `assets/tools.css`, `assets/notfound.css`, `assets/cv.css`: page types

## Tests

```bash
node --test tests/*.test.mjs
```

## Deploy

Static site. Deploy the folder to Vercel, Netlify, or any static host.

```bash
vercel --prod
```

## License

All content © Gabriel Ioryem / Kell Electricals Ltd. All rights reserved.
