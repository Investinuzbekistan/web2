<script setup lang="ts">
/**
 * Chapter IV — the project portfolio.
 *
 * The plot is a beeswarm on a logarithmic investment axis, which is the one
 * view that answers an investor's first question: what sizes of ticket are on
 * the table? Each dot is one project, its area proportional to the investment
 * sought. Filtering dims rather than removes, so the shape of the whole
 * portfolio stays visible while a subset is being read.
 *
 * Three projects cannot sit on a dollar axis — two are stated in soums and one
 * has no figure at all — so they get their own lane at the left rather than
 * being converted at a rate nobody published.
 *
 * The layout is computed in viewBox units against a fixed 1000x420 canvas and
 * scaled by CSS, so nothing here measures the DOM and there is no resize path
 * to feed back on itself.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProjectPanel from '../components/ProjectPanel.vue';
import ScrubFigure from '../components/ScrubFigure.vue';
import type { Project } from '../lib/forum-types';
import { formatMoney, formatTick, millionWord } from '../lib/money';
import { useChapterTimeline } from '../lib/motion';
import { clearFilters, filters, tr, useStore, type PortfolioSort } from '../lib/state';

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

/** Regions that actually have projects, in the order the data file lists them. */
const regionOptions = computed(() =>
  Object.keys(forum.value?.portfolio.regionCounts ?? {}).map((id) => ({
    id,
    label: regionNames.value[id] ? tr(regionNames.value[id]) : id,
  })),
);

const SORTS: PortfolioSort[] = ['largest', 'smallest', 'region', 'name'];
const SORT_LABEL: Record<PortfolioSort, string> = {
  largest: 'portfolio.sortLargest',
  smallest: 'portfolio.sortSmallest',
  region: 'portfolio.sortRegion',
  name: 'portfolio.sortName',
};

const title = (p: Project) => p.displayTitle ?? p.title;

/** The sheet's own one-word description of the project, when it gives one. */
const activityOf = (p: Project) =>
  p.metrics.find((m) => /^(ACTIVITY|OPERATOR|STATUS)$/i.test(m.label))?.value ?? null;

/** " mln USD" / " млн USD" / " M USD" — the unit word follows the language. */
const usdSuffix = computed(() => ` ${millionWord(lang.value)} USD`);

