<script setup lang="ts">
/**
 * Prologue: the mark draws itself, the title rises, and a generated globe turns
 * behind it. Without WebGL or with reduced motion the globe is replaced by a
 * static arc graphic — the chapter still reads.
 */
import { defineAsyncComponent, onMounted, ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

import SourceTag from '../components/SourceTag.vue';
import { canAnimate, hasWebGl, onIdle, scrollToId, useChapterTimeline } from '../lib/motion';
import { tr, useStore } from '../lib/state';

const { t } = useI18n();
const { content } = useStore();
const root = ref<HTMLElement | null>(null);

const Globe = shallowRef<ReturnType<typeof defineAsyncComponent> | null>(null);

/** Served from public/, written there by scripts/sync-shared.mjs. */
const MARK = 'brand/logo-icon-white.svg';

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
    const mark = el.querySelector('.prologue__mark');
    if (mark) {
      gsap.fromTo(
        mark,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'power2.inOut' },
      );
    }
    gsap.from(el.querySelectorAll('.prologue__reveal'), {
      y: 28,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      delay: 0.45,
      ease: 'power3.out',
    });
  },
);
</script>

<template>
  <section id="prologue" ref="root" class="chapter prologue">
    <div class="prologue__bg">
      <component :is="Globe" v-if="Globe" />
      <!-- Fallback and under-layer: generated arcs, no asset, always present. -->
      <svg v-else class="prologue__arcs" viewBox="0 0 800 800" aria-hidden="true">
        <defs>
          <radialGradient id="prologue-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00AA95" stop-opacity="0.32" />
            <stop offset="60%" stop-color="#006FB9" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#05070A" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="400" cy="400" r="400" fill="url(#prologue-halo)" />
        <g fill="none" stroke="#00AA95" stroke-opacity="0.22">
          <circle cx="400" cy="400" r="250" />
          <circle cx="400" cy="400" r="180" />
          <ellipse cx="400" cy="400" rx="250" ry="90" />
          <ellipse cx="400" cy="400" rx="250" ry="170" />
          <ellipse cx="400" cy="400" rx="90" ry="250" />
          <ellipse cx="400" cy="400" rx="170" ry="250" />
        </g>
        <circle cx="452" cy="330" r="5" fill="#00AA95" />
      </svg>
    </div>

    <div class="shell prologue__content">
      <!-- The real brand mark, wiped in left-to-right. Using the asset rather
           than a hand-traced path keeps the geometry exactly on-brand; the wipe
           gives the same "drawing itself" read as a stroke-dash animation. -->
      <img class="prologue__mark" :src="MARK" alt="" aria-hidden="true" width="136" height="103" />

      <p class="eyebrow prologue__reveal">{{ t('prologue.agency') }}</p>
      <h1 class="prologue__title prologue__reveal">
        {{ t('chapters.prologue.title') }}
      </h1>
      <p class="prologue__lead prologue__reveal">{{ t('prologue.lead') }}</p>
      <p class="prologue__body prologue__reveal">{{ t('prologue.body') }}</p>

      <p v-if="content" class="prologue__mission prologue__reveal">
        {{ tr(content.organization.tagline) }}
        <SourceTag :id="content.organization.source" />
      </p>

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
.prologue {
  align-content: center;
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
  max-width: 44rem;
}

.prologue__mark {
  display: block;
  width: clamp(4.5rem, 9vw, 7rem);
  height: auto;
  margin-block-end: 2rem;
}

.prologue__title {
  font-size: clamp(2.75rem, 8vw, 6.5rem);
  margin-block: 0.75rem 0;
}

.prologue__lead {
  margin-block-start: 1.75rem;
  font-size: clamp(1.1rem, 1.6vw, 1.45rem);
  color: var(--ink);
}

.prologue__body {
  margin-block-start: 1rem;
  max-width: 34rem;
}

.prologue__mission {
  margin-block-start: 2rem;
  font-size: 0.95rem;
  color: var(--ink-dim);
}

.prologue__scroll {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-block-start: 3rem;
  padding: 0.75rem 1.4rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.2s;
}
.prologue__scroll:hover {
  border-color: var(--teal);
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
