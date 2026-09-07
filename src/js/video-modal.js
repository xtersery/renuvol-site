/**
 * Optional film experience.
 *
 * The video is a secondary asset: its source is not attached until the
 * visitor opens the modal, so it costs nothing at first paint and the page
 * is complete without it. Nothing on the page depends on it loading.
 */

/**
 * Pick the best clip this browser can actually decode, at the right size for
 * the device. Some builds ship without the proprietary H.264 decoder, so this
 * is a capability check rather than a browser sniff.
 */
function pickSource(video, isTouch) {
  const d = video.dataset;
  const webm = (isTouch && d.rvSrcWebmMobile) || d.rvSrcWebm;
  const mp4 = (isTouch && d.rvSrcMobile) || d.rvSrc;

  if (webm && video.canPlayType('video/webm; codecs="vp9"')) return webm;
  if (mp4 && video.canPlayType('video/mp4; codecs="avc1.42E01E"')) return mp4;
  return mp4 || webm || '';
}

export function initFilm() {
  const root = document.querySelector('[data-rv-film]');
  const video = root?.querySelector('[data-rv-film-video]');
  const openers = document.querySelectorAll('[data-rv-video-open]');
  if (!root || !video || !openers.length) return null;

  const dialog = root.querySelector('.rv-film__dialog');
  // The source clip closes on a third-party manufacturer end-card, which is
  // not ours to publish without a rights decision (docs/claims-verification.md).
  // Stop the film before it. Remove the attribute once the master is trimmed.
  const endAt = parseFloat(video.dataset.rvEnd || '');
  let lastFocus = null;
  let loaded = false;

  if (Number.isFinite(endAt)) {
    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= endAt) {
        video.pause();
        video.currentTime = endAt;
      }
    });
  }

  const open = () => {
    lastFocus = document.activeElement;

    // Attach the source on first open only.
    if (!loaded) {
      const src = pickSource(video, window.matchMedia('(pointer: coarse)').matches);
      if (src) {
        video.src = src;
        loaded = true;
      }
    }

    root.hidden = false;
    document.body.style.overflow = 'hidden';
    root.querySelector('[data-rv-film-close]')?.focus();

    // Play on the visitor's action, never on load, and never with sound
    // they did not ask for.
    video.play().catch(() => {
      /* the controls are there if autoplay is refused */
    });
  };

  const close = () => {
    video.pause();
    if (Number.isFinite(endAt) && video.currentTime >= endAt) video.currentTime = 0;
    root.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  };

  openers.forEach((btn) => btn.addEventListener('click', open));
  root.querySelectorAll('[data-rv-film-close]').forEach((el) =>
    el.addEventListener('click', close)
  );

  document.addEventListener('keydown', (event) => {
    if (root.hidden) return;

    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab' || !dialog) return;

    const focusable = dialog.querySelectorAll('button, video[controls], a[href]');
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

  return { open, close };
}
