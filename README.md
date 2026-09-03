# RENUVOL Site

Marketing website for RENUVOL.

## Status

Homepage implemented: all 13 sections, Russian-language, with a
scroll-scrubbed hero film. Content that has not been verified renders as a
visible `[CONTENT REQUIRED]` marker rather than invented copy — see
`content/placeholders.md` for the full list and
`docs/claims-verification.md` for what is blocked and why.

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
