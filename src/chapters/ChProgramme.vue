<script setup lang="ts">
/**
 * Chapter V — the day, hour by hour, and the four key sessions under it.
 *
 * The timeline is a description list rather than a table: the rows are not
 * comparable along a second axis, and a <dl> keeps the time attached to the
 * item it belongs to when it is read out.
 *
 * Topic lists are collapsed by default — plenary 2 alone has six sub-themes,
 * and the shape of the day is the point of this chapter.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DocTag from '../components/DocTag.vue';
import type { ProgrammeItem } from '../lib/forum-types';
import { useChapterTimeline } from '../lib/motion';
import { tr, useStore } from '../lib/state';

const { t } = useI18n();
const { forum } = useStore();
const root = ref<HTMLElement | null>(null);
const open = ref(new Set<string>());

const programme = computed(() => forum.value?.programme);
const sessions = computed(() => forum.value?.sessions ?? []);

const keyOf = (item: ProgrammeItem) => `${item.start}-${item.kind}`;

function toggle(item: ProgrammeItem) {
  const key = keyOf(item);
  const next = new Set(open.value);
  if (!next.delete(key)) next.add(key);
  open.value = next;
}

const kindLabel = (item: ProgrammeItem) =>
  item.kind === 'plenary' ? t('programme.kinds.plenary', { n: item.plenary ?? 1 }) : t(`programme.kinds.${item.kind}`);

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    gsap.from(el.querySelectorAll('.day__row'), {
      scrollTrigger: { trigger: el.querySelector('.day'), start: 'top 78%' },
      opacity: 0,
      x: -18,
      duration: 0.55,
      stagger: 0.06,
      ease: 'power2.out',
    });
  },
);
</script>

<template>
  <section id="programme" ref="root" class="chapter programme">
    <div class="shell">
      <p class="eyebrow">{{ t('chapters.programme.n') }}</p>
      <h2>{{ t('chapters.programme.title') }}</h2>
      <p class="programme__lead">{{ t('programme.lead') }}</p>
      <p class="programme__body">{{ t('programme.body') }}</p>

      <dl v-if="programme" class="day">
        <div v-for="item in programme.items" :key="keyOf(item)" class="day__row" :class="`day__row--${item.kind}`">
          <dt class="day__time">
            <span class="day__clock">{{ item.start }}</span>
            <span class="day__dash" aria-hidden="true">–</span>
            <span class="day__clock day__clock--end">{{ item.end }}</span>
          </dt>
          <dd class="day__item">
            <p class="day__kind">{{ kindLabel(item) }}</p>
            <h3 class="day__title">{{ tr(item.title) }}</h3>
            <p v-if="item.body" class="day__text">{{ tr(item.body) }}</p>

            <template v-if="item.bullets?.length">
              <button type="button" class="day__toggle" :aria-expanded="open.has(keyOf(item))" @click="toggle(item)">
                {{ open.has(keyOf(item)) ? t('programme.collapse') : t('programme.expand') }}
                <span class="day__chev" :class="{ 'day__chev--up': open.has(keyOf(item)) }" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="12" height="12">
                    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  </svg>
                </span>
              </button>
              <ul v-if="open.has(keyOf(item))" class="day__bullets">
                <li v-for="(bullet, i) in item.bullets" :key="i">{{ tr(bullet) }}</li>
              </ul>
            </template>
          </dd>
        </div>
      </dl>

      <p v-if="programme" class="programme__note">
        {{ tr(programme.note) }}
        <DocTag id="programme" />
      </p>

      <!-- The four key sessions --------------------------------------------- -->
      <h3 class="programme__sub">{{ t('programme.sessionsTitle') }}</h3>
      <p class="programme__body">{{ t('programme.sessionsBody') }}</p>

      <ol class="sessions">
        <li v-for="session in sessions" :key="session.id" class="sessions__item card">
          <span class="sessions__n">{{ String(session.number).padStart(2, '0') }}</span>
          <h4>{{ tr(session.title) }}</h4>
          <p class="sessions__topics">{{ tr(session.topics) }}</p>
          <p class="sessions__working">
            <span class="eyebrow">{{ t('programme.workingTitle') }}</span>
            <em>{{ session.workingTitle }}</em>
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.programme {
  align-content: start;
  padding-block-start: clamp(5rem, 14vh, 9rem);
}
h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}
.programme__lead {
  margin-block-start: 1.5rem;
  color: var(--ink);
  font-size: 1.1rem;
}
.programme__body {
  margin-block-start: 0.6rem;
  max-width: 36rem;
}

.day {
  margin: clamp(2.5rem, 7vh, 4rem) 0 0;
}
.day__row {
  display: grid;
  gap: 0.35rem 2rem;
  padding-block: 1.3rem;
  border-block-start: 1px solid var(--hairline);
}
.day__row:last-child {
  border-block-end: 1px solid var(--hairline);
}
@media (min-width: 48rem) {
  .day__row {
    grid-template-columns: 9rem minmax(0, 1fr);
  }
}

.day__time {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  font-variant-numeric: tabular-nums;
  font-size: 0.95rem;
  color: var(--ink);
}
.day__dash,
.day__clock--end {
  color: var(--ink-dim);
  font-size: 0.85rem;
}

.day__item {
  margin: 0;
}
.day__kind {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent-soft);
}
.day__row--break .day__kind {
  color: var(--ink-dim);
}
.day__title {
  margin-block-start: 0.3rem;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
}
.day__text {
  margin-block-start: 0.45rem;
  font-size: 0.9rem;
}

.day__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-block-start: 0.7rem;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-dim);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}
.day__toggle:hover {
  color: var(--ink);
  border-color: var(--accent);
}
.day__chev {
  display: inline-flex;
  transition: transform 0.2s;
}
.day__chev--up {
  transform: rotate(180deg);
}

.day__bullets {
  margin: 0.8rem 0 0;
  padding-inline-start: 1.1rem;
  display: grid;
  gap: 0.35rem;
  font-size: 0.88rem;
  color: var(--ink-soft);
}

.programme__note {
  margin-block-start: 1.25rem;
  font-size: 0.8rem;
  color: var(--ink-dim);
}

.programme__sub {
  margin-block-start: clamp(3.5rem, 10vh, 6rem);
  font-size: clamp(1.4rem, 3vw, 2.25rem);
}

.sessions {
  list-style: none;
  margin: clamp(1.75rem, 4vh, 2.5rem) 0 0;
  padding: 0;
  display: grid;
  gap: 1rem;
  counter-reset: none;
}
@media (min-width: 56rem) {
  .sessions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.sessions__item {
  display: grid;
  gap: 0.5rem;
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
}
.sessions__n {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: var(--accent-soft);
  font-variant-numeric: tabular-nums;
}
.sessions h4 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  line-height: 1.15;
  color: var(--ink);
}
.sessions__topics {
  font-size: 0.88rem;
}
.sessions__working {
  display: grid;
  gap: 0.2rem;
  margin-block-start: auto;
  padding-block-start: 0.75rem;
  border-block-start: 1px solid var(--hairline);
}
.sessions__working em {
  font-style: normal;
  font-size: 0.85rem;
  color: var(--ink);
}
</style>
