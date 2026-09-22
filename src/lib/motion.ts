/**
 * Motion plumbing: GSAP registration, Lenis smooth scroll and a single source of
 * truth for "is motion allowed here".
 *
 * `prefers-reduced-motion` is not treated as a hint to slow things down. When it
 * is set, Lenis never starts, nothing is pinned and nothing is scrubbed — the
 * page becomes an ordinary vertical document. Every chapter checks `canAnimate`
 * before building a timeline.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { onBeforeUnmount, onMounted } from 'vue';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

const reduceQuery =
  typeof matchMedia === 'undefined' ? null : matchMedia('(prefers-reduced-motion: reduce)');

/** False when the visitor asked for reduced motion. Read at setup time. */
export const canAnimate = (): boolean => !reduceQuery?.matches;

let lenis: Lenis | null = null;

export function startSmoothScroll(): void {
  if (!canAnimate() || lenis) return;

  lenis = new Lenis({
    duration: 1.05,
    // A gentle exponential ease; anything longer starts to feel like lag.
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
  });

  // Lenis drives the scroll position, so ScrollTrigger must be told to read it
  // from Lenis's RAF rather than from native scroll events.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function stopSmoothScroll(): void {
  lenis?.destroy();
  lenis = null;
}

export function scrollToId(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else target.scrollIntoView({ behavior: canAnimate() ? 'smooth' : 'auto' });
}

/**
 * Build a GSAP timeline for one chapter and tear it down on unmount.
 *
 * The callback runs inside a gsap.context bound to the chapter root, so every
 * tween and ScrollTrigger it creates is reverted together — no stray triggers
 * left pinning a section that no longer exists.
 */
export function useChapterTimeline(
  root: () => HTMLElement | null | undefined,
  build: (ctx: { gsap: typeof gsap; root: HTMLElement }) => void,
): void {
  let context: gsap.Context | null = null;

  onMounted(() => {
    const el = root();
    if (!el || !canAnimate()) return;
    context = gsap.context(() => build({ gsap, root: el }), el);
  });

  onBeforeUnmount(() => {
    context?.revert();
    context = null;
  });
}

/** True when the browser can actually give us a WebGL context. */
export function hasWebGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Run work when the browser is idle, with a timeout so it always runs. */
export function onIdle(task: () => void, timeout = 2500): void {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(task, { timeout });
  else setTimeout(task, 300);
}
