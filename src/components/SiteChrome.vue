<script setup lang="ts">
/**
 * Everything that floats above the chapters: the logo, the top navigation, the
 * reading progress bar, the vertical chapter number and the full-screen menu.
 *
 * The navigation follows the model used on the forum's own site — a sticky bar
 * carrying section links, a language dropdown and one primary call to action,
 * collapsing to a single button on narrow screens. It is rebuilt in this site's
 * own language rather than copied: the links point at this page's chapters, the
 * palette is the forum gold on night, and the button that replaces the links
 * opens the full-screen chapter list this site already had rather than an
 * accordion under the bar.
 *
 * The bar shows five sections. All eight chapters stay in the overlay, which is
 * also the only navigation below 68rem.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ForumMark from './ForumMark.vue';
import { scrollToId } from '../lib/motion';
import { setLang, useStore } from '../lib/state';
import { LANGS, type Lang } from '../lib/shared/content-types';

const props = defineProps<{ chapters: { id: string; key: string }[] }>();

const { t } = useI18n();
const { lang } = useStore();

/** The sections the bar links to, and the chapter each one lands on. */
const NAV = [
  { key: 'why', id: 'crossroads' },
  { key: 'themes', id: 'themes' },
  { key: 'projects', id: 'portfolio' },
  { key: 'programme', id: 'programme' },
  { key: 'contacts', id: 'epilogue' },
] as const;

const LANG_NAMES: Record<Lang, string> = {
  uz: 'Oʻzbekcha',
  ru: 'Русский',
  en: 'English',
};

const progress = ref(0);
/** Past the title card the bar sits over body copy and needs a real backdrop. */
const scrolled = ref(false);
const activeIndex = ref(0);
const menuOpen = ref(false);
const langOpen = ref(false);

const activeId = computed(() => props.chapters[activeIndex.value]?.id);

/**
 * Scroll handling is split in two so neither part measures layout per event.
 *
 * The progress bar needs the document height, which is a layout read, so it is
 * read once per resize and cached. The active chapter used to cost one
 * getBoundingClientRect per chapter per scroll event — eight forced reflows
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
  scrolled.value = window.scrollY > 120;
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
  if (event.key !== 'Escape') return;
  if (langOpen.value) {
    event.preventDefault();
    langOpen.value = false;
  } else if (menuOpen.value) {
    event.preventDefault();
    menuOpen.value = false;
  }
}

/** A dropdown that only closes on its own button is a trap; close on any outside press. */
function onPointerDown(event: Event) {
  if (!langOpen.value) return;
  const target = event.target as HTMLElement | null;
  if (!target?.closest('.langs')) langOpen.value = false;
}

