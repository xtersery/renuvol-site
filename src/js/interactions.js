/**
 * Pointer-driven interactions: formula orbit, before/after comparison,
 * protocol selector, cosmetologist directions, cases carousel, private
 * selection and the lead form.
 *
 * Everything here is namespaced to the RENUVOL markup and attaches only to
 * elements it finds, so any single section can be lifted out (see
 * docs/tilda-integration.md) without breaking the rest.
 */

const isFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- 04 · Formula orbit -------------------------------------------- */

export function initFormula() {
  const root = document.querySelector('[data-rv-formula]');
  if (!root) return;

  const nodes = Array.from(root.querySelectorAll('[data-rv-node]'));
  const panels = Array.from(root.querySelectorAll('[data-rv-panel]'));
  const links = Array.from(root.querySelectorAll('[data-rv-link]'));
  if (!nodes.length || !panels.length) return;

  let active = nodes[0].dataset.rvNode;

  function setActive(key) {
    if (key === active) return;
    active = key;

    nodes.forEach((node) => node.setAttribute('aria-pressed', String(node.dataset.rvNode === key)));
    links.forEach((line) => line.classList.toggle('is-active', line.dataset.rvLink === key));
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.rvPanel !== key;
    });
  }

  nodes.forEach((node) => {
    const key = node.dataset.rvNode;
    node.addEventListener('click', () => setActive(key));
    node.addEventListener('focus', () => setActive(key));
    if (isFinePointer()) {
      node.addEventListener('pointerenter', () => setActive(key));
    }
  });

  setActiveLinkInitial();

  function setActiveLinkInitial() {
    links.forEach((line) => line.classList.toggle('is-active', line.dataset.rvLink === active));
  }

  buildFormulaAccordion(root, panels, nodes);
}

/**
 * Below the orbit breakpoint the five components become a native accordion.
 * The panels are reused rather than duplicated, so there is one source of
 * content for both presentations.
 */
function buildFormulaAccordion(root, panels, nodes) {
  const detail = root.querySelector('[data-rv-detail]');
  const cta = detail?.querySelector('.rv-detail__cta');
  if (!detail || detail.querySelector('.rv-accordion')) return;

  const mq = window.matchMedia('(max-width: 760px)');
  let accordion = null;

  const build = () => {
    if (accordion) return;
    accordion = document.createElement('div');
    accordion.className = 'rv-accordion';

    panels.forEach((panel, index) => {
      const key = panel.dataset.rvPanel;
      const node = nodes.find((n) => n.dataset.rvNode === key);
      const name = node?.querySelector('.rv-node__name')?.textContent?.trim() || key;
      const indexLabel = panel.querySelector('.rv-detail__index')?.textContent?.trim() || '';

      const item = document.createElement('div');
      item.className = 'rv-accordion__item';
      if (index === 0) item.classList.add('is-open');
      item.dataset.rvAccent = panel.dataset.rvAccent || '';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'rv-accordion__trigger';
      trigger.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
      trigger.innerHTML =
        `<span class="rv-accordion__lead">` +
        `<span class="rv-node__index">${indexLabel}</span>` +
        `<span class="rv-node__name"></span>` +
        `</span><span class="rv-accordion__sign" aria-hidden="true"></span>`;
      trigger.querySelector('.rv-node__name').textContent = name;

      const body = document.createElement('div');
      body.className = 'rv-accordion__body';
      const inner = document.createElement('div');
      inner.className = 'rv-accordion__inner';
      body.append(inner);

      trigger.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(open));
      });

      item.append(trigger, body);
      accordion.append(item);
      // Move the real panel content into the accordion body.
      inner.append(panel);
      panel.hidden = false;
    });

    detail.prepend(accordion);
    if (cta) detail.append(cta);
  };

  const teardown = () => {
    if (!accordion) return;
    panels.forEach((panel) => {
      detail.insertBefore(panel, accordion);
      panel.hidden = panel.dataset.rvPanel !== nodes[0].dataset.rvNode;
    });
    accordion.remove();
    accordion = null;
    // Re-assert the desktop active panel.
    const first = nodes.find((n) => n.getAttribute('aria-pressed') === 'true') || nodes[0];
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.rvPanel !== first.dataset.rvNode;
    });
  };

  const apply = () => (mq.matches ? build() : teardown());
  apply();
  mq.addEventListener('change', apply);
}

/* ---------- 05 · Before / after comparison --------------------------------- */

