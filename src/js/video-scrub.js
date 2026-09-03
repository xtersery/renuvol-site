/**
 * Scroll-driven video scrubbing.
 *
 * Scroll position sets a *target* playhead; a standalone rAF loop walks the
 * real playhead toward it. Wheel and trackpad events do not arrive at a
 * constant rate, so writing currentTime 1:1 reproduces every gap in them and
 * reads as stutter. Three mechanisms keep it smooth:
 *
 *   - lerp        the playhead eases toward the target each frame
 *   - deadband    writes smaller than a threshold are skipped (they cost a
 *                 seek and show nothing)
 *   - coalescing  no new seek is issued while the decoder is still resolving
 *                 the last one, so a fast flick cannot pile seeks up
 *
 * The clip is fetched as a Blob so seeking never depends on HTTP range
 * support, and the poster is held until a real frame has painted (iOS keeps a
 * seeked-but-never-played muted video blank, so hiding the poster on metadata
 * alone flashes an empty stage).
 *
 * Ranges are configurable per element and default to the whole clip; cues are
 * keyed to scroll progress elsewhere, so the video file can be swapped
 * without touching any timings here.
 */

const LERP = 0.18;
const DEADBAND_DESKTOP = 0.008; // seconds
const DEADBAND_TOUCH = 0.02;

/**
 * Choose the best clip this browser can actually decode, at the right size
 * for the device. WebM/VP9 is preferred where supported (smaller, seeks
 * well); MP4/H.264 covers Safari and iOS. Some builds ship without the
 * proprietary H.264 decoder entirely, so this is a capability check rather
 * than a browser sniff.
 */
function pickSource(video, isTouch) {
  const d = video.dataset;
  const webm = (isTouch && d.rvSrcWebmMobile) || d.rvSrcWebm;
  const mp4 = (isTouch && d.rvSrcMobile) || d.rvSrc || video.getAttribute('src');

  if (webm && video.canPlayType('video/webm; codecs="vp9"')) return webm;
  if (mp4 && video.canPlayType('video/mp4; codecs="avc1.42E01E"')) return mp4;
  return mp4 || webm || '';
}

export function initVideoScrub({ engine, reducedMotion = false } = {}) {
  const video = document.querySelector('[data-rv-scrub]');
  if (!video) return null;

  const media = video.closest('.rv-hero__media') || video.parentElement;
  const scene = video.closest('[data-rv-scene]');
  const poster = document.querySelector('[data-rv-poster]');

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const deadband = isTouch ? DEADBAND_TOUCH : DEADBAND_DESKTOP;

  // Under reduced motion the film does not scrub: the poster frame stands in.
  if (reducedMotion) {
    media?.classList.remove('is-ready');
    return null;
  }

  const src = pickSource(video, isTouch);
  if (!src) return null;

  let duration = 0;
  let rangeStart = parseFloat(video.dataset.rvStart || '0');
  let rangeEnd = parseFloat(video.dataset.rvEnd || 'NaN');
  let target = 0;
  let current = 0;
  let lastP = 0;
  let seeking = false;
  let painted = false;
  let raf = 0;
  let objectUrl = '';

  const markPainted = () => {
    if (painted) return;
    painted = true;
    media?.classList.add('is-ready');
  };

  const onSeeked = () => {
    seeking = false;
    markPainted();
  };

  video.addEventListener('seeked', onSeeked);
  video.addEventListener('loadeddata', markPainted);

  video.addEventListener('loadedmetadata', async () => {
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration) return;
    if (!Number.isFinite(rangeEnd) || rangeEnd <= rangeStart) rangeEnd = duration;

    // A muted video that has never played can stay blank after a seek on some
    // browsers (notably iOS Safari). Priming it with an immediate play/pause
    // forces the decoder to produce a frame.
    try {
      await video.play();
      video.pause();
    } catch {
      /* autoplay may be refused; the seek below is usually enough */
    }

    current = rangeStart + (rangeEnd - rangeStart) * lastP;
    target = current;
    try {
      video.currentTime = current;
    } catch {
      /* the loop will retry on the next progress tick */
    }
    if (!raf) raf = requestAnimationFrame(step);
  });

  // We already hold the bytes after the fetch below, so preloading costs
  // nothing extra — but it must be enabled or the element never decodes.
  video.preload = 'auto';

  // Blob load: guarantees seekability regardless of server range support.
  fetch(src)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
    .then((blob) => {
      objectUrl = URL.createObjectURL(blob);
      video.src = objectUrl;
      video.load();
    })
    .catch(() => {
      // Fall back to a plain src; scrubbing still works where the server
      // supports range requests (Vite and most static hosts do).
      video.src = src;
      video.load();
    });

  const unsubscribe = engine.onProgress((sceneEl, p) => {
    if (sceneEl !== scene) return;
    lastP = p;
    if (!duration) return;
    target = rangeStart + (rangeEnd - rangeStart) * p;
    if (!raf) raf = requestAnimationFrame(step);
  });

  function step() {
    raf = 0;
    if (!duration) return;

    current += (target - current) * LERP;

    const delta = Math.abs(current - video.currentTime);
    if (!seeking && delta > deadband) {
      seeking = true;
      try {
        video.currentTime = current;
      } catch {
        seeking = false;
      }
    }

    // Keep stepping while the playhead has not settled on its target.
    if (Math.abs(target - current) > deadband) {
      raf = requestAnimationFrame(step);
    }
  }

  return {
    destroy() {
      unsubscribe();
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener('seeked', onSeeked);
      video.removeAttribute('src');
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
  };
}
