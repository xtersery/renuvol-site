# Asset Audit

Status: planning document. Inventories every asset and content slot the
project structure expects (per `CLAUDE.md` and `src/sections/`) against what
currently exists in `public/` and `content/`. No design or implementation has
started. This revision reflects assets added directly to `main` after the
first pass: three wireframes, a headline video, and product renders. Gaps
still remain and stay marked `[CONTENT REQUIRED]`.

**Source-of-truth hierarchy** (binding on this whole document and on
`content/*.md`): `content/product-facts.md` and `content/certificates.md`
first, then primary manufacturer/clinical documents, then other verified
project documents, then `public/references/instagram/` (positioning/visual
ideas only, never facts), then any other visual reference (wireframes, mood
boards) for visual direction only. Every claim carried in from Instagram or
the wireframes is tracked in `docs/claims-verification.md` before it can be
considered for `content/*.md`.

## Method

Compared the directory structure under `public/` and `content/` against the
13 numbered sections in `src/sections/`. Every directory below currently
contains nothing but a `.gitkeep` placeholder unless noted otherwise.

## Wireframes — supplied

`public/references/wireframe/` now contains three PNGs, one per desktop page
segment (1440px, sections 01–04, 05–08, 09–13). Together they cover all 13
sections in `src/sections/` with layout, copy placement, and interaction
annotations (a legend marks hover/click/scroll/popup/tab behavior per
element). This unblocks `references/design-dna`'s Analyze phase and gives
`docs/implementation-plan.md` Phase 1 real material to work from.

**Important caveat — wireframe copy is illustrative, not verified content.**
The wireframes contain placeholder text that reads as real information but
is not confirmed and must not be copied into `content/*.md` or shipped
as-is:

