<script setup lang="ts">
/**
 * The forum's mark, inlined so it can be animated.
 *
 * `scripts/process-logos.mjs` exports both files with their parts as separate
 * `<g id="…">` elements — the State Emblem and then each of the three lines of
 * type — which is the whole reason these are inlined rather than linked as
 * images: the parts arrive one after another, and the gold gradient keeps
 * drifting under them afterwards so the mark never looks like a flat sticker.
 *
 * `form` picks between the full lockup, emblem and all, and the wordmark on its
 * own. The wordmark exists for slots too small or too wide for the emblem to
 * survive; the client has confirmed the lockup is the mark to lead with.
 */
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue';

import lockupGold from '../assets/forum-lockup.svg?raw';
import lockupWhite from '../assets/forum-lockup-white.svg?raw';
import wordmarkGold from '../assets/forum-wordmark.svg?raw';
import wordmarkWhite from '../assets/forum-wordmark-white.svg?raw';
import { canAnimate, gsap } from '../lib/motion';

const props = withDefaults(
  defineProps<{
    form?: 'lockup' | 'wordmark';
    variant?: 'gold' | 'white';
    /** Animate on mount. Off for the small mark in the header. */
    animate?: boolean;
    /** Keep the gradient drifting after the parts have landed. */
    drift?: boolean;
  }>(),
  { form: 'lockup', variant: 'gold', animate: false, drift: false },
);

const SOURCES = {
  'lockup-gold': lockupGold,
  'lockup-white': lockupWhite,
  'wordmark-gold': wordmarkGold,
  'wordmark-white': wordmarkWhite,
};

const uid = useId();
const root = ref<HTMLElement | null>(null);

/**
 * Ids inside each file are unique per file, not per instance, and the mark
 * appears more than once on the page. Suffixing every id and every url(#…)
 * reference keeps two instances from sharing one gradient.
 */
const markup = computed(() =>
  SOURCES[`${props.form}-${props.variant}` as keyof typeof SOURCES]
    .replace(/id="([^"]+)"/g, (_, id: string) => `id="${id}-${uid}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${id}-${uid})`),
);

let tween: gsap.core.Timeline | null = null;

onMounted(() => {
  if (!props.animate || !canAnimate() || !root.value) return;
  const parts = root.value.querySelectorAll('svg > g > g');
  const gradient = root.value.querySelector('linearGradient');
  if (!parts.length) return;

  tween = gsap.timeline();

  // On the lockup the first group is the emblem: it settles rather than rises,
  // so the three lines of type read as arriving underneath something already
  // standing.
  if (props.form === 'lockup' && parts.length > 1) {
    tween
      .from(parts[0] as SVGGElement, {
        opacity: 0,
        scale: 0.86,
        transformOrigin: '50% 50%',
        duration: 0.9,
        ease: 'power3.out',
      })
      .from(
        Array.from(parts).slice(1),
        { opacity: 0, yPercent: 16, duration: 0.85, stagger: 0.14, ease: 'power3.out' },
        '-=0.55',
      );
  } else {
    tween.from(parts, { opacity: 0, yPercent: 16, duration: 0.85, stagger: 0.14, ease: 'power3.out' });
  }

  // The artwork's gradient runs bottom-left to top-right. Rocking its axis a
  // few degrees reads as light moving across metal rather than as an effect.
  if (props.drift && gradient) {
    tween.to(
      gradient,
      {
        attr: { x1: 0.35, y1: 0.85, x2: 1.25, y2: 0.1 },
        duration: 7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      },
      '-=0.4',
    );
  }
});

onBeforeUnmount(() => {
  tween?.kill();
  tween = null;
});
</script>

<template>
  <!-- The file carries its own role="img", <title> and aria-label.
       `markup` is a build-time import of a brand SVG written by
       scripts/process-logos.mjs and already run through svgo; the only thing
       done to it at runtime is suffixing its ids. No input reaches it. -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div ref="root" class="mark" v-html="markup" />
</template>

<style scoped>
.mark :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
/* Sized by height instead — the header has a bar to fit inside, not a column.
   The wrapper has to take the height too, or the svg's `height: 100%` resolves
   against an auto-height box and collapses to nothing. */
.mark--by-height {
  height: 100%;
}
.mark--by-height :deep(svg) {
  width: auto;
  height: 100%;
}
</style>
