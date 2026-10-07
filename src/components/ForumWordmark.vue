<script setup lang="ts">
/**
 * The forum wordmark, inlined so it can be animated.
 *
 * `scripts/process-logos.mjs` exports this file with its three lines of type as
 * separate `<g id="…-line-n">` groups, which is the whole reason it is inlined
 * rather than linked as an <img>: the lines arrive one after another, and the
 * gold gradient keeps drifting under them afterwards so the mark never looks
 * like a flat sticker.
 *
 * The State Emblem that sits above the type in the organiser's full lockup is
 * deliberately not used in the site chrome — see brand/palette.json. The
 * emblem-free wordmark carries the identity on its own.
 */
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue';

import goldSvg from '../assets/forum-wordmark.svg?raw';
import whiteSvg from '../assets/forum-wordmark-white.svg?raw';
import { canAnimate, gsap } from '../lib/motion';

const props = withDefaults(
  defineProps<{
    variant?: 'gold' | 'white';
    /** Animate on mount. Off for the small mark in the header. */
    animate?: boolean;
    /** Keep the gradient drifting after the lines have landed. */
    drift?: boolean;
  }>(),
  { variant: 'gold', animate: false, drift: false },
);

const uid = useId();
const root = ref<HTMLElement | null>(null);

/**
 * Ids inside the file are unique per file, not per instance, and the wordmark
 * appears more than once on the page. Suffixing every id and every url(#…)
 * reference keeps two instances from sharing one gradient.
 */
const markup = computed(() => {
  const raw = props.variant === 'white' ? whiteSvg : goldSvg;
  return raw
    .replace(/id="([^"]+)"/g, (_, id: string) => `id="${id}-${uid}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${id}-${uid})`);
});

let tween: gsap.core.Timeline | null = null;

onMounted(() => {
  if (!props.animate || !canAnimate() || !root.value) return;
  const lines = root.value.querySelectorAll('svg > g > g');
  const gradient = root.value.querySelector('linearGradient');
  if (!lines.length) return;

  tween = gsap.timeline();
  tween.from(lines, {
    opacity: 0,
    yPercent: 16,
    duration: 0.85,
    stagger: 0.14,
    ease: 'power3.out',
  });

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
       `markup` is a build-time import of brand/svg/forum-wordmark.svg, written
       by scripts/process-logos.mjs and already run through svgo; the only thing
       done to it at runtime is suffixing its ids. No input reaches it. -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div ref="root" class="wordmark" v-html="markup" />
</template>

<style scoped>
.wordmark :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
