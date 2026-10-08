<script setup lang="ts">
/**
 * The forum's title card: the wordmark arrives a line of type at a time, the
 * date and place follow, and a generated globe turns behind it. Without WebGL
 * or with reduced motion the globe is replaced by a static arc graphic — the
 * chapter still reads.
 */
import { computed, defineAsyncComponent, onMounted, ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import ForumMark from '../components/ForumMark.vue';
import { canAnimate, hasWebGl, onIdle, scrollToId, useChapterTimeline } from '../lib/motion';
import { eventDates, tr, useStore } from '../lib/state';

const { t } = useI18n();
const { forum } = useStore();
const root = ref<HTMLElement | null>(null);

const Globe = shallowRef<ReturnType<typeof defineAsyncComponent> | null>(null);

const event = computed(() => forum.value?.event);
const dates = computed(() => eventDates());

onMounted(() => {
  if (!canAnimate() || !hasWebGl()) return;
  // three.js is ~450 kB; it waits for an idle moment and never blocks the text.
  onIdle(() => {
    Globe.value = defineAsyncComponent(() => import('../components/HeroGlobe.vue'));
  });
});

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    gsap.from(el.querySelectorAll('.prologue__reveal'), {
      y: 26,
      opacity: 0,
      duration: 0.9,
      stagger: 0.1,
      // After the wordmark's own three lines have landed.
      delay: 0.85,
      ease: 'power3.out',
    });
  },
);
</script>

<template>
  <section id="prologue" ref="root" class="chapter stage prologue">
    <div class="prologue__bg">
      <component :is="Globe" v-if="Globe" />
      <!-- Fallback and under-layer: generated arcs, no asset, always present. -->
      <svg v-else class="prologue__arcs" viewBox="0 0 800 800" aria-hidden="true">
        <defs>
          <radialGradient id="prologue-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#E4BB7D" stop-opacity="0.26" />
            <stop offset="60%" stop-color="#C18429" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#101538" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="400" cy="400" r="400" fill="url(#prologue-halo)" />
        <g fill="none" stroke="#D2A156" stroke-opacity="0.2">
          <circle cx="400" cy="400" r="250" />
          <circle cx="400" cy="400" r="180" />
          <ellipse cx="400" cy="400" rx="250" ry="90" />
          <ellipse cx="400" cy="400" rx="250" ry="170" />
          <ellipse cx="400" cy="400" rx="90" ry="250" />
          <ellipse cx="400" cy="400" rx="170" ry="250" />
        </g>
        <circle cx="452" cy="330" r="5" fill="#E4BB7D" />
      </svg>
    </div>

    <div class="shell prologue__content">
      <p class="eyebrow prologue__organiser">{{ t('prologue.organiser') }}</p>

      <h1 class="prologue__mark">
        <span class="sr-only">{{ event ? tr(event.name) : '' }}</span>
        <ForumMark form="lockup" animate drift aria-hidden="true" />
      </h1>

      <p v-if="event" class="prologue__when prologue__reveal">
        <span class="prologue__dates">{{ dates }}</span>
        <span class="prologue__dot" aria-hidden="true">·</span>
        <span>{{ tr(event.city) }}</span>
      </p>

      <p class="prologue__within prologue__reveal">{{ t('prologue.within') }}</p>

      <p v-if="event" class="prologue__motto prologue__reveal">
        <span class="prologue__motto-1">{{ tr(event.motto.line1) }}</span>
        <span class="prologue__motto-2">{{ tr(event.motto.line2) }}</span>
      </p>

      <p class="prologue__lead prologue__reveal">{{ t('prologue.lead') }}</p>

      <div class="prologue__actions prologue__reveal">
        <button type="button" class="btn btn--solid" @click="scrollToId('portfolio')">
          {{ t('prologue.cta') }}
        </button>
        <button type="button" class="btn" @click="scrollToId('epilogue')">
          {{ t('prologue.cta2') }}
        </button>
      </div>

      <button type="button" class="prologue__scroll prologue__reveal" @click="scrollToId('crossroads')">
        <span>{{ t('scrollHint') }}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
/* The header is fixed and, at 360px, about 86px tall. The chapter's default
   padding is not enough to clear it, so the title card sets its own. */
.prologue {
  padding-block-start: clamp(7rem, 16vh, 9rem);
}

.prologue__bg {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
.prologue__arcs {
  width: min(120vh, 110vw);
  height: auto;
  opacity: 0.9;
}

.prologue__content {
  position: relative;
  z-index: 2;
  max-width: 46rem;
}

.prologue__organiser {
  color: var(--forum-sand);
}

.prologue__mark {
  margin-block: 1.5rem 0;
  /* The wordmark is 1.91:1; this keeps it off the right edge on wide screens. */
  width: min(82%, 23rem);
}

.prologue__when {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.6rem;
  margin-block-start: 2rem;
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 3vw, 2rem);
  color: var(--ink);
}
.prologue__dot {
  color: var(--forum-mid);
}

.prologue__within {
  margin-block-start: 0.5rem;
  font-size: 0.95rem;
  color: var(--ink-dim);
}

.prologue__motto {
  display: grid;
  gap: 0.2rem;
  margin-block-start: 2rem;
  padding-inline-start: 1.1rem;
  border-inline-start: 2px solid var(--forum-mid);
}
.prologue__motto-1 {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--forum-sand);
}
.prologue__motto-2 {
  font-family: var(--font-display);
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  color: var(--ink);
}

.prologue__lead {
  margin-block-start: 1.75rem;
  max-width: 34rem;
}

.prologue__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-block-start: 2.25rem;
}

.prologue__scroll {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-block-start: 3rem;
  padding: 0.6rem 0;
  border: 0;
  background: transparent;
  color: var(--ink-dim);
  font: inherit;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;
}
.prologue__scroll:hover {
  color: var(--ink);
}
.prologue__scroll svg {
  animation: nudge 2.4s ease-in-out infinite;
}

@keyframes nudge {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}
</style>
