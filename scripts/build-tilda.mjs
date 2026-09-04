/**
 * Tilda export.
 *
 * Produces a T123-ready copy of the site from the same sources the Vite build
 * uses. Nothing here writes back into `src/` — run it as often as you like;
 * the development project is untouched.
 *
 *   node scripts/build-tilda.mjs
 *
 * What it does, and why each step exists:
 *
 * 1. Expands the `@include` directives, because Tilda has no build step.
 * 2. Lifts out `#renuvol-site` — the page shell (doctype, head, body) belongs
 *    to Tilda, so only the wrapper travels.
 * 3. Prefixes every CSS selector with `#renuvol-site`, so Tilda's own rules
 *    cannot reach the design and the design cannot reach Tilda's page.
 * 4. Flattens the ES modules into one IIFE, because a T123 block cannot
 *    resolve `import './scroll.js'`.
 * 5. Replaces asset URLs with named placeholders, because the files have to
 *    be uploaded to Tilda's CDN and the URLs are not knowable from here.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(PROJECT, 'src');
const OUT = join(PROJECT, 'tilda-export');

/* -------------------------------------------------------------------------
   Assets → placeholders

   Order matters: the longer `.webp`/`-mobile` paths must be replaced before
   the shorter ones they contain as a prefix.
   ------------------------------------------------------------------------- */

const ASSETS = [
  ['/fonts/onest-cyrillic.woff2', '{{TILDA_FONT_ONEST_CYRILLIC_URL}}'],
  ['/fonts/onest-latin.woff2', '{{TILDA_FONT_ONEST_LATIN_URL}}'],
  ['/fonts/prata-cyrillic.woff2', '{{TILDA_FONT_PRATA_CYRILLIC_URL}}'],
  ['/fonts/prata-latin.woff2', '{{TILDA_FONT_PRATA_LATIN_URL}}'],

  ['/images/hero/renuvol-main-transparent.webp', '{{TILDA_HERO_IMAGE_WEBP_URL}}'],
  ['/images/hero/renuvol-main-transparent.png', '{{TILDA_HERO_IMAGE_PNG_URL}}'],
  ['/images/sections/renuvol-premium-pdo-vial.webp', '{{TILDA_FORMULA_IMAGE_URL}}'],
  ['/images/product/renuvol-vial.webp', '{{TILDA_PRODUCT_VIAL_URL}}'],
  ['/images/brand/la-beautex-logo.png', '{{TILDA_LOGO_URL}}'],

  ['/video/renuvol-hero-scrub-mobile.webm', '{{TILDA_FILM_WEBM_MOBILE_URL}}'],
  ['/video/renuvol-hero-scrub-mobile.mp4', '{{TILDA_FILM_MP4_MOBILE_URL}}'],
  ['/video/renuvol-hero-scrub.webm', '{{TILDA_FILM_WEBM_URL}}'],
  ['/video/renuvol-hero-scrub.mp4', '{{TILDA_FILM_MP4_URL}}'],
  ['/video/renuvol-hero-poster.jpg', '{{TILDA_FILM_POSTER_URL}}'],
];

function placehold(text) {
  let out = text;
  const used = new Set();
  for (const [path, token] of ASSETS) {
    if (out.includes(path)) used.add(path);
    out = out.split(path).join(token);
  }
  return { out, used };
}

/* -------------------------------------------------------------------------
   HTML
   ------------------------------------------------------------------------- */

const INCLUDE = /<!--\s*@include\s+([^\s>]+)\s*-->/g;

function expandIncludes(html, fromDir, seen = new Set()) {
  return html.replace(INCLUDE, (_match, relPath) => {
    const file = resolve(fromDir, relPath);
    if (!existsSync(file)) throw new Error(`@include target not found: ${relPath}`);
    if (seen.has(file)) throw new Error(`@include cycle detected at: ${relPath}`);
    seen.add(file);
    return expandIncludes(readFileSync(file, 'utf-8'), dirname(file), seen);
  });
}

