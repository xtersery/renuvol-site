# Design System

Status: implemented. The tokens below are live in
`src/styles/tokens.css`; this document is the reasoning behind them.

**Design read:** a professional-facing product site for aesthetic-medicine
practitioners, with a clinical-light editorial language, leaning toward
premium Korean cosmeceutical × editorial fashion rather than a
pharmaceutical catalogue.

**Dials** (`taste-skill` vocabulary), as the art-direction pass left them:
`DESIGN_VARIANCE 8` — every section has a bespoke composition and no two
share a layout gesture; `MOTION_INTENSITY 7` — four pinned scenes, a fixed
atmosphere layer that drifts with global page progress, and colour chapters
that interpolate, but no ambient loops and no scroll-driven video;
`VISUAL_DENSITY 3` — an editorial amount of air, since the page is a
considered read for a professional audience, not a dashboard.

The colour and material layer built on top of these tokens has its own
document: `docs/art-direction.md`. Read it alongside this one — the nine
colour chapters and the `rv-orb` / `rv-blob` / `rv-membrane` / `rv-wash` /
`rv-arc` / `rv-iris` material set live there, not here.

No mood/inspiration references were ever supplied
(`public/references/inspiration/` is still empty), so the visual language
was extracted from the assets that do exist: the owner-supplied product
film, the packaging, and the ice-blue/pearl/molecular vocabulary that runs
through the Instagram library.

## Language rule (binding on the whole site)

**The entire public-facing website is in Russian.** English appears only as
a restrained visual/editorial accent where it materially improves the
design — never as a second parallel language track. Examples of the
allowed kind of accent (short, branding-flavored, not sentence-level
content):

- `MADE IN SOUTH KOREA`
- `READY TO DISCOVER RENUVOL?`
- `ONE PRODUCT. MULTIPLE PROTOCOLS.`

Everything else is Russian: navigation, buttons, forms, tooltips, mobile UI,
error messages, and accessibility labels that are user-facing. The site is
not bilingual by default — do not add an English copy track "for
completeness."

Confirmed Russian navigation labels (from the approved wireframe, unchanged):

```
О препарате
Эффект
Протоколы
Кейсы
Для косметолога
Контакты
```

## Section 04 — reworked formula section

### The correction

The approved wireframe shows 4 formula hotspots. The Instagram reference
library consistently documents RENUVOL's formula as **5** components. This
is a confirmed structural correction — see `docs/asset-audit.md` § the
Section 04 correction note for how this relates to the (unmodified)
wireframe PNGs.

### Content model

- **Eyebrow/title:** `ВНУТРИ RENUVOL`
- **Heading:** `ИНТЕЛЛЕКТ ФОРМУЛЫ`
- **Core concept:** "5 компонентов — одна система" — the five ingredients
  must read as one integrated system, not five interchangeable feature
  cards. This is the single most important design constraint for this
  section.
- **The five components:**
  1. PDO
  2. PN (полинуклеотид)
  3. Витамин C
  4. Глутатион
  5. Гиалуронат (sodium hyaluronate)
