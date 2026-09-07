import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { defineConfig } from 'vite';

const SECTION_ROOT = resolve(process.cwd(), 'src');

/**
 * Zero-dependency HTML partial include.
 *
 * Lets `src/index.html` compose the page from the numbered fragments in
 * `src/sections/`, which keeps each section a standalone, portable file
 * (useful for the Tilda migration path — see docs/tilda-integration.md)
 * without pulling in a templating dependency.
 *
 *   <!-- @include sections/02-hero.html -->
 */
function htmlInclude() {
  const PATTERN = /<!--\s*@include\s+([^\s>]+)\s*-->/g;

  const expand = (html, fromDir, seen = new Set()) =>
    html.replace(PATTERN, (match, relPath) => {
      const file = resolve(fromDir, relPath);
      if (!existsSync(file)) {
        throw new Error(`@include target not found: ${relPath}`);
      }
      if (seen.has(file)) {
        throw new Error(`@include cycle detected at: ${relPath}`);
      }
      seen.add(file);
      return expand(readFileSync(file, 'utf-8'), dirname(file), seen);
    });

  return {
    name: 'rv-html-include',
    transformIndexHtml: {
      order: 'pre',
      handler: (html, ctx) => expand(html, dirname(ctx.filename)),
    },
    // Rebuild the page when a fragment changes during development.
    handleHotUpdate({ file, server }) {
      if (file.startsWith(resolve(SECTION_ROOT, 'sections')) && file.endsWith('.html')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [htmlInclude()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsInlineLimit: 2048,
  },
  server: {
    port: 5173,
  },
});
