# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

RENUVOL marketing website (product of LA BEAUTEX). The homepage is
implemented: 12 sections, Russian-language, art-directed as one continuous
artwork — nine colour chapters, a fixed atmosphere layer and a CSS material
system (see `docs/art-direction.md`). The film is an optional modal behind a
CTA, not the hero; the page is complete without it.

## Language

**The public site is Russian.** English is allowed only as a restrained
editorial accent (`MADE IN SOUTH KOREA`, `ONE PRODUCT. MULTIPLE PROTOCOLS.`,
`READY TO DISCOVER RENUVOL?`). Do not add a parallel English copy track.
Navigation, buttons, forms, tooltips, error messages and accessibility labels
are all Russian.

## Stack

- Vite + vanilla HTML/CSS/JavaScript. No frontend framework.
- No CSS preprocessor or utility framework unless a future decision adds one.
- No animation library: the scroll engine is hand-rolled in `src/js/`.
- Classes are namespaced `rv-`, custom properties `--rv-*`, hooks
  `data-rv-*`, and JS exposes only `window.RENUVOL` — this keeps the build
  portable into Tilda (`docs/tilda-integration.md`).
- Sections live as standalone fragments in `src/sections/` and are composed
  into `src/index.html` by a small zero-dependency Vite plugin.

## Gotchas that have already bitten

- **Never set `overflow` on `html`.** It propagates to the viewport and
  silently breaks every `position: sticky` pinned section.
- A hover preview must not share a class with a click toggle, or hovering
  inverts the button's state.
- `preload="none"` prevents a video from ever decoding. The film modal sets
  `preload` before assigning the source for exactly this reason.
- **Two things must not share a class name across layers.** `.rv-field` was
  both a decorative absolute-positioned mass and the contact form's field
  wrapper; every form label stacked on top of the next. The decorative one is
  now `.rv-wash`.
- **Never clip a scene or a pinned stage vertically.** `overflow: hidden`
  there cuts the section's own colour at its boundary and draws a hard seam
  between every section. Clip on the horizontal axis only (`overflow-x:
  clip`) and contain vertically with a `mask-image` fade.
- A cue at `opacity: 0` still receives clicks. `scroll.js` toggles
  `pointer-events` so a faded cue cannot swallow the control underneath it.

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview production build
```

## Structure

- `public/` — static assets copied as-is at build time (video, images, documents, reference material).
- `content/` — source copy and factual content in markdown. Do not invent product facts, claims,
  or figures here; leave placeholders until real content is supplied.
- `src/` — application source: `index.html` entry point, `styles/`, `js/`, and `sections/`
  (individual page-section HTML fragments, numbered in page order).
- `references/` — external design/UX reference material, not part of the shipped site.
- `docs/` — planning and specification documents for this project.

## External expert libraries

Before any design or frontend implementation work, inspect:

- /references/design-dna
- /references/anthropics-skills
- /references/taste-skill
- /references/scroll-craft

Read relevant README.md and SKILL.md files before applying their methodology.

Use:

- design-dna for reference analysis and design-language extraction
- anthropics-skills as the full Anthropic skills library; select relevant skills based on the task
- taste-skill for premium frontend critique and anti-generic design decisions
- scroll-craft for scroll choreography, motion, video scrubbing and cinematic storytelling

These repositories are guidance libraries.
Do not modify their contents.
Do not blindly combine all techniques.
Select only what materially improves the RENUVOL website.

## Rules

- Do not fabricate product claims, certifications, statistics, or testimonials. Content files under
  `content/` and `docs/` should stay as placeholders until real information is provided.
- Keep the dependency footprint minimal — avoid adding packages unless there is a clear need.
