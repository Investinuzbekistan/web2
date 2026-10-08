<script setup lang="ts">
/**
 * Chapter IV — the project portfolio.
 *
 * Seventy-four projects is too many to read and too few to need a search engine,
 * so the chapter is built around a breakdown that is also the navigation: three
 * columns of bars — by region, by direction, by ticket size — where every row
 * filters the list below it.
 *
 * It replaced a beeswarm on a logarithmic axis. That plot was accurate and
 * unreadable: it needed a legend for the dot size, another for the axis, and a
 * third for the lane of projects that state no dollar figure at all. The bars
 * answer the three questions an investor arrives with, and answer them without
 * a legend.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProjectPanel from '../components/ProjectPanel.vue';
import ScrubFigure from '../components/ScrubFigure.vue';
import StatBars, { type BarRow } from '../components/StatBars.vue';
import type { Project } from '../lib/forum-types';
import { formatMoney, millionWord } from '../lib/money';
import { useChapterTimeline } from '../lib/motion';
import {
  bandOf,
  clearFilters,
  filters,
  SIZE_BANDS,
  tr,
  useStore,
  type PortfolioSort,
  type SizeBand,
} from '../lib/state';

const { t } = useI18n();
const { forum, lang } = useStore();
const root = ref<HTMLElement | null>(null);
const selected = ref<Project | null>(null);

const projects = computed(() => forum.value?.portfolio.projects ?? []);
const regionNames = computed(() => forum.value?.portfolio.regionNames ?? {});
const themes = computed(() => forum.value?.themes ?? []);

const totals = computed(() => {
  const p = forum.value?.portfolio;
  return {
    projects: p?.projects.length ?? 0,
    usd: (p?.totalUsd ?? 0) / 1e6,
    statedUsd: p?.statedUsdCount ?? 0,
    statedUzs: p?.statedUzsCount ?? 0,
    open: p?.openCount ?? 0,
    regions: Object.keys(p?.regionCounts ?? {}).length,
  };
});

const SORTS: PortfolioSort[] = ['largest', 'smallest', 'region', 'name'];
const SORT_LABEL: Record<PortfolioSort, string> = {
  largest: 'portfolio.sortLargest',
  smallest: 'portfolio.sortSmallest',
  region: 'portfolio.sortRegion',
  name: 'portfolio.sortName',
};

/**
 * The featured project carries its own three-language text, because its source
 * document was Uzbek; everything else keeps the English the organiser prepared.
 */
const title = (p: Project) => (p.titleI18n ? tr(p.titleI18n) : (p.displayTitle ?? p.title));
const subtitleOf = (p: Project) => (p.subtitleI18n ? tr(p.subtitleI18n) : p.subtitle);
const thumb = (p: Project) => (p.photos[0] ? `photos/${p.photos[0]}-thumb.webp` : null);

/** The sheet's own one-word description of the project, when it gives one. */
const activityOf = (p: Project) =>
  p.metrics.find((m) => /^(ACTIVITY|OPERATOR|STATUS)$/i.test(m.label))?.value ?? null;

/** " mln USD" / " млн USD" / " M USD" — the unit word follows the language. */
const usdSuffix = computed(() => ` ${millionWord(lang.value)} USD`);