export function initCompare() {
  const root = document.querySelector('[data-rv-compare]');
  if (!root) return;

  const input = root.querySelector('[data-rv-compare-input]');
  if (!input) return;

  const apply = (value) => root.style.setProperty('--rv-split', `${value}%`);

  apply(input.value);
  input.addEventListener('input', () => apply(input.value));

  // Dragging anywhere on the frame moves the split, not just the handle.
  let dragging = false;

  const positionFrom = (clientX) => {
    const rect = root.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(100, Math.max(0, ratio));
    input.value = String(clamped);
    apply(clamped);
  };

  root.addEventListener('pointerdown', (event) => {
    dragging = true;
    root.setPointerCapture?.(event.pointerId);
    positionFrom(event.clientX);
  });

  root.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    positionFrom(event.clientX);
  });

  const stop = (event) => {
    if (!dragging) return;
    dragging = false;
    root.releasePointerCapture?.(event.pointerId);
  };

  root.addEventListener('pointerup', stop);
  root.addEventListener('pointercancel', stop);
}

/* ---------- 06 · Horizontal chapter rail ----------------------------------- */

export function initRail({ engine }) {
  const rail = document.querySelector('[data-rv-rail]');
  const scene = rail?.closest('[data-rv-scene]');
  if (!rail || !scene || !engine) return;

  const mq = window.matchMedia('(max-width: 760px)');
  let travel = 0;

  const measure = () => {
    if (mq.matches) {
      travel = 0;
      rail.style.removeProperty('--rv-rail-x');
      return;
    }
    // Measure the real overflow rather than assuming it: a rail narrower than
    // the viewport would otherwise pin a motionless screen for its whole span.
    travel = Math.max(rail.scrollWidth - window.innerWidth, 0);
  };

  measure();
  window.addEventListener('resize', measure, { passive: true });
  mq.addEventListener('change', measure);

  engine.onProgress((sceneEl, p) => {
    if (sceneEl !== scene || !travel) return;
    rail.style.setProperty('--rv-rail-x', `${(-travel * p).toFixed(1)}px`);
  });
}

/* ---------- 08 · Protocol selector ----------------------------------------- */

export function initProtocolSelector() {
  const root = document.querySelector('[data-rv-selector]');
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[data-rv-goal]'));
  const panels = Array.from(root.querySelectorAll('[data-rv-protocol]'));
  if (!tabs.length || !panels.length) return;

  const select = (key, { focus = false } = {}) => {
    tabs.forEach((tab) => {
      const on = tab.dataset.rvGoal === key;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.rvProtocol !== key;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => select(tab.dataset.rvGoal));
  });

  // Roving focus, as expected of a tablist.
  root.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(document.activeElement);
    if (index === -1) return;
    let next = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (next === null) return;
    event.preventDefault();
    select(tabs[next].dataset.rvGoal, { focus: true });
  });
}

/* ---------- 09 · Direction cards ------------------------------------------- */

export function initDirections() {
  document.querySelectorAll('[data-rv-direction]').forEach((card) => {
    const toggle = card.querySelector('.rv-direction__toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const open = card.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Свернуть' : 'Подробнее';
    });

    // On a fine pointer the card previews its detail on hover. The preview is
    // a separate state from the pinned one, so hovering never inverts what
    // the button reports or leaves the card stuck open.
    if (isFinePointer()) {
      card.addEventListener('pointerenter', () => card.classList.add('is-preview'));
      card.addEventListener('pointerleave', () => card.classList.remove('is-preview'));
    }
  });
}

/* ---------- 11 · Cases carousel -------------------------------------------- */

