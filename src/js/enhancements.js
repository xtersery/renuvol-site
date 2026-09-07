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
 * Глава рельса открывает панель с англоязычным слайдом; пока указатель
 * находится на самой панели, показывается русская версия. На устройствах без
 * hover панель открывается тапом, второй тап по картинке меняет язык, третий
 * закрывает.
 *
 * Если слайд не удалось загрузить, панель не открывается вовсе и подсказка у
 * главы прячется: отсутствующий файл не должен превращаться в пустой чёрный
 * экран поверх страницы.
 */
export function initProofPreview() {
  const triggers = Array.from(document.querySelectorAll('[data-rv-proof-open]'));
  if (!triggers.length) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  triggers.forEach((trigger) => {
    const proof = document.getElementById(trigger.getAttribute('aria-controls') || '');
    if (!proof) return;

    const images = Array.from(proof.querySelectorAll('[data-rv-proof-lang]'));
    const primary = images.find((i) => i.dataset.rvProofLang === 'en') || images[0];
    if (!primary) return;

    let closeTimer = 0;
    let hideTimer = 0;
    let warmed = null;
    let open = false;

    const setLang = (lang) => {
      images.forEach((img) => img.classList.toggle('is-active', img.dataset.rvProofLang === lang));
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
      window.clearTimeout(closeTimer);
      window.clearTimeout(hideTimer);
      if (open) return;

      if (!(await warm())) {
        disable();
        return;
      }

      open = true;
      setLang('en');
      proof.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      // Два кадра: за один браузер не успевает засчитать снятие hidden,
      // и переход не запускается.
      requestAnimationFrame(() => requestAnimationFrame(() => proof.classList.add('is-open')));
    };

    const hide = () => {
      if (!open) return;
      open = false;
      proof.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      setLang('en');
      hideTimer = window.setTimeout(() => {
        proof.hidden = true;
      }, 400);
    };

    const hideSoon = () => {
      window.clearTimeout(closeTimer);
      // Небольшая пауза: панель перекрывает главу, и без неё уход курсора с
      // главы на саму панель читался бы как «ушёл совсем».
      closeTimer = window.setTimeout(hide, 90);
    };

    trigger.addEventListener('pointerenter', () => {
      if (fine.matches) show();
    });

    /**
     * Открытая панель занимает весь экран и накрывает саму главу, поэтому
     * hover-события кнопки до неё больше не доходят: пока панель открыта,
     * положение курсора считаем сами.
     *
     * Курсор над главой — английский слайд, над картинкой — русский, мимо
     * обоих — закрываем.
     */
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

    proof.addEventListener('pointermove', (event) => {
      if (!fine.matches || !open) return;
      const { clientX: x, clientY: y } = event;

      if (inside(trigger.getBoundingClientRect(), x, y)) {
        window.clearTimeout(closeTimer);
        setLang('en');
        return;
      }
      if (inside(imageBox(), x, y)) {
        window.clearTimeout(closeTimer);
        setLang('ru');
        return;
      }
      hideSoon();
    });

    // Курсор ушёл за пределы окна.
    proof.addEventListener('pointerleave', () => {
      if (fine.matches) hideSoon();
    });

    // Клавиатура: панель следует за фокусом кнопки.
    trigger.addEventListener('focus', () => {
      if (fine.matches) show();
    });
    trigger.addEventListener('blur', hideSoon);

    // Без hover — тапами: открыть, сменить язык, закрыть.
    trigger.addEventListener('click', () => {
      if (fine.matches) return;
      if (open) hide();
      else show();
    });
    proof.addEventListener('click', () => {
      if (fine.matches) return;
      const showingRu = images.some((i) => i.dataset.rvProofLang === 'ru' && i.classList.contains('is-active'));
      if (showingRu) hide();
      else setLang('ru');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && open) hide();
    });
  });
}
