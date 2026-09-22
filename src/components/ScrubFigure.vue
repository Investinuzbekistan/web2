<script setup lang="ts">
/**
 * A large figure that counts up as the chapter scrubs past.
 *
 * With reduced motion the number is simply printed — the value is the point,
 * the counting is decoration.
 */
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

import { canAnimate, gsap, ScrollTrigger } from '../lib/motion';
import { useStore } from '../lib/state';
import { formatValue } from '../lib/shared/content';

const props = defineProps<{
  value: number;
  prefix?: string;
  suffix?: string;
  trigger?: string;
}>();

const { lang } = useStore();
const shown = ref(canAnimate() ? 0 : props.value);
const el = ref<HTMLElement | null>(null);
// Named apart from the `trigger` prop: a local with the same name shadows it in
// the template scope.
let scrubTrigger: ScrollTrigger | null = null;

const render = () => `${props.prefix ?? ''}${formatValue(shown.value, lang.value)}${props.suffix ?? ''}`;
const text = ref(render());
watch([shown, lang], () => (text.value = render()));

onMounted(() => {
  if (!canAnimate() || !el.value) return;
  scrubTrigger = ScrollTrigger.create({
    trigger: props.trigger ?? el.value,
    start: 'top 85%',
    end: 'top 45%',
    scrub: 0.6,
    onUpdate: (self) => {
      shown.value = props.value * self.progress;
    },
    onLeave: () => (shown.value = props.value),
  });
  gsap.set(el.value, { opacity: 1 });
});

onBeforeUnmount(() => {
  scrubTrigger?.kill();
  scrubTrigger = null;
});
</script>

<template>
  <span ref="el" class="scrub-figure figure">{{ text }}</span>
</template>

<style scoped>
.scrub-figure {
  display: inline-block;
  font-variant-numeric: tabular-nums;
}
</style>
