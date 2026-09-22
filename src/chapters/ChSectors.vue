<script setup lang="ts">
/**
 * Chapter IV — the ten priority sectors as a pinned horizontal run.
 *
 * With reduced motion the pin is dropped and the same cards become an ordinary
 * scroll-snapping row, so the content is reachable either way and the keyboard
 * can still tab through every link.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import SourceTag from '../components/SourceTag.vue';
import { canAnimate, useChapterTimeline } from '../lib/motion';
import { tr, useStore } from '../lib/state';

const { t } = useI18n();
const { content } = useStore();
const root = ref<HTMLElement | null>(null);

const sectors = computed(() => content.value?.sectors.items ?? []);
const animated = canAnimate();

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    const track = el.querySelector<HTMLElement>('.sectors__track');
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
  <section id="sectors" ref="root" class="chapter sectors">
    <div class="shell sectors__head">
      <p class="eyebrow">{{ t('chapters.sectors.n') }}</p>
      <h2>{{ t('chapters.sectors.title') }}</h2>
      <p class="sectors__lead">{{ t('sectors.lead') }}</p>
      <p class="sectors__body">
        {{ t('sectors.body') }}
        <SourceTag :id="content?.sectors.source" />
      </p>
    </div>

    <ul class="sectors__track" :class="{ 'sectors__track--free': !animated }">
      <li v-for="(sector, i) in sectors" :key="sector.id" class="sectors__card">
        <span class="sectors__n">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3>{{ tr(sector) }}</h3>
        <a :href="sector.url" target="_blank" rel="noopener noreferrer">
          {{ t('sectors.open') }}
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              d="M7 17 17 7M8 7h9v9"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.sectors {
  align-content: center;
  gap: clamp(2rem, 5vh, 3.5rem);
}

h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}
.sectors__lead {
  margin-block-start: 1.25rem;
  color: var(--ink);
  font-size: 1.1rem;
}
.sectors__body {
  margin-block-start: 0.5rem;
  max-width: 34rem;
}

.sectors__track {
  list-style: none;
  margin: 0;
  padding-inline: max(1.25rem, calc((100vw - var(--shell)) / 2));
  display: flex;
  gap: 1.25rem;
  width: max-content;
}

/* Reduced motion: no pin, no transform — a normal swipeable row. */
.sectors__track--free {
  width: auto;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-block-end: 1rem;
}
.sectors__track--free .sectors__card {
  scroll-snap-align: start;
}

.sectors__card {
  flex: 0 0 auto;
  width: clamp(14rem, 24vw, 19rem);
  min-height: clamp(15rem, 30vh, 20rem);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.75rem;
  border: 1px solid var(--hairline);
  border-radius: 4px;
  background: linear-gradient(160deg, rgb(255 255 255 / 0.05), transparent 60%);
  transition: border-color 0.25s, transform 0.25s;
}
.sectors__card:hover {
  border-color: var(--teal);
  transform: translateY(-4px);
}

.sectors__n {
  font-family: var(--font-body);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}

.sectors__card h3 {
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  margin-block-end: auto;
}

.sectors__card a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--teal);
  text-decoration: none;
}
.sectors__card a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
