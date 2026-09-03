# Skills Analysis

Status: planning document. No design or implementation has started. This analysis
inspects the four external expert libraries under `references/` (see
`CLAUDE.md` § External expert libraries), the current `content/` and `public/`
state, and the three wireframe slots, and decides what each library
contributes to the RENUVOL build.

## Inputs inspected

- `CLAUDE.md` — stack (Vite, vanilla HTML/CSS/JS, no framework), structure, and
  the external-library usage rules.
- `public/references/wireframe/` — **empty**, only a `.gitkeep`. No wireframes
  have been supplied yet, despite three being expected. See `docs/asset-audit.md`.
- `content/*.md` — all six files are placeholders (`site-copy.md`,
  `product-facts.md`, `protocols.md`, `cases.md`, `certificates.md`,
  `placeholders.md`). No real copy or facts exist yet.
- `public/images/*`, `public/video/`, `public/documents/*` — all empty.
- `references/design-dna`, `references/anthropics-skills`,
  `references/taste-skill`, `references/scroll-craft` — read in full below.

## Constraint that shapes every decision below

RENUVOL is a **Vite + vanilla HTML/CSS/JS** project with an explicit
minimal-dependency rule (`CLAUDE.md`). All four libraries assume, to varying
degrees, a React/Tailwind/GSAP/Motion stack, a Node/Playwright/ffmpeg toolchain,
or both. None of that tooling is adopted as a project dependency. What we take
from each library is its **methodology and taste rules**, re-implemented in
vanilla CSS/JS. Where a library's own scripts are genuinely useful as one-off
dev-time tools (not shipped in `package.json`), that is called out explicitly.

## `references/design-dna`

**What it is:** a 3-phase workflow (Structure → Analyze → Generate) for turning
visual references into a machine-readable "Design DNA" JSON across three
dimensions: design system (tokens), design style (qualitative feel), and
visual effects (Canvas/WebGL/scroll/etc.).

**Relevant when:** we have real reference images/screenshots/URLs to analyze
(the wireframes, once supplied, and any brand/mood references in
`public/references/inspiration/`, currently empty).

**Adopt:**
- The **three-dimension schema** (`references/schema.md`) as the shape of
  `docs/design-system.md` once it's written: measurable tokens, qualitative
  style, and visual-effects notes, kept separate rather than mixed together.
- The **deterministic color measurement** approach (`scripts/measure-colors.mjs`
  / `scripts/verify.mjs`) as an optional, ad hoc dev-time check — run locally
  via `node` against the skill's own `scripts/` directory, never added to this
  project's `package.json`. Useful once real wireframes/brand references exist,
  to avoid perceived-color drift (e.g. a brand color read as a "familiar"
  hex instead of its actual value).
- The Analyze → Generate flow as the general shape of "reference in, token
  system out, implementation second" — matches how `docs/design-system.md`
  should be produced once wireframes land.

**Do not adopt:** nothing to reject here; the skill has no framework
assumptions baked into its output format (the JSON is portable), only its
optional measurement scripts need Node/npm, which stays outside the shipped app.

**Blocked on:** real wireframe/reference images. With zero references currently
available, there is nothing to extract DNA from yet.

## `references/anthropics-skills`

**What it is:** the full Anthropic example-skills library (22+ skills spanning
document generation, design, dev tooling, comms). Only a subset is relevant to
a marketing site build.

**Selected skills:**
- **`frontend-design`** — the primary design-process skill for this project:
  ground design in the subject, treat the hero as a thesis, make typography
  carry personality, use structural devices (numbering, eyebrows, dividers)
  only when they encode something true about the content, use motion
  deliberately, and run a brainstorm → plan → critique → build → critique-again
  process rather than shipping a first draft. Its named "AI-default" looks
  (warm cream + serif + terracotta; near-black + one acid accent; broadsheet
  hairline-and-serif) are useful as an explicit checklist of defaults to avoid
  reaching for by default.
- **`webapp-testing`** — for QA once sections are built: drive the dev server
  with Playwright to screenshot rendered pages and check console errors. Used
  as an ad hoc tool (`npx playwright` or similar, run outside `package.json`),
  not a project dependency.
- **`brand-guidelines`** — relevant once RENUVOL supplies real brand assets
  (logo, palette, type). Partially actionable now: the logo has landed
  (`public/images/brand/la-beautex-logo.png`, confirming the parent brand is
  "La BEAUTEX"), but palette and type references have not, and
  `content/product-facts.md` is still a placeholder, so this skill's fuller
  use is still blocked.

**Not selected (out of scope for this project):**
- `docx`, `pptx`, `pdf`, `xlsx` — document-format skills, not site-build tools.
  May become relevant later only if RENUVOL asks for the `docs/` planning
  material or `public/documents/presentations/` content authored as Office
  files, which hasn't been requested.
