<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import SiteChrome from './components/SiteChrome.vue';
import ChPrologue from './chapters/ChPrologue.vue';
import ChCrossroads from './chapters/ChCrossroads.vue';
import ChMomentum from './chapters/ChMomentum.vue';
import ChYoung from './chapters/ChYoung.vue';
import ChSectors from './chapters/ChSectors.vue';
import ChRoadmap from './chapters/ChRoadmap.vue';
import ChEpilogue from './chapters/ChEpilogue.vue';
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from './lib/motion';
import { retry, startLoading, useStore } from './lib/state';

const { t } = useI18n();
const { content, error, isReady } = useStore();

/** Chapter order; SiteChrome uses this for the counter and the menu. */
const CHAPTERS = [
  { id: 'prologue', key: 'prologue' },
  { id: 'crossroads', key: 'crossroads' },
  { id: 'momentum', key: 'momentum' },
  { id: 'young', key: 'young' },
  { id: 'sectors', key: 'sectors' },
  { id: 'roadmap', key: 'roadmap' },
  { id: 'epilogue', key: 'epilogue' },
];

startLoading();

onMounted(() => {
  startSmoothScroll();
  // Chapters mount after the fetch resolves, so their pinned heights only exist
  // once the content is in. One refresh then settles every trigger.
  const settle = () => ScrollTrigger.refresh();
  const timer = window.setTimeout(settle, 200);
  window.addEventListener('load', settle);
  onBeforeUnmount(() => {
    window.clearTimeout(timer);
    window.removeEventListener('load', settle);
  });
});

onBeforeUnmount(stopSmoothScroll);
</script>

<template>
  <a class="skip-link" href="#prologue">{{ t('skip') }}</a>

  <SiteChrome v-if="isReady" :chapters="CHAPTERS" />

  <main>
    <div v-if="error" class="state" role="alert">
      <h1>{{ t('state.errorTitle') }}</h1>
      <p>{{ t('state.errorBody') }}</p>
      <p class="state__detail">{{ error }}</p>
      <button type="button" @click="retry">{{ t('state.retry') }}</button>
    </div>

    <div v-else-if="!content" class="state" aria-busy="true">
      <span class="state__pulse" aria-hidden="true" />
      <p>{{ t('state.loading') }}</p>
    </div>

    <template v-else>
      <ChPrologue />
      <ChCrossroads />
      <ChMomentum />
      <ChYoung />
      <ChSectors />
      <ChRoadmap />
      <ChEpilogue />
    </template>
  </main>
</template>

<style scoped>
.state {
  min-height: 100svh;
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 0.75rem;
  width: var(--shell);
  margin-inline: auto;
}
.state h1 {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
}
.state__detail {
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  color: var(--ink-dim);
  word-break: break-all;
}
.state button {
  margin-block-start: 1rem;
  padding: 0.85rem 1.6rem;
  border: 0;
  border-radius: 999px;
  background: var(--ink);
  color: var(--night);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.state__pulse {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: var(--glow);
  opacity: 0.35;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(0.85);
    opacity: 0.25;
  }
  50% {
    transform: scale(1);
    opacity: 0.5;
  }
}
</style>
