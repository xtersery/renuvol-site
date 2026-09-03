# Design System

Status: partially populated. Full tokens (typography, spacing, the site-wide
palette) are still blocked on Phase 1 of `docs/implementation-plan.md`
(mood/inspiration references in `public/references/inspiration/`, still
empty — see `docs/asset-audit.md`). What follows is the set of design
decisions that *are* settled: the site-wide language rule, and the Section
04/10/11 content models corrected after reviewing the Instagram reference
library (see `docs/claims-verification.md` for why).

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

## Outstanding (blocked on Phase 1)

Typography pairing, the full site-wide color palette (beyond the Section 04
ingredient-color directions above), spacing scale, and the three
`taste-skill` dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`)
remain undecided pending mood/inspiration references — see
`docs/implementation-plan.md` Phase 1.