- `canvas-design`, `theme-factory`, `algorithmic-art`, `slack-gif-creator`,
  `internal-comms`, `mcp-builder`, `skill-creator`, `doc-coauthoring`,
  `academy-guide`, `discernment-nudge`, `claude-api`, `web-artifacts-builder` —
  no bearing on a static marketing site.

## `references/taste-skill`

**What it is:** a bundle of "anti-slop" frontend skills. The primary one,
`design-taste-frontend` (`skills/taste-skill/SKILL.md`), is the most detailed
and directly applicable: brief inference, three tunable "dials"
(`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`), a design-system
selection map, and a long list of hard layout/typography/color/AI-tell rules,
capped by a mandatory pre-flight checklist.

**Adopt (taste rules, stack-agnostic):**
- The **brief-inference discipline**: state a one-line "design read" (page
  kind, audience, vibe, aesthetic family) before making design decisions, and
  ask at most one clarifying question when genuinely ambiguous.
- The **three dials** as a planning vocabulary for `docs/design-system.md` and
  `docs/motion-spec.md`, even without the skill's own preset table (RENUVOL is
  a premium aesthetic/medical-adjacent consumer brand, not one of the listed
  presets — dial values should be reasoned from the brief once real content
  exists, not defaulted).
- The **hard layout rules** (Section 4.7): hero fits in the initial viewport,
  max 2-line headline, nav on one line, no more than 2 consecutive
  image/text-split sections, eyebrow budget (max 1 per 3 sections), no
  duplicate-intent CTAs, button-contrast and wrap checks.
- The **AI-tells list** (Section 9): no em dash anywhere visible, no section
  counters (`01/06`), no scroll cues, no fake statistics, no "Jane Doe" filler
  names, no filler verbs ("elevate", "seamless", "revolutionize"). Directly
  enforceable regardless of stack and directly relevant to RENUVOL's rule
  against fabricated claims.
- The **pre-flight checklist** (Section 14) as a literal QA gate before any
  section is considered done.

**Explicitly reject (stack mismatch):**
- Section 3 (Default Architecture): React/Next.js, Tailwind v4, Motion
  (Framer Motion), Zustand/Jotai, Phosphor/Hugeicons icon packages. None of
  this applies — RENUVOL ships hand-written vanilla CSS/JS per `CLAUDE.md`.
- Section 5.A/5.B GSAP `ScrollTrigger` code skeletons — useful as **behavior
  specifications** (pin-at-top, scrub-with-lerp, sticky-stack mechanics) but
  must be re-implemented with native web APIs (IntersectionObserver, CSS
  `position: sticky`, `animation-timeline: scroll()` where supported, plain
  `requestAnimationFrame`), not the GSAP/Motion libraries named in the code.
- Section 2.A's official design-system table (Fluent, Material, Carbon, Primer,
  etc.) — none apply; RENUVOL has no existing design system to conform to.

**Other bundled skills in this repo** (`brandkit`, `brutalist-skill`,
`gpt-tasteskill`, `image-to-code-skill`, `imagegen-frontend-mobile/web`,
`minimalist-skill`, `output-skill`, `redesign-skill`, `soft-skill`,
`stitch-skill`, `taste-skill-v1`) are single-aesthetic or single-purpose
variants (image generation direction, a v1 predecessor, an "always redesign"
skill, etc.). None fit RENUVOL better than the general `taste-skill` above;
noted for completeness, not selected.

## `references/scroll-craft`

**What it is:** a full scroll-driven-site build pipeline (interview → grammar
→ asset generation via `kie.ai` → HTML build → Playwright-based verification),
packaged as a Claude Code plugin with its own JS/CSS engine
(`engine/scrollcraft.js`/`.css`).

**Explicitly reject (tooling):**
- The `kie.ai` asset-generation pipeline (`scripts/kie.mjs`) — paid, external,
  and unnecessary: `CLAUDE.md` forbids fabricated content, and real
  product/brand photography and video are expected from RENUVOL, not
  generated. `public/video/` and `public/images/*` are empty because real
  assets haven't been supplied yet, not because they need to be generated.
- The `scrollcraft.js`/`.css` engine itself, its `ffmpeg`/Playwright/Node build
  scripts, and the `/plugin` install flow — a separate toolchain outside this
  project's Vite setup and its minimal-dependency rule. (`/plugin` is also not
  available in this session's environment.)
- The plugin's own interview-and-report workflow (`BRIEF.md`, fingerprint
  registry) — process scaffolding for a different delivery model, not needed
  here since this project already has its own docs/ structure.

