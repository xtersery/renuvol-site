/**
 * RENUVOL — entry point.
 *
 * Initialisation is explicit and each module attaches only to the markup it
 * finds inside `#renuvol-site`, so sections can be moved or lifted out
 * individually (see docs/tilda-integration.md). Nothing is written to the
 * global scope beyond the single `window.RENUVOL` handle used for teardown.
 *
 * The boot sequence is written for the harder of the two environments. On a
 * Tilda page the block's markup can appear after DOMContentLoaded, after
 * `load`, or be re-rendered by the editor, so booting is:
 *
 *   - idempotent — a second call is a no-op while the same wrapper is live;
 *   - patient — it waits for the wrapper rather than assuming it exists;
 *   - self-checking — if `position: sticky` does not actually stick (a Tilda
 *     ancestor with a non-visible overflow will do that), the page falls back
 *     to the static layout it already has for reduced motion, instead of
 *     leaving four pinned scenes frozen on a dead scroll.
 */

import { createScrollEngine, initReveals, initHeader, initAnchors } from './scroll.js';
import { initFilm } from './video-modal.js';
import {
  initPointer,
  initFormula,
  initCompare,
  initRail,
  initSelection,
  initForm,
  initYear,
} from './interactions.js';
import { initMenu, initViewportUnit } from './mobile.js';
import { siteRoot, resetSiteRoot } from './root.js';

let booted = null;

/**
 * Does `position: sticky` actually stick here?
 *
 * An ancestor with a non-visible `overflow` silently turns sticky into
 * static for everything below it, and a host page can introduce one at any
 * time — Tilda's own wrappers sometimes do. There is no feature query for
 * that, so walk the ancestors.
 *
 * `<html>` and `<body>` are excluded on purpose: their overflow propagates
 * to the viewport, which is the normal scrolling box, and sticky works
 * against it. This site's own `body { overflow-x: hidden }` is exactly that
 * case, and treating it as a blocker would put every visitor into the static
 * layout.
 */
function stickyWorks(root) {
  if (!CSS.supports?.('position', 'sticky')) return false;

  const body = document.body;
  for (let el = root.parentElement; el && el !== body; el = el.parentElement) {
    const style = getComputedStyle(el);
    if (style.overflow !== 'visible' || style.overflowX !== 'visible' || style.overflowY !== 'visible') {
      return false;
    }
  }
  return true;
}

/**
 * Initialise the site. Safe to call more than once and from any point in the
 * page lifecycle.
 *
 * @returns {object|null} the `window.RENUVOL` handle, or null if the wrapper
 *   is not in the document yet.
 */
export function initRenuvolSite() {
  const root = document.getElementById('renuvol-site');
  if (!root) return null;

  // Already running against this same wrapper.
  if (booted && booted.root === root && root.isConnected) return booted.api;

  // A different wrapper (Tilda re-rendered the block): tear the old one down
  // rather than stacking a second set of listeners on top of it.
  if (booted) {
    booted.api.destroy();
    booted = null;
    resetSiteRoot();
  }

  if (root.dataset.rvBooted === 'true') return booted?.api ?? null;
  root.dataset.rvBooted = 'true';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedMotion = prefersReduced || !stickyWorks(root);

  root.classList.remove('rv-no-js');

  // Layout and viewport first, so measured values are correct.
  initViewportUnit();

  const engine = createScrollEngine({ reducedMotion });

  initHeader();
  initAnchors();
  initReveals();
  initMenu();
  initPointer();

  initFormula();
  initCompare();
  initRail({ engine });

  initSelection();
  initForm();
  initYear();

  // The film is optional and loads nothing until it is opened.
  const film = initFilm();

  const api = {
    engine,
    film,
    root,
    reducedMotion,
    destroy() {
      engine.destroy();
      root.removeAttribute('data-rv-booted');
      booted = null;
      resetSiteRoot();
    },
  };

  booted = { root, api };
  window.RENUVOL = api;
  return api;
}

/**
 * Boot as soon as the wrapper exists.
 *
 * Tries immediately, then on DOMContentLoaded and `load`, and finally
 * observes the DOM for a short window — which covers a T123 block whose
 * markup is injected after both events have already fired.
 */
function autoBoot() {
  if (initRenuvolSite()) return;

  const attempt = () => Boolean(initRenuvolSite());

  document.addEventListener('DOMContentLoaded', attempt, { once: true });
  window.addEventListener('load', attempt, { once: true });

  if (typeof MutationObserver !== 'function') return;

  const observer = new MutationObserver(() => {
    if (attempt()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Do not watch the host page forever.
  window.setTimeout(() => observer.disconnect(), 20000);
}

// The stylesheet hides cue content until the engine runs; if scripting is
// unavailable the class stays and CSS reveals everything instead. Applied to
// the wrapper as soon as it can be found, so nothing flashes.
(function markNoJs() {
  const apply = () => {
    const root = document.getElementById('renuvol-site');
    if (root) root.classList.add('rv-no-js');
    return Boolean(root);
  };
  if (!apply()) document.addEventListener('DOMContentLoaded', apply, { once: true });
})();

autoBoot();

if (typeof window !== 'undefined') {
  // Exposed so a Tilda page (or the editor's preview) can re-run the boot by
  // hand if a block is rebuilt.
  window.initRenuvolSite = initRenuvolSite;
}
