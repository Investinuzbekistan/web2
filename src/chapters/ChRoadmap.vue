<script setup lang="ts">
/**
 * Chapter V — the timeline from content.json, plus the five strategy priorities.
 * Dots light as the line draws past them.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import SourceTag from '../components/SourceTag.vue';
import { useChapterTimeline } from '../lib/motion';
import { tr, trSuffixed, useStore } from '../lib/state';
import { formatDateRange, formatValue } from '../lib/shared/content';

const { t } = useI18n();
const { content, lang } = useStore();
const root = ref<HTMLElement | null>(null);

const timeline = computed(() => content.value?.timeline ?? []);
const strategy = computed(() => content.value?.strategy_2030);
const tiif = computed(() => content.value?.tiif_2026);

const targetsFor = (priority: Record<string, unknown>) =>
  trSuffixed<string[] | undefined>(priority, 'targets') ?? [];

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    gsap.from(el.querySelector('.roadmap__spine span'), {
      scaleY: 0,
      transformOrigin: '50% 0%',
      ease: 'none',
      scrollTrigger: { trigger: el.querySelector('.roadmap__list'), start: 'top 70%', end: 'bottom 80%', scrub: 0.5 },
    });
    gsap.from(el.querySelectorAll('.roadmap__item'), {
      opacity: 0,
      x: -24,
      stagger: 0.12,
      ease: 'power2.out',
      scrollTrigger: { trigger: el.querySelector('.roadmap__list'), start: 'top 75%', end: 'bottom 85%', scrub: 0.6 },
    });
  },
);
</script>

<template>
  <section id="roadmap" ref="root" class="chapter roadmap">
    <div class="shell">
      <p class="eyebrow">{{ t('chapters.roadmap.n') }}</p>
      <h2>{{ t('chapters.roadmap.title') }}</h2>
      <p class="roadmap__lead">{{ t('roadmap.lead') }}</p>
      <p class="roadmap__body">
        {{ t('roadmap.body') }}
        <SourceTag :id="strategy?.source" />
      </p>

      <div class="roadmap__list">
        <div class="roadmap__spine" aria-hidden="true"><span /></div>
        <ol>
          <li v-for="entry in timeline" :key="entry.year" class="roadmap__item">
            <span class="roadmap__dot" aria-hidden="true" />
            <span class="roadmap__year figure">{{ entry.year }}</span>
            <span class="roadmap__text">
              {{ tr(entry) }}
              <SourceTag :id="entry.source" />
            </span>
          </li>
        </ol>
      </div>

      <div v-if="strategy" class="roadmap__priorities">
        <article v-for="priority in strategy.priorities" :key="priority.n">
          <span class="roadmap__numeral">{{ priority.n }}</span>
          <h3>{{ tr(priority) }}</h3>
          <ul v-if="targetsFor(priority as unknown as Record<string, unknown>).length">
            <li v-for="target in targetsFor(priority as unknown as Record<string, unknown>)" :key="target">
              {{ target }}
            </li>
          </ul>
        </article>
      </div>

      <!-- The 2026 entry in the timeline above, opened up. Past tense: the forum
           has been held, so there is no countdown here. -->
      <aside v-if="tiif" class="roadmap__tiif">
        <header>
          <h3>{{ tr(tiif.name) }}</h3>
          <p>
            {{ t('tiif.held') }}: {{ formatDateRange(tiif.dates, lang) }} · {{ tiif.city }}
            <SourceTag :id="tiif.source" />
          </p>
          <p class="roadmap__tiif-note">{{ t('tiif.past') }}</p>
        </header>
        <dl>
          <div v-for="stat in tiif.stats" :key="stat.id">
            <dd class="figure">{{ stat.prefix ?? '' }}{{ formatValue(stat.value, lang) }}{{ stat.suffix ?? '' }}</dd>
            <dt>{{ tr(stat.label) }}</dt>
          </div>
        </dl>
        <p class="roadmap__tiif-orgs">
          <!-- Text only: no third-party logos. -->
          <span v-for="name in tiif.notable_attendees_text_only" :key="name">{{ name }}</span>
        </p>
        <a :href="tiif.official_site" target="_blank" rel="noopener noreferrer">tiif.online</a>
      </aside>

      <!-- content.json flags this block for re-checking: two official pages give
           different 2030 GDP targets. Surface it rather than pick silently. -->
      <p v-if="strategy?.verify" class="roadmap__verify">
        {{ strategy.verify_note }}
      </p>
    </div>
  </section>
</template>

<style scoped>
h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}
.roadmap__lead {
  margin-block-start: 1.5rem;
  color: var(--ink);
  font-size: 1.1rem;
}
.roadmap__body {
  margin-block-start: 0.6rem;
  max-width: 34rem;
}

.roadmap__list {
  position: relative;
  margin-block-start: clamp(3rem, 8vh, 5rem);
}
.roadmap__spine {
  position: absolute;
  inset-block: 0.75rem;
  inset-inline-start: 0.45rem;
  width: 1px;
  background: var(--hairline);
}
.roadmap__spine span {
  display: block;
  height: 100%;
  background: var(--glow);
}

.roadmap__list ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: clamp(1.25rem, 3vh, 2rem);
}

.roadmap__item {
  position: relative;
  display: grid;
  grid-template-columns: 1.75rem 4.5rem minmax(0, 1fr);
  align-items: baseline;
  gap: 0.75rem;
}
.roadmap__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--teal);
  justify-self: start;
  margin-inline-start: 0.18rem;
  box-shadow: 0 0 0 4px rgb(0 170 149 / 0.12);
}
.roadmap__year {
  font-size: clamp(1.1rem, 2vw, 1.6rem);
}
.roadmap__text {
  color: var(--ink-soft);
}

.roadmap__priorities {
  margin-block-start: clamp(3rem, 8vh, 5rem);
  display: grid;
  gap: 1rem;
}
@media (min-width: 52rem) {
  .roadmap__priorities {
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  }
}
.roadmap__priorities article {
  padding: 1.5rem;
  border: 1px solid var(--hairline);
  border-radius: 4px;
}
.roadmap__numeral {
  font-family: var(--font-display);
  font-size: 1.75rem;
  color: var(--teal);
}
.roadmap__priorities h3 {
  font-size: 1.05rem;
  line-height: 1.3;
  margin-block-start: 0.5rem;
}
.roadmap__priorities ul {
  margin: 0.9rem 0 0;
  padding-inline-start: 1rem;
  font-size: 0.85rem;
  color: var(--ink-dim);
  display: grid;
  gap: 0.35rem;
}

.roadmap__tiif {
  margin-block-start: clamp(3rem, 8vh, 5rem);
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border: 1px solid var(--hairline);
  border-radius: 4px;
  background: linear-gradient(160deg, rgb(0 170 149 / 0.07), transparent 65%);
}
.roadmap__tiif h3 {
  font-size: clamp(1.3rem, 3vw, 2rem);
}
.roadmap__tiif header p {
  margin-block-start: 0.5rem;
  font-size: 0.9rem;
  color: var(--ink-dim);
}
.roadmap__tiif-note {
  color: var(--ink-soft) !important;
}
.roadmap__tiif dl {
  margin: 2rem 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 1.5rem 1rem;
}
.roadmap__tiif dl div {
  display: grid;
  gap: 0.2rem;
}
.roadmap__tiif dd {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 2.1rem);
}
.roadmap__tiif dt {
  font-size: 0.8rem;
  color: var(--ink-dim);
}
.roadmap__tiif-orgs {
  margin-block-start: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.roadmap__tiif-orgs span {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--ink-dim);
}
.roadmap__tiif > a {
  display: inline-block;
  margin-block-start: 1.5rem;
  color: var(--teal);
  font-size: 0.85rem;
}

.roadmap__verify {
  margin-block-start: 2rem;
  padding: 1rem 1.25rem;
  border-inline-start: 2px solid var(--teal);
  font-size: 0.85rem;
  color: var(--ink-dim);
}
</style>
