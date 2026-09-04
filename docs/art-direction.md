# Art Direction

Status: implemented. This is the visual/authorship layer applied on top of the
existing 13-section architecture. **Nothing structural changed** — same
sections, same order, same content hierarchy, same interaction model. What
changed is composition, colour, material, scale and motion.

## Why the previous version read as dry

An honest diagnosis of the build this replaces:

1. **One ground for the whole page.** Three ground states (pearl / ice / navy)
   over thirteen sections meant most of the site was the same warm white.
   Colour carried no narrative.
2. **Everything was typography on emptiness.** Each section opened with a big
   serif heading on a blank field. Correct, restrained — and interchangeable.
   Nine sections shared one layout gesture.
3. **Forms were small and decorative.** A 10px node dot, a 44px icon, a
   hairline. Nothing occupied the viewport with authority.
4. **Rectangles everywhere.** Sections were stacked boxes with hard top and
   bottom edges; the page read as a list of slides.
5. **Placeholders were exposed.** `[CONTENT REQUIRED]` markers rendered
   publicly, which made a finished design look permanently unfinished.
6. **The wow was outsourced to the video.** Remove the film and the page had
   no visual event of its own.

## What was taken from the reference

pear.no is blocked by this environment's egress proxy, so the first pass was
built from the principles the brief enumerates rather than from the site
itself. Screenshots were later supplied to `references/pear/` and the
client-ready pass is built on those. What they actually show:

- One dominant object, right of frame, at a scale nothing else competes with.
- A confident, saturated ground. Not a wash of pale gradients.
- Serif headline left, small support paragraph placed low and in a different
  column — asymmetric text placement rather than a centred stack.
- A thin editorial rule — one vertical, one horizontal, diamond nodes at the
  ends — drawn over everything, imagery included.
- Tiny mono-caps section labels (`— THE MODEL`) and black pill CTAs.
- Full-bleed image bands cropped hard (a branch, two hands, a cap) with type
  set inside the image on its calm region.

Translated to RENUVOL — reinterpreted, not copied:

| Principle | How it is used here |
|---|---|
| Artistic authorship over template minimalism | Every section has a bespoke composition; no section repeats another's layout gesture |
| Bold, unafraid colour | Nine colour chapters that evolve down the page, each with its own atmosphere |
| Large forms | Orbs, membranes and fields occupying 40–90% of the viewport, frequently bleeding off-screen |
| Unexpected scale and cropping | Wordmark runs off the left edge; product is cropped by its own lens; forms are cut by section boundaries |
| Layering and depth | Four depth planes per scene: atmosphere → forms → media → type |
| Expressive motion | Slow drift, mask openings, scale and colour transitions driven by scroll |
| Scroll continuity | One fixed atmosphere layer travels the whole page; forms cross section boundaries |
| Section-to-section transformation | Colour and form state interpolate between chapters rather than switching |
| Organic geometry | Blob radii, curved membranes, elliptical masks instead of rectangles |

What was deliberately *not* taken: the neoclassical/collage imagery and
halftone treatment. That is Pear's own identity and would be wrong on a
medical-aesthetics product.

## The colour system

Nine chapters. Each defines ground, ink, line, accent and three atmosphere
colours. `<html data-rv-ground>` switches chapter as scenes pass; the values
are registered with `@property` so they interpolate rather than jump.

| Chapter | Sections | Mood |
|---|---|---|
| `ice` | Hero | Icy cyan, pearl, cobalt, silver |
| `pearl` | Manifesto | Warm pearl, skin tone, soft lavender |
| `glass` | Formula | Clear glass, aqua, gold, violet — ingredient identities |
| `skin` | Transformation | Pearl skin, blush, translucent water |
| `flux` | What changes | Aqua → blush → gold, evolving with the rail |
| `dark` | Biotech | Deep navy, liquid black, electric cobalt, violet |
| `clinic` | Protocols, For cosmetologists, Korea | White, silver, deep blue |
| `warm` | Cases, Private selection | Warmer, more sensual close |
| `night` | Footer | Returns to the biotech world |

The accent is not one flat colour any more: it shifts per chapter within a
single hue family, so the page never looks like it changed brand.