function matches(p: Project): boolean {
  const f = filters.value;
  if (f.region !== 'all' && p.region !== f.region) return false;
  if (f.segment !== 'all' && p.segment !== f.segment) return false;
  if (f.size !== 'all' && bandOf(p) !== f.size) return false;
  const q = f.query.trim().toLowerCase();
  if (!q) return true;
  // Everything the sheet states, so a search for "glamping", "ski" or a
  // district name finds the project whether the word is in the title, a chip,
  // the concept list or the overview.
  const haystack = [
    title(p),
    p.subtitle,
    p.overview,
    p.region && regionNames.value[p.region] ? tr(regionNames.value[p.region]) : '',
    ...[...p.metrics, ...p.concept, ...p.whyInvest, ...p.place].map((s) => `${s.label} ${s.value}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

const shown = computed(() => {
  const list = projects.value.filter(matches);
  const by = filters.value.sort;
  const amount = (p: Project) => (p.currency === 'USD' ? (p.investment ?? -1) : -1);
  return [...list].sort((a, b) => {
    // The hand-transcribed concept leads the list however it is sorted.
    if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
    if (by === 'largest') return amount(b) - amount(a);
    if (by === 'smallest') return amount(a) - amount(b);
    if (by === 'name') return title(a).localeCompare(title(b));
    // A sheet can arrive without a region; those sort to the end.
    if (a.region !== b.region) {
      if (!a.region) return 1;
      if (!b.region) return -1;
      return a.region.localeCompare(b.region);
    }
    return amount(b) - amount(a);
  });
});

const filtered = computed(
  () =>
    filters.value.region !== 'all' ||
    filters.value.segment !== 'all' ||
    filters.value.size !== 'all' ||
    filters.value.query.trim() !== '',
);

/* ------------------------------------------------------------- breakdown */

/**
 * The three bar columns.
 *
 * Counted over the whole portfolio, not over what is currently shown: these
 * rows are the filter, and a filter that recounts itself as you use it tells
 * you nothing about what else is there.
 */
const count = (fn: (p: Project) => string | null) => {
  const out = new Map<string, number>();
  for (const p of projects.value) {
    const key = fn(p);
    if (key) out.set(key, (out.get(key) ?? 0) + 1);
  }
  return out;
};

const regionRows = computed<BarRow[]>(() => {
  const counts = count((p) => p.region);
  return [...counts.entries()]
    .map(([id, n]) => ({
      id,
      label: regionNames.value[id] ? tr(regionNames.value[id]) : id,
      count: n,
    }))
    .sort((a, b) => b.count - a.count);
});

const segmentRows = computed<BarRow[]>(() => {
  const counts = count((p) => p.segment);
  return themes.value
    .map((theme) => ({ id: theme.id, label: tr(theme.title), count: counts.get(theme.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
});

const sizeRows = computed<BarRow[]>(() => {
  const counts = count((p) => bandOf(p));
  return [...SIZE_BANDS.map((b) => b.id), 'open'].map((id) => ({
    id,
    label: t(`portfolio.bands.${id}`),
    count: counts.get(id) ?? 0,
  }));
});


useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    gsap.from(el.querySelectorAll('.breakdown .bars__fill'), {
      scrollTrigger: { trigger: el.querySelector('.breakdown'), start: 'top 82%' },
      scaleX: 0,
      transformOrigin: '0% 50%',
      duration: 0.7,
      stagger: 0.02,
      ease: 'power2.out',
    });
  },
);
</script>

<template>
  <section id="portfolio" ref="root" class="chapter portfolio">
    <div class="shell">
      <p class="eyebrow">{{ t('chapters.portfolio.n') }}</p>
      <h2>{{ t('chapters.portfolio.title') }}</h2>
      <p class="portfolio__lead">
        {{ t('portfolio.lead', { count: totals.projects, regions: totals.regions }) }}
      </p>
      <p class="portfolio__body">{{ t('portfolio.body') }}</p>

      <ul class="portfolio__totals">
        <li>
          <ScrubFigure :value="totals.projects" />
          <span class="portfolio__caption">{{ t('portfolio.projectsLabel') }}</span>
        </li>
        <li>
          <ScrubFigure :value="totals.usd" :suffix="usdSuffix" />
          <span class="portfolio__caption">{{ t('portfolio.totalLabel') }}</span>
        </li>
        <li>
          <ScrubFigure :value="totals.regions" />
          <span class="portfolio__caption">{{ t('portfolio.regionsLabel') }}</span>
        </li>
      </ul>
      <p class="portfolio__footnote">
        {{ t('portfolio.totalNote', { n: totals.statedUsd, uzs: totals.statedUzs, open: totals.open }) }}
      </p>

      <!-- Controls -------------------------------------------------------- -->
      <div class="portfolio__controls">
        <p class="field field--search">
          <label for="pf-q">{{ t('portfolio.searchLabel') }}</label>
          <input
            id="pf-q"
            v-model="filters.query"
            type="search"
            autocomplete="off"
            :placeholder="t('portfolio.searchPlaceholder')"
          />
        </p>
        <p class="field">
          <label for="pf-sort">{{ t('portfolio.sortBy') }}</label>
          <select id="pf-sort" v-model="filters.sort">
            <option v-for="option in SORTS" :key="option" :value="option">
              {{ t(SORT_LABEL[option]) }}
            </option>
          </select>
        </p>
      </div>

      <p class="portfolio__status" role="status">
        {{ t('portfolio.results', shown.length) }}
        <button v-if="filtered" type="button" class="portfolio__clear" @click="clearFilters">
          {{ t('portfolio.clear') }}
        </button>
      </p>

      <!-- The breakdown, which is also the navigation --------------------- -->
      <div class="breakdown">
        <StatBars
          :title="t('portfolio.byRegion')"
          :rows="regionRows"
          :active="filters.region"
          @pick="(id) => (filters.region = id)"
        />
        <StatBars
          :title="t('portfolio.byDirection')"
          :rows="segmentRows"
          :active="filters.segment"
          @pick="(id) => (filters.segment = id)"
        />
        <StatBars
          :title="t('portfolio.bySize')"
          :rows="sizeRows"
          :active="filters.size"
          @pick="(id) => (filters.size = id as SizeBand)"
        />
      </div>

      <!-- The list -------------------------------------------------------- -->
      <p v-if="!shown.length" class="portfolio__empty">{{ t('portfolio.empty') }}</p>

      <ol v-else class="portfolio__list">
        <li v-for="project in shown" :key="project.id">
          <button type="button" class="row" :class="{ 'row--featured': project.featured }" @click="selected = project">
            <!-- The sheets carry their own renders and photographs; a project
                 described only in figures reads as a spreadsheet row. -->
            <span class="row__shot" :class="{ 'row__shot--empty': !thumb(project) }">
              <!-- Intrinsic size given so the browser can schedule the decode
                   without measuring; CSS still sets how big it draws. -->
              <img
                v-if="thumb(project)"
                :src="thumb(project)!"
                alt=""
                width="220"
                height="150"
                loading="lazy"
                decoding="async"
              />
            </span>
            <span class="row__main">
              <span v-if="project.featured" class="row__flag">{{ t('portfolio.featured') }}</span>
              <span class="row__title">{{ title(project) }}</span>
              <span class="row__meta">
                {{ project.region && regionNames[project.region] ? tr(regionNames[project.region]) : subtitleOf(project) }}
                <template v-if="project.region && activityOf(project)"> · {{ activityOf(project) }}</template>
              </span>
            </span>
            <span
              class="row__money figure"
              :title="t('portfolio.asStated', { raw: project.investmentDisplay ?? '' })"
            >
              <template v-if="project.investment && project.currency">
                {{ formatMoney(project.investment, project.currency, lang) }}
              </template>
              <template v-else>{{ t('portfolio.noFigure') }}</template>
            </span>
          </button>
        </li>
      </ol>
    </div>

    <ProjectPanel :project="selected" @close="selected = null" />
  </section>
</template>

<style scoped>
.portfolio {
  align-content: start;
  padding-block-start: clamp(5rem, 14vh, 9rem);
}
h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}
.portfolio__lead {
  margin-block-start: 1.5rem;
  color: var(--ink);
  font-size: 1.1rem;
}
.portfolio__body {
  margin-block-start: 0.6rem;
  max-width: 34rem;
}

.portfolio__totals {
  list-style: none;
  margin: clamp(2.5rem, 6vh, 3.5rem) 0 0;
  padding: 0;
  display: grid;
  gap: 1.5rem;
}
/* Two rows with the figure in a stretching first row, so a figure that wraps
   to two lines ("1 250,6 mln USD" does, in the band where the columns are
   narrowest) does not drop its own caption below the other two. */
.portfolio__totals li {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0.2rem;
  padding-block-end: 1.25rem;
  border-block-end: 1px solid var(--hairline);
}
/* The figure is itself a <span>, so the caption needs its own class — a bare
   `span` rule here outranks .figure and greys the numbers out. */
.portfolio__totals :deep(.scrub-figure) {
  font-size: clamp(2rem, 4.6vw, 3.25rem);
  line-height: 1.05;
  text-wrap: balance;
}
.portfolio__caption {
  font-size: 0.85rem;
  color: var(--ink-dim);
}
@media (min-width: 48rem) {
  .portfolio__totals {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem;
  }
}

.portfolio__footnote {
  margin-block-start: 1rem;
  max-width: 44rem;
  font-size: 0.8rem;
  color: var(--ink-dim);
}

.portfolio__controls {
  display: grid;
  gap: 0.75rem;
  margin-block-start: clamp(2rem, 5vh, 3rem);
}
@media (min-width: 52rem) {
  .portfolio__controls {
    grid-template-columns: minmax(0, 1fr) 14rem;
    align-items: end;
  }
}
.field {
  display: grid;
  gap: 0.3rem;
}
.field label {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.field input,
.field select {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--hairline);
  border-radius: 0.6rem;
  background: var(--surface-2);
  color: var(--ink);
  font: inherit;
  font-size: 0.9rem;
}
.field input:hover,
.field select:hover {
  border-color: var(--accent);
}

.portfolio__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-block-start: 1.25rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.portfolio__clear {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-dim);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}
.portfolio__clear:hover {
  color: var(--ink);
  border-color: var(--accent);
}

/* Three columns on a wide screen, stacked below. */
.breakdown {
  margin-block-start: clamp(2rem, 5vh, 3rem);
  display: grid;
  gap: clamp(1.75rem, 4vw, 2.5rem);
}
@media (min-width: 58rem) {
  .breakdown {
    /* The direction labels are the longest of the three sets. */
    grid-template-columns: 1.05fr 1.45fr 1fr;
  }
}

.portfolio__empty {
  margin-block-start: 2rem;
  color: var(--ink-dim);
}

.portfolio__list {
  list-style: none;
  margin: clamp(2rem, 5vh, 3rem) 0 0;
  padding: 0;
}
/* Seventy-four rows, each with an image, is a lot of layout for a section most
   visitors scroll past. The browser skips the ones it cannot see; the reserved
   height keeps the scrollbar honest while it does. */
.portfolio__list li {
  content-visibility: auto;
  contain-intrinsic-size: auto 4.6rem;
}
.row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.7rem 0.5rem;
  border: 0;
  border-block-end: 1px solid var(--hairline);
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: background-color 0.18s, color 0.18s;
}
.row:hover {
  background: var(--surface-2);
  color: var(--ink);
}
.row--featured {
  background: var(--raise);
}

.row__shot {
  display: block;
  inline-size: 4.5rem;
  block-size: 3.2rem;
  border-radius: 0.4rem;
  overflow: hidden;
  background: var(--surface-2);
}
.row__shot img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
  display: block;
}
/* A project whose sheet carried no usable image keeps the slot, so the list
   does not jog left and right as it scrolls. */
.row__shot--empty {
  border: 1px dashed var(--hairline);
  background: transparent;
}

.row__flag {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-soft);
}
.row__main {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}
.row__title {
  color: var(--ink);
  font-size: 1rem;
}
.row__meta {
  font-size: 0.8rem;
  color: var(--ink-dim);
}
.row__money {
  flex: 0 0 auto;
  font-size: 1rem;
  color: var(--accent-soft);
  white-space: nowrap;
}
</style>