/** Slice out `<div id="renuvol-site">…</div>` by balancing div tags. */
function extractWrapper(html) {
  const open = html.indexOf('<div id="renuvol-site">');
  if (open === -1) throw new Error('#renuvol-site wrapper not found in src/index.html');

  const tag = /<div\b[^>]*>|<\/div>/gi;
  tag.lastIndex = open;

  let depth = 0;
  let match;
  while ((match = tag.exec(html))) {
    depth += match[0] === '</div>' ? -1 : 1;
    if (depth === 0) return html.slice(open, match.index + match[0].length);
  }
  throw new Error('#renuvol-site wrapper is not balanced');
}

/**
 * Tag the CTAs a Tilda form or popup should later be wired to.
 *
 * Applied here rather than in `src/`, because the hooks describe an
 * integration the standalone site does not have. The mapping is documented in
 * README-TILDA.md.
 */
const ACTIONS = [
  ['href="#rv-selection"', 'consultation'],
  ['href="#rv-contacts"', 'contact'],
];

function tagActions(html) {
  let out = html;
  for (const [attr, action] of ACTIONS) {
    out = out.split(attr).join(`${attr} data-renuvol-action="${action}"`);
  }
  // The lead form itself is the private-selection endpoint.
  out = out.replace('<form class="rv-form" data-rv-form', '<form class="rv-form" data-renuvol-action="private-selection" data-rv-form');
  return out;
}

/* -------------------------------------------------------------------------
   CSS scoping

   A small, deliberate transformer rather than a full parser: this stylesheet
   is hand-written, flat (no nesting), and the only at-rules it uses are
   @media, @font-face, @property and @supports.
   ------------------------------------------------------------------------- */

const SCOPE = '#renuvol-site';

/** At-rules whose contents are declarations, not rules — never prefixed. */
const DECLARATION_AT_RULES = /^@(font-face|property|page|counter-style|font-feature-values)/i;
/** At-rules whose contents are rules that DO need prefixing. */
const NESTED_AT_RULES = /^@(media|supports|layer|container)/i;
/** Keyframes hold selectors like `from`, `to`, `40%` — never prefixed. */
const KEYFRAMES = /^@(-\w+-)?keyframes/i;

function prefixSelector(selector) {
  return selector
    .split(',')
    .map((part) => {
      const s = part.trim();
      if (!s) return s;

      // Already ours.
      if (s.startsWith(SCOPE)) return s;

      // The page root becomes the wrapper: every token the site defines is
      // then inherited by everything inside it, and by nothing outside.
      if (s === ':root') return SCOPE;

      // Page-shell rules are dropped, not remapped. `body` and `html` belong
      // to the host page in Tilda, and mapping them onto the wrapper is
      // actively harmful: `body { overflow-x: hidden }` became
      // `#renuvol-site { overflow-x: hidden }`, which turned the wrapper into
      // a scroll container and silently killed `position: sticky` for all
      // four pinned scenes. Everything the wrapper needs is declared on
      // `#renuvol-site` in base.css instead.
      if (/^(html|body)\b/.test(s)) return null;

      // State the wrapper itself carries.
      if (s.startsWith('.rv-static') || s.startsWith('.rv-no-js') || s.startsWith('[data-rv-ground')) {
        return SCOPE + s;
      }

      // `::selection` and friends need the descendant form.
      return `${SCOPE} ${s}`;
    })
    .filter(Boolean)
    .join(',\n');
}

function scopeCss(css) {
  let out = '';
  let i = 0;

  const readBlock = (from) => {
    let depth = 0;
    for (let j = from; j < css.length; j += 1) {
      if (css[j] === '{') depth += 1;
      else if (css[j] === '}') {
        depth -= 1;
        if (depth === 0) return j;
      }
    }
    throw new Error('Unbalanced CSS block');
  };

  while (i < css.length) {
    // Comments and whitespace pass through untouched.
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      const stop = end === -1 ? css.length : end + 2;
      out += css.slice(i, stop);
      i = stop;
      continue;
    }
    if (/\s/.test(css[i])) {
      out += css[i];
      i += 1;
      continue;
    }

    const braceAt = css.indexOf('{', i);
    const semiAt = css.indexOf(';', i);

    // A statement at-rule such as `@charset` or `@import`.
    if (semiAt !== -1 && (braceAt === -1 || semiAt < braceAt)) {
      out += css.slice(i, semiAt + 1);
      i = semiAt + 1;
      continue;
    }
    if (braceAt === -1) {
      out += css.slice(i);
      break;
    }

    const prelude = css.slice(i, braceAt).trim();
    const closeAt = readBlock(braceAt);
    const body = css.slice(braceAt + 1, closeAt);

    if (prelude.startsWith('@')) {
      if (DECLARATION_AT_RULES.test(prelude) || KEYFRAMES.test(prelude)) {
        // @font-face and @property are global by definition and must stay at
        // the top level; keyframe bodies are not selectors.
        out += `${prelude} {${body}}`;
      } else if (NESTED_AT_RULES.test(prelude)) {
        out += `${prelude} {\n${scopeCss(body)}\n}`;
      } else {
        out += `${prelude} {${body}}`;
      }
    } else {
      const scoped = prefixSelector(prelude);
      out += scoped ? `${scoped} {${body}}` : '';
    }

    i = closeAt + 1;
  }

  return out;
}