## The material system

Six reusable elements in `src/styles/art.css`, used as a system rather than
as decoration:

- **`rv-orb`** — translucent sphere, layered radial gradients with an inner
  light, rim light and iridescent edge. The recurring protagonist.
- **`rv-blob`** — organic mass with asymmetric radii and a slow morph.
- **`rv-membrane`** — curved glass sheet: large radius, backdrop blur, 1px
  edge highlight.
- **`rv-wash`** — soft gradient mass for atmosphere and colour bleed.
  (Named `rv-wash`, not `rv-field`: `.rv-field` is the contact form's field
  wrapper, and the collision absolutely-positioned every form label on top of
  the next.)
- **`rv-arc`** — oversized circle that deliberately leaves the viewport.
- **`rv-rules`** — the editorial measuring rule: one vertical line on the
  shell's content edge, one horizontal line low in the frame, diamond nodes
  at the ends. Used on the hero, the manifesto and the formula band; it is
  what makes three very different compositions read as one plate.
- **`rv-iris`** — low-opacity conic iridescence laid over glass surfaces.

All are CSS: gradients, radii, masks and transforms. No images, no canvas, no
library. Blur is used sparingly and only on composited, non-scrolling layers.

## Continuity

Two mechanisms make the page read as one artwork:

1. **The atmosphere layer** (`.rv-atmos`, fixed, behind everything): three
   large gradient masses whose colour comes from the current chapter and
   whose position is driven by *global* page progress (`--rv-page`). The same
   forms travel the entire page, so colour changes arrive as a drift rather
   than a cut.
2. **Bleeding forms**: every section places at least one large element that
   crosses its own top or bottom edge, so a section's shape is already
   present before its content arrives.

Both depend on one detail: `.rv-scene` and the pinned stages clip
horizontally (`overflow-x: clip`) but not vertically. A vertical clip draws a
hard line at the exact pixel where one section ends and the next begins,
which is the seam the whole direction is trying to dissolve. Vertical
containment is a `mask-image` fade on the scene instead, so a section's
colour dies out gradually into its neighbour.

## Per-section changes

- **Hero** — product-led, and rebuilt in the client-ready pass around the
  approved transparent render (`images/hero/renuvol-main-transparent.png`).
  The vial runs from above the top edge to below the bottom on the right at
  roughly half the viewport width, cropped by the frame rather than by a
  mask, and its own liquid ribbon supplies the diagonal. A deep ice→cobalt
  ground gives the cut-out somewhere to sit; one soft lens light sits behind
  it. The four decorative forms the previous hero stacked here (major orb,
  minor orb, blob, arc) were removed — against a render this rich they read
  as clutter. The oversized `RENU/VOL` wordmark went with them: it competed
  with the photograph and at some widths covered it, so the brand is now a
  tracked eyebrow and the message carries the display weight. Motion is
  scroll drift and scale plus pointer parallax on fine pointers, composed
  into a single transform. The film remains an optional CTA.
- **Formula** — opens on a full-bleed image band: a macro crop of the vial's
  cap and neck, with the section title set inside the image over its calm
  upper-left. This is the hand-off out of the manifesto — the page changes
  register rather than printing another heading on another empty ground. On
  a phone the type moves below the image, where it is legible.
- **Manifesto** — `НЕ ЗАПОЛНЯТЬ.` sits inside a large translucent blob; as
  scroll continues the blob expands past the viewport and the ground warms,
  and `ВОССТАНАВЛИВАТЬ.` emerges at a larger scale through a clip-path mask.
- **Formula** — five ingredient orbs, each with its own material identity.
  Selecting one transforms the scene: the orb scales and lights, connectors
  take its colour, the ground field warms or cools toward it, and a colour
  wash crosses the product. The vial sits in a glass lens on an orbital
  field.
- **Transformation** — the two empty rectangles are gone. Before/after are
  two art-directed macro surfaces (dull, matte, cool vs luminous, plump,
  iridescent) revealed by the drag mask, so the section is complete and
  sensual without clinical photography.