export function initCases() {
  const viewport = document.querySelector('[data-rv-cases]');
  const track = document.querySelector('[data-rv-case-track]');
  if (!viewport || !track) return;

  const slides = Array.from(track.querySelectorAll('[data-rv-case]'));
  const prev = document.querySelector('[data-rv-case-prev]');
  const next = document.querySelector('[data-rv-case-next]');
  const current = document.querySelector('[data-rv-case-current]');
  const total = document.querySelector('[data-rv-case-total]');
  if (!slides.length) return;

  const mq = window.matchMedia('(max-width: 760px)');
  let index = 0;

  if (total) total.textContent = String(slides.length).padStart(2, '0');

  const nativeScroll = () => getComputedStyle(viewport).overflowX === 'auto';

  const syncControls = () => {
    if (current) current.textContent = String(index + 1).padStart(2, '0');
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
  };

  const render = ({ scroll = false } = {}) => {
    if (nativeScroll()) {
      // Touch: the viewport scrolls natively with snap points; the arrows
      // drive that scroll rather than a transform.
      if (scroll) {
        const slide = slides[index];
        viewport.scrollTo({
          left: slide.offsetLeft - slides[0].offsetLeft,
          behavior: 'smooth',
        });
      }
    } else {
      const offset = slides[index].offsetLeft - slides[0].offsetLeft;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
    syncControls();
  };

  const go = (n) => {
    index = Math.min(slides.length - 1, Math.max(0, n));
    render({ scroll: true });
  };

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));
  window.addEventListener('resize', () => render(), { passive: true });
  mq.addEventListener('change', () => render());

  // Keep the counter honest when the reader scrolls the rail themselves.
  let pending = 0;
  viewport.addEventListener(
    'scroll',
    () => {
      if (!nativeScroll() || pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        const base = slides[0].offsetLeft;
        const nearest = slides.reduce(
          (best, slide, i) =>
            Math.abs(slide.offsetLeft - base - viewport.scrollLeft) <
            Math.abs(slides[best].offsetLeft - base - viewport.scrollLeft)
              ? i
              : best,
          0
        );
        if (nearest !== index) {
          index = nearest;
          syncControls();
        }
      });
    },
    { passive: true }
  );

  render();

  return { go, get index() { return index; }, nativeScroll, slides };
}

/* ---------- 12 · Private selection + form ---------------------------------- */

export function initSelection() {
  const root = document.querySelector('[data-rv-selection]');
  if (!root) return;

  const buttons = Array.from(root.querySelectorAll('[data-rv-profile]'));
  const panel = root.querySelector('[data-rv-private]');
  const choice = root.querySelector('[data-rv-private-choice]');
  const field = document.querySelector('[data-rv-profile-field]');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.rvProfile || '';
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      if (choice) choice.textContent = value;
      if (field) field.value = value;
      if (panel) panel.hidden = false;
    });
  });
}

export function initForm() {
  const form = document.querySelector('[data-rv-form]');
  if (!form) return;

  const status = form.querySelector('[data-rv-form-status]');

  const messages = {
    name: 'Укажите имя',
    contact: 'Укажите телефон или Telegram',
    email: 'Укажите корректный e-mail',
    consent: 'Необходимо согласие на обработку данных',
  };

  const fieldWrap = (input) => input.closest('.rv-field') || input.closest('.rv-consent');

  const setError = (input, message) => {
    const wrap = fieldWrap(input);
    const slot = wrap?.querySelector('[data-rv-error]');
    if (slot) slot.textContent = message || '';
    wrap?.classList.toggle('is-invalid', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  const validate = () => {
    let firstInvalid = null;

    form.querySelectorAll('input, textarea').forEach((input) => {
      if (!input.name || !input.required) return;
      let message = '';

      if (input.type === 'checkbox') {
        if (!input.checked) message = messages[input.name] || 'Заполните поле';
      } else if (!input.value.trim()) {
        message = messages[input.name] || 'Заполните поле';
      } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        message = messages.email;
      }

      setError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    return firstInvalid;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const invalid = validate();
    if (invalid) {
      invalid.focus();
      if (status) status.textContent = 'Проверьте выделенные поля.';
      return;
    }

    const endpoint = form.dataset.rvEndpoint;
    const payload = Object.fromEntries(new FormData(form).entries());

    // No endpoint is configured yet: the integration target is a deployment
    // decision (Tilda handler, webhook or CRM) — see docs/tilda-integration.md.
    if (!endpoint) {
      if (status) {
        status.textContent =
          'Форма пока не подключена к приёмнику заявок. [CONTENT REQUIRED: endpoint]';
      }
      form.dispatchEvent(new CustomEvent('rv:submit', { detail: payload, bubbles: true }));
      return;
    }

    if (status) status.textContent = 'Отправляем…';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      if (status) status.textContent = 'Заявка отправлена. Мы свяжемся с вами.';
    } catch {
      if (status) status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз.';
    }
  });

  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('input', () => setError(input, ''));
    input.addEventListener('change', () => setError(input, ''));
  });
}

/* ---------- Footer year ----------------------------------------------------- */

export function initYear() {
  const slot = document.querySelector('[data-rv-year]');
  if (slot) slot.textContent = String(new Date().getFullYear());
}
