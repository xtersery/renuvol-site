# Implementation Plan

Status: planning document only. **No implementation has started and none is
authorized by this document.** It sequences the work for when content and
assets arrive, and states what blocks each phase today. See
`docs/skills-analysis.md` for the methodology this plan draws on and
`docs/asset-audit.md` for the full list of current `[CONTENT REQUIRED]` gaps.

## Binding rules across every phase

- **Language:** the public site is Russian throughout. English is allowed
  only as a restrained visual/editorial accent (e.g. `MADE IN SOUTH KOREA`),
  never as a parallel copy track. See `docs/design-system.md` § Language
  rule.
- **Source-of-truth hierarchy:** `content/product-facts.md` and
  `content/certificates.md` first, then primary manufacturer/clinical
  documents, then other verified project documents, then
  `public/references/instagram/` (positioning/visual ideas only), then any
  other visual reference. Every claim from Instagram or the wireframes is
  tracked in `docs/claims-verification.md` before it can reach
  `content/*.md`. See `docs/asset-audit.md` § Instagram reference library —
  image classification for which assets may even be considered.

## Phase 0 — Content & asset intake (blocking everything below)

Full detail in `docs/asset-audit.md`; summary here, updated after wireframes,
a headline video, product renders, and the brand logo were supplied:

- **Supplied**: three wireframes in `public/references/wireframe/`, covering
  all 13 sections' layout and interaction (but not verified copy — see the
  caveat in `docs/asset-audit.md`).
- **Supplied**: a headline video, `public/video/renuvol-intro.mp4` (placement
  not yet decided); 5 product renders in `public/images/product/`
  (provenance/approval not yet confirmed); the brand logo,
  `public/images/brand/la-beautex-logo.png` (confirms the "La BEAUTEX"
  parent-brand name; low-resolution raster, a vector source may still be
  needed for final build).
- `[CONTENT REQUIRED]` Mood/inspiration references in
  `public/references/inspiration/` (still empty) — needed for the visual-style
  side of Phase 1, since the wireframes are grayscale/structural only.
- `[CONTENT REQUIRED]` Real, verified copy in all six `content/*.md` files
  (still placeholders — the wireframes' copy is illustrative only, not a
  source of truth; see `docs/asset-audit.md`).
- `[CONTENT REQUIRED]` Skin and Korea-science photography
  (`public/images/skin/`, `public/images/korea/`, still empty).
- `[CONTENT REQUIRED]` Protocol, certificate, presentation, and partnership
  documents (`public/documents/*`, still empty; the wireframes now name three
  specific expected PDFs plus three specific certificates — see
  `docs/asset-audit.md`).

Per `CLAUDE.md`, none of the remaining gaps may be fabricated to unblock the
schedule. Phase 0 is partially unblocked (layout material and brand logo
have arrived) but still open on visual references, real copy, and documents.

## Phase 1 — Design DNA extraction

Layout material (the three wireframes) has arrived, so this phase can begin
on structure; it remains blocked on mood/inspiration references for the
visual-style side (palette, type, effects). Once both are available:

1. Run `references/design-dna`'s Analyze phase against the supplied
   wireframes/references to produce a Design DNA JSON (tokens, style,
   effects) — see `docs/skills-analysis.md` for how this skill is used
   (methodology adopted, its optional Node scripts used ad hoc, nothing added
   to `package.json`).
2. Cross-check the extracted palette/type choices against `taste-skill`'s and
   `scroll-craft`'s AI-default traps (the cream+brass premium-consumer
   palette, Inter-as-default, the AI-purple trap) — RENUVOL is a
   skincare/aesthetics brand, exactly the category those rules warn is most
   at risk of a generic result.
