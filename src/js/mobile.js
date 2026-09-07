/**
 * Mobile behaviour.
 *
 * Not a scaled-down desktop: the menu and the swipeable carousel are
 * separate interactions that replace their desktop counterparts below the
 * breakpoint. See docs/mobile-spec.md.
 */

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
