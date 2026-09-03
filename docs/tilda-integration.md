# Tilda Integration

Status: implemented with portability in mind. This describes how the current
build can be moved into, or run alongside, Tilda.

## What makes it portable

- **No framework and no runtime dependencies.** The page is plain HTML, CSS
  and ES modules. There is nothing to bundle into Tilda beyond the files
  themselves, and no React/GSAP/Motion runtime to reconcile with Tilda's own
  scripts.
- **Everything is namespaced.** Every class is prefixed `rv-`, every custom
  property `--rv-*`, every hook `data-rv-*`. There are no bare element
  selectors that could restyle Tilda blocks — the only element-level rules
  are in `base.css` and are limited to resets scoped by the same stylesheet
  load.
- **One global.** JavaScript exposes exactly `window.RENUVOL`
  (`{ engine, destroy() }`). Nothing else is written to the global scope.
- **Explicit initialisation.** `src/js/main.js` calls each module by name;
  nothing self-executes on import. A section that is not present is simply
  skipped, because each module returns early when its markup is absent.
- **Sections are separate files.** `src/sections/01-header.html` …
  `13-footer.html` are standalone fragments, composed into the page at build
  time by a small zero-dependency Vite plugin (`vite.config.js`). Any one of
  them can be pasted into a Tilda **T123 / HTML block** on its own.

## Moving a single section into Tilda

1. Copy the fragment's markup from `src/sections/<n>-<name>.html` into a
   Tilda HTML block.
2. Include the stylesheets once per page (Tilda: *Settings → HTML code for
   HEAD*), either as uploaded files or inlined:
   `tokens.css`, `base.css`, `layout.css`, `components.css`, `sections.css`,
   `responsive.css` — in that order; later files depend on earlier tokens.
3. Include the JS once, before `</body>`, as a module:
   `<script type="module" src="…/main.js"></script>`.
4. Upload `public/fonts/*`, `public/video/*` and `public/images/*` to Tilda's
   file manager (or a CDN) and update the paths — they are all root-relative
   (`/fonts/…`, `/video/…`, `/images/…`), so a single find-and-replace of the
   prefix is enough.

`base.css` contains a light reset. If it fights Tilda's own styles, drop it
and keep `tokens.css` + the rest; the components do not depend on the reset
beyond `box-sizing`.

## The lead form

`src/sections/12-private-selection.html` carries a single configuration
point:

```html
<form data-rv-form data-rv-endpoint="">
```

- **Left empty** (the current state) the form validates in Russian, blocks
  submission, and reports that no receiver is connected. It also emits a
  `rv:submit` DOM event with the payload, so an external integration can
  listen without modifying the module.
- **Set to a URL** the form POSTs JSON to it and reports success or failure
  in Russian.
- **To use a Tilda form handler instead**, replace the `<form>` element with
  Tilda's own form block and keep the surrounding markup — the profile
  selection writes into a plain hidden input (`data-rv-profile-field`), which
  Tilda will submit like any other field.

No CRM, webhook or Tilda endpoint is hardcoded anywhere.

## Assets and encoding

The film plays back normally now (it lives in a modal, not on the scroll
timeline), so a dense GOP is no longer required — but the shipped encodes
still have one, from when the hero scrubbed. They are harmless: a dense GOP
costs bitrate, not playback. If the video is replaced, a plain web encode is
fine; the commands below are the ones that produced the current files and are
kept so the existing assets can be reproduced (ffmpeg, dev-time only, not a
project dependency; drop `-g 5 -keyint_min 5 -sc_threshold 0` and raise the
CRF for a smaller normal-playback encode):

```bash
# desktop, WebM/VP9 (preferred where supported)
ffmpeg -i source.mp4 -an -vf scale=1024:-2 -c:v libvpx-vp9 \
  -g 5 -keyint_min 5 -crf 41 -b:v 0 -row-mt 1 -deadline good -cpu-used 5 \
  public/video/renuvol-hero-scrub.webm

# desktop, MP4/H.264 (Safari and iOS)
ffmpeg -i source.mp4 -an -vf scale=1024:-2 -c:v libx264 -profile:v high \
  -pix_fmt yuv420p -g 5 -keyint_min 5 -sc_threshold 0 -crf 26 -preset slow \
  -movflags +faststart public/video/renuvol-hero-scrub.mp4

# mobile variants: same commands at scale=640:-2 with crf 44 / 28
# poster
ffmpeg -ss 0.2 -i source.mp4 -frames:v 1 -q:v 4 -vf scale=1280:-2 \
  public/video/renuvol-hero-poster.jpg
```

The `<video>` now lives in `src/sections/14-video-modal.html`. Nothing on the
page is keyed to video seconds, so a replacement file needs no other change
except one attribute: `data-rv-end` stops playback before the source clip's
**METABIOMED end-card** (a third-party manufacturer mark — see
`docs/claims-verification.md`). Retime it for a new file, or drop it once the
master is trimmed.

## Things to watch

- **Do not set `overflow` on `html`.** Any non-visible overflow on the root
  propagates to the viewport and stops the pinned stages from sticking. If
  Tilda's own CSS sets it, the hero and chapter rail will silently stop
  pinning. (This was hit and fixed during the build.)
- **`position: sticky` needs an unclipped ancestor chain.** Tilda wrappers
  that set `overflow: hidden` around a block will break the pinned sections
  in the same way.
- **Load order matters**: `tokens.css` must come first.
- The fonts are self-hosted (`public/fonts/`, ~92KB total) with
  `font-display: swap`; there is no Google Fonts request to allow-list.
