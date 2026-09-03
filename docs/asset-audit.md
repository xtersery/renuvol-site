# Asset Audit

Status: planning document. Inventories every asset and content slot the
project structure expects (per `CLAUDE.md` and `src/sections/`) against what
currently exists in `public/` and `content/`. No design or implementation has
started — this only records gaps, all marked `[CONTENT REQUIRED]`.

## Method

Compared the directory structure under `public/` and `content/` against the
13 numbered sections in `src/sections/` (which imply what each part of the
page will eventually need) and against what the task brief for this audit
explicitly calls out (three wireframes). Every directory below currently
contains nothing but a `.gitkeep` placeholder unless noted otherwise.

## Wireframes — `[CONTENT REQUIRED]`

`public/references/wireframe/` contains only `.gitkeep`. **No wireframes are
present.** Three wireframes were expected per this audit's brief; zero exist.
Until they're supplied:

- `references/design-dna`'s Analyze phase (extracting a Design DNA JSON from
  visual references) cannot run — see `docs/skills-analysis.md`.
- `docs/design-system.md` and `docs/implementation-plan.md`'s section-by-section
  layout decisions cannot be made; there is no reference layout to build from.

## Inspiration / mood references — `[CONTENT REQUIRED]`

`public/references/inspiration/` contains only `.gitkeep`. No mood boards,
competitor screenshots, or style references have been supplied. Needed
alongside the wireframes for the design-DNA extraction and for
`taste-skill`'s brief-inference step ("vibe words", reference signals).

## Video — `[CONTENT REQUIRED]`

`public/video/` contains only `.gitkeep`. No video assets exist. At minimum,
the following sections imply video need, based on their names and the
`video-scrub.js` module already scaffolded in `src/js/`:

| Section | Likely video need |
|---|---|
| `02-hero.html` | Hero scrub or background footage (per scroll-craft's `scrub` device) |
| `05-transformation.html` | Before/after or process footage |
| `07-biotech.html` | Product/lab/process footage |

## Images — `[CONTENT REQUIRED]` (all four subdirectories empty)

| Directory | Contents | Implied by | Status |
|---|---|---|---|
| `public/images/product/` | `.gitkeep` only | `04-formula.html`, `12-private-selection.html` | `[CONTENT REQUIRED]` |
| `public/images/brand/` | `.gitkeep` only | `01-header.html` (logo/wordmark), `13-footer.html` | `[CONTENT REQUIRED]` |
| `public/images/skin/` | `.gitkeep` only | `06-skin-changes.html`, `05-transformation.html` | `[CONTENT REQUIRED]` |
| `public/images/korea/` | `.gitkeep` only | `10-korea-science.html` | `[CONTENT REQUIRED]` |

No logo, no product photography, no clinical/skin imagery, no
Korea-science-related imagery currently exists anywhere in the repository
(confirmed: no `.png`/`.jpg`/`.jpeg`/`.svg`/`.mp4`/`.mov` files exist outside
the `references/` submodules, which are guidance libraries, not site assets).

## Documents — `[CONTENT REQUIRED]` (all four subdirectories empty)

| Directory | Contents | Implied by | Status |
|---|---|---|---|
| `public/documents/protocols/` | `.gitkeep` only | `content/protocols.md`, `08-protocol-selector.html` | `[CONTENT REQUIRED]` |
| `public/documents/certificates/` | `.gitkeep` only | `content/certificates.md` | `[CONTENT REQUIRED]` |
| `public/documents/presentations/` | `.gitkeep` only | `09-cosmetologists.html` (professional-facing material) | `[CONTENT REQUIRED]` |
| `public/documents/partnership/` | `.gitkeep` only | `09-cosmetologists.html`, `12-private-selection.html` | `[CONTENT REQUIRED]` |

## Content copy — `[CONTENT REQUIRED]` (all six files are placeholders)

Cross-referenced against `content/placeholders.md`, which already tracks
this list:

| File | Current state | Status |
|---|---|---|
| `content/site-copy.md` | Placeholder note only | `[CONTENT REQUIRED]` |
| `content/product-facts.md` | Placeholder note only | `[CONTENT REQUIRED]` |
| `content/protocols.md` | Placeholder note only | `[CONTENT REQUIRED]` |
| `content/cases.md` | Placeholder note only | `[CONTENT REQUIRED]` |
| `content/certificates.md` | Placeholder note only | `[CONTENT REQUIRED]` |

No product claims, certifications, statistics, or testimonials may be
invented to fill these in (`CLAUDE.md` § Rules) — they stay blocked until
real content is supplied.

## Section-by-section dependency map

Every one of the 13 sections in `src/sections/` currently has no content or
asset dependency satisfied:

| # | Section | Depends on |
|---|---|---|
| 01 | `header.html` | brand logo (`images/brand/`) |
| 02 | `hero.html` | hero video/image, `site-copy.md` |
| 03 | `manifesto.html` | `site-copy.md` |
| 04 | `formula.html` | `product-facts.md`, `images/product/` |
| 05 | `transformation.html` | `images/skin/`, video |
| 06 | `skin-changes.html` | `images/skin/`, `product-facts.md` |
| 07 | `biotech.html` | `product-facts.md`, video/images |
| 08 | `protocol-selector.html` | `protocols.md`, `documents/protocols/` |
| 09 | `cosmetologists.html` | `documents/presentations/`, `documents/partnership/` |
| 10 | `korea-science.html` | `images/korea/`, `product-facts.md` |
| 11 | `cases.html` | `cases.md`, `images/skin/` |
| 12 | `private-selection.html` | `product-facts.md`, `images/product/`, `documents/partnership/` |
| 13 | `footer.html` | `images/brand/`, contact/legal copy (not yet in `content/`) |

## Summary

Every asset and content slot in the project is currently empty. This is
expected at this stage (`CLAUDE.md`: "no design or implementation has been
done yet") and is not a defect — it is the complete list of blockers for
`docs/implementation-plan.md` Phase 0. Nothing here should be filled with
placeholder or invented content; each row stays `[CONTENT REQUIRED]` until
RENUVOL supplies the real material.
