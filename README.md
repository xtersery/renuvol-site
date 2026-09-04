# RENUVOL Site

Marketing website for RENUVOL.

## Status

Homepage implemented: 12 sections, Russian-language, art-directed as one
continuous artwork (`docs/art-direction.md`). The product film is an optional
modal behind a CTA — the page carries itself without it.

Content that has not been verified is never invented and never shown to a
visitor: the component is composed to read as finished without it, and the
`[CONTENT REQUIRED]` marker survives as an HTML comment beside the slot. See
`content/placeholders.md` for the full list and `docs/claims-verification.md`
for what is blocked and why.

## Stack

- [Vite](https://vitejs.dev/) with vanilla HTML, CSS, and JavaScript.
- No framework, no animation library, no runtime dependencies. Fonts are
  self-hosted.

## Documentation

| Document | Contents |
|---|---|
| `docs/design-system.md` | Palette, typography, spacing, language rule |
| `docs/motion-spec.md` | Scroll engine, device per section, what was verified |
| `docs/mobile-spec.md` | How mobile differs from desktop, reduced motion |
| `docs/asset-audit.md` | Every asset classified; what may be published |
| `docs/claims-verification.md` | Claim-by-claim ledger with statuses |
| `docs/tilda-integration.md` | Porting notes, form endpoint, video re-encoding |
| `docs/implementation-plan.md` | Phases and what remains outstanding |
| `docs/skills-analysis.md` | What was taken from the reference libraries |

## Getting started

```bash
npm install
npm run dev      # start local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Project structure

```
public/       static assets served as-is (video, images, documents, references)
content/      source copy and factual content (markdown)
src/          application source (HTML entry, styles, JS, page sections)
references/   external design/reference material
docs/         planning and specification documents
```
