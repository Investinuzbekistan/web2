<script setup lang="ts">
/**
 * Everything that floats above the chapters: the logo, the reading progress
 * bar, the vertical chapter number and the full-screen menu.
 *
 * Navigation here is deliberately minimal — no top nav bar. The page is read
 * top to bottom; the menu exists for people who want to jump.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { scrollToId } from '../lib/motion';
import { setLang, useStore } from '../lib/state';
import { LANGS, type Lang } from '../lib/shared/content-types';

const props = defineProps<{ chapters: { id: string; key: string }[] }>();

/** Served from public/, written there by scripts/sync-shared.mjs. */
const LOGO_WHITE = 'brand/logo-white.svg';

const { t } = useI18n();
const { lang } = useStore();

const progress = ref(0);
const activeIndex = ref(0);
const menuOpen = ref(false);

/**
 * Scroll handling is split in two so neither part measures layout per event.
 *
 * The progress bar needs the document height, which is a layout read, so it is
 * read once per resize and cached. The active chapter used to cost one
 * getBoundingClientRect per chapter per scroll event — seven forced reflows
 * every frame — and is now an IntersectionObserver.
 */
let maxScroll = 0;
let ticking = false;

function measure() {
  maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  updateProgress();
}

function updateProgress() {
  progress.value = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateProgress();
    ticking = false;
  });
}

let chapterObserver: IntersectionObserver | null = null;

function watchChapters() {
  chapterObserver?.disconnect();
  // A band across the upper middle of the viewport: whichever chapter is
  // crossing it is the one being read.
  chapterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = props.chapters.findIndex((c) => c.id === entry.target.id);
        if (index !== -1) activeIndex.value = index;
      }
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
  );
  for (const chapter of props.chapters) {
    const el = document.getElementById(chapter.id);
    if (el) chapterObserver.observe(el);
  }
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && menuOpen.value) {
    event.preventDefault();
    menuOpen.value = false;
  }
}

onMounted(() => {
  measure();
  watchChapters();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  document.addEventListener('keydown', onKey);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', measure);
  document.removeEventListener('keydown', onKey);
  chapterObserver?.disconnect();
  chapterObserver = null;
});

const counter = computed(() => {
  const n = String(activeIndex.value + 1).padStart(2, '0');
  const total = String(props.chapters.length).padStart(2, '0');
  return `${n} / ${total}`;
});

function go(id: string) {
  menuOpen.value = false;
  scrollToId(id);
}

function choose(code: Lang) {
  setLang(code);
}
</script>

<template>
  <div
    class="progress"
    role="progressbar"
    :aria-label="t('progress')"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span :style="{ transform: `scaleX(${progress})` }" />
  </div>

  <header class="bar">
    <a href="#prologue" class="logo" aria-label="Invest in Uzbekistan" @click.prevent="go('prologue')">
      <!-- Bound, not literal: a literal `src` is rewritten into a build-time
           import, and these files are copied into public/ by sync-shared. -->
      <img :src="LOGO_WHITE" alt="Invest in Uzbekistan" width="150" height="84" />
    </a>

    <div class="bar__right">
      <div class="langs" role="group" :aria-label="t('menu.language')">
        <button
          v-for="code in LANGS"
          :key="code"
          type="button"
          :aria-pressed="lang === code"
          @click="choose(code)"
        >
          {{ code }}
        </button>
      </div>
      <button type="button" class="menu-toggle" :aria-expanded="menuOpen" @click="menuOpen = true">
        {{ t('menu.open') }}
      </button>
    </div>
  </header>

  <p class="chapter__number" aria-hidden="true">{{ counter }}</p>

  <Teleport to="body">
    <div v-if="menuOpen" class="overlay">
      <button type="button" class="overlay__scrim" :aria-label="t('menu.close')" @click="menuOpen = false" />
      <nav class="overlay__inner" :aria-label="t('menu.label')">
        <button type="button" class="overlay__close" @click="menuOpen = false">
          {{ t('menu.close') }}
        </button>
        <ol>
          <li v-for="(chapter, i) in chapters" :key="chapter.id">
            <button type="button" :aria-current="activeIndex === i ? 'true' : undefined" @click="go(chapter.id)">
              <span class="overlay__n">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="overlay__label">
                <small>{{ t(`chapters.${chapter.key}.n`) }}</small>
                {{ t(`chapters.${chapter.key}.title`) }}
              </span>
            </button>
          </li>
        </ol>
      </nav>
    </div>
  </Teleport>
</template>

<style scoped>
.progress {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 60;
  height: 2px;
  background: var(--hairline);
}
.progress > span {
  display: block;
  height: 100%;
  background: var(--glow);
  transform-origin: 0 50%;
  will-change: transform;
}

.bar {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem clamp(1rem, 3vw, 2.5rem);
  background: linear-gradient(to bottom, rgb(5 7 10 / 0.85), transparent);
}
.logo img {
  display: block;
  height: clamp(2rem, 4vw, 2.6rem);
  width: auto;
}

.bar__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.langs {
  display: flex;
  gap: 0.15rem;
  padding: 0.2rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
}
.langs button {
  padding: 0.35rem 0.6rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ink-dim);
  font: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: color 0.18s, background-color 0.18s;
}
.langs button[aria-pressed='true'] {
  background: var(--ink);
  color: var(--night);
}

.menu-toggle {
  padding: 0.6rem 1.1rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.18s;
}
.menu-toggle:hover {
  border-color: var(--teal);
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
}
.overlay__scrim {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgb(5 7 10 / 0.92);
  backdrop-filter: blur(8px);
  cursor: pointer;
}
.overlay__inner {
  position: relative;
  width: var(--shell);
  margin-inline: auto;
  padding-block: clamp(4rem, 12vh, 8rem);
}
.overlay__close {
  position: absolute;
  inset-block-start: 1.5rem;
  inset-inline-end: 0;
  padding: 0.6rem 1.1rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
.overlay ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.25rem;
}
.overlay li button {
  display: flex;
  align-items: baseline;
  gap: clamp(1rem, 3vw, 2.5rem);
  width: 100%;
  padding: clamp(0.6rem, 1.4vh, 1rem) 0;
  border: 0;
  border-block-end: 1px solid var(--hairline);
  background: transparent;
  color: var(--ink-soft);
  text-align: start;
  cursor: pointer;
  transition: color 0.2s;
}
.overlay li button:hover,
.overlay li button[aria-current='true'] {
  color: var(--ink);
}
.overlay__n {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}
.overlay__label {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 4vw, 2.6rem);
  line-height: 1.1;
}
.overlay__label small {
  display: block;
  font-family: var(--font-body);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-dim);
  margin-block-end: 0.2rem;
}
</style>
