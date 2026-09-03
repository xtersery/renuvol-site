# Motion Spec

Status: planning document. No motion has been implemented — `src/js/scroll.js`,
`src/js/video-scrub.js`, `src/js/interactions.js`, and `src/js/mobile.js` are
all still one-line stubs. This spec defines *how* motion will be built once
Phase 3 of `docs/implementation-plan.md` is unblocked, drawing on the device
vocabulary and taste rules identified in `docs/skills-analysis.md` (primarily
`references/scroll-craft` and `references/taste-skill`), re-implemented in
vanilla JS/CSS with no animation library, per `CLAUDE.md`.

## Why vanilla, not GSAP/Motion

Both `scroll-craft` and `taste-skill`'s reference code is written against
GSAP `ScrollTrigger` and Motion (`motion/react`). RENUVOL ships no framework
and keeps its dependency footprint minimal, so every device below is
specified as a **behavior contract**, not as library-specific code, and is
built on:

- `IntersectionObserver` for enter/exit and reveal timing.
- `position: sticky` for pinned stages.
- A single hand-rolled `requestAnimationFrame` loop per interactive module for
  scroll-position-driven values (never `window.addEventListener("scroll")`
  writing to layout-triggering properties directly).
- CSS custom properties as the hand-off between JS-computed scroll progress
  and CSS-driven visuals (mirrors `scroll-craft`'s `--sc-p` pattern: JS writes
  one progress variable per section, CSS/`calc()` does the rest).
- CSS `animation-timeline: scroll()` / `view()` used directly where a browser
  supports it and the effect is purely presentational, with a JS fallback
  path for browsers that don't.

## Global rules (binding on every section)

Consolidated from `scroll-craft`'s `taste.md` and `taste-skill`'s Sections
4–9, which independently converge on the same rules (see
`docs/skills-analysis.md` § Cross-library agreement):

1. **Animate only `transform` and `opacity`.** `clip-path` is the sanctioned
   third, for wipes. Never animate `width`, `height`, `top`, `left`, `margin`,
   or `padding`, and never `transition: all`.
2. **`prefers-reduced-motion` is mandatory**, not optional, on anything above
   a simple hover state. Reduced motion means fewer and gentler, not
   necessarily zero: keep the opacity change that carries meaning, drop
   position/transform changes. Infinite loops, parallax, and scroll-hijack
   effects collapse to static.
3. **No `window.addEventListener("scroll", ...)` writing continuous values
   directly.** Use `IntersectionObserver` for boundary events; use a
   `requestAnimationFrame` loop reading `scrollY`/`getBoundingClientRect()`
   only for continuously-driven values, and write results to CSS custom
   properties, not to React/JS state (there is none) or directly to
   layout-triggering styles.
4. **Lerp, don't snap, for scrubbed values.** A target value updates every
   frame; the rendered value eases toward it (`current += (target - current) *
   factor`, factor ≈ 0.15–0.2) so uneven wheel-event timing doesn't read as
   stutter. Reduced-motion mode sets the factor to 1 (no smoothing).
5. **UI transitions stay under 300ms**; hover 120–180ms, buttons 100–160ms,
   using an ease-out curve (`cubic-bezier(0.23, 1, 0.32, 1)` or similar) —
   never `ease-in` on interactive feedback, since it delays the moment the
   user is already looking at.
6. **No device repeats back-to-back.** Across the 13 sections, use at least
   four distinct device families (below) and never the same one on two
   consecutive sections.
7. **No fabricated numbers in `count` devices.** A counter only ships once
   `content/product-facts.md` or another real source supplies the number
   (`CLAUDE.md` § Rules). No number, no counter.

## Device vocabulary

Adapted from `references/scroll-craft/.../references/devices.md`. Each device
is a *behavior*, assignable per section once that section's content exists
(see `docs/implementation-plan.md` Phase 3). Devices are picked per-section by
what the content needs to communicate, not applied uniformly.

