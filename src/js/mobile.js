/**
 * Mobile behaviour.
 *
 * Not a scaled-down desktop: the menu, the protocol accordion and the
 * swipeable carousel are separate interactions that replace their desktop
 * counterparts below the breakpoint. See docs/mobile-spec.md.
 */

const MOBILE = '(max-width: 760px)';

/** Burger menu with focus containment and scroll lock. */
export function initMenu() {
  const burger = document.querySelector('[data-rv-burger]');
  const menu = document.querySelector('[data-rv-menu]');
  if (!burger || !menu) return;

  let open = false;
  let lastFocus = null;

  const setOpen = (next) => {
    open = next;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      lastFocus = document.activeElement;
      menu.querySelector('a, button')?.focus();
    } else if (lastFocus instanceof HTMLElement) {
      lastFocus.focus();
    }
  };

  burger.addEventListener('click', () => setOpen(!open));

  menu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = menu.querySelectorAll('a[href], button:not([disabled])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Leaving mobile width with the menu open would otherwise strand the lock.
  window.matchMedia('(min-width: 1025px)').addEventListener('change', (event) => {
    if (event.matches && open) setOpen(false);
  });
}

/**
 * Protocol selector on touch: move each panel directly under its trigger so
 * the list reads as a native accordion instead of a pair of distant columns.
 */
export function initProtocolAccordion() {
  const root = document.querySelector('[data-rv-selector]');
  if (!root) return;

  const list = root.querySelector('.rv-goals');
  const host = root.querySelector('[data-rv-protocol-host]');
  if (!list || !host) return;

  const mq = window.matchMedia(MOBILE);
  let applied = false;

  const toAccordion = () => {
    if (applied) return;
    applied = true;

    list.querySelectorAll('[data-rv-goal]').forEach((tab) => {
      const key = tab.dataset.rvGoal;
      const panel = host.querySelector(`[data-rv-protocol="${key}"]`);
      if (panel) tab.parentElement.append(panel);
    });
  };

  const toColumns = () => {
    if (!applied) return;
    applied = false;

    list.querySelectorAll('[data-rv-protocol]').forEach((panel) => host.append(panel));
  };

  const apply = () => (mq.matches ? toAccordion() : toColumns());
  apply();
  mq.addEventListener('change', apply);
}

/**
 * Horizontal swipe for the cases carousel — only where the viewport is not
 * already natively scrollable. Below the mobile breakpoint the rail uses real
 * scroll-snap, and a synthetic swipe handler would fight it.
 */
export function initSwipe(carousel) {
  const viewport = document.querySelector('[data-rv-cases]');
  if (!viewport || !carousel) return;
  if (carousel.nativeScroll?.()) return;

  let startX = 0;
  let startY = 0;
  let tracking = false;

  viewport.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1) return;
      tracking = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    },
    { passive: true }
  );

  viewport.addEventListener(
    'touchend',
    (event) => {
      if (!tracking) return;
      tracking = false;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // Ignore anything that reads as a vertical scroll.
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      carousel.go(carousel.index + (dx < 0 ? 1 : -1));
    },
    { passive: true }
  );
}

/**
 * iOS viewport height: 100dvh is well supported now, but older Safari still
 * needs a measured fallback for the pinned stages.
 */
export function initViewportUnit() {
  if (CSS.supports?.('height: 100dvh')) return;

  const set = () => {
    document.documentElement.style.setProperty('--rv-vh', `${window.innerHeight * 0.01}px`);
    document.querySelectorAll('[data-rv-stage]').forEach((stage) => {
      stage.style.height = `${window.innerHeight}px`;
    });
  };

  set();
  window.addEventListener('resize', set, { passive: true });
  window.addEventListener('orientationchange', set);
}
