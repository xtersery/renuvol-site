/**
 * The site's scope root.
 *
 * Standalone and embedded, everything the site owns lives inside
 * `#renuvol-site`. Two things follow from that:
 *
 * 1. Element lookups are scoped to the wrapper, so an embed can never reach
 *    into the host page's markup (or be confused by it).
 * 2. Page state — `data-rv-ground`, `--rv-page`, `--rv-mx/--rv-my`,
 *    `.rv-static`, `.rv-no-js` — is written to the wrapper rather than to
 *    `<html>`, which on a Tilda page is not ours to touch. Custom properties
 *    inherit, so everything inside reads them exactly as before.
 *
 * The fallback to `document.documentElement` keeps the modules usable if the
 * wrapper is ever missing; nothing then breaks, it just widens the scope.
 */

let cached = null;

/** The wrapper, resolved once. */
export function siteRoot() {
  if (cached && cached.isConnected) return cached;
  cached = document.getElementById('renuvol-site') || document.documentElement;
  return cached;
}

/** Reset the cache — only needed if the wrapper is replaced at runtime. */
export function resetSiteRoot() {
  cached = null;
}

/** Scoped `querySelector`. */
export function q(selector) {
  return siteRoot().querySelector(selector);
}

/** Scoped `querySelectorAll`, as an array. */
export function qa(selector) {
  return Array.from(siteRoot().querySelectorAll(selector));
}
