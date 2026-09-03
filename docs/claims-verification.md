# Claims Verification

Status: living ledger. Every claim, statistic, or credibility signal found in
`public/references/instagram/` (or any other reference material) that could
plausibly end up in site copy gets one row here before it is ever considered
for `content/*.md`. Nothing in this file is approved for the public site
until its status is `VERIFIED` and its "Allowed on website" column says yes.

## Source-of-truth hierarchy

Per project policy, claims are trusted in this order, highest first:

1. `content/product-facts.md`
2. `content/certificates.md`
3. Primary manufacturer / clinical documents
4. Other verified project documents
5. `public/references/instagram/` (positioning/visual/terminology ideas only)
6. Any other visual reference (wireframes, mood boards) — visual direction only

`public/references/instagram/` and the wireframes sit at the bottom of this
hierarchy. They may inform positioning, visual language, content themes,
storytelling ideas, and terminology candidates. They are never, on their own,
sufficient to publish a claim as fact.

## Statuses

- **VERIFIED** — confirmed against a primary source at or above tier 3; safe
  to publish as written (subject to normal copy review).
- **UNVERIFIED** — plausible, sourced only from Instagram/wireframe material;
  blocked until a primary source is supplied.
- **LEGAL-REVIEW** — blocked for reasons beyond fact-checking (third-party
  name/likeness, IP, endorsement implication); needs rights clearance, not
  just a citation.
- **DO-NOT-USE** — excluded from the public site outright until further
  notice, regardless of future verification, per explicit project decision.
- **VISUAL-REFERENCE-ONLY** — the underlying material may inform mood/style
  direction but the specific wording/imagery itself is never published.

## Claims ledger

