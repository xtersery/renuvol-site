/**
 * Scroll engine.
 *
 * One rAF loop drives every scroll-linked value on the page. Scenes publish
 * their own progress as `--rv-p` (0..1) on their root element; everything
 * visual is then expressed in CSS against that variable. Nothing here writes
 * layout-triggering properties, and the loop only runs while at least one
 * scene is on screen.
 *
 * Deliberately no scroll event listener for continuous values, per the
 * device contract in docs/motion-spec.md.
 */

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Cue window: "from to [rampIn rampOut]", all in scene progress.
 * A third value of 0 makes a "greet" cue — already at full opacity when the
 * scene begins, so the first screen a visitor sees is never blank.
 */
function parseCue(value) {
  const parts = String(value).trim().split(/\s+/).map(Number);
  const from = Number.isFinite(parts[0]) ? parts[0] : 0;
  const to = Number.isFinite(parts[1]) ? parts[1] : 1;
  const span = Math.max(to - from, 0.0001);
  const rampIn = Number.isFinite(parts[2]) ? parts[2] : span * 0.3;
  const rampOut = Number.isFinite(parts[3]) ? parts[3] : span * 0.3;
  return { from, to, rampIn, rampOut, hold: parts.length === 1 };
}

function cueOpacity(p, cue) {
  if (cue.hold) {
    // Single value: fade in and stay. Only the last cue of a scene should.
    return cue.rampIn > 0 ? clamp01((p - cue.from) / cue.rampIn) : p >= cue.from ? 1 : 0;
  }
  // Strict comparisons: with rampIn 0 (a "greet" cue) p === from must read as
  // fully visible, not as the very start of a fade that never happened.
  if (p < cue.from - cue.rampIn || p > cue.to + cue.rampOut) return 0;
  if (p < cue.from) return cue.rampIn > 0 ? clamp01((p - (cue.from - cue.rampIn)) / cue.rampIn) : 1;
  if (p > cue.to) return cue.rampOut > 0 ? clamp01((cue.to + cue.rampOut - p) / cue.rampOut) : 1;
  return 1;
}

export function createScrollEngine({ reducedMotion = false } = {}) {
  const scenes = [];
  const subscribers = new Set();
  let running = false;
  let frame = 0;

  const root = document.documentElement;

  // Reduced motion: pinned scenes are not given their travel height at all.
  // Holding a frozen frame for three viewports is dead scroll, so the stages
  // become ordinary sections and their content is shown in full instead.
  if (reducedMotion) root.classList.add('rv-static');

  document.querySelectorAll('[data-rv-scene]').forEach((el) => {
    const span = parseFloat(el.dataset.rvSpan || '0');
    const stage = el.querySelector('[data-rv-stage]');

    // A scene with a span is a pinned scene: give the section the height that
    // its stage needs to travel through.
    if (span > 0 && stage && !reducedMotion) {
      el.style.height = `${span * 100}vh`;
    }

    scenes.push({
      el,
      stage,
      pinned: Boolean(span > 0 && stage),
      ground: el.dataset.rvGround || 'pearl',
      cues: Array.from(el.querySelectorAll('[data-rv-cue]')).map((node) => ({
        node,
        cue: parseCue(node.dataset.rvCue),
        last: -1,
      })),
      visible: false,
      p: -1,
    });
  });

  // Only run the loop for scenes actually on screen.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const scene = scenes.find((s) => s.el === entry.target);
        if (scene) scene.visible = entry.isIntersecting;
      });
      if (scenes.some((s) => s.visible)) start();
    },
    { rootMargin: '20% 0px 20% 0px' }
  );
  scenes.forEach((s) => io.observe(s.el));

  // Ground drift: whichever scene owns the middle of the viewport sets the
  // page ground, so colour changes hand off between scenes instead of
  // switching at hard section boundaries.
  let currentGround = '';
  const groundIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const scene = scenes.find((s) => s.el === entry.target);
        if (scene && scene.ground !== currentGround) {
          currentGround = scene.ground;
          root.dataset.rvGround = scene.ground;
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );
  scenes.forEach((s) => groundIo.observe(s.el));

  function progressOf(scene) {
    const rect = scene.el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    if (scene.pinned) {
      // Travel is the section height minus the one viewport the stage holds.
      const travel = Math.max(rect.height - vh, 1);
      return clamp01(-rect.top / travel);
    }
    // Unpinned scenes report their pass through the viewport, which is enough
    // for ambient effects; they generally do not use cues.
    const travel = Math.max(rect.height + vh, 1);
    return clamp01((vh - rect.top) / travel);
  }

  function tick() {
    frame = 0;
    let active = false;

    for (const scene of scenes) {
      if (!scene.visible) continue;
      active = true;

      const p = progressOf(scene);
      if (Math.abs(p - scene.p) > 0.0004) {
        scene.p = p;
        scene.el.style.setProperty('--rv-p', p.toFixed(4));

        for (const entry of scene.cues) {
          const o = cueOpacity(p, entry.cue);
          if (Math.abs(o - entry.last) > 0.004) {
            entry.last = o;
            entry.node.style.setProperty('--rv-o', o.toFixed(3));
          }
        }

        subscribers.forEach((fn) => fn(scene.el, p));
      }
    }

    if (active) {
      frame = requestAnimationFrame(tick);
    } else {
      running = false;
    }
  }

  function start() {
    if (running || reducedMotion === 'freeze') return;
    running = true;
    frame = requestAnimationFrame(tick);
  }

  /** Subscribe to per-scene progress: fn(sceneEl, progress). */
  function onProgress(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  function destroy() {
    if (frame) cancelAnimationFrame(frame);
    io.disconnect();
    groundIo.disconnect();
    subscribers.clear();
    running = false;
  }

  start();

  return { onProgress, destroy, scenes };
}

/** Enter-on-scroll for ordinary content. Fires once per element. */
export function initReveals() {
  const items = document.querySelectorAll('[data-rv-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
  );

  // Stagger siblings so a group arrives in sequence rather than all at once.
  const groups = new Map();
  items.forEach((el) => {
    const parent = el.parentElement;
    const index = groups.get(parent) || 0;
    groups.set(parent, index + 1);
    if (index) el.style.setProperty('--rv-delay', `${Math.min(index * 70, 280)}ms`);
    io.observe(el);
  });
}

/** Header: compact state after the hero, plus active-section marking. */
export function initHeader() {
  const header = document.querySelector('[data-rv-header]');
  if (!header) return;

  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:80vh;pointer-events:none;';
  document.body.prepend(sentinel);

  new IntersectionObserver(
    ([entry]) => header.classList.toggle('is-stuck', !entry.isIntersecting),
    { threshold: 0 }
  ).observe(sentinel);

  const links = Array.from(document.querySelectorAll('.rv-nav__link'));
  const targets = links
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      const el = id && document.getElementById(id);
      return el ? { link, el } : null;
    })
    .filter(Boolean);

  if (!targets.length) return;

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = targets.find((t) => t.el === entry.target);
        if (!match) return;
        links.forEach((l) => l.classList.remove('is-active'));
        match.link.classList.add('is-active');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  targets.forEach((t) => spy.observe(t.el));
}
