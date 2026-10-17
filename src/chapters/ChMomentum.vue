<script setup lang="ts">
/**
 * Chapter II — the four headline figures of 2025, each arriving on its own.
 * Source and date travel with every number.
 *
 * The arrival fires once rather than being scrubbed with the scroll: tied to
 * scroll position the rows faded back out on the way up, and a figure that
 * dims when you scroll back to check it is a figure you cannot check.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CountFigure from '../components/CountFigure.vue';
import { useChapterTimeline } from '../lib/motion';
import { tr, useStore } from '../lib/state';

const { t } = useI18n();
const { content } = useStore();
const root = ref<HTMLElement | null>(null);

/** The four an investor asks for first, in narrative order. */
const ORDER = ['gdp', 'gdp_growth', 'foreign_investment', 'trade'];

const figures = computed(() => {
  const economy = content.value?.economy_2025;
  if (!economy) return [];
  return ORDER.map((id) => economy.kpis.find((k) => k.id === id)).filter((k) => k !== undefined);
});


useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    gsap.from(el.querySelectorAll('.momentum__row'), {
      scrollTrigger: { trigger: el, start: 'top 70%' },
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.14,
      ease: 'power2.out',
    });
  },
);
</script>

<template>
  <section id="momentum" ref="root" class="chapter momentum">
    <div class="shell">
      <p class="eyebrow chapter-mark">{{ t('chapters.momentum.n') }}</p>
      <h2>{{ t('chapters.momentum.title') }}</h2>

      <ol class="momentum__list">
        <li v-for="figure in figures" :key="figure.id" class="momentum__row">
          <CountFigure
            class="momentum__value"
            :value="figure.value"
            :prefix="figure.prefix"
            :suffix="figure.suffix"
          />
          <span class="momentum__label">{{ tr(figure.label) }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}

.momentum__list {
  list-style: none;
  margin: clamp(3rem, 8vh, 5rem) 0 0;
  padding: 0;
  display: grid;
  gap: clamp(1.5rem, 4vh, 3rem);
}

.momentum__row {
  display: grid;
  gap: 0.35rem;
  padding-block-end: clamp(1.5rem, 4vh, 3rem);
  border-block-end: 1px solid var(--hairline);
}
.momentum__row:last-child {
  border-block-end: 0;
  padding-block-end: 0;
}

:deep(.momentum__value) {
  font-size: clamp(3rem, 11vw, 8rem);
  line-height: 0.95;
}

.momentum__label {
  font-size: clamp(0.95rem, 1.4vw, 1.15rem);
  color: var(--ink-dim);
}

@media (min-width: 60rem) {
  .momentum__row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 18rem);
    align-items: baseline;
    gap: 2rem;
  }
}
</style>