3. Write a one-line "design read" (page kind, audience, vibe, aesthetic
   family) per `taste-skill` Section 0.B, and set initial values for the
   three dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`) as a
   starting point for discussion, not a final decision.

**Output:** `docs/design-system.md` gets its first real content (tokens,
type pairing, palette, dial values). It is currently a placeholder and stays
one until this phase runs.

## Phase 2 — Section-by-section content mapping

Blocked on Phase 0's copy and asset delivery. For each of the 13 sections in
`src/sections/`, confirm the content/assets listed in `docs/asset-audit.md`'s
dependency map are in hand before drafting that section's markup. Sections
should be built in an order that respects real dependencies rather than
strictly the numeric order, e.g.:

1. `01-header.html` / `13-footer.html` — need only brand assets, the
   lightest dependency; good first build once Phase 0/1 land.
2. `02-hero.html` — highest-visibility section, gets the most design-DNA
   attention and (per `scroll-craft`) the page's device budget.
3. `03-manifesto.html`, `04-formula.html` — copy-led sections. `04-formula`
   is corrected to **5** components (PDO, PN, Vitamin C, Glutathione,
   Hyaluronate) per `docs/design-system.md` § Section 04 — content still
   `[CONTENT REQUIRED]` per ingredient, but the structure is now decided.
4. `05-transformation.html`, `06-skin-changes.html`, `07-biotech.html` —
   image/video-heavy sections, blocked on `images/skin/` and video assets.
5. `08-protocol-selector.html` — needs `protocols.md` and
   `documents/protocols/` to be meaningful; likely the most interactive
   section (a selector implies state, handled in `src/js/interactions.js`).
6. `09-cosmetologists.html`, `10-korea-science.html`, `11-cases.html`,
   `12-private-selection.html` — each blocked on its own specific content per
   the dependency map. `10-korea-science` and `11-cases` now have an
   approved *safe-interim* content model (`docs/design-system.md` §
   Section 10, § Section 11) — they can be built with `[CONTENT REQUIRED]`
   markers in place of unverified manufacturer claims and fabricated case
   data, rather than waiting fully idle for verification.

## Phase 3 — Motion implementation

Not started; spec lives in `docs/motion-spec.md` (companion document to this
plan, written alongside it). Motion is implemented per-section only after
that section's static markup and content are in place — motion is applied to
real content, never placeholder text, per `frontend-design`'s guidance that
copy is design material.

## Phase 4 — Responsive & accessibility pass

Applies across all sections once built:

- Mobile collapse rules declared explicitly per section (per `scroll-craft`
  taste floor — no "Tailwind will handle it" assumptions, and we don't use
  Tailwind).
- `prefers-reduced-motion` fallback for every animated section.
- Keyboard focus visibility, WCAG AA contrast on all text and controls.
- `src/js/mobile.js` handles any touch-specific interaction differences
  (e.g. hover-driven effects gated to `(hover: hover) and (pointer: fine)`).

## Phase 5 — Verification

Adapted from `anthropics-skills`' `webapp-testing` skill and `scroll-craft`'s
verification approach (methodology only, not their tooling — see
`docs/skills-analysis.md`):

- Run `npm run dev` and walk each section with a headless browser
  (Playwright, invoked ad hoc, not added as a project dependency) to
  screenshot the rendered page at rest, mid-scroll, and reduced-motion states.
- Confirm no dead scroll (a scroll range that changes nothing on screen) and
  no cue that never reaches full opacity, per `scroll-craft`'s device
  contract, re-implemented in this project's own vanilla JS.
- Run `taste-skill`'s pre-flight checklist (Section 14) against the finished
  page: brief inference declared, dial values reasoned, hero fits the initial
  viewport, no duplicate-intent CTAs, no em dash anywhere visible, no
  fabricated statistics.

## Explicit non-goals

- No CSS framework or preprocessor (`CLAUDE.md`).
- No React/Tailwind/GSAP/Motion/Playwright added to `package.json` — see
  `docs/skills-analysis.md` for what's adopted as methodology vs. rejected as
  tooling from each reference library.
- No generated (AI image/video) assets in place of real RENUVOL photography
  and footage — `scroll-craft`'s `kie.ai` pipeline is explicitly not used
  (see `docs/skills-analysis.md`).
- No invented product facts, certifications, statistics, or testimonials at
  any phase (`CLAUDE.md` § Rules).
- No claim from `public/references/instagram/` reaches `content/*.md`
  without first being logged and cleared in `docs/claims-verification.md`.
- No Nobel Prize / Prof. Omar M. Yaghi name, likeness, or implied
  endorsement anywhere on the public site (UI, copy, metadata, alt text,
  SEO, structured data) — `docs/claims-verification.md` rows 1–3.
- No bilingual copy track. The site is Russian; English appears only as a
  restrained editorial accent per `docs/design-system.md` § Language rule.

## Current status — homepage built

All 13 sections are implemented in `src/`, in the approved wireframe order,
with Section 04 corrected to five components. Phases 1–5 have been carried
out against the assets that exist:

- **Phase 1** — design tokens, type pairing and palette are live; see
  `docs/design-system.md`. Note the mood/inspiration references were never
  supplied, so the visual language was derived from the product film,
  packaging and the Instagram library's visual vocabulary instead.
- **Phase 2** — every section is built. Copy is the owner-approved Russian
  text; everything unverified is a visible `[CONTENT REQUIRED]` marker
  rather than invented filler.
- **Phase 3** — motion implemented and verified; see `docs/motion-spec.md`.
- **Phase 4** — responsive and accessibility pass done; see
  `docs/mobile-spec.md`.
- **Phase 5** — verified with a headless browser: scroll choreography in both
  directions, pinning, interaction states, no horizontal overflow, no
  console errors, reduced-motion layout, Russian-language validation
  messages.

**Still outstanding, and still blocking a real launch:** verified product
facts, protocols, case data and certificates; approved before/after and
skin imagery; the four document types under `public/documents/`; real
contact and legal copy; and a lead-form endpoint. Each is marked in the UI
with `[CONTENT REQUIRED]` and tracked in `docs/asset-audit.md` and
`docs/claims-verification.md`.
