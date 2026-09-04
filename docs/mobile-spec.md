# Mobile Spec

Status: implemented. Mobile is designed as its own interaction model, not a
scaled-down desktop. The breakpoint that separates the two models is
**760px**; navigation collapses earlier, at **1024px**.

All mobile UI is Russian (see `docs/design-system.md` § Language rule).

## What changes, and why

| Section | Desktop | Mobile | Reason |
|---|---|---|---|
| 01 Header | Full nav + CTA | Burger → full-screen menu with focus trap and scroll lock | Six Cyrillic nav labels plus a CTA cannot sit on one line below ~1024px, and a two-line nav is broken |
| 02 Hero | Wordmark centred behind the copy, splitting on scroll | Wordmark moves to the upper third, split travel halves (22vw → 12vw), CTAs go full-width, scroll cue hidden | At 390px the centred wordmark sits behind the opening statement |
| 03 Manifesto | Two phrases cross-fade in the same optical centre | Phrases stack in flow; type sized by the longest word so `ВОССТАНАВЛИВАТЬ.` never overflows | Overlaying two large Cyrillic phrases is unreadable at phone width |
| 04 Formula | 5-node orbit with connector lines and a detail panel | Orbit and connectors hidden; product first, then a native accordion built from the same panels | The orbit needs width the phone does not have; the accordion keeps every component reachable by tap |
| 05 Transformation | 16:9 comparison, drag anywhere | 3:4 portrait crop; only the uncropped side carries the placeholder note | Portrait reads better on a phone, and the split must not cut through text |
| 06 What changes | Section pins; vertical scroll drives a horizontal rail | Pin released entirely; the rail becomes a native `scroll-snap` strip the reader swipes | Scroll-hijacking a touch device fights the reader's own gesture |
| 07 Biotech | Copy left, orb right | Orb repositioned up-right, copy stacked, CTA full-width | Side-by-side does not fit; the scene still inverts the ground |
| 08 Protocols | List drives a detail panel beside it | Each panel is moved under its own trigger — a real accordion | Two distant columns require looking in two places on a small screen |
| 09 For cosmetologists | Three hairline-separated columns | Stacked rows; hover preview replaced by an explicit tap toggle with a 44px target | Hover does not exist; nothing is force-opened behind the reader |
| 11 Cases | Arrows drive a transform | Native horizontal scroll with snap; the arrows scroll the viewport, the counter follows the reader's own scrolling | A synthetic swipe handler fights native momentum scrolling |
| 12 Selection | Five profiles in one row | Single column; form fields stack | Five Cyrillic labels cannot share a row |
| 13 Footer | Four columns | Single column | — |

## Touch rules applied throughout

- Every hover-only affordance is gated behind
  `(hover: hover) and (pointer: fine)`, so touch never fires a false hover.
- Interactive targets are at least 44–48px tall (buttons have a 48px min
  height; accordion triggers 60px).
- The film is behind a CTA and nothing about it is fetched until someone
  opens the modal, so a phone on mobile data pays nothing for it by default.
  When opened, it gets a separate smaller encode
  (`renuvol-hero-scrub-mobile.webm` / `.mp4`, ~3MB vs ~6.5–7MB).
- `100dvh` is used for pinned stages, with a measured-height fallback for
  older Safari (`initViewportUnit` in `src/js/mobile.js`) so the address bar
  cannot cause a layout jump.
- No horizontal page scroll at any width — verified at 360, 390, 834, 1180,
  1440 and 1920px.

## Reduced motion

`prefers-reduced-motion: reduce` is treated as its own layout, not just
disabled animation (`.rv-static`, applied by `src/js/scroll.js`):

- Pinned sections never receive their travel height, so there is no long
  stretch of scroll that changes nothing.
- Every cue renders at full opacity — no content is reachable only by
  scrolling through an animation.
- The hero's three scroll beats become one stacked opening statement.
- The video is not fetched at all; the poster frame stands in.
- The chapter rail becomes a reader-driven horizontal scroll region.

## Verified

Checked with a headless browser at 390×844 and 360×780: burger menu open,
link close and scroll lock; formula accordion; protocol accordion; cases
scroll-snap and counter sync; no horizontal overflow; no console errors.
Also fixed during that pass: the hero stacked in the wrong order and ran past
the viewport (the desktop composition pins the product and the copy to one
shared grid row, which defeats `order` — released at ≤760px), the ingredient
wash and the word `ТРАНСФОРМАЦИЯ` pushed the page sideways at 360px, and the
contact form's labels stacked on top of each other because `.rv-field` named
both a form wrapper and a decorative absolute-positioned mass.

Not verified on a real iOS device — headless Chromium cannot reproduce
Safari's video decoder, autoplay policy or Low Power Mode, so film playback
on a physical iPhone remains untested.