/* -------------------------------------------------------------------------
   JS flattening
   ------------------------------------------------------------------------- */

/** Dependency order — `root.js` first, entry point last. */
const MODULES = ['root.js', 'scroll.js', 'interactions.js', 'mobile.js', 'video-modal.js', 'main.js'];

const IMPORT_LINE = /^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm;
const EXPORT_KEYWORD = /^export\s+(?=(function|const|let|class))/gm;

function flattenModules() {
  const seen = new Map();
  const parts = [];

  for (const name of MODULES) {
    const file = join(SRC, 'js', name);
    let code = readFileSync(file, 'utf-8');

    code = code.replace(IMPORT_LINE, '').replace(EXPORT_KEYWORD, '');

    // A flattened bundle shares one scope: a duplicate top-level name would
    // silently shadow another module's. Fail loudly instead.
    const declarations = code.matchAll(/^(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm);
    for (const [, ident] of declarations) {
      if (seen.has(ident)) {
        throw new Error(
          `Duplicate top-level identifier "${ident}" in ${name} (already declared in ${seen.get(ident)}).`
        );
      }
      seen.set(ident, name);
    }

    parts.push(`/* ---- src/js/${name} ${'-'.repeat(Math.max(0, 60 - name.length))} */\n${code.trim()}`);
  }

  return parts.join('\n\n');
}

/* -------------------------------------------------------------------------
   Build
   ------------------------------------------------------------------------- */

const CSS_FILES = [
  'tokens.css',
  'base.css',
  'layout.css',
  'art.css',
  'components.css',
  'sections.css',
  'responsive.css',
];

/**
 * The Tilda-compatibility layer.
 *
 * Injected ahead of the design's own rules, and only into the export — the
 * standalone page has no host theme to defend against, and adding it there
 * would outrank the layout rules it is meant to protect.
 *
 * Specificity is the whole point. `#renuvol-site :where(...)` computes to
 * (1,0,0): high enough to beat any bare element selector a Tilda theme can
 * write (0,0,1), low enough to lose to every scoped rule in this stylesheet,
 * which all carry at least (1,1,0). So it removes what the host added and
 * never touches what the design sets.
 *
 * The bug that made this necessary: a host rule of `section { padding: 20px 0 }`
 * pushed every pinned stage 20px down inside its own section — a whole
 * viewport-height composition shifted, on all four pinned scenes.
 */
const HOST_RESET = `
/* ===== Tilda compatibility layer (export only) ===== */

/* Only non-inherited box properties are reset here. Resetting an inherited
   one — text-transform, letter-spacing, font-variant, text-indent — would
   declare it directly on descendants and so beat the value the design sets
   on their ancestor. That is not theoretical: an earlier version reset
   text-transform on \`span\`, and the manifesto's uppercase headline came out
   in sentence case because the text sits in a span inside the styled p. */
#renuvol-site :where(section, article, aside, header, footer, nav, main,
  div, span, form, fieldset, blockquote, table, figure, figcaption,
  ul, ol, li, dl, dd, dt, h1, h2, h3, h4, h5, h6, p) {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  float: none;
  clear: none;
  min-width: 0;
  max-width: none;
  min-height: 0;
  box-shadow: none;
}

#renuvol-site :where(input, textarea, select, button) {
  margin: 0;
  border: 0;
  border-radius: 0;
  background: none;
  box-shadow: none;
  min-height: 0;
}

#renuvol-site :where(a) {
  text-decoration: none;
  background: none;
}

#renuvol-site :where(img, video, svg, picture) {
  display: block;
  max-width: 100%;
  border: 0;
  box-shadow: none;
}

/* Tilda animates blocks in by transitioning opacity and transform on its own
   wrappers. A transform on an ancestor makes it the containing block for the
   fixed layers inside — ground, atmosphere, grain, header, film modal — and
   they stop being viewport-fixed. Opt this block out. */
#renuvol-site {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
  animation: none !important;
}
`;

const BANNER = (what) => `/*!
 * RENUVOL — ${what} for a Tilda T123 block.
 *
 * Generated by scripts/build-tilda.mjs. Do not edit by hand: change the
 * source in src/ and re-run the script.
 *
 * Every selector is scoped to #renuvol-site. Asset URLs are {{PLACEHOLDERS}}
 * — see asset-map.md.
 */
`;

function build() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  // --- HTML ---------------------------------------------------------------
  const index = readFileSync(join(SRC, 'index.html'), 'utf-8');
  const expanded = expandIncludes(index, SRC);
  let html = extractWrapper(expanded);
  html = tagActions(html);

  const htmlPass = placehold(html);
  html = htmlPass.out;

  // --- CSS ----------------------------------------------------------------
  const rawCss = CSS_FILES.map(
    (name) => `/* ===== src/styles/${name} ===== */\n${readFileSync(join(SRC, 'styles', name), 'utf-8')}`
  ).join('\n\n');

  let css = HOST_RESET + '\n' + scopeCss(rawCss);
  const cssPass = placehold(css);
  css = cssPass.out;

  // --- JS -----------------------------------------------------------------
  const js = `(function () {\n'use strict';\n\n${flattenModules()}\n})();\n`;
  const jsPass = placehold(js);

  // --- Write --------------------------------------------------------------
  writeFileSync(join(OUT, 'renuvol-tilda.css'), BANNER('stylesheet') + css + '\n');
  writeFileSync(join(OUT, 'renuvol-tilda.js'), BANNER('script') + jsPass.out);
  writeFileSync(
    join(OUT, 'renuvol-tilda.html'),
    `<!--\n  RENUVOL — markup for a Tilda T123 block.\n\n  Generated by scripts/build-tilda.mjs. Pair it with renuvol-tilda.css and\n  renuvol-tilda.js, or use renuvol-tilda-inline.html which already contains\n  all three.\n-->\n${html}\n`
  );

  const inline = [
    '<!--',
    '  RENUVOL — complete embed for a Tilda T123 "HTML code" block.',
    '',
    '  Generated by scripts/build-tilda.mjs. Replace every {{TILDA_*_URL}}',
    '  placeholder with the file\'s Tilda CDN address (see asset-map.md), then',
    '  paste this whole file into the block.',
    '-->',
    '<style>',
    css,
    '</style>',
    '',
    html,
    '',
    '<script>',
    jsPass.out,
    '<\/script>',
    '',
  ].join('\n');
  writeFileSync(join(OUT, 'renuvol-tilda-inline.html'), inline);

  const usedAssets = new Set([...htmlPass.used, ...cssPass.used, ...jsPass.used]);

  return {
    htmlBytes: Buffer.byteLength(html),
    cssBytes: Buffer.byteLength(css),
    jsBytes: Buffer.byteLength(jsPass.out),
    inlineBytes: Buffer.byteLength(inline),
    usedAssets: [...usedAssets].sort(),
    placeholders: ASSETS.filter(([path]) => usedAssets.has(path)).map(([, token]) => token),
  };
}

const result = build();

console.log('tilda-export/');
console.log(`  renuvol-tilda.html         ${(result.htmlBytes / 1024).toFixed(1)} kB`);
console.log(`  renuvol-tilda.css          ${(result.cssBytes / 1024).toFixed(1)} kB`);
console.log(`  renuvol-tilda.js           ${(result.jsBytes / 1024).toFixed(1)} kB`);
console.log(`  renuvol-tilda-inline.html  ${(result.inlineBytes / 1024).toFixed(1)} kB`);
console.log(`\n${result.usedAssets.length} assets referenced, all as placeholders:`);
for (const p of result.placeholders) console.log(`  ${p}`);