- A statistic ("93% of specialists report improved skin quality after 2
  procedures") attributed to "LA BEAUTEX internal research, 2023" in the
  manifesto section (03). `content/placeholders.md`'s "Missing Content" list
  explicitly flags clinical statistics as unavailable and not to be invented
  — this number needs verification against a real source before it can
  appear on the site, wireframe or not.
- Specific protocol intervals in the protocol-selector section (08): "3–4
  procedures, 2–4 week intervals, maintenance every 2–3 months." The same
  "Missing Content" list flags exact protocols, dosage, and treatment
  intervals as unavailable.
- Named certificates in the Korea/science section (10): ISO 13485, KFDA
  registration, CE certificate. The "Missing Content" list flags certificate
  numbers as unavailable — whether RENUVOL actually holds these specific
  certifications needs confirmation before they're named on the site.
- Illustrative case data in the cases section (11): three cases with patient
  age/gender, request, procedure count, and result. The "Missing Content"
  list flags patient case data as unavailable — these are layout
  placeholders, not real cases.
- Placeholder contact details in the footer (13): the street address reads
  "ul. Primernaya" (literally "Example Street" in Russian) — a deliberate
  placeholder, not a real address.
- The brand name in the header reads "LA BEAUTEX" above "RENUVOL," implying
  RENUVOL is a product line under a parent brand called La BEAUTEX. **Now
  confirmed** by the supplied logo file (`public/images/brand/la-beautex-logo.png`)
  — see Images below — though the parent/product-line relationship itself is
  still not written up anywhere in `content/`.

**Structural content the wireframes do supply reliably** (layout and IA, not
facts): fixed header nav (О препарate / Эффект / Протоколы / Кейсы / Для
косметолога / Контакты), the split "RENU / VOL" hero typography treatment,
a formula diagram (component names only — see `content/product-facts.md`,
still a placeholder for the actual claims), the before/after slider pattern,
the 5-attribute skin-change grid (Hydration, Density, Elasticity, Texture,
Glow), the protocol-selector tab pattern (5 patient-need categories), the
cosmetologist-facing 3-protocol-type layout plus 3 named downloadable PDFs
(protocols, presentation, partnership terms — sizes shown in the mockup,
files themselves not supplied, see Documents below), the Korea/certificates
2x2 block layout, the cases carousel, and the private-selection lead-capture
form (5 need categories).

**Correction — Section 04 is now 5 components, not 4.** The wireframe as
drawn shows 4 formula hotspots. The Instagram source library
(`public/references/instagram/01-formula-all-in-one/` and related
ingredient categories) consistently shows RENUVOL's formula as **5**
components — PDO, PN, Vitamin C, Glutathione, Hyaluronate/Sodium
Hyaluronate. This is a confirmed structural correction to the approved
wireframe, decided in project direction (not a wireframe edit — the PNGs are
static and are not modified; this note is the source of truth for the
deviation). See `docs/design-system.md` § Section 04 for the redesigned
geometry (asymmetric/orbital 5-node layout, not 5 identical cards) and
`docs/motion-spec.md`'s updated `04-formula` device entry. The wireframe
images themselves are left as-is; treat this note, not the PNG, as
authoritative for the component count.

**One direct conflict with the taste rules in `docs/motion-spec.md`:** the
hero (section 02) includes a "SCROLL TO DISCOVER" cue. Both `taste-skill` and
`scroll-craft` ban scroll cues as an AI-page tell (`docs/skills-analysis.md`
§ Cross-library agreement). This should be dropped or replaced when the hero
is actually built, per those rules — noted here so it isn't silently carried
through from the wireframe.

## Inspiration / mood references — `[CONTENT REQUIRED]`

`public/references/inspiration/` still contains only `.gitkeep`. The
wireframes specify structure and interaction, not visual style (color, type,
imagery mood) — mood references are still needed for the design-DNA
Analyze phase to produce a real palette/type/effects profile, rather than
inferring style from a grayscale wireframe alone.

## Video — supplied (needs a placement decision)

`public/video/renuvol-intro.mp4` now exists (~6.8MB, ISO Media / MP4). No
accompanying note specifies which section it targets. Based on the
wireframes' own interaction annotations, the strongest candidate is the
hero (section 02, "on scroll: oversized title shifts left/right," "subtle
mouse parallax on packshot") or the dark "wow/biotech" moment (section 07,
"slow dramatic scroll," "glow/ambient animation"). This needs a decision in
`docs/motion-spec.md` once the clip is reviewed for content and length — not
assumed here.

| Section | Video need per wireframe | Status |
|---|---|---|
| `02-hero.html` | Oversized title + parallax packshot; wireframe does not show scrub-video, uses static packshot with mouse parallax instead | `renuvol-intro.mp4` is a candidate, needs confirmation |
| `05-transformation.html` | Before/after **image** slider (drag), not video | No video need per wireframe — was assumed in the prior audit pass, corrected here |
| `07-biotech.html` | "Slow dramatic scroll," ambient glow animation around a network/globe graphic | Could use `renuvol-intro.mp4` or a generated/CSS effect; not decided |

## Images — product renders and brand logo supplied, two subdirectories still empty

| Directory | Contents | Status |
|---|---|---|
| `public/images/product/` | 5 PNGs: transparent-background product renders (vial + syringe, and a 5-vial gift box), filenames indicate they are AI-generated and/or background-removed via Photoroom (`grok-image-*-Photoroom.png`, `image-Photoroom*.png`), not confirmed studio photography | Supplied, provenance needs confirmation before treating as final packshots (see caveat below) |
| `public/images/brand/` | `la-beautex-logo.png` — the "La BEAUTEX" wordmark and wing mark (black on transparent, 382×256px) | Supplied. Confirms the parent-brand name flagged as unverified in the earlier wireframe caveat: the site's header/footer reads "La BEAUTEX" above/around "RENUVOL." Resolution is low for a logo asset (382×256px raster) — a vector (SVG) or higher-resolution source should be requested before final build if this PNG is only a reference/preview export. |
| `public/images/skin/` | `.gitkeep` only | `[CONTENT REQUIRED]` — needed for `05-transformation.html`'s before/after slider and `06-skin-changes.html` |
| `public/images/korea/` | `.gitkeep` only | `[CONTENT REQUIRED]` — needed for `10-korea-science.html` |

**Provenance caveat on the product renders:** filenames (`grok-image-…`,
`image-Photoroom (1..3).png`) suggest these are AI-generated concept renders
with backgrounds removed by Photoroom, not photographs of the physical
product. They show packaging reading "RENUVOL / PREMIUM COMETOLOGY" (note:
"COMETOLOGY," not "COSMETOLOGY" — appears consistently across the renders,
worth flagging in case it's an unintended typo in a source asset rather than
intentional branding) in a light-blue color scheme. Useful now for layout
and color-DNA extraction; should be confirmed as final, approved packaging
art (or replaced with real photography) before shipping.

## Documents — `[CONTENT REQUIRED]` (all four subdirectories still empty)

The wireframes now name specific expected documents, which sharpens this
list without supplying the files:

| Directory | Contents | Named in wireframe (section 09/10) | Status |
|---|---|---|---|
| `public/documents/protocols/` | `.gitkeep` only | "Протоколы" PDF, ~2.3MB | `[CONTENT REQUIRED]` |
| `public/documents/certificates/` | `.gitkeep` only | ISO 13485, KFDA registration, CE certificate (each a separate PDF) | `[CONTENT REQUIRED]` — **decision:** do not name these specific certificates anywhere in the public UI until the actual documents exist here. Build Section 10's document area as a neutral "Документы и регистрационные материалы" placeholder with `[CONTENT REQUIRED: verified certificates]`, not fake ISO/KFDA/CE cards. See `docs/claims-verification.md` row 21. |
| `public/documents/presentations/` | `.gitkeep` only | "Презентация" PDF, ~5.1MB | `[CONTENT REQUIRED]` |
| `public/documents/partnership/` | `.gitkeep` only | "Условия сотрудничества" PDF, ~1.6MB | `[CONTENT REQUIRED]` |

## Instagram reference library — image classification

`public/references/instagram/` (added directly to `main`) is a 19-category
source library of RENUVOL/Metabiomed/INCUBE Instagram marketing material,
with a `README.md` (plus `README-BATCH2.md`/`README-BATCH3.md`) and per-
category `source.md` files. Per project policy (`docs/claims-verification.md`
§ Source-of-truth hierarchy), this library ranks below all primary/verified
sources and is never itself evidence — it may inform positioning, visual
language, and terminology only.

Every image is classified below as one of `FINAL-CANDIDATE`,
`REFERENCE-ONLY`, `REQUIRES-PROVENANCE-CHECK`, or `DO-NOT-USE`. **Only
`FINAL-CANDIDATE` assets may be used in the public website.** No image in
this library currently qualifies — the strongest candidates
(`04-product-visuals`) are `REQUIRES-PROVENANCE-CHECK`, pending confirmation
of rights and whether they are real photography or renders, before they can
be promoted.

Images actually opened and visually inspected this session are marked
*(inspected)*; the rest are classified from the category's own `source.md`
and filename, and default to `REQUIRES-PROVENANCE-CHECK` unless the
category's stated content (e.g. embedded clinical percentages, named
individuals) makes a stronger classification clearly safe to assign without
inspection — those cases are noted as "expected," to be confirmed on actual
review before use.

