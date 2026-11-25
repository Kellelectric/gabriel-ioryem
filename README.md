# Gabriel Ioryem — Personal Executive Website

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
- SEO: meta tags, Open Graph, Person structured data
- Responsive

## Local preview

Open `index.html` in a modern browser. Place portrait at `images/gabriel-ioryem.jpg`.

## Contact form backend (Formspree)

1. Create a form at https://formspree.io
2. Point it to your preferred email (e.g. info@kellelectricals.com)
3. Copy the endpoint `https://formspree.io/f/xxxxxxxx`
4. In `index.html` set `const FORMSPREE = 'https://formspree.io/f/xxxxxxxx';`

## Deploy

Static site. Deploy the folder to Vercel, Netlify, or any static host.

```bash
vercel --prod
```

## License

All content © Gabriel Ioryem / Kell Electricals Ltd. All rights reserved.