**Adopt (the device kit and taste floor, re-implemented in vanilla JS/CSS):**
- The **device vocabulary** (`references/devices.md`): `scrub` (video playhead
  driven by scroll position), `pin` (sticky stage, content advances via cue
  windows), `pan` (vertical scroll → lateral rail travel), `reveal`
  (`clip-path` wipe), `kinetic` (line-by-line heading assembly), `parallax`
  (layered depth via differential scroll rate), `count` (numeric counters —
  real numbers only, per `CLAUDE.md`'s no-fabrication rule). This vocabulary
  maps directly onto this project's `src/js/scroll.js`, `src/js/video-modal.js`,
  and `src/js/interactions.js`, reimplemented with `IntersectionObserver`,
  `position: sticky`, and a hand-rolled `requestAnimationFrame` lerp loop
  instead of the GSAP-based engine.
- The **variety rule**: at least four distinct device families across the
  page, never the same device twice in a row — directly applicable to
  RENUVOL's 13 sections.
- The **taste floor** (`references/taste.md`): the 4px spacing scale with
  more space above a heading than below it, two-typeface maximum, 45–75ch
  body measure, six-color-role palette with one locked accent, the "premium
  cream + brass" palette trap to avoid for a skincare/aesthetics brand, the
  five depth tools (offset shadow, edge light, scale/blur, overlap, grain),
  `transform`/`opacity`-only motion, and the full refuse list (identical
  cards, eyebrow-per-section, scroll cues, gradient text, em dashes, invented
  statistics). This is consistent with and reinforces `taste-skill`'s rules
  above — cross-library agreement, not a conflict, so it's treated as a single
  merged rule set in `docs/motion-spec.md` and `docs/design-system.md`.
- The **feeling-curve method** (`references/feel.md`): write one emotion per
  section plus what on screen causes it, before assigning any motion device,
  and identify a single engineered "peak" section that gets the most scroll
  room. Directly usable once real content exists to decide what RENUVOL's
  13 sections are actually meant to make a visitor feel.
- The **clip-time-is-not-cue-time** and **pinned-span** lessons (minimum
  useful pin span, measuring rail overflow before relying on it, greet-form
  cues for hero content) — implementation pitfalls worth encoding directly
  into `docs/motion-spec.md` regardless of engine.

## Cross-library agreement (the actual rule set)

`frontend-design`, `taste-skill`, and `scroll-craft`'s `taste.md` independently
converge on the same core rules: no em dash, no fabricated statistics, no
three-equal-cards, no eyebrow-per-section, no scroll cues, `transform`/`opacity`
-only motion, `prefers-reduced-motion` support, one locked accent color, and a
named "AI-default" palette/layout list to actively avoid. Because three
independent sources agree, this is treated as the project's binding design
floor (to be written up in `docs/design-system.md` and `docs/motion-spec.md`),
not just one library's opinion.

## What is NOT decided yet

Per the task, this analysis selects methodology, not final design. Actual
color/type/layout decisions (`docs/design-system.md`, not yet in scope here)
depend on real inputs — see `docs/asset-audit.md` for the full, current list
of `[CONTENT REQUIRED]` gaps. Since this analysis was first written, the
three wireframes, a headline video, and product renders were added directly
to `main` (merged into this branch), so `design-dna`'s Analyze phase now has
real layout material to run against — but with an important caveat carried
over from `docs/asset-audit.md`: the wireframes' copy (a usage statistic,
protocol intervals, named certificates, case data, contact details) is
illustrative placeholder text, not verified content, and must not be treated
as source material for `content/*.md`. What's still genuinely blocked:

- `[CONTENT REQUIRED]` — no mood/inspiration references exist
  (`public/references/inspiration/` empty), so the *visual-style* dimension
  of `design-dna`'s Analyze phase (palette, type character, effects) has
  nothing to run against yet — the wireframes supply structure, not style.
- **Resolved**: a standalone logo file now exists
  (`public/images/brand/la-beautex-logo.png`), confirming the parent brand
  name. Still `[CONTENT REQUIRED]`: a brand color palette and type
  references — the logo alone is black-on-transparent and doesn't supply a
  color system, so the accent-color lock decision (`taste-skill` § 4.2) is
  still blocked.
- `[CONTENT REQUIRED]` — no verified product facts, protocol descriptions,
  case studies, or certificates exist (`content/*.md` are all placeholders,
  and `content/placeholders.md` now carries an explicit "Missing Content"
  list matching this), so `count` devices, testimonial/case sections, and any
  shippable copy at all remain unwritten. The product renders in
  `public/images/product/` also carry unconfirmed provenance (filenames
  suggest AI generation plus background removal) and should not be assumed
  final without approval — see `docs/asset-audit.md`.