### 01 — formula-all-in-one

| File | Status | Note |
|---|---|---|
| `formula-5-components-overview.jpg` *(inspected)* | REFERENCE-ONLY | RENUVOL-branded infographic with Instagram-style hook copy ("Почему RENUVOL продает сам себя?"); useful for Section 04's 5-component visual direction, not a shippable web asset as-is |
| `five-forces-bottle-visual.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `five-key-ingredients-intro.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `formula-components-plus-results.jpg` | REQUIRES-PROVENANCE-CHECK | Likely carries result/effect claims per category name — expect DO-NOT-USE pending inspection |
| `formula-skin-layer-5-components.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `formula-symphony-5-components-a.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `formula-symphony-5-components-b.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `ingredient-role-list.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |

### 02 — events-credibility

| File | Status | Note |
|---|---|---|
| `imcas-world-congress-2026.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; `source.md` flags IMCAS participation/association as needing verification before any factual claim |

### 03 — pdo-positioning

| File | Status | Note |
|---|---|---|
| `pdo-vs-plla-positioning.jpg` *(inspected)* | DO-NOT-USE (as-is) | Carries the blocked comparative claim ("works as long as PLLA, without the risks") baked into the image text — see `docs/claims-verification.md` row 4. The underlying packshot photography, isolated from the text, would still need `REQUIRES-PROVENANCE-CHECK` |

### 04 — product-visuals

| File | Status | Note |
|---|---|---|
| `renuvol-packshot-glow.jpg` *(inspected)* | REQUIRES-PROVENANCE-CHECK | Clean packshot, no overlaid claims — the strongest candidate in the library, but real-photo-vs-render and usage rights are unconfirmed |
| `renuvol-packshot-glow-variant.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; same caveats likely apply as the variant above |

