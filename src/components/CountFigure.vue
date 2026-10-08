<script setup lang="ts">
/**
 * A large figure that counts up once, the first time it is scrolled into view,
 * and then stays where it landed.
 *
 * It used to be tied to scroll position with a GSAP scrub, which meant the
 * numbers ran backwards when the reader scrolled back up — a figure that
 * changes depending on which way you are going is not a figure, it is a dial.
 * An IntersectionObserver fires once and a tween does the counting, which is
 * also what the brief asked for.
 *
 * With reduced motion the number is simply printed — the value is the point,
 * the counting is decoration.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { canAnimate, gsap } from '../lib/motion';
import { useStore } from '../lib/state';
import { formatValue } from '../lib/shared/content';

const props = withDefaults(
  defineProps<{
    value: number;
    prefix?: string;
    suffix?: string;
    /** Seconds. Longer for bigger numbers reads better than one fixed length. */
    duration?: number;
  }>(),
  { prefix: '', suffix: '', duration: 1.4 },
);

const { lang } = useStore();
const shown = ref(canAnimate() ? 0 : props.value);
const el = ref<HTMLElement | null>(null);

const render = () => `${props.prefix}${formatValue(shown.value, lang.value)}${props.suffix}`;
const text = ref(render());
watch([shown, lang, () => props.value], () => (text.value = render()));

let observer: IntersectionObserver | null = null;
let tween: gsap.core.Tween | null = null;

function run() {
  const counter = { n: 0 };
  tween = gsap.to(counter, {
    n: props.value,
    duration: props.duration,
    ease: 'power2.out',
    onUpdate: () => (shown.value = counter.n),
    // Land exactly on the value rather than on whatever the last frame gave.
    onComplete: () => (shown.value = props.value),
  });
}

onMounted(() => {
  if (!canAnimate() || !el.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer?.disconnect();
      observer = null;
      run();
    },
    // A little before it reaches the middle of the screen, so the count is
    // already running by the time it is being looked at.
    { rootMargin: '0px 0px -20% 0px', threshold: 0 },
  );
  observer.observe(el.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  tween?.kill();
  tween = null;
});
</script>

<template>
  <span ref="el" class="count-figure figure">{{ text }}</span>
</template>

<style scoped>
.count-figure {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}
</style>
