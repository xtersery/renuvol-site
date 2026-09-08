/**
 * RENUVOL — progressive enhancements.
 *
 * Five of these behaviours were authored directly on the deployed build as
 * inline scripts and lifted back into source; `initProofPreview` was added
 * afterwards. Each one attaches only to markup it finds and does nothing when
 * that markup is absent, so a section can be moved or removed without touching
 * this file.
 *
 * Ordering note: `initFormAlert` listens on the capture phase while the form
 * engine in interactions.js listens on the bubble phase, so the alert always
 * observes the engine's validation classes regardless of which module runs
 * first.
 */

/**
 * Ingredient photo switcher: syncs the orbit photos with the selected node.
 *
 * The node engine owns `aria-pressed`; this watches those flips rather than
 * duplicating the click handling, so there is one source of truth for which
 * ingredient is active.
 */
export function initIngredientPhotos() {
  const root = document.querySelector('[data-rv-formula]');
  if (!root) return;

  const nodes = Array.from(root.querySelectorAll('[data-rv-node]'));
  const photos = Array.from(root.querySelectorAll('[data-rv-photo]'));
  if (!nodes.length || !photos.length) return;

  const currentKey = () => {
    const active = nodes.find((n) => n.getAttribute('aria-pressed') === 'true');
    return (active || nodes[0]).dataset.rvNode;
  };

  const sync = () => {
    const key = currentKey();
    photos.forEach((p) => p.classList.toggle('is-active', p.dataset.rvPhoto === key));
  };

  const observer = new MutationObserver(sync);
  nodes.forEach((n) => observer.observe(n, { attributes: true, attributeFilter: ['aria-pressed'] }));

  sync(); // initial state (PDO is pressed by default)
}