function matches(p: Project): boolean {
  const f = filters.value;
  if (f.region !== 'all' && p.region !== f.region) return false;
  if (f.segment !== 'all' && p.segment !== f.segment) return false;
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

const shownIds = computed(() => new Set(shown.value.map((p) => p.id)));
const filtered = computed(
  () => filters.value.region !== 'all' || filters.value.segment !== 'all' || filters.value.query.trim() !== '',
);

/* --------------------------------------------------------------- the plot */

const VIEW = { w: 1000, h: 296 };
const PLOT = { left: 160, right: 972, top: 18, bottom: 218 };
const TICKS = [1e5, 1e6, 1e7, 1e8];

const usdProjects = computed(() => projects.value.filter((p) => p.currency === 'USD' && p.investment));
const domain = computed(() => {
  const values = usdProjects.value.map((p) => p.investment as number);
  return values.length ? { min: Math.min(...values), max: Math.max(...values) } : { min: 1e5, max: 1e8 };
});

function xFor(amount: number): number {
  const { min, max } = domain.value;
  const lo = Math.log10(Math.min(min, TICKS[0] as number));
  const hi = Math.log10(Math.max(max, TICKS[TICKS.length - 1] as number));
  const t = (Math.log10(amount) - lo) / (hi - lo);
  return PLOT.left + t * (PLOT.right - PLOT.left);
}

function radiusFor(amount: number | null): number {
  if (!amount) return 5;
  // Area, not diameter: a project twice the size should look twice as big.
  const t = Math.sqrt(amount / domain.value.max);
  return 5 + t * 17;
}

/**
 * Greedy beeswarm packing. Dots are placed left to right and pushed off the
 * centre line until they clear everything already placed, which is O(n^2) on
 * 51 points — a few thousand comparisons, once.
 */
const layout = computed(() => {
  const placed: { x: number; y: number; r: number; p: Project }[] = [];
  const midY = (PLOT.top + PLOT.bottom) / 2;

  const sorted = [...usdProjects.value].sort(
    (a, b) => (a.investment as number) - (b.investment as number),
  );
  for (const p of sorted) {
    const x = xFor(p.investment as number);
    const r = radiusFor(p.investment);
    let y = midY;
    for (let step = 0; step < 220; step++) {
      // Alternate above and below the axis, widening as we go.
      const offset = Math.ceil(step / 2) * 7 * (step % 2 === 0 ? 1 : -1);
      y = midY + offset;
      if (y - r < PLOT.top || y + r > PLOT.bottom) continue;
      const clash = placed.some((o) => {
        const need = o.r + r + 1.5;
        return (x - o.x) ** 2 + (y - o.y) ** 2 < need * need;
      });
      if (!clash) break;
    }
    placed.push({ x, y, r, p });
  }

  /**
   * The lane for everything that cannot be put on a dollar axis: the sheets
   * that state soums and the ones that leave the figure open. Laid out as a
   * grid sized to the plot, so the lane grows sideways as sheets arrive rather
   * than spilling past the axis.
   */
  const aside = projects.value.filter((p) => !(p.currency === 'USD' && p.investment));
  const step = 28;
  const rows = Math.max(1, Math.floor((PLOT.bottom - PLOT.top) / step));
  const cols = Math.ceil(aside.length / rows);
  const perCol = Math.ceil(aside.length / cols);
  const asideDots = aside.map((p, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const colCount = Math.min(perCol, aside.length - col * perCol);
    return {
      x: 118 - (cols - 1 - col) * step,
      y: midY + (row - (colCount - 1) / 2) * step,
      r: 9,
      p,
    };
  });

  return { placed, asideDots };
});

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    gsap.from(el.querySelectorAll('.swarm__dot'), {
      scrollTrigger: { trigger: el.querySelector('.swarm'), start: 'top 80%' },
      opacity: 0,
      scale: 0,
      transformOrigin: '50% 50%',
      duration: 0.5,
      stagger: { each: 0.012, from: 'center' },
      ease: 'back.out(1.7)',
    });
  },
);

