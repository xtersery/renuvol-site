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

## Deployment

The site is built, not hand-edited. `npm run build` produces `dist/`, and it is
`dist/` that goes to the hosting root — never a file edited in place on the
server. A change made directly in the deployed `index.html` is invisible to the
build and is silently reverted the next time anyone runs it.

One file lives only on the server and never in this repository:
`renuvol-config.php`, which carries the Telegram bot token and the notification
address. Copy `renuvol-config.sample.php` next to the site root (or one level
above it) and fill it in. `api/lead.php` also accepts the same values from the
environment as `RENUVOL_TG_TOKEN`, `RENUVOL_TG_CHAT` and `RENUVOL_MAIL_TO`.

Every accepted lead is appended to a file on disk before delivery is attempted,
so a Telegram or mail outage cannot lose a contact. Paths default to the
server's temp directory and are configurable via `leads_file` / `log_file`.

## Where refinements live

`src/styles/refinements.css` and `src/js/enhancements.js` hold work that was
originally authored on the deployed build and lifted back into source. The
stylesheet is loaded last on purpose — several of its rules deliberately
override the thematic sheets — so move a rule out of it only together with the
rule it overrides.

## Project structure

```
public/       static assets served as-is (video, images, documents, api/)
content/      source copy and factual content (markdown)
src/          application source (HTML entry, styles, JS, page sections)
docs/         planning and specification documents
dist/         build output — what gets uploaded; not committed
```
