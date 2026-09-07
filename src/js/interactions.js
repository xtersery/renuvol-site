/**
 * Pointer-driven interactions and scene transformation.
 *
 * Everything here is namespaced to the RENUVOL markup and attaches only to
 * elements it finds, so any single section can be lifted out (see
 * docs/tilda-integration.md) without breaking the rest.
 */

const isFinePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Pointer parallax ------------------------------------------------
   Publishes a normalised pointer position (-1..1) so any element carrying
   .rv-pointer can respond in CSS. Fine pointers only, and never under
   reduced motion. */

export function initPointer() {
  if (!isFinePointer()) return;

  const root = document.documentElement;
  let pending = 0;
  let x = 0;
  let y = 0;

  window.addEventListener(
    'pointermove',
    (event) => {
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        root.style.setProperty('--rv-mx', x.toFixed(3));
        root.style.setProperty('--rv-my', y.toFixed(3));
      });
    },
    { passive: true }
  );
}

/* ---------- 04 · Formula orbit -------------------------------------------- */

/** Ingredient identities. One colour drives the whole scene per selection. */
const INGREDIENT_TINT = {
  pdo: 'var(--rv-a-pdo)',
  pn: 'var(--rv-a-pn)',
  vitc: 'var(--rv-a-vitc)',
  gsh: 'var(--rv-a-gsh)',
  ha: 'var(--rv-a-ha)',
};

export function initFormula() {
  const root = document.querySelector('[data-rv-formula]');
  if (!root) return;

  const section = root.closest('[data-rv-scene]');
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

    // Selecting an ingredient transforms the scene, not just the text: the
    // halo, the wash across the product, the connector and the heading all
    // read from this one value.
    if (section && INGREDIENT_TINT[key]) {
      section.style.setProperty('--rv-active', INGREDIENT_TINT[key]);
    }
  }

  nodes.forEach((node) => {
    const key = node.dataset.rvNode;
    node.addEventListener('click', () => setActive(key));
    node.addEventListener('focus', () => setActive(key));
    if (isFinePointer()) {
      node.addEventListener('pointerenter', () => setActive(key));
    }
  });

  links.forEach((line) => line.classList.toggle('is-active', line.dataset.rvLink === active));
  if (section && INGREDIENT_TINT[active]) {
    section.style.setProperty('--rv-active', INGREDIENT_TINT[active]);
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

  const mq = window.matchMedia('(max-width: 860px)');
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
      item.dataset.rvAccent = panel.dataset.rvAccent || '';
      if (index === 0) item.classList.add('is-open');

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'rv-accordion__trigger';
      trigger.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
      trigger.innerHTML =
        '<span class="rv-accordion__lead">' +
        `<span class="rv-accordion__dot" aria-hidden="true"></span>` +
        `<span class="rv-node__index">${indexLabel}</span>` +
        '<span class="rv-node__name"></span>' +
        '</span><span class="rv-accordion__sign" aria-hidden="true"></span>';
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
      inner.append(panel);
      panel.hidden = false;
    });

    detail.prepend(accordion);
    if (cta) detail.append(cta);
  };

  const teardown = () => {
    if (!accordion) return;
    panels.forEach((panel) => detail.insertBefore(panel, accordion));
    accordion.remove();
    accordion = null;
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

/* ---------- 06 · Chapter rail + the evolving form --------------------------- */

/**
 * Five states of one form. The rail's progress selects the state, so the
 * central sculpture is the section's protagonist and the chapters are its
 * captions.
 */
const MORPH_STATES = [
  // Увлажнение — liquid, luminous, full
  { tint: 'var(--rv-a-ha)', radius: '50%', scale: 1, stretch: 1, ring: 1, core: 0.9 },
  // Плотность — compressed, denser, tighter
  { tint: 'var(--rv-a-pdo)', radius: '44% 44% 40% 40% / 46% 46% 42% 42%', scale: 0.92, stretch: 0.82, ring: 0.86, core: 0.55 },
  // Эластичность — stretched
  { tint: 'var(--rv-a-pn)', radius: '52% 48% 46% 54% / 58% 54% 46% 42%', scale: 1.04, stretch: 1.22, ring: 1.1, core: 0.6 },
  // Рельеф — refined, smoothed
  { tint: 'var(--rv-a-gsh)', radius: '50%', scale: 0.98, stretch: 1, ring: 0.94, core: 0.42 },
  // Glow — brightest, iridescent
  { tint: 'var(--rv-a-vitc)', radius: '50%', scale: 1.14, stretch: 1, ring: 1.24, core: 1 },
];

export function initRail({ engine }) {
  const rail = document.querySelector('[data-rv-rail]');
  const scene = rail?.closest('[data-rv-scene]');
  if (!rail || !scene || !engine) return;

  const stage = scene.querySelector('[data-rv-stage]') || scene;
  const chapters = Array.from(rail.querySelectorAll('.rv-chapter'));
  const mq = window.matchMedia('(max-width: 860px)');
  let travel = 0;
  let state = -1;

  const measure = () => {
    if (mq.matches) {
      travel = 0;
      rail.style.removeProperty('--rv-rail-x');
      return;
    }
    // Measure real overflow rather than assuming it: a rail narrower than the
    // viewport would otherwise pin a motionless screen for its whole span.
    travel = Math.max(rail.scrollWidth - window.innerWidth, 0);
  };

  const setState = (index) => {
    if (index === state) return;
    state = index;
    const s = MORPH_STATES[index] || MORPH_STATES[0];
    stage.style.setProperty('--rv-stage-tint', s.tint);
    stage.style.setProperty('--rv-morph-radius', s.radius);
    stage.style.setProperty('--rv-morph-scale', String(s.scale));
    stage.style.setProperty('--rv-morph-stretch', String(s.stretch));
    stage.style.setProperty('--rv-morph-ring', String(s.ring));
    stage.style.setProperty('--rv-morph-core', String(s.core));

    chapters.forEach((chapter, i) => {
      chapter.style.opacity = i === index ? '1' : '0.36';
    });
  };

  measure();
  setState(0);
  window.addEventListener('resize', measure, { passive: true });
  mq.addEventListener('change', measure);

  engine.onProgress((sceneEl, p) => {
    if (sceneEl !== scene) return;
    if (travel) rail.style.setProperty('--rv-rail-x', `${(-travel * p).toFixed(1)}px`);
    // Progress selects which of the five states the form is in.
    setState(Math.min(MORPH_STATES.length - 1, Math.floor(p * MORPH_STATES.length)));
  });

  // On touch the rail scrolls natively, so the state follows that scroll.
  rail.addEventListener(
    'scroll',
    () => {
      if (!mq.matches) return;
      const max = rail.scrollWidth - rail.clientWidth;
      if (max <= 0) return;
      const p = rail.scrollLeft / max;
      setState(Math.min(MORPH_STATES.length - 1, Math.round(p * (MORPH_STATES.length - 1))));
    },
    { passive: true }
  );
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
      form.dispatchEvent(new CustomEvent('rv:submit', { detail: payload, bubbles: true }));
      if (status) status.textContent = 'Спасибо. Мы свяжемся с вами.';
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