| # | Claim | Source | Status | Verification needed | Allowed on website | Safe interim wording |
|---|---|---|---|---|---|---|
| 1 | Nobel medal imagery / "Nobel technology" wording | `07-incube-credibility/nobel-medal-reference.jpg` | **DO-NOT-USE** | Factual link between INCUBE/CUBRIX and any Nobel-recognized work, plus rights to reference the Nobel name/imagery in advertising | No | Omit entirely; do not reference "Nobel" in any form (UI, copy, metadata, alt text, SEO, structured data) |
| 2 | Prof. Omar M. Yaghi's name, likeness, or tribute imagery | `07-incube-credibility/omar-yaghi-tribute.jpg` | **LEGAL-REVIEW** (also DO-NOT-USE until cleared) | Explicit rights/licensing confirmation to use a named, identifiable individual's name and photo in marketing; confirmation of the actual nature of any affiliation | No | Omit entirely — do not name or depict this individual anywhere on the public site |
| 3 | Implied Nobel endorsement of RENUVOL or INCUBE | Composite inference from items 1–2 plus `05-incube-cubrix-technology` (MOF framing) | **DO-NOT-USE** | Same as items 1–2 | No | Do not construct or imply this connection in any copy, even indirectly ("Nobel-winning science," "award-winning molecular technology," etc.) |
| 4 | "RENUVOL — PDO that works as long as PLLA, without the risks, more comfortable for the patient" | `03-pdo-positioning/pdo-vs-plla-positioning.jpg` | **UNVERIFIED** | Head-to-head clinical or literature comparison vs. PLLA from a primary source | No | "Формула RENUVOL объединяет несколько компонентов в одном продукте." (neutral, no comparison) |
| 5 | "Works as long as / safer than / without the risks of PLLA" (general comparative framing) | `03-pdo-positioning/source.md` | **UNVERIFIED** | Same as #4 | No | Describe RENUVOL on its own terms; no named-competitor or named-material comparison |
| 6 | "Best PDO," "number one," "world first" (any superlative) | Multiple (`13-founder-story`, `11-manufacturing-metabiomed`) | **UNVERIFIED** | Independent, citable substantiation for any superlative claim | No | Neutral descriptive language only |
| 7 | Hydration up to 35.2% (up to 102.8% in some cases) | `09-clinical-evidence/clinical-hydration-35-2-102-8.jpg` | **UNVERIFIED** | Underlying study: protocol, sample size, methodology, publication/report | No, and not as a chart/badge/animated counter | `[CONTENT REQUIRED: verified clinical data]` |
| 8 | Pigmentation reduction 34.8% | `09-clinical-evidence/clinical-pigmentation-34-8.jpg` | **UNVERIFIED** | Same as #7 | No | `[CONTENT REQUIRED: verified clinical data]` |
| 9 | Pore volume / roughness reduction (exact %) | `09-clinical-evidence/clinical-pores-roughness.jpg` | **UNVERIFIED** | Same as #7 | No | `[CONTENT REQUIRED: verified clinical data]` |
| 10 | Elasticity +13.26% / fullness +21.73% | `09-clinical-evidence/clinical-metrics-elasticity-fullness.jpg` | **UNVERIFIED** | Same as #7 | No | `[CONTENT REQUIRED: verified clinical data]` |
| 11 | "100% Vitamin C activity preserved" via INCUBE | `05-incube-cubrix-technology/incube-preserves-vitamin-c-activity.jpg` | **UNVERIFIED** | Stability study or manufacturer technical documentation | No | "участвует в комплексной формуле" / "антиоксидантный компонент" (no preservation percentage) |
| 12 | PDO particle size 30–60 μm, duration 6–8 months, "30+ years in surgery" | `08-pdo-benefits-safety/pdo-size-time-experience.jpg` | **UNVERIFIED** | Manufacturer technical spec sheet; independent confirmation of the "30+ years" framing as applied to this product | No | Omit exact figures; general category description only if needed |
| 13 | METABIOMED: "only Korean / first-in-world" uncolored white PDO manufacturer | `11-manufacturing-metabiomed/metabiomed-white-pdo-manufacturing.jpg` | **UNVERIFIED** | Independent market/industry confirmation of the "first/only" claim | No | Omit the superlative; may describe the product attribute (white/uncolored) without the ranking claim, once that attribute itself is confirmed |
| 14 | METABIOMED 1993 origin story / founder biography (Seok-Song Oh) | `13-founder-story/*` | **UNVERIFIED**; also note the portrait image shows AI-generation tells | Direct confirmation from the manufacturer of the biographical narrative; separately, confirmation the imagery is authentic if any photo is to be used | No | Omit founder narrative from public site for now; may remain in internal notes |
| 15 | "35 years of quality" | Implied by #14 (1993 origin) | **UNVERIFIED** | Same as #14 | No | Omit |
| 16 | 70+ patents | `12-manufacturer-credibility/world-class-300-patents.jpg` | **UNVERIFIED** | Patent registry confirmation or manufacturer documentation | No | Omit |
| 17 | 120+ countries (distribution reach) | `12-manufacturer-credibility/*` | **UNVERIFIED** | Manufacturer/distribution documentation | No | Omit |
| 18 | "World Class 300" recognition | `12-manufacturer-credibility/world-class-300-patents.jpg` | **UNVERIFIED** (photo itself appears to be an authentic award-ceremony photo, which is a *weaker* form of evidence than primary documentation, not sufficient alone) | Confirmation the award applies to the entity/product line relevant to RENUVOL, plus documentation | No | Omit |
| 19 | Second factory investment amount / floor area | `11-manufacturing-metabiomed/second-factory-expansion.jpg` | **UNVERIFIED** | Manufacturer documentation | No | Omit; may use "Производственная культура" as a general, number-free descriptor |
| 20 | Full vertical integration / own PDO powder / exact R&D capabilities | `11-manufacturing-metabiomed/vertical-integration-process.jpg` | **UNVERIFIED** | Manufacturer documentation | No | "Технологический подход" / "Исследовательская база" (general, no specificity claimed) |
| 21 | ISO 13485 / KFDA registration / CE certificate (named certificates) | Wireframe section 10 (not from Instagram — carried over from the wireframe mockup) | **UNVERIFIED** | Actual certificate documents in `public/documents/certificates/` (currently empty) | No — remove specific certificate names from public UI | "Документы и регистрационные материалы" + `[CONTENT REQUIRED: verified certificates]` |
| 22 | Anti-inflammatory effect (PN) | `16-pn-mechanism/source.md` | **UNVERIFIED** | Clinical/regulatory substantiation | No | "поддерживает качество кожи" |
| 23 | Cancer-prevention-adjacent wording (Vitamin C) | `17-vitamin-c/source.md` | **UNVERIFIED**, high sensitivity | Authoritative medical/regulatory source; likely never appropriate for a cosmetic product regardless of sourcing | No | "антиоксидантный компонент" |
| 24 | Detoxification claims (glutathione) | `19-glutathione/source.md` | **UNVERIFIED** | Clinical/regulatory substantiation | No | "антиоксидантный компонент" |
| 25 | Cellular regeneration claims (PN, PDO) | `14-pdo-mechanism/*`, `16-pn-mechanism/*` | **UNVERIFIED** | Clinical/regulatory substantiation | No | "участвует в комплексной формуле" |
| 26 | Pore-narrowing / pigmentation-treatment claims | `16-pn-mechanism/*`, `19-glutathione/*` | **UNVERIFIED** | Clinical/regulatory substantiation | No | "поддерживает качество кожи" |
| 27 | Guaranteed collagen stimulation / guaranteed lifting (PDO) | `14-pdo-mechanism/pdo-collagen-stimulation.jpg`, `pdo-lifting-foundation-visual.jpg` | **UNVERIFIED** | Clinical/regulatory substantiation; "guaranteed" wording is separately inappropriate for a cosmetic claim regardless of evidence | No | "используется как компонент формулы" |
| 28 | Exact degradation duration (PDO) | `08-pdo-benefits-safety/*` | **UNVERIFIED** | Manufacturer technical documentation | No | Omit exact timing |
| 29 | Exact clinical effect timing (any ingredient) | Various | **UNVERIFIED** | Study documentation | No | Omit exact timing |
| 30 | Protocol intervals: "3–4 procedures, 2–4 week intervals, maintenance every 2–3 months" | Wireframe section 08 (not Instagram — wireframe mockup copy) | **UNVERIFIED** | Manufacturer/clinical protocol documentation | No | `[CONTENT REQUIRED: verified protocol]` |
| 31 | Three illustrative case studies (patient age/gender, request, procedure count, result) | Wireframe section 11 (mockup copy) | **DO-NOT-USE** as written — fabricated illustrative data, not real cases | Real, consented before/after cases and outcome data | No | `[CONTENT REQUIRED: approved before/after cases]` / `[CONTENT REQUIRED: verified study outcomes]` |
| 32 | "93% of specialists report improved skin quality after 2 procedures" (LA BEAUTEX internal research, 2023) | Wireframe section 03 (mockup copy) | **UNVERIFIED** | The cited internal research itself, made available for review | No | Omit or replace with a non-numeric line once real copy exists |
| 33 | Parent-brand relationship: RENUVOL is a product line under "La BEAUTEX" | `public/images/brand/la-beautex-logo.png` (confirms the wordmark exists) + wireframe header | **VERIFIED** (wordmark itself) / **UNVERIFIED** (the exact corporate relationship wording) | A short, approved description of how La BEAUTEX, RENUVOL, METABIOMED, LABINCUBE, and INCUBE relate to each other | Logo: yes. Relationship copy: not until written and approved | Use the logo; do not write out the brand-family relationship until confirmed |
| 34 | Product packaging label reads "PREMIUM COMETOLOGY" on some renders vs. "PREMIUM PDO BOOSTER" on Instagram assets | `public/images/product/*` vs. `public/references/instagram/04-product-visuals/*` | **UNVERIFIED** — inconsistency, not a claim per se | Confirm which label text is the approved final packaging copy; "COMETOLOGY" may be an unintended typo | N/A (asset-consistency issue, not a copy claim) | Flag for design/brand review before any packaging render ships |

## Adding new claims

Any new claim surfaced from future reference material (additional Instagram
batches, new manufacturer documents, etc.) gets a new row here before it is
considered for `content/*.md`, using the same status vocabulary. Do not skip
this file and write a claim directly into `content/*.md`.
