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

import { canAnimate, gsap, ScrollTrigger } from '../lib/motion';
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

let trigger: ScrollTrigger | null = null;
let tween: gsap.core.Tween | null = null;

/**
 * Count in the figure's own precision, not in the tween's.
 *
 * The tween carries a float, and printing it raw made a count of seventy-four
 * projects pass through "73.8" and a count of thirteen regions sit on "13.0".
 * A reader who glances at the page mid-animation sees a wrong number, and a
 * wrong number is worse than no animation. So every frame is rounded to the
 * number of decimals the final value actually has: none for a count, one for
 * a sum in millions.
 */
const DECIMALS = Number.isInteger(props.value) ? 0 : 1;

function run() {
  const counter = { n: 0 };
  tween = gsap.to(counter, {
    n: props.value,
    duration: props.duration,
    ease: 'power2.out',
    onUpdate: () => (shown.value = Number(counter.n.toFixed(DECIMALS))),
    // Land exactly on the value rather than on whatever the last frame gave.
    onComplete: () => (shown.value = props.value),
  });
}

onMounted(() => {
  if (!canAnimate() || !el.value) return;
  /**
   * ScrollTrigger rather than an IntersectionObserver.
   *
   * An observer only reports a crossing, and a figure the reader jumps clean
   * past — which the bar's links do — goes from "below the viewport" to "above
   * it" without ever intersecting, so no crossing is reported and the number
   * sits on zero for good. ScrollTrigger evaluates where the page actually is
   * and fires either way.
   *
   * `once` is what keeps it from running backwards: it counts the first time
   * the figure is reached and never again.
   */
  trigger = ScrollTrigger.create({
    trigger: el.value,
    start: 'top 85%',
    once: true,
    onEnter: run,
  });
});

onBeforeUnmount(() => {
  trigger?.kill();
  trigger = null;
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