| Device | Behavior | Vanilla implementation sketch | Candidate sections* |
|---|---|---|---|
| `scrub` | A pre-rendered video's playhead tracks scroll position, one frame per notch, lerped for smoothness. | `<video>` with `playsinline muted`, `requestAnimationFrame` loop writing lerped `currentTime` from scroll progress. Poster image holds until first real frame paints (iOS keeps a seeked-never-played video blank). Max **two** per page — it's the heaviest device. | `02-hero`, `05-transformation` |
| `pin` | Stage holds (`position: sticky`) while content advances via overlapping fade windows ("cue" ranges) inside it. | `IntersectionObserver` + `position: sticky`; a CSS custom property `--section-progress` drives cue opacity via `calc()`. Minimum useful pinned span ≈1.2 viewport-heights — shorter and progress jumps 0→1 in one scroll notch. | `04-formula`, `07-biotech`, `08-protocol-selector` |
| `pan` | Vertical scroll drives lateral (horizontal) travel of a rail of items. | Measure `scrollWidth - viewport` before relying on it (a rail narrower than the viewport travels zero — this must be checked at runtime, not assumed). Reads as *breadth*, not hierarchy — do not use for ranked content. | `11-cases`, `10-korea-science` (if presented as a gallery) |
| `reveal` | `clip-path` wipe from an edge, signaling a state change. | CSS `clip-path` transition triggered by `IntersectionObserver`. Use on full-bleed images for a real transformation moment, not as decoration on small elements. | `06-skin-changes` (before/after) |
| `kinetic` | Heading splits into lines that assemble (slide up from behind a mask) as the section enters. | JS splits text into line-wrapped spans at runtime (after `document.fonts.ready`, so real line boxes are measured), each animated via `IntersectionObserver`. Line-level splitting only — word/character splitting turns reading into waiting. One kinetic heading per section, at most. | `03-manifesto`, hero headline |
| `parallax` | Layers move at different rates, reading as depth. | `requestAnimationFrame` loop writes a per-layer `translateY` from scroll delta. Small rate differences only (roughly 10–30% between adjacent layers) — anything larger reads as "sliding" rather than depth. Never put body copy on a parallax layer. | Background/texture layers behind `02-hero` |
| `count` | A number animates up to its real value as it enters view. | `IntersectionObserver` triggers a short `requestAnimationFrame` tween from 0 to the real, sourced number. **Blocked** until `content/product-facts.md` supplies real figures. | `04-formula`, `10-korea-science` (contingent on real data) |
| `flow` / `in` | An ordinary section with a simple enter transition (fade + slight `translateY`), no pinning. | `IntersectionObserver`, CSS transition on `opacity`/`transform`, `once: true`. The default for sections that don't need a bespoke device. | `01-header`, `09-cosmetologists`, `12-private-selection`, `13-footer` |

\* Candidate assignments are provisional. They depend on real content and
imagery that don't exist yet (`docs/asset-audit.md`) and must be revisited
once each section's actual material is in hand — the table records intent,
not a commitment.

## The cue contract (for `pin` sections)

Adapted directly from `scroll-craft`'s cue-window lessons, since they're
implementation pitfalls independent of the engine used:

- A hero's first cue must already be visible at progress `0` (a "greet" —
  fade *out* rather than in), never fade *in* from nothing, since the first
  screen every visitor sees must not be blank.
- Cue windows overlap (~15% of the section) so an outgoing line is still
  fading as the next arrives — no gap that reads as a stall.
- Only the section's very last cue holds a single, unchanging value; every
  other cue must close before its section's scroll range ends, or the content
  drags upward past a following section as it un-pins.
- A pinned section needs a "ground" — a held image, color, or already-visible
  first cue — for the roughly one-viewport window before its own pin
  progress starts, or it shows an empty stage during that time.

## Feeling curve (write before assigning devices)

Per `scroll-craft`'s `feel.md`: once real section content and copy exist
(Phase 2 of the implementation plan), write one line per section — the
emotion it should produce, then what on screen causes it — **before**
assigning that section a device. Two adjacent sections with the same intended
feeling means one is filler and should be cut or changed. Identify one
section as the page's engineered "peak" (the moment a visitor would describe
to someone else) and give it the largest device budget and the most scroll
room. This cannot be done meaningfully today — it depends on real copy that
doesn't exist yet (`content/site-copy.md` is a placeholder) — so it is
recorded here as a required step for Phase 3, not performed now.

## Verification (once built)

Per `docs/implementation-plan.md` Phase 5: screenshot every section at rest,
mid-scroll, and under `prefers-reduced-motion`, and confirm no "dead scroll"
(a scroll range where nothing on screen changes) and no cue that never
reaches full opacity. Manually verify `pan` rail overflow at multiple
viewport widths, since a rail that fits the viewport exactly produces zero
travel and looks like a frozen section rather than an error.

## Current status

No motion exists in the codebase. This spec is the target behavior for
Phase 3 of `docs/implementation-plan.md`, which is blocked on Phase 0/1/2
(real content, design tokens, and section markup) landing first.
