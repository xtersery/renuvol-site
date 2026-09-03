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
is a *behavior*. The three wireframes now in `public/references/wireframe/`
(see `docs/asset-audit.md`) annotate a specific interaction per section, so
the table below maps each device to the sections whose wireframe annotation
actually calls for it, rather than guessing. This is layout intent, not
built behavior — content in each section (Phase 2) is still required before
any of this is implemented, and the assignments should be re-checked against
the real copy/imagery once it lands.

| Device | Behavior | Vanilla implementation sketch | Sections per wireframe |
|---|---|---|---|
| `pointer` | Interactivity driven by hover/click/drag, not scroll position: tooltips, popups, tabs/accordion, drag sliders, carousels. | Plain event listeners (`pointerenter`/`click`/`pointerdown`); gate hover-only effects to `(hover: hover) and (pointer: fine)` so touch doesn't fire false hovers (`src/js/mobile.js` handles the touch fallback). | `04-formula` (hover node → tooltip, click → accordion on mobile — now **5** nodes in an asymmetric/orbital arrangement, not 4 cards; see `docs/design-system.md` § Section 04), `05-transformation` (drag before/after slider, swipe on mobile), `08-protocol-selector` (tabs desktop / accordion mobile), `09-cosmetologists` (hover-reveal cards, click → popup), `10-korea-science` (popup documents), `11-cases` (carousel + swipe + lightbox), `12-private-selection` (multi-step form) |
| `pin` | Stage holds (`position: sticky`) while content advances via overlapping fade windows ("cue" ranges) inside it, or a pinned stage drives lateral travel (`06`). | `IntersectionObserver` + `position: sticky`; a CSS custom property `--section-progress` drives cue opacity via `calc()`. Minimum useful pinned span ≈1.2 viewport-heights — shorter and progress jumps 0→1 in one scroll notch. | `06-skin-changes` ("pinned section, vertical scroll drives horizontal movement" — `pin`+`pan` combined), `07-biotech` ("section pin for emphasis", "slow dramatic scroll") |
| `kinetic` / title-split | Heading responds to scroll position rather than assembling on entry — the wireframe's hero calls for the oversized "RENU / VOL" wordmark to shift apart on scroll, not line-by-line assembly. | `requestAnimationFrame` loop writes a lerped `translateX` per half of the split wordmark, driven by scroll progress through the hero. | `02-hero` ("on scroll: oversized title shifts left/right") |
| `reveal` | Text reveal via a dramatic typographic transition, or `clip-path` wipe on an image signaling a state change. | For text: `IntersectionObserver`-triggered opacity/transform on the manifesto's headline. For images: `clip-path` transition on full-bleed art only. | `03-manifesto` ("text reveal on scroll / dramatic typography transition") |
| `parallax` | Layers move at different rates on pointer movement (not scroll), reading as depth on the hero packshot. | `pointermove` listener writes a lerped small offset (a few px, not the 100s-of-px scroll-driven parallax scroll-craft describes) to a CSS custom property; disabled under `(pointer: coarse)` and `prefers-reduced-motion`. | `02-hero` ("subtle mouse parallax on packshot") |
| `flow` / `in` | An ordinary section with a simple enter transition (fade + slight `translateY`), no pinning. | `IntersectionObserver`, CSS transition on `opacity`/`transform`, `once: true`. The base behavior every section gets in addition to any device above. | `01-header` (fixed, smooth-scroll anchor nav — not itself a scroll device), `13-footer` |
| `count` | A number animates up to its real value as it enters view. | `IntersectionObserver` triggers a short `requestAnimationFrame` tween from 0 to the real, sourced number. **Blocked** until `content/product-facts.md` or another verified source supplies a real figure — the wireframe's own 93% stat is explicitly unverified (`docs/asset-audit.md`). | None assigned yet — no verified number exists to count up to |

**Correction from the prior draft of this spec:** earlier versions of this
table assumed a `scrub` (video-playhead) device for the hero and
transformation sections. The actual wireframes specify a **static** hero
packshot with pointer parallax (no video) and a **drag slider** for
before/after (also no video), not a scroll-scrubbed clip. `scrub` is dropped
from the assignment table; `public/video/renuvol-intro.mp4`'s placement is
still an open decision (see `docs/asset-audit.md` § Video) and, if used, its
device would need to be decided against the actual footage, not assumed.

**Variety check against the global rule (no device twice in a row):** reading
top to bottom through the 13 sections — `flow` (01) → title-split (02) →
`reveal` (03) → `pointer` (04) → `pointer` (05) → `pin` (06) → `pin` (07) →
`pointer` (08) → `pointer` (09) → `pointer` (10) → `pointer` (11) →
`pointer` (12) → `flow` (13) — the wireframe as drawn repeats `pin` once
(06→07) and `pointer` five times in a row (08–12). Both break the
no-repeat-in-a-row rule in `docs/skills-analysis.md` § Cross-library
agreement. This needs a real design decision once Phase 2 content exists,
not a silent pass-through of the wireframe's interaction pattern — options
include varying 08–12's presentation (e.g. giving `10-korea-science` or
`11-cases` a `pan` scroll-driven rail instead of a click-driven
carousel/popup) rather than defaulting every mid-page section to hover/click.

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

No motion exists in the codebase. The device-per-section table above is now
grounded in the three wireframes' actual interaction annotations rather than
guessed, and has already surfaced one real issue (the device-repeat rule
violation across sections 08–12) to resolve during Phase 2/3. This spec is
still the target behavior for Phase 3 of `docs/implementation-plan.md`,
which remains blocked on Phase 0/1/2 (verified content, design tokens, and
section markup) landing first.