- **What changes** — one central form evolves through the five chapters as
  the rail travels: liquid → compressed layers → stretched → refined →
  iridescent, with the chapter colour driving the atmosphere.
- **Biotech** — a gallery installation rather than sci-fi: liquid black
  ground, a large translucent sculpture with orbital rings, violet and
  electric-cobalt light, very slow motion.
- **Cases / Korea / Protocols / Selection / Footer** — recomposed with the
  same material system; placeholders replaced by finished neutral states.

## Placeholders

`[CONTENT REQUIRED]` is never rendered to a visitor. Where content is
missing the component is designed to look complete without it: the element
is omitted, or replaced by an honest functional line (for example, materials
and clinical cases are offered on request rather than faked). The markers
survive as HTML comments next to each slot, and the full list stays in
`content/placeholders.md`, so nothing is lost for the team.

## Mobile

Mobile keeps the artistic identity — colour chapters, large forms, the
atmosphere layer, the orbs — and simplifies the mechanics: fewer
simultaneously animating layers, no pointer parallax, shorter pins, and
forms scaled to sit inside the viewport rather than bleeding on every edge.
See `docs/mobile-spec.md`.

## Performance guardrails

- Only `transform`, `opacity` and `clip-path` are animated.
- The atmosphere layer is `position: fixed` and moves by transform only, so
  it never repaints on scroll.
- Colour interpolation is done by `@property`-registered custom properties,
  not by JS.
- Backdrop blur is limited to the header and two membrane elements.
- The video is no longer part of first paint at all.

## What the visual pass changed

The direction above was implemented and then reviewed in a headless browser
at six widths. What the review caught, and what was done:

| Found | Fix |
|---|---|
| The hero wordmark collided with the vial, then with the copy | One grid row, two columns; the wordmark sits in its own band above both |
| On a phone the hero stacked in the wrong order and overflowed the viewport | The desktop rule pinned product and copy to a shared row, which defeats `order`; released at ≤760px and the composition retuned to fit 100dvh |
| Both manifesto phrases were at full opacity at the same scroll position | Cue ranges separated: the negation is out by 0.40, the promise starts at 0.40 |
| `.rv-field` named both a decorative mass and the form field wrapper | Decorative one renamed `rv-wash` |
| Faded cues still swallowed clicks — the hero's film CTA was unclickable | `scroll.js` makes a cue inert below 2% opacity and live again above it |
| A hard seam at every section boundary | Horizontal-only clipping plus a mask fade (see *Continuity*) |
| The before/after plate read as a flat grey slab | Both halves rebuilt from the same irregular soft masses, so the drag reads as one surface changing state; labels moved to their own sides |
| The orbit's ingredient wash and `ТРАНСФОРМАЦИЯ` pushed the page sideways on a 360px screen | Wash clipped on the horizontal axis only; the title got its own type ramp |
| No favicon (a 404 on every load) | An SVG mark drawn from the site's own glass orb |

## The client-ready pass

A focused refinement for a client presentation. Three goals, no rebuild:

1. **The approved hero render replaces the old opening.** See *Hero* above.
   The artwork's own edges are dissolved with a narrow mask (10%/7% on the
   sides, 5%/6% top and bottom) because the liquid ribbon runs to the frame
   and otherwise terminates in four straight lines — the transparent render
   reads as a rectangular image block. The fades sit outside the vial's
   extremities, so the product itself is never cropped.
2. **The reference was applied to the first sections only** — hero,
   manifesto, formula, and the transition between them. Everything after
   `05-transformation` was left alone.
3. **The standalone Protocols section was removed.** Its five panels all
   resolved to the same sentence and the same CTA, and protocol content that
   carries weight already lives in *Для косметолога* (materials on request)
   and in the patient-profile selector in *Private selection*. Removed with
   it: the `Протоколы` items in the desktop nav, the mobile menu and the
   footer, the `initProtocolSelector` / `initProtocolAccordion` modules, and
   the `.rv-protocols` / `.rv-goal` / `.rv-protocol` rules.

Deliberately not taken from the reference: the neoclassical collage, the
halftone treatment, the glitch and sparkle overlays. That is Pear's own
identity and would be wrong on a medical-aesthetics product.