- Ingredient role/benefit copy for each component is still
  `[CONTENT REQUIRED]` pending `content/product-facts.md` — see the safe
  conservative wording guidance in `docs/claims-verification.md` (e.g.
  "антиоксидантный компонент," "используется как компонент формулы," never
  a mechanism or outcome claim that isn't sourced).

### Geometry

Preserve the wireframe's approved concept — central RENUVOL product,
interactive hotspots, connector lines/orbital system, premium editorial
spacing — but the geometry must be redesigned to fit 5 nodes elegantly, not
by forcing a 5th identical card into the previous 4-card layout. Directions
to choose from (final choice is a build-time decision, not fixed here):

- **Pentagonal orbital layout** — 5 nodes evenly spaced on a ring around the
  central vial, connector lines radiating out like the wireframe's original
  4-hotspot version, just re-spaced for 5.
- **Asymmetrical radial composition** — nodes at varied distances/sizes from
  the center, weighted by visual or narrative importance rather than
  mechanically even spacing.
- **3 + 2 balanced editorial grouping** — two clusters (e.g. 3 "active"
  ingredients + 2 "carrier/support" ingredients, once that grouping logic is
  confirmed against real product facts) rather than one uniform ring.
- **Vertically staged ingredient reveal** — a scroll- or step-driven
  sequence that introduces one component at a time before showing the full
  system, still anchored to the central product.

Whichever direction is chosen, **do not** default to 5 identical cards
arranged mechanically around the vial — that's the one explicitly rejected
option. Interaction stays as annotated in the wireframe: hover on desktop
opens a tooltip, click on mobile opens an accordion card
(`docs/motion-spec.md` § `04-formula`).

### Color direction

Directional roles, not final hex tokens (final values still depend on Phase
1's design-DNA extraction once mood references arrive):

| Element | Color direction |
|---|---|
| Base / ground | Icy blue → pearl light blue (matches the product-world palette confirmed across Instagram product visuals) |
| Product center (vial) | Premium white / silver |
| PDO | Base blue (no separate accent — it's the foundation ingredient) |
| PN | Soft aqua / cyan |
| Vitamin C | Gold / orange accent (the one warm note in an otherwise cool system) |
| Glutathione | Restrained lilac |
| Hyaluronate | Blue (distinguished from PDO's base blue by value/saturation, exact pairing TBD) |

Use the Instagram visual language (glass spheres, transparent molecular
structures, glowing rings) as **inspiration for technique**, not a template
to copy — build an original web interpretation of the 5-component system
rather than reproducing an Instagram slide layout in HTML.

## Section 10 — "Южная Корея / Наука / Качество" (safe interim version)

Manufacturer/credibility claims from the Instagram library (patents, country
count, "World Class 300," founder biography, factory investment/area,
"first in the world" wording) are all `UNVERIFIED` — see
`docs/claims-verification.md` rows 13–20. Until primary documentation exists,
Section 10 uses only safe, number-free, award-free language:

```
MADE IN SOUTH KOREA

Технологический подход
Производственная культура
Контроль качества
Исследовательская база

Документы и регистрационные материалы
[CONTENT REQUIRED: verified certificates]
```

Do not show: patent counts, country counts, awards ("World Class 300"),
founder biography, investment amounts, factory floor area, or any
first-in-world/superlative claim. Do not name ISO/KFDA/CE or any other
specific certificate until the actual document exists in
`public/documents/certificates/` (`docs/claims-verification.md` row 21).
This is still a **visually strong** section — the constraint is on claims
and specificity, not on production values; the 2×2
Technology/Production/Quality/Certificates block layout from the wireframe
stays.

## Section 11 — clinical results (safe interim version)

No verified clinical data or approved before/after imagery exists. The
wireframe's three illustrative cases (patient age/gender, request, procedure
count, result) are fabricated mockup content and must not ship
(`docs/claims-verification.md` row 31). Keep the section's designed shell —
carousel, lightbox, the visual rhythm of the wireframe — but replace content
with explicit placeholders:

```
Кейсы / результаты

[CONTENT REQUIRED: approved before/after cases]
[CONTENT REQUIRED: verified study outcomes]
```

Do not invent patient ages, procedure counts, clinical percentages,
timelines, or outcomes to fill the shell in the meantime.

## Implemented tokens

### Palette

Six roles plus one locked accent, with the ingredient hues confined to
Section 04 and the chapter rail. The ground drifts between three states as
scenes hand off (`data-rv-ground` on `<html>`), which is what makes the page
read as one journey rather than a stack.

| Token | Value | Role |
|---|---|---|
| `--rv-pearl` | `#f2efea` | Warm-white editorial ground (default) |
| `--rv-ice` | `#e6eef3` | Icy ground for the product-world scenes |
| `--rv-mineral` | `#c3c6c8` | Neutral for placeholder surfaces |
| `--rv-ink` | `#14171a` | Near-black text (never `#000`) |
| `--rv-navy` | `#0b1220` | Deep ground for the biotech scene and footer |
| `--rv-cobalt` | `#2a5ea8` | The single page accent |

Ingredient accents (Section 04 only): PDO `#7d94a8` (silver-ice, the
structural base), PN `#5fa9bd` (aqua), Vitamin C `#c08a3e` (the one warm
note), Glutathione `#9a92bd` (restrained lilac), Hyaluronate `#4272ad`.

Deliberately avoided: generic medical blue everywhere, neon, purple
gradients, and the cream-and-brass palette that every premium-consumer brief
defaults to.

### Typography

Two families, no third.

- **Display — Prata** (`--rv-font-display`): an elegant Cyrillic didone,
  used for every editorial statement and section title. Chosen because the
  wireframe's own headings are set in a thin high-contrast serif, and
  because the brief explicitly asks for an editorial-fashion register.
- **Text — Onest** (`--rv-font-text`): a contemporary Cyrillic neo-grotesk
  for all functional copy, labels and UI.

Both are **self-hosted** (`public/fonts/`, ~92KB total for Latin +
Cyrillic subsets, `font-display: swap`). No Google Fonts request, so there
is no third-party render-blocking dependency. Onest ships as one variable
file per subset, so a single face covers weights 300–700.

Scale is fluid (`clamp()`) throughout; tracking tightens as size grows
(`--rv-track-tight: -0.03em` on display), body measure is capped at 42ch,
display line-height 0.96 against body 1.62.

### Spacing, depth, motion

- 4px base scale (`--rv-1` … `--rv-11`), fluid gutter
  (`clamp(20px, 5vw, 72px)`) and section rhythm
  (`clamp(88px, 11vh, 176px)`).
- Depth comes from hairlines, overlap and a fixed grain layer at ~3%
  opacity — not from card containers. Three elevation steps exist and are
  barely used: the page groups by proximity and rule, not by boxes.
- One easing curve (`cubic-bezier(0.23, 1, 0.32, 1)`), UI transitions under
  300ms, and only `transform` / `opacity` / `clip-path` animated.

### What the page deliberately does not do

No card grids as page structure, no eyebrow above every section (three in
total across thirteen sections), no gradient text, no neon glow, no custom
cursor, and no invented statistics — so there are no counters, badges or
infographics anywhere on the page.

### Two deliberate deviations from the reference libraries

1. **The hero keeps a `SCROLL TO DISCOVER` cue**, which both `taste-skill`
   and `scroll-craft` list as an anti-pattern. It is retained because the
   brief specifies it explicitly; it is set in the smallest type on the page
   and fades out within the first 6% of hero scroll.

2. **The em-dash ban does not apply to Russian copy.** Both libraries ban
   `—` outright, but that rule is written for English, where the em dash is
   an LLM stylistic tell. In Russian, тире is *required* punctuation — a
   dash between a subject and a predicate noun (`RENUVOL — препарат…`) is
   grammar, not decoration, and replacing it with a hyphen would be an
   orthographic error. The dash is therefore used where Russian requires it
   and nowhere else: it appears three times on the page
   (`5 компонентов — одна система`, the downloads note, the document title)
   and never as a decorative separator, in an eyebrow, a label or a button.
