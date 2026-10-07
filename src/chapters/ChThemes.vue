<script setup lang="ts">
/**
 * Chapter III — the eight thematic directions, as a pinned horizontal run.
 *
 * Each card carries the number of portfolio projects filed under it and opens
 * the portfolio already filtered to that direction, so the chapter is a way in
 * rather than a list to read past.
 *
 * With reduced motion the pin is dropped and the cards become an ordinary
 * scroll-snapping row, so everything stays reachable and tabbable.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ThemeIcon from '../components/ThemeIcon.vue';
import { canAnimate, scrollToId, useChapterTimeline } from '../lib/motion';
import { showSegment, tr, useStore } from '../lib/state';

const { t } = useI18n();
const { forum } = useStore();
const root = ref<HTMLElement | null>(null);
const animated = canAnimate();

const themes = computed(() => forum.value?.themes ?? []);
const counts = computed(() => forum.value?.portfolio.segmentCounts ?? {});

function openPortfolio(segment: string) {
  showSegment(segment);
  scrollToId('portfolio');
}

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    const track = el.querySelector<HTMLElement>('.themes__track');
    if (!track) return;

    gsap.to(track, {
      // Translate by exactly the overflow, so the last card lands flush.
      x: () => -(track.scrollWidth - el.clientWidth + 48),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => `+=${track.scrollWidth - el.clientWidth + 48}`,
        pin: true,
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    });
  },
);
</script>

<template>
  <section id="themes" ref="root" class="chapter themes">
    <div class="shell themes__head">
      <p class="eyebrow">{{ t('chapters.themes.n') }}</p>
      <h2>{{ t('chapters.themes.title') }}</h2>
      <p class="themes__lead">{{ t('themes.lead') }}</p>
      <p class="themes__body">{{ t('themes.body') }}</p>
    </div>

    <ul class="themes__track" :class="{ 'themes__track--free': !animated }">
      <li v-for="(theme, i) in themes" :key="theme.id" class="themes__card card">
        <div class="themes__top">
          <ThemeIcon :name="theme.icon" class="themes__icon" />
          <span class="themes__n">{{ String(i + 1).padStart(2, '0') }}</span>
        </div>
        <h3>{{ tr(theme.title) }}</h3>
        <p class="themes__text">{{ tr(theme.body) }}</p>
        <button
          v-if="counts[theme.id]"
          type="button"
          class="themes__link"
          @click="openPortfolio(theme.id)"
        >
          {{ t('themes.projectsIn', counts[theme.id] ?? 0) }}
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              d="M5 12h14m0 0-6-6m6 6-6 6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.themes {
  align-content: start;
  padding-block-start: clamp(5rem, 14vh, 9rem);
}
h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}
.themes__lead {
  margin-block-start: 1.5rem;
  color: var(--ink);
  font-size: 1.1rem;
}
.themes__body {
  margin-block-start: 0.6rem;
  max-width: 34rem;
}

.themes__track {
  display: flex;
  gap: 1.25rem;
  margin: clamp(2.5rem, 7vh, 4rem) 0 0;
  padding: 0 clamp(1.25rem, 3vw, 2.5rem);
  list-style: none;
  will-change: transform;
}
/* Reduced motion: no pin, so the row has to scroll by itself. */
.themes__track--free {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-block-end: 1rem;
}
.themes__track--free .themes__card {
  scroll-snap-align: start;
}

.themes__card {
  flex: 0 0 min(80vw, 21rem);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
}

.themes__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: 0.5rem;
  color: var(--accent-soft);
}
.themes__n {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}

h3 {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
}
.themes__text {
  font-size: 0.92rem;
  color: var(--ink-soft);
}

.themes__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-block-start: auto;
  padding: 0.6rem 0 0;
  border: 0;
  background: transparent;
  color: var(--accent-soft);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: start;
  cursor: pointer;
  transition: gap 0.18s, color 0.18s;
}
.themes__link:hover {
  gap: 0.7rem;
  color: var(--ink);
}
</style>
