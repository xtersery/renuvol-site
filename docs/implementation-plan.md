# Implementation Plan

Status: planning document only. **No implementation has started and none is
authorized by this document.** It sequences the work for when content and
assets arrive, and states what blocks each phase today. See
`docs/skills-analysis.md` for the methodology this plan draws on and
`docs/asset-audit.md` for the full list of current `[CONTENT REQUIRED]` gaps.

## Phase 0 — Content & asset intake (blocking everything below)

Nothing in Phase 1 onward can start until these arrive. Full detail in
`docs/asset-audit.md`; summary here:

- `[CONTENT REQUIRED]` Three wireframes in `public/references/wireframe/`
  (currently empty).
- `[CONTENT REQUIRED]` Mood/inspiration references in
  `public/references/inspiration/` (currently empty).
- `[CONTENT REQUIRED]` Brand assets: logo/wordmark, brand color/type
  references, in `public/images/brand/` (currently empty).
- `[CONTENT REQUIRED]` Real copy in all six `content/*.md` files (currently
  placeholders).
- `[CONTENT REQUIRED]` Product, skin, and Korea-science photography and any
  hero/process video (`public/images/*`, `public/video/`, all empty).
- `[CONTENT REQUIRED]` Protocol, certificate, presentation, and partnership
  documents (`public/documents/*`, all empty).

Per `CLAUDE.md`, none of this may be fabricated to unblock the schedule.
Phase 0 has no target date — it ends when RENUVOL supplies the material.

## Phase 1 — Design DNA extraction

Blocked on Phase 0's wireframes and inspiration references. Once available:

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
   attention and (per `scroll-craft`) the page's `scrub` device budget.
3. `03-manifesto.html`, `04-formula.html` — copy-led sections.
4. `05-transformation.html`, `06-skin-changes.html`, `07-biotech.html` —
   image/video-heavy sections, blocked on `images/skin/` and video assets.
5. `08-protocol-selector.html` — needs `protocols.md` and
   `documents/protocols/` to be meaningful; likely the most interactive
   section (a selector implies state, handled in `src/js/interactions.js`).
6. `09-cosmetologists.html`, `10-korea-science.html`, `11-cases.html`,
   `12-private-selection.html` — each blocked on its own specific content per
   the dependency map.

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

## Current status

**Phase 0 is the only active phase, and it is entirely blocked on content and
assets that have not yet been supplied.** No section has been drafted, no
design tokens have been chosen, and no code beyond the initial scaffold
exists in `src/`.