onMounted(() => {
  measure();
  watchChapters();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  document.addEventListener('keydown', onKey);
  document.addEventListener('pointerdown', onPointerDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', measure);
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('pointerdown', onPointerDown);
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
  langOpen.value = false;
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

  <header class="bar" :class="{ 'bar--solid': scrolled }">
    <a
      href="#prologue"
      class="logo"
      aria-label="Tourism Investment Forum 2026"
      @click.prevent="go('prologue')"
    >
      <!-- The link carries the name; the mark inside it must not repeat it. -->
      <ForumMark form="lockup" variant="white" class="mark--by-height" aria-hidden="true" />
    </a>

    <!-- Named apart from the overlay's nav: two navigation landmarks with the
         same name are indistinguishable when they are listed. -->
    <nav class="nav" :aria-label="t('menu.sections')">
      <a
        v-for="item in NAV"
        :key="item.key"
        :href="`#${item.id}`"
        :aria-current="activeId === item.id ? 'true' : undefined"
        @click.prevent="go(item.id)"
      >
        {{ t(`nav.${item.key}`) }}
      </a>
    </nav>

    <div class="bar__right">
      <div class="langs">
        <button
          type="button"
          class="langs__toggle"
          :aria-expanded="langOpen"
          :aria-label="t('menu.language')"
          @click="langOpen = !langOpen"
        >
          <span>{{ lang }}</span>
          <svg viewBox="0 0 12 8" width="10" height="7" aria-hidden="true">
            <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6" />
          </svg>
        </button>
        <ul v-if="langOpen" class="langs__menu">
          <li v-for="code in LANGS" :key="code">
            <button type="button" :aria-current="lang === code ? 'true' : undefined" @click="choose(code)">
              {{ LANG_NAMES[code] }}
            </button>
          </li>
        </ul>
      </div>

      <button type="button" class="bar__cta" @click="go('epilogue')">
        {{ t('nav.cta') }}
      </button>

      <button type="button" class="menu-toggle" :aria-expanded="menuOpen" @click="menuOpen = true">
        <span class="menu-toggle__text">{{ t('menu.open') }}</span>
        <svg class="menu-toggle__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
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
  gap: clamp(1rem, 3vw, 2.5rem);
  padding: 0.9rem clamp(1rem, 3vw, 2.5rem);
  background: linear-gradient(to bottom, rgb(5 7 10 / 0.85), transparent);
  transition: background-color 0.25s, border-color 0.25s;
}
/* Over the title card a gradient scrim is enough. Below it the bar crosses
   running text, so it takes a surface of its own. */
.bar--solid {
  background: rgb(5 7 10 / 0.82);
  border-block-end: 1px solid var(--hairline);
  backdrop-filter: blur(10px);
}

.logo {
  /* The lockup is 1.33:1 — nearly square — so in a bar it is sized by height,
     not by width, or it pushes the bar open on small screens. */
  display: block;
  flex: 0 0 auto;
  height: clamp(3rem, 6.5vw, 4rem);
}

/* The section links. Hidden below 68rem, where the overlay takes over — the
   same trade the forum's own bar makes at its `lg` breakpoint. */
.nav {
  display: none;
  align-items: center;
  gap: clamp(1rem, 2.2vw, 2rem);
  min-width: 0;
}
.nav a {
  position: relative;
  padding-block: 0.4rem;
  font-size: 0.82rem;
  color: var(--ink-soft);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.18s;
}
.nav a::after {
  content: '';
  position: absolute;
  inset-block-end: 0;
  inset-inline: 0;
  height: 1px;
  background: var(--accent-soft);
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform 0.22s;
}
.nav a:hover {
  color: var(--ink);
}
.nav a:hover::after,
.nav a[aria-current='true']::after {
  transform: scaleX(1);
}
.nav a[aria-current='true'] {
  color: var(--ink);
}

.bar__right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.langs {
  position: relative;
}
.langs__toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s;
}
.langs__toggle:hover,
.langs__toggle[aria-expanded='true'] {
  border-color: var(--accent);
  color: var(--ink);
}
.langs__menu {
  position: absolute;
  inset-block-start: calc(100% + 0.5rem);
  inset-inline-end: 0;
  z-index: 10;
  min-width: 9rem;
  margin: 0;
  padding: 0.3rem;
  list-style: none;
  border: 1px solid var(--hairline);
  border-radius: 0.7rem;
  background: var(--night-2);
  box-shadow: 0 1rem 2rem rgb(0 0 0 / 0.45);
}
.langs__menu button {
  display: block;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 0;
  border-radius: 0.45rem;
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  font-size: 0.85rem;
  text-align: start;
  cursor: pointer;
}
.langs__menu button:hover {
  background: rgb(255 255 255 / 0.06);
  color: var(--ink);
}
.langs__menu button[aria-current='true'] {
  color: var(--accent-soft);
}

/* The bar's one call to action, as on the forum's own site. Hidden on the
   narrowest screens, where the title card's buttons are a scroll away. */
.bar__cta {
  display: none;
  padding: 0.55rem 1.1rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--night);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.18s;
}
.bar__cta:hover {
  background: var(--ink);
}

.menu-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.1rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.18s;
}
.menu-toggle:hover {
  border-color: var(--accent);
}
.menu-toggle__icon {
  display: none;
}

@media (min-width: 30rem) {
  .bar__cta {
    display: inline-flex;
  }
}

@media (min-width: 68rem) {
  .nav {
    display: flex;
  }
  /* With the sections on the bar the overlay becomes the "everything" menu, so
     its button steps back to an icon. */
  .menu-toggle {
    padding: 0.55rem;
    border-radius: 0.6rem;
  }
  .menu-toggle__text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .menu-toggle__icon {
    display: block;
  }
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
