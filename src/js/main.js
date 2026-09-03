/**
 * RENUVOL — entry point.
 *
 * Initialisation is explicit and each module attaches only to the markup it
 * finds, so sections can be moved or lifted out individually (see
 * docs/tilda-integration.md). Nothing is written to the global scope beyond
 * the single `window.RENUVOL` handle used for teardown.
 */

import { createScrollEngine, initReveals, initHeader } from './scroll.js';
import { initVideoScrub } from './video-scrub.js';
import {
  initFormula,
  initCompare,
  initRail,
  initProtocolSelector,
  initDirections,
  initCases,
  initSelection,
  initForm,
  initYear,
} from './interactions.js';
import { initMenu, initProtocolAccordion, initSwipe, initViewportUnit } from './mobile.js';

function boot() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.remove('rv-no-js');

  // Layout and viewport first, so measured values are correct.
  initViewportUnit();

  const engine = createScrollEngine({ reducedMotion });

  initHeader();
  initReveals();
  initMenu();

  const scrub = initVideoScrub({ engine, reducedMotion });

  initFormula();
  initCompare();
  initRail({ engine });
  initProtocolSelector();
  initProtocolAccordion();
  initDirections();

  const cases = initCases();
  initSwipe(cases);

  initSelection();
  initForm();
  initYear();

  window.RENUVOL = {
    engine,
    destroy() {
      scrub?.destroy();
      engine.destroy();
    },
  };
}

// The stylesheet hides cue content until the engine runs; if scripting is
// unavailable the class stays and CSS reveals everything instead.
document.documentElement.classList.add('rv-no-js');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