function dotTitle(p: Project): string {
  const money =
    p.investment && p.currency ? formatMoney(p.investment, p.currency, lang.value) : t('portfolio.noFigure');
  return `${title(p)} — ${money}`;
}
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
          <label for="pf-region">{{ t('portfolio.allRegions') }}</label>
          <select id="pf-region" v-model="filters.region">
            <option value="all">{{ t('portfolio.allRegions') }}</option>
            <option v-for="region in regionOptions" :key="region.id" :value="region.id">
              {{ region.label }}
            </option>
          </select>
        </p>
        <p class="field">
          <label for="pf-segment">{{ t('portfolio.allSegments') }}</label>
          <select id="pf-segment" v-model="filters.segment">
            <option value="all">{{ t('portfolio.allSegments') }}</option>
            <option v-for="theme in themes" :key="theme.id" :value="theme.id">
              {{ tr(theme.title) }}
            </option>
          </select>
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

      <!-- The swarm ------------------------------------------------------- -->
      <div class="swarm">
        <svg :viewBox="`0 0 ${VIEW.w} ${VIEW.h}`" role="img" :aria-label="t('portfolio.fieldAlt', { n: totals.projects })">
          <g class="swarm__axis">
            <line :x1="PLOT.left" :y1="PLOT.bottom + 18" :x2="PLOT.right" :y2="PLOT.bottom + 18" />
            <g v-for="tick in TICKS" :key="tick">
              <line :x1="xFor(tick)" :y1="PLOT.top" :x2="xFor(tick)" :y2="PLOT.bottom + 18" class="swarm__grid" />
              <text :x="xFor(tick)" :y="PLOT.bottom + 44" text-anchor="middle">
                {{ formatTick(tick, lang) }}
              </text>
            </g>
            <text :x="PLOT.right" :y="VIEW.h - 6" text-anchor="end" class="swarm__unit">USD</text>
            <line :x1="128" :y1="PLOT.top" :x2="128" :y2="PLOT.bottom + 18" class="swarm__divider" />
            <!-- Covers both the soum figures and the ones left open: neither
                 belongs on a dollar axis, and saying "not stated" of a project
                 that states soums would be wrong. -->
            <text :x="72" :y="PLOT.bottom + 44" text-anchor="middle">{{ t('portfolio.offScale') }}</text>
          </g>

          <g class="swarm__dots">
            <g
              v-for="dot in [...layout.asideDots, ...layout.placed]"
              :key="dot.p.id"
              class="swarm__dot"
              :class="{ 'swarm__dot--dim': !shownIds.has(dot.p.id) }"
            >
              <circle :cx="dot.x" :cy="dot.y" :r="dot.r" />
              <!-- A transparent, finger-sized hit area over small dots. -->
              <!-- A finger-sized hit area over the smaller dots. It is not
                   focusable: the list below holds the same 51 projects and is
                   fully keyboard-operable, so making every dot a tab stop
                   would only double the journey through the chapter. -->
              <circle
                class="swarm__hit"
                :cx="dot.x"
                :cy="dot.y"
                :r="Math.max(dot.r, 12)"
                @click="selected = dot.p"
              >
                <title>{{ dotTitle(dot.p) }}</title>
              </circle>
            </g>
          </g>
        </svg>
      </div>

      <!-- The list -------------------------------------------------------- -->
      <p v-if="!shown.length" class="portfolio__empty">{{ t('portfolio.empty') }}</p>

      <ol v-else class="portfolio__list">
        <li v-for="project in shown" :key="project.id">
          <button type="button" class="row" @click="selected = project">
            <span class="row__main">
              <span class="row__title">{{ title(project) }}</span>
              <span class="row__meta">
                {{ project.region && regionNames[project.region] ? tr(regionNames[project.region]) : '' }}
                <template v-if="activityOf(project)"> · {{ activityOf(project) }}</template>
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
.portfolio__totals li {
  display: grid;
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
    grid-template-columns: 1.6fr 1fr 1fr 1fr;
    align-items: end;
  }
}
.field {
  display: grid;
  gap: 0.3rem;
}
.field label {
  font-size: 0.7rem;
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
  background: var(--night-2);
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

.swarm {
  margin-block-start: clamp(1.5rem, 4vh, 2.5rem);
}
.swarm svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.swarm__axis line {
  stroke: var(--hairline);
  stroke-width: 1;
}
.swarm__grid {
  stroke-dasharray: 2 6;
}
.swarm__divider {
  stroke: var(--hairline);
}
.swarm__axis text {
  fill: var(--ink-dim);
  font-family: var(--font-body);
  font-size: 15px;
}
.swarm__unit {
  font-size: 13px;
  letter-spacing: 0.12em;
}

.swarm__dot circle:first-child {
  fill: var(--accent-soft);
  fill-opacity: 0.85;
  transition: fill-opacity 0.25s, fill 0.25s;
}
.swarm__dot--dim circle:first-child {
  fill: var(--ink);
  fill-opacity: 0.1;
}
.swarm__hit {
  fill: transparent;
  cursor: pointer;
}
.swarm__dot:hover circle:first-child {
  fill: var(--ink);
  fill-opacity: 1;
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
.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  padding: 0.95rem 0;
  border: 0;
  border-block-end: 1px solid var(--hairline);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: color 0.18s;
}
.row:hover {
  color: var(--ink);
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