### 05 — incube-cubrix-technology

| File | Status | Note |
|---|---|---|
| `cubrix-mofac-incube-diagram.jpg` *(inspected)* | REFERENCE-ONLY | Appears to be INCUBE/LABINCUBE's own corporate/technical material (third-party sub-brand), not a RENUVOL asset — visual language (dark navy, molecular lattice) only |
| `incube-preserves-vitamin-c-activity.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; `source.md` flags "100% preserved activity" as high-risk — see claims row 11 |
| `incube-vitc-glutathione-capsule-visual.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `vitamin-c-protected-by-incube-nobel-claim.jpg` | DO-NOT-USE | Filename and category both indicate Nobel-linked claim content — treat as DO-NOT-USE without needing further inspection, per the blanket Nobel/Yaghi exclusion (claims rows 1–3) |

### 06 — brand-visual-language

| File | Status | Note |
|---|---|---|
| `doctor-holding-renuvol.jpg` *(inspected)* | REFERENCE-ONLY | Visible AI-generation tell: the vial's "PREMIUM PDO BOOSTER" label is mirrored/reversed. Tone/composition reference only, not a usable photo |

### 07 — incube-credibility

| File | Status | Note |
|---|---|---|
| `nobel-medal-reference.jpg` *(inspected)* | DO-NOT-USE | Nobel medal imagery — see claims row 1 |
| `omar-yaghi-tribute.jpg` *(inspected)* | LEGAL-REVIEW / DO-NOT-USE until cleared | Named, identifiable real individual — see claims row 2 |

### 08 — pdo-benefits-safety

| File | Status | Note |
|---|---|---|
| `pdo-size-time-experience.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; likely carries the 30–60 μm / 6–8 month / "30+ years" claims as image text — see claims row 12 |
| `pdo-benefits-safety-claims.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; filename indicates claim content |

### 09 — clinical-evidence

