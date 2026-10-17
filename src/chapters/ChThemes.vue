<script setup lang="ts">
/**
 * Chapter III — the thematic directions, as a horizontal run.
 *
 * Each card carries the number of portfolio projects filed under it and opens
 * the portfolio already filtered to that direction, so the chapter is a way in
 * rather than a list to read past.
 *
 * The run is pinned — the chapter holds still while the cards travel sideways
 * — only where the scroll arrives in wheel ticks. Under a thumb that same
 * effect is a fight: the page stops where the finger expects it to carry on,
 * the swipe has to be learnt, and the handoff back to vertical scrolling at
 * the end of the row is where every scroll-jacked page on a phone feels
 * broken. On touch, and with reduced motion, the row is a row you swipe, which
 * is a gesture the hardware already has and does at sixty frames a second
 * without any help from us.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ThemeIcon from '../components/ThemeIcon.vue';
import { canAnimate, gsap, SCRUB_QUERY, scrollToId, useChapterTimeline } from '../lib/motion';
import { showSegment, tr, useStore } from '../lib/state';

const { t } = useI18n();
const { forum } = useStore();
const root = ref<HTMLElement | null>(null);

/* Wide enough for the travel to be worth it, and driven by a wheel. The
   query itself is shared with the other pinned chapter; see lib/motion.ts. */
const supportsQuery = typeof matchMedia !== 'undefined';
const pinned = ref(canAnimate() && supportsQuery && matchMedia(SCRUB_QUERY).matches);

/* The query can change under the page — a window dragged narrower, a tablet
   turned on its side — and the row has to change with it, because the CSS that
   lets it scroll itself is the same switch. */
let watcher: MediaQueryList | null = null;
function followQuery(event: MediaQueryListEvent) {
  pinned.value = canAnimate() && event.matches;
}

const themes = computed(() => forum.value?.themes ?? []);
const counts = computed(() => forum.value?.portfolio.segmentCounts ?? {});

function openPortfolio(segment: string) {
  showSegment(segment);
  scrollToId('portfolio');
}

/* gsap.matchMedia builds the pin when the query matches and reverts it when it
   stops matching, which is the only way to take a pin back cleanly — a
   ScrollTrigger that is merely killed leaves its pin-spacer behind. */
let media: ReturnType<typeof gsap.matchMedia> | null = null;

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    media = gsap.matchMedia();
    media.add(SCRUB_QUERY, () => {
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
    });
  },
);

onMounted(() => {
  if (!supportsQuery) return;
  watcher = matchMedia(SCRUB_QUERY);
  watcher.addEventListener('change', followQuery);
});

onBeforeUnmount(() => {
  watcher?.removeEventListener('change', followQuery);
  watcher = null;
  media?.revert();
  media = null;
});
</script>

<template>
  <section id="themes" ref="root" class="chapter themes">
    <div class="shell themes__head">
      <p class="eyebrow chapter-mark">{{ t('chapters.themes.n') }}</p>
      <h2>{{ t('chapters.themes.title') }}</h2>
    </div>

    <ul class="themes__track" :class="{ 'themes__track--free': !pinned }">
      <li v-for="(theme, i) in themes" :key="theme.id" class="themes__card card">
        <div class="themes__top">
          <!-- The icon stands in a niche, the way a figure does in a wall. -->
          <span class="themes__niche">
            <ThemeIcon :name="theme.icon" class="themes__icon" />
          </span>
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
  /* 7rem, not 5: the fixed bar is 93px and a chapter that sets its own top
     padding has to clear it at every window height, as .chapter now does. */
  padding-block-start: clamp(7rem, 14vh, 9rem);
}
h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}

.themes__track {
  display: flex;
  gap: 1.25rem;
  margin: clamp(2.5rem, 7vh, 4rem) 0 0;
  /* The track is full-bleed, but its first card lines up with the heading:
     the same gutter .shell computes from min(100% - 2.5rem, 78rem). Without
     this the row starts at the page edge and, past about 1600px, visibly
     misses the column the chapter is set in. */
  padding-inline: max(var(--gutter), calc((100% - 78rem) / 2));
  list-style: none;
}
/* Only the pinned row is promoted: a layer the compositor holds for a row
   that never transforms is a layer for nothing. */
.themes__track:not(.themes__track--free) {
  will-change: transform;
}
/* Not pinned: the row scrolls itself, which is what a thumb expects anyway. */
.themes__track--free {
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-snap-type: x mandatory;
  padding-block-end: 1rem;
  /* Without this the snap puts the first card flush against the scroll port
     and the gutter above is scrolled straight past, so the row starts at the
     page edge while the heading starts at the column. */
  scroll-padding-inline-start: max(var(--gutter), calc((100% - 78rem) / 2));
}
.themes__track--free .themes__card {
  scroll-snap-align: start;
}

.themes__card {
  position: relative;
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
}

.themes__niche {
  display: grid;
  place-items: center;
  inline-size: 2.9rem;
  block-size: 3.5rem;
  /* Near-square, so the shared arch comes to a point rather than a dome. */
  clip-path: url(#uz-arch);
  background: color-mix(in srgb, var(--accent-deep) 9%, transparent);
  color: var(--accent-deep);
}
.themes__niche .theme-icon {
  margin-block-start: 0.35rem;
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

/**
 * The card's one control — and, through the pseudo-element below, the card.
 *
 * Drawn as a link at the foot of the card, but the whole card is the hit
 * area: on a phone the alternative is asking a thumb to find a line of
 * 14-pixel type at the bottom of a box that is plainly one thing. The
 * stretched pseudo-element is why nothing else in the card may be
 * interactive; there is nothing else, and nothing should be added.
 */
.themes__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-block-start: auto;
  min-block-size: var(--tap);
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
.themes__link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}
@media (hover: hover) {
  .themes__link:hover {
    gap: 0.7rem;
    color: var(--ink);
  }
  /* The card answers the pointer, not just the line of type inside it. */
  .themes__card:hover {
    border-color: var(--gold);
  }
  .themes__card:hover .themes__link {
    gap: 0.7rem;
    color: var(--ink);
  }
}
/* The ring belongs to the card, since the card is what is being pressed. */
.themes__card:has(.themes__link:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.themes__link:focus-visible {
  outline: none;
}
</style>
