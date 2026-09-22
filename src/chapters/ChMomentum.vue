<script setup lang="ts">
/**
 * Chapter II — the four headline figures of 2025, each arriving on its own as
 * the chapter scrubs. Source and date travel with every number.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ScrubFigure from '../components/ScrubFigure.vue';
import SourceTag from '../components/SourceTag.vue';
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

const source = computed(() => content.value?.economy_2025.source);

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    gsap.from(el.querySelectorAll('.momentum__row'), {
      scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
      y: 40,
      opacity: 0,
      stagger: 0.25,
      ease: 'none',
    });
  },
);
</script>

<template>
  <section id="momentum" ref="root" class="chapter momentum">
    <div class="shell">
      <p class="eyebrow">{{ t('chapters.momentum.n') }}</p>
      <h2>{{ t('chapters.momentum.title') }}</h2>
      <p class="momentum__lead">{{ t('momentum.lead') }}</p>
      <p class="momentum__body">{{ t('momentum.body') }}</p>

      <ol class="momentum__list">
        <li v-for="figure in figures" :key="figure.id" class="momentum__row">
          <ScrubFigure
            class="momentum__value"
            :value="figure.value"
            :prefix="figure.prefix"
            :suffix="figure.suffix"
          />
          <span class="momentum__label">
            {{ tr(figure.label) }}
            <SourceTag :id="source" />
          </span>
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
.momentum__lead {
  margin-block-start: 1.5rem;
  color: var(--ink);
  font-size: 1.1rem;
}
.momentum__body {
  margin-block-start: 0.6rem;
  max-width: 34rem;
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