| File | Status | Note |
|---|---|---|
| `clinical-hydration-35-2-102-8.jpg` *(inspected)* | DO-NOT-USE | Exact hydration percentages baked into the image as headline text — see claims row 7 |
| `clinical-data-intro.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `clinical-metrics-elasticity-fullness.jpg` | DO-NOT-USE (expected) | Filename embeds the specific claim figures — see claims row 10; treat as DO-NOT-USE pending inspection confirming the same template as the hydration asset |
| `clinical-pigmentation-34-8.jpg` | DO-NOT-USE (expected) | Same reasoning — see claims row 8 |
| `clinical-pores-roughness.jpg` | DO-NOT-USE (expected) | Same reasoning — see claims row 9 |

### 10 — incube-brand-world

| File | Status | Note |
|---|---|---|
| `labincube-incube-brand-board.jpg` *(inspected)* | REFERENCE-ONLY | Third-party sub-brand's own brand board (LABINCUBE/INCUBE); confirms the navy/orange/white visual language noted in `README.md`, not a RENUVOL asset |

### 11 — manufacturing-metabiomed

| File | Status | Note |
|---|---|---|
| `metabiomed-white-pdo-manufacturing.jpg` *(inspected)* | REQUIRES-PROVENANCE-CHECK | Appears to be authentic cleanroom/manufacturing photography (no AI tells observed), but is a third-party manufacturer's facility — needs explicit rights confirmation before use on RENUVOL's own site, and also displays a "first in the world" claim as caption text (claims row 13) that would need removing even if the photo itself is cleared |
| `metabiomed-pdo-lab-visual.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `metabiomed-renuvol-quality-cta.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `second-factory-expansion.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; likely carries investment/floor-area figures as text — claims row 19 |
| `vertical-integration-process.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; likely carries vertical-integration claim text — claims row 20 |

### 12 — manufacturer-credibility

| File | Status | Note |
|---|---|---|
| `world-class-300-patents.jpg` *(inspected)* | DO-NOT-USE (as-is) | Otherwise-authentic-looking award-ceremony photo, but "70+ патентов" and "120+ стран" are baked into the image as overlay text — cannot be used even if the underlying photo and award were independently confirmed, without redoing the graphic. See claims rows 16–18 |
| `renuvol-manufacturer-credentials-summary.jpg` | DO-NOT-USE (expected) | Filename and `source.md` both indicate a claims-summary graphic (35 years, 70+ patents, 120+ countries, World Class 300) — same treatment expected as the inspected file above |

### 13 — founder-story

| File | Status | Note |
|---|---|---|
| `seok-song-oh-founder-story.jpg` *(inspected)* | REFERENCE-ONLY | Visible AI-generation tell: garbled product label text ("CINNAMAM PDO DECAYER"); narrative voice/tone reference only |
| `founder-restart-story.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `metabiomed-1993-origin-story.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |

### 14 — pdo-mechanism

| File | Status | Note |
|---|---|---|
| `pdo-collagen-stimulation.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; mechanism claim — claims row 27 |
| `pdo-lifting-foundation-visual.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; mechanism claim — claims row 27 |

### 15 — component-synergy

| File | Status | Note |
|---|---|---|
| `five-component-synergy-map.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; potentially useful for Section 04's "5 components, one system" concept diagram, subject to inspection |
| `pdo-vitamin-c-collagen-protection.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `pn-recovers-pdo-builds.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `pn-vitamin-c-restoration-protection.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `vitc-gluta-incube-glow-youth.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `vitc-gluta-mutual-restoration.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `vitc-pdo-collagen-protection.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |

### 16 — pn-mechanism

| File | Status | Note |
|---|---|---|
| `pn-three-effects.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; `source.md` flags anti-inflammatory/regeneration claims — claims rows 22, 25 |
| `pn-before-after-cells.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `pn-cell-restoration-visual.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |

### 17 — vitamin-c

| File | Status | Note |
|---|---|---|
| `vitamin-c-pigmentation-claim.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; `source.md` singles out cancer-prevention-adjacent wording in this category as especially high-risk — claims row 23 |
| `vitamin-c-antioxidant-free-radicals.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `vitamin-c-four-effects.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `vitamin-c-protects-collagen.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |

### 18 — hyaluronate

| File | Status | Note |
|---|---|---|
| `hyaluronate-ideal-medium.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `hyaluronate-activates-components.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `hyaluronate-supports-pdo-environment.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `hyaluronate-three-properties.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `sodium-hyaluronate-instant-hydration.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; "instant hydration" is an effect-timing claim — claims row 29 |

### 19 — glutathione