/** Hero word: gentle pointer parallax for the RENU/VOL headline. */
export function initHeroWordParallax() {
  const hero = document.querySelector('.rv-hero');
  const word = document.querySelector('[data-rv-hero-word]');
  if (!hero || !word) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return; // mouse/trackpad only

  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;

  hero.addEventListener('pointermove', (event) => {
    const r = hero.getBoundingClientRect();
    tx = ((event.clientX - r.left) / r.width - 0.5) * 20;
    ty = ((event.clientY - r.top) / r.height - 0.5) * 14;
  });
  hero.addEventListener('pointerleave', () => {
    tx = 0;
    ty = 0;
  });

  const loop = () => {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    word.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`;
    requestAnimationFrame(loop);
  };
  loop();
}

/**
 * Параллакс-декор: молекулы и сферы двигаются со скроллом.
 *
 * Writes the `translate` property rather than `transform`, so it does not
 * fight the CSS drift animation that already owns `transform` on these
 * elements.
 */
export function initParallaxDecor() {
  const els = Array.from(document.querySelectorAll('[data-rv-para]'));
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = els.map((el) => ({
    el,
    sec: el.closest('[data-rv-scene]') || el.parentElement,
    speed: parseFloat(el.getAttribute('data-rv-para')) || 0,
  }));

  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight || 800;
    const mid = vh / 2;
    items.forEach((it) => {
      const r = it.sec.getBoundingClientRect();
      if (r.bottom < -220 || r.top > vh + 220) return;
      const p = (mid - (r.top + r.height / 2)) / (r.height + vh); // ~ -0.5 … 0.5
      it.el.style.translate = `0 ${(p * it.speed * 2).toFixed(1)}px`;
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update);
  update();
}

/** Просмотр декларации: открыть/закрыть, запрет контекстного меню на документе. */
export function initDocView() {
  const view = document.querySelector('[data-rv-docview]');
  if (!view) return;

  const open = () => {
    view.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    view.hidden = true;
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-rv-docview-open]').forEach((b) => b.addEventListener('click', open));
  view.querySelectorAll('[data-rv-docview-close]').forEach((b) => b.addEventListener('click', close));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !view.hidden) close();
  });

  view.addEventListener('contextmenu', (event) => event.preventDefault());
}

/** Форма: общее сообщение, если обязательные поля не заполнены. */
export function initFormAlert() {
  const form = document.querySelector('[data-rv-form]');
  const alert = document.querySelector('[data-rv-form-alert]');
  if (!form || !alert) return;

  const status = form.querySelector('[data-rv-form-status]');

  form.addEventListener(
    'submit',
    () => {
      // Показываем сообщение после того, как штатный обработчик расставил is-invalid.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          alert.hidden = !form.querySelector('.is-invalid');
        });
      });
    },
    true, // capture: сам сабмит не трогаем, только читаем результат валидации
  );

  const isValid = (field) => {
    if (field.type === 'checkbox') return field.checked;
    const value = field.value.trim();
    if (!value) return false;
    if (field.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return true;
  };

  const refresh = () => {
    const invalid = form.querySelector('.is-invalid');
    alert.hidden = !invalid;
    if (!invalid && status && status.textContent === 'Проверьте выделенные поля.') {
      status.textContent = '';
    }
  };

  form.querySelectorAll('input, textarea').forEach((field) => {
    if (field.type === 'hidden' || !field.required) return;
    const wrap = field.closest('.rv-field') || field.closest('.rv-consent');

    const onEdit = () => {
      // Снимаем красную рамку с поля, как только оно корректно заполнено.
      if (wrap && wrap.classList.contains('is-invalid') && isValid(field)) {
        wrap.classList.remove('is-invalid');
        field.removeAttribute('aria-invalid');
      }
      refresh();
    };

    field.addEventListener('input', onEdit);
    field.addEventListener('change', onEdit);
  });
}

/**
 * Данные исследования во всю высоту экрана.
 *
 * Панель открывается кликом по главе рельса — наведение только подсвечивает
 * призыв на карточке. Раньше открывало само наведение, и это давало
 * неустранимую двусмысленность: панель разворачивается почти во весь экран и
 * накрывает карточку, поэтому «курсор на главе» и «курсор на картинке»
 * оказывались одной точкой, а язык зависел от того, двигалась ли мышь. Клик
 * снимает вопрос целиком.
 *
 * Открывается всегда на английской версии. На мыши русская показывается, пока
 * курсор над картинкой; на тач-устройствах — по тапу в неё. Закрывают крестик,
 * клик мимо картинки и Escape.
 *
 * Если слайд не удалось загрузить, панель не открывается вовсе и подсказка у
 * главы прячется: отсутствующий файл не должен превращаться в пустой чёрный
 * экран поверх страницы.
 */
export function initProofPreview() {
  const triggers = Array.from(document.querySelectorAll('[data-rv-proof-open]'));
  if (!triggers.length) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Открытой может быть только одна панель: две полноэкранные друг на друге —
  // гарантированная путаница с языком и закрытием.
  const panels = [];

  triggers.forEach((trigger) => {
    const proof = document.getElementById(trigger.getAttribute('aria-controls') || '');
    if (!proof) return;

    const images = Array.from(proof.querySelectorAll('[data-rv-proof-lang]'));
    const primary = images.find((i) => i.dataset.rvProofLang === 'en') || images[0];
    if (!primary) return;

    let open = false;
    let openedAt = 0;
    let hideTimer = 0;
    let warmed = null;

    const setLang = (lang) => {
      images.forEach((img) => img.classList.toggle('is-active', img.dataset.rvProofLang === lang));
    };
    const currentLang = () =>
      (images.find((i) => i.classList.contains('is-active')) || primary).dataset.rvProofLang;

    const inside = (rect, x, y) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    /** Объединённый прямоугольник обеих версий: пропорции у них разные. */
    const imageBox = () => {
      const rects = images.map((img) => img.getBoundingClientRect());
      return {
        left: Math.min(...rects.map((r) => r.left)),
        right: Math.max(...rects.map((r) => r.right)),
        top: Math.min(...rects.map((r) => r.top)),
        bottom: Math.max(...rects.map((r) => r.bottom)),
      };
    };

    const disable = () => {
      trigger.disabled = true;
      trigger.closest('.rv-chapter')?.classList.add('is-unavailable');
    };

    /** Грузит слайды по первому обращению и сообщает, есть ли что показывать. */
    const warm = () => {
      if (warmed) return warmed;
      warmed = Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              img.loading = 'eager';
              if (img.complete) {
                resolve(img.naturalWidth > 0);
                return;
              }
              img.addEventListener('load', () => resolve(true), { once: true });
              img.addEventListener('error', () => resolve(false), { once: true });
            }),
        ),
      ).then((results) => results[images.indexOf(primary)]);
      return warmed;
    };

    const show = async () => {
      if (open) return;
      if (!(await warm())) {
        disable();
        return;
      }

      panels.forEach((other) => {
        if (other.proof !== proof) other.hide();
      });

      open = true;
      openedAt = performance.now();
      window.clearTimeout(hideTimer);
      setLang('en');
      proof.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      // Два кадра: за один браузер не успевает засчитать снятие hidden,
      // и переход не запускается.
      requestAnimationFrame(() => requestAnimationFrame(() => proof.classList.add('is-open')));
      proof.querySelector('[data-rv-proof-close]')?.focus({ preventScroll: true });
    };

    const hide = ({ returnFocus = false } = {}) => {
      if (!open) return;
      open = false;
      zoom.reset({ instant: true });
      proof.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      setLang('en');
      hideTimer = window.setTimeout(() => {
        proof.hidden = true;
      }, 400);
      if (returnFocus) trigger.focus({ preventScroll: true });
    };

    panels.push({ proof, hide });

    trigger.addEventListener('click', show);

    // На мыши язык следует за курсором: над картинкой — русская версия.
    proof.addEventListener('pointermove', (event) => {
      if (!fine.matches || !open) return;
      setLang(inside(imageBox(), event.clientX, event.clientY) ? 'ru' : 'en');
    });

    // Щипок и перетаскивание на сенсорных экранах.
    const zoom = initPinchZoom(proof, images, fine);

    proof.addEventListener('click', (event) => {
      if (!open) return;
      // Клик, которым панель открыли, долетает до неё самой — она к этому
      // моменту уже накрыла экран. Отсекаем по времени открытия.
      if (performance.now() - openedAt < 350) return;

      if (event.target.closest('[data-rv-proof-close]')) {
        hide({ returnFocus: true });
        return;
      }
      // Жест уже обработан как щипок или перетаскивание — тапом это не считаем.
      if (zoom.consumeGesture()) return;
      // Приближённая картинка: клик возвращает масштаб, а не закрывает панель,
      // иначе из увеличения нельзя выйти, не свернув всё.
      if (zoom.isZoomed()) {
        zoom.reset();
        return;
      }

      if (inside(imageBox(), event.clientX, event.clientY)) {
        // На мыши языком управляет наведение, второй раз трогать его кликом
        // незачем; на тач-устройствах это единственный способ переключиться.
        if (!fine.matches) setLang(currentLang() === 'ru' ? 'en' : 'ru');
        return;
      }

      hide({ returnFocus: true }); // клик мимо картинки
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && open) hide({ returnFocus: true });
    });
  });
}

/**
 * Щипок и перетаскивание для панели с данными исследования.
 *
 * Горизонтальный слайд на вертикальном экране телефона ужимается до
 * нечитаемого, поэтому его нужно уметь приблизить. Работает только там, где
 * нет мыши: на десктопе панель живёт по наведению и увеличение ей ни к чему.
 *
 * Трансформация вешается на обе версии слайда сразу — они лежат в одной
 * ячейке грида, поэтому смена языка не сбрасывает масштаб и не сдвигает кадр.
 *
 * @returns {{ isZoomed: () => boolean, reset: (opts?: {instant?: boolean}) => void,
 *             consumeGesture: () => boolean }}
 */
function initPinchZoom(proof, images, fine) {
  const MIN = 1;
  const MAX = 4;

  let scale = MIN;
  let tx = 0;
  let ty = 0;

  // Жест был именно жестом (двигали или щипали), а не тапом.
  let gestured = false;

  const pointers = new Map();
  let start = null;

  const apply = () => {
    const transform = scale === MIN && tx === 0 && ty === 0 ? '' : `translate(${tx}px, ${ty}px) scale(${scale})`;
    images.forEach((img) => {
      img.style.transform = transform;
    });
  };

  const clampOffsets = () => {
    // Активная версия задаёт границы: у двух слайдов разные пропорции.
    const active = images.find((i) => i.classList.contains('is-active')) || images[0];
    const rect = active.getBoundingClientRect();
    const baseW = rect.width / scale;
    const baseH = rect.height / scale;
    const maxX = Math.max(0, (baseW * scale - proof.clientWidth) / 2);
    const maxY = Math.max(0, (baseH * scale - proof.clientHeight) / 2);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  };

  const reset = ({ instant = false } = {}) => {
    scale = MIN;
    tx = 0;
    ty = 0;
    if (!instant) {
      proof.classList.add('is-zoom-easing');
      window.setTimeout(() => proof.classList.remove('is-zoom-easing'), 280);
    }
    apply();
  };

  const midpoint = () => {
    const pts = Array.from(pointers.values());
    return {
      x: (pts[0].x + pts[1].x) / 2,
      y: (pts[0].y + pts[1].y) / 2,
    };
  };

  const spread = () => {
    const pts = Array.from(pointers.values());
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  };

  const beginPinch = () => {
    const active = images.find((i) => i.classList.contains('is-active')) || images[0];
    const rect = active.getBoundingClientRect();
    // Масштаб не двигает центр элемента, поэтому центр в состоянии покоя —
    // это текущий центр минус накопленный сдвиг.
    const centre = { x: rect.left + rect.width / 2 - tx, y: rect.top + rect.height / 2 - ty };
    const mid = midpoint();
    start = {
      kind: 'pinch',
      scale,
      dist: spread(),
      centre,
      // Точка контента под пальцами: она должна остаться на месте при зуме.
      anchor: { x: (mid.x - centre.x - tx) / scale, y: (mid.y - centre.y - ty) / scale },
    };
  };

  const beginPan = (event) => {
    start = { kind: 'pan', x: event.clientX, y: event.clientY, tx, ty };
  };

  proof.addEventListener('pointerdown', (event) => {
    if (fine.matches) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gestured = false;

    if (pointers.size === 2) beginPinch();
    else if (pointers.size === 1 && scale > MIN) beginPan(event);
    else start = null;
  });

  proof.addEventListener(
    'pointermove',
    (event) => {
      if (fine.matches || !pointers.has(event.pointerId) || !start) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (start.kind === 'pinch' && pointers.size >= 2) {
        const dist = spread();
        if (!start.dist) return;
        scale = Math.min(MAX, Math.max(MIN, (start.scale * dist) / start.dist));
        const mid = midpoint();
        tx = mid.x - start.centre.x - scale * start.anchor.x;
        ty = mid.y - start.centre.y - scale * start.anchor.y;
        clampOffsets();
        apply();
        gestured = true;
        return;
      }

      if (start.kind === 'pan' && pointers.size === 1) {
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.hypot(dx, dy) > 6) gestured = true;
        tx = start.tx + dx;
        ty = start.ty + dy;
        clampOffsets();
        apply();
      }
    },
    { passive: true },
  );

  const release = (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);

    if (pointers.size === 1 && scale > MIN) {
      // Один палец отпустили после щипка — продолжаем как перетаскивание.
      const [remaining] = Array.from(pointers.values());
      start = { kind: 'pan', x: remaining.x, y: remaining.y, tx, ty };
    } else if (pointers.size === 0) {
      start = null;
      if (scale <= MIN) reset({ instant: true }); // на всякий случай снимаем остаточный сдвиг
    }
  };

  proof.addEventListener('pointerup', release);
  proof.addEventListener('pointercancel', release);

  return {
    isZoomed: () => scale > MIN + 0.01,
    reset,
    consumeGesture: () => {
      const was = gestured;
      gestured = false;
      return was;
    },
  };
}

/**
 * Левитация объекта INCUBE: параллакс указателя и защита от отсутствующего файла.
 *
 * Трансформации разведены по трём слоям, потому что одно и то же свойство
 * нельзя писать из двух мест: внешняя обёртка получает `translate` от
 * `initParallaxDecor`, средний слой держит бесконечный дрейф в CSS, а здесь
 * трогается только сама картинка. Поэтому объект одновременно плывёт со
 * скроллом, дышит сам по себе и отзывается на курсор, ничего не перебивая.
 *
 * Если картинки нет, секция схлопывается в текстовую: пустая колонка или
 * значок битого изображения выглядят хуже, чем её отсутствие.
 */
export function initLevitate() {
  const objects = Array.from(document.querySelectorAll('[data-rv-levitate]'));
  if (!objects.length) return;

  objects.forEach((object) => {
    const img = object.querySelector('[data-rv-levitate-img]');
    if (!img) return;

    const markMissing = () => object.closest('section')?.classList.add('is-imageless');
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing, { once: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return; // мышь и трекпад

    const section = object.closest('section') || object;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let running = false;

    section.addEventListener('pointermove', (event) => {
      const r = section.getBoundingClientRect();
      // Отклонение от центра секции, а не от картинки: объект отзывается на
      // движение по всей секции, включая колонку с текстом.
      tx = ((event.clientX - r.left) / r.width - 0.5) * 40;
      ty = ((event.clientY - r.top) / r.height - 0.5) * 28;
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    });
    section.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
    });

    function loop() {
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      img.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      // Останавливаем цикл, когда объект вернулся в покой: держать rAF ради
      // нулевого смещения незачем.
      if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05 && tx === 0 && ty === 0) {
        img.style.transform = '';
        running = false;
        return;
      }
      requestAnimationFrame(loop);
    }
  });
}