| File | Status | Note |
|---|---|---|
| `glutathione-antioxidant-hero.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected |
| `glutathione-three-actions.jpg` | REQUIRES-PROVENANCE-CHECK | Not inspected; `source.md` flags detoxification/depigmenting claims — claims rows 24, 26 |

### Existing project assets (non-Instagram)

| Asset | Status | Used on the site? | Note |
|---|---|---|---|
| `public/images/brand/la-beautex-logo.png` | FINAL-CANDIDATE | **Yes** — header and footer | Supplied directly by the project owner. Low resolution (382×256px); a vector/higher-res source is still worth requesting, and the black artwork is inverted by CSS on the dark scenes |
| `public/video/renuvol-intro.mp4` | FINAL-CANDIDATE (owner-supplied, owner-directed) | **Yes** — source for the hero | Reviewed frame by frame against the claims policy: it carries no blocked claim as on-screen text. It does end on a **METABIOMED end-card**, which the hero deliberately stops before (`data-rv-end="39.4"`) — a third-party manufacturer mark is not something to surface without a rights decision |
| `public/video/renuvol-hero-scrub.{webm,mp4}`, `-mobile.{webm,mp4}`, `renuvol-hero-poster.jpg` | FINAL-CANDIDATE (derived) | **Yes** | Re-encodes of the above for scrubbing (dense GOP) plus a poster frame. Regeneration commands are in `docs/tilda-integration.md` |
| `public/images/product/renuvol-vial.webp` | FINAL-CANDIDATE (derived) | **Yes** — centre of Section 04 | A still cut from the owner-supplied film. Chosen over the supplied renders because its packaging text is clean and legible |
| `public/images/product/*.png` (the 5 original renders) | **DO-NOT-USE** as public assets | No | Beyond the AI-generation/Photoroom provenance already noted, the label text is visibly garbled and inconsistent across them ("PREMIUM COMETOLOGY", "PREMIUM COME TOLOGY"), which is disqualifying at any size a viewer could read. They also show composition figures (`100mg / Vial`, `PDO 35mg, PN 8mg`) that are unverified — see `docs/claims-verification.md` row 35. Kept in the repo as reference |
| `public/fonts/*.woff2` (4 files) | FINAL-CANDIDATE | **Yes** | Self-hosted Onest + Prata, Latin and Cyrillic subsets only, ~92KB total |
| `public/references/wireframe/*.png` (3 files) | Structural reference only, not a site asset | No | Internal planning material; never shipped. See `CORRECTIONS.md` beside them |

**Three different label texts appear across the supplied product assets** —
"PREMIUM PDO BOOSTER" (film and carton), "PREMIUM PDO COLLAGEN BOOSTER"
(film titling) and "PREMIUM COMETOLOGY" (renders). Only the first is used on
the site, via the film still. Which is the approved packaging copy needs
confirming before any packaging imagery ships.

## Content copy — `[CONTENT REQUIRED]` (all six files still placeholders)

Unchanged by the new assets — the wireframes supply layout, not approved
copy (see caveat above). `content/placeholders.md` was independently updated
with an explicit "Missing Content" list (verified ingredient list, clinical
statistics, patient case data, certificate numbers, manufacturer details,
exact protocols, dosage, treatment intervals, contraindications) and a
`[CONTENT REQUIRED]` convention for the frontend, which this audit adopts
throughout.

| File | Current state | Status |
|---|---|---|
| `content/site-copy.md` | Placeholder note only | `[CONTENT REQUIRED]` |
| `content/product-facts.md` | Placeholder note only | `[CONTENT REQUIRED]` |
| `content/protocols.md` | Placeholder note only | `[CONTENT REQUIRED]` |
| `content/cases.md` | Placeholder note only | `[CONTENT REQUIRED]` |
| `content/certificates.md` | Placeholder note only | `[CONTENT REQUIRED]` |

No product claims, certifications, statistics, or testimonials may be
invented to fill these in (`CLAUDE.md` § Rules), including copying the
wireframe's illustrative stat, protocol intervals, certificate names, or
case data — they stay blocked until real, confirmed content is supplied.

## Section-by-section dependency map

| # | Section | Layout reference | Asset/content still needed |
|---|---|---|---|
| 01 | `header.html` | Wireframe 01 | `images/brand/` satisfied (logo supplied) |
| 02 | `hero.html` | Wireframe 01 | `site-copy.md`; video placement decision (see Video above); drop the "scroll to discover" cue per taste rules |
| 03 | `manifesto.html` | Wireframe 01 | `site-copy.md`; the 93% stat is blocked (`docs/claims-verification.md` row 32) — use neutral copy or `[CONTENT REQUIRED]` |
| 04 | `formula.html` | Wireframe 01 (corrected: 5 components, not 4 — see `docs/design-system.md`) | `product-facts.md` (component names known, claims/composition not verified); `images/product/` satisfied |
| 05 | `transformation.html` | Wireframe 02 | `images/skin/` before/after pairs (not video, corrected above) |
| 06 | `skin-changes.html` | Wireframe 02 | `images/skin/`, `product-facts.md` |
| 07 | `biotech.html` | Wireframe 02 | `product-facts.md`; ambient/video treatment decision |
| 08 | `protocol-selector.html` | Wireframe 02 | `protocols.md`, `documents/protocols/`; wireframe's specific intervals blocked (`docs/claims-verification.md` row 30) |
| 09 | `cosmetologists.html` | Wireframe 03 | `documents/presentations/`, `documents/partnership/`, `documents/protocols/` |
| 10 | `korea-science.html` | Wireframe 03, but see the safe-interim direction in `docs/design-system.md` § Section 10 | `images/korea/`; named certifications and manufacturer figures blocked (`docs/claims-verification.md` rows 13–21) — use neutral "Документы и регистрационные материалы" + `[CONTENT REQUIRED]` instead |
| 11 | `cases.html` | Wireframe 03, but see `docs/design-system.md` § Section 11 | `cases.md`, `images/skin/`; wireframe's illustrative cases are `DO-NOT-USE` (`docs/claims-verification.md` row 31) — ship as `[CONTENT REQUIRED]` placeholders, not fabricated cases |
| 12 | `private-selection.html` | Wireframe 03 | `product-facts.md`, `documents/partnership/`; `images/product/` satisfied |
| 13 | `footer.html` | Wireframe 03 | `images/brand/` satisfied (logo supplied); real contact/legal copy still needed (wireframe's address is a placeholder) |

## Summary

Layout and interaction structure for all 13 sections is now supplied via the
three wireframes, and product renders, a headline video, and the brand logo
give the design and motion phases real material to start from. This
unblocks `docs/implementation-plan.md` Phase 1 (Design DNA extraction). It
does **not** unblock section content drafting (Phase 2): every fact,
statistic, protocol detail, certificate, case, and piece of contact
information the wireframes display is illustrative only, and `content/*.md`
remain placeholders. Skin imagery (`images/skin/`), Korea imagery
(`images/korea/`), and all four document subdirectories remain empty and
`[CONTENT REQUIRED]`.

The Instagram reference library added a large amount of positioning and
visual-language material, none of which is currently `FINAL-CANDIDATE` (see
§ Instagram reference library above) — the strongest image candidates are
`REQUIRES-PROVENANCE-CHECK`, and a meaningful subset is `DO-NOT-USE` outright
(Nobel/Yaghi material, and several clinical/credibility graphics with
unverified statistics baked into the image text). Every claim surfaced by
this library is tracked in `docs/claims-verification.md`, which is the
authoritative record of what may and may not be published, and supersedes
any impression given by the wireframe's own illustrative copy (the 93% stat,
protocol intervals, named certificates, and case data called out above).
Section 04 has also been corrected from 4 to 5 formula components per the
Instagram library's consistent formula composition — see `docs/design-system.md`.
