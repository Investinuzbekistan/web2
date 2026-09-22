<script setup lang="ts">
/**
 * Chapter III — demography as a field of dots, one dot per 100 000 people.
 *
 * The field is *queried*, not scrubbed: pick a cohort and that share of the
 * country lights up. Comparing "everyone under 30" against "the people who join
 * the labour market this year" in the same field is the point — the second is
 * six dots out of three hundred and eighty-six.
 *
 * Two things this deliberately does not do, because the previous version did
 * both and cost 46% of the page's CPU:
 *
 *  - It never writes the canvas's CSS size. Writing width/height as inline
 *    styles resized the element the ResizeObserver was watching, so the
 *    observer fired again, forever. Only the backing-store attributes are set;
 *    CSS owns the layout size.
 *  - It never measures during a draw. The box is measured once per resize and
 *    cached, so scrolling costs nothing at all.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import SourceTag from '../components/SourceTag.vue';
import { canAnimate } from '../lib/motion';
import { tr, useStore } from '../lib/state';
import { formatValue } from '../lib/shared/content';

const { t } = useI18n();
const { content, lang } = useStore();
const canvas = ref<HTMLCanvasElement | null>(null);

const human = computed(() => content.value?.human_capital);
const kpi = (id: string) => human.value?.kpis.find((k) => k.id === id);

const population = computed(() => kpi('population'));
const medianAge = computed(() => kpi('median_age'));

/** One dot per 100 000 people, from the published population figure. */
const PEOPLE_PER_DOT = 100_000;
const totalDots = computed(() =>
  Math.round(((population.value?.value ?? 38.6) * 1_000_000) / PEOPLE_PER_DOT),
);

/**
 * The cohorts the field can show.
 *
 * `share` is how much of the field lights up. For `under30` that is the
 * published percentage. For the others it is the published absolute figure
 * divided by the published population — both from the same source page, and
 * used only to decide how many dots light. No derived percentage is printed;
 * each cohort shows the figure its source actually publishes.
 */
const cohorts = computed(() => {
  const millions = population.value?.value ?? 38.6;
  const absolute = (id: string, unitMillions: number) => {
    const k = kpi(id);
    return k ? { k, share: (k.value * unitMillions) / (millions * 1_000_000) } : null;
  };

  const under30 = kpi('under30');
  const list = [
    under30 ? { id: 'under30', k: under30, share: under30.value / 100 } : null,
    absolute('labor_force', 1_000_000),
    absolute('students', 1_000_000),
    absolute('new_entrants', 1),
  ].filter((c): c is { id?: string; k: NonNullable<ReturnType<typeof kpi>>; share: number } =>
    Boolean(c),
  );
  return list;
});

const selected = ref(0);
const current = computed(() => cohorts.value[selected.value] ?? null);

/* ------------------------------------------------------------------ canvas */

interface Dot {
  x: number;
  y: number;
  /** Position in the reveal order — spreads lit dots across the field. */
  rank: number;
}

let dots: Dot[] = [];
let box = { width: 0, height: 0 };
let radius = 2;
let revealed = 0;
let frame = 0;
let observer: ResizeObserver | null = null;

function context() {
  return canvas.value?.getContext('2d') ?? null;
}

function draw() {
  const ctx = context();
  if (!ctx) return;
  ctx.clearRect(0, 0, box.width, box.height);
  for (const dot of dots) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = dot.rank < revealed ? '#00AA95' : 'rgba(255,255,255,0.14)';
    ctx.fill();
  }
}

function layout() {
  const el = canvas.value;
  const ctx = context();
  if (!el || !ctx) return;

  // Measured from the element's own CSS box. Nothing here writes a style, so
  // the ResizeObserver cannot re-trigger itself.
  const width = el.clientWidth;
  const height = el.clientHeight;
  if (width === 0 || height === 0) return;

  const dpr = Math.min(devicePixelRatio, 2);
  const backingWidth = Math.round(width * dpr);
  const backingHeight = Math.round(height * dpr);
  if (el.width !== backingWidth) el.width = backingWidth;
  if (el.height !== backingHeight) el.height = backingHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  box = { width, height };

  const count = totalDots.value;
  const columns = Math.max(1, Math.round(Math.sqrt(count * (width / height))));
  const rows = Math.max(1, Math.ceil(count / columns));
  const cellX = width / columns;
  const cellY = height / rows;
  radius = Math.max(1.2, Math.min(cellX, cellY) * 0.28);

  dots = Array.from({ length: count }, (_, i) => ({
    x: cellX * ((i % columns) + 0.5),
    y: cellY * (Math.floor(i / columns) + 0.5),
    // A large step coprime with the count scatters the ranks evenly, so a
    // cohort reads as "this many people, spread across the country".
    rank: (i * 997) % count,
  }));

  draw();
}

function target() {
  return Math.round(totalDots.value * (current.value?.share ?? 0));
}

function animateTo(next: number) {
  cancelAnimationFrame(frame);
  if (!canAnimate()) {
    revealed = next;
    draw();
    return;
  }
  const from = revealed;
  const start = performance.now();
  const duration = 650;
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    // easeOutCubic: arrives quickly, settles softly.
    revealed = from + (next - from) * (1 - (1 - p) ** 3);
    draw();
    if (p < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

onMounted(() => {
  const el = canvas.value;
  if (!el) return;
  layout();
  revealed = 0;
  animateTo(target());
  observer = new ResizeObserver(() => layout());
  observer.observe(el);
});

watch([selected, totalDots, cohorts], () => animateTo(target()));

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <section id="young" class="chapter young">
    <div class="shell young__grid">
      <div>
        <p class="eyebrow">{{ t('chapters.young.n') }}</p>
        <h2>{{ t('chapters.young.title') }}</h2>
        <p class="young__lead">{{ t('young.lead') }}</p>
        <p class="young__body">{{ t('young.body') }}</p>

        <div class="cohorts" role="radiogroup" :aria-label="t('young.cohortLabel')">
          <button
            v-for="(cohort, i) in cohorts"
            :key="cohort.k.id"
            type="button"
            role="radio"
            :aria-checked="selected === i"
            class="cohorts__btn"
            @click="selected = i"
          >
            {{ tr(cohort.k.label) }}
          </button>
        </div>

        <p v-if="current" class="readout" aria-live="polite">
          <span class="readout__value figure">
            {{ current.k.prefix ?? '' }}{{ formatValue(current.k.value, lang)
            }}{{ current.k.suffix ?? '' }}
          </span>
          <span class="readout__label">
            {{ tr(current.k.label) }}
            <SourceTag :id="human?.source" />
          </span>
        </p>

        <p v-if="medianAge" class="young__median">
          {{ tr(medianAge.label) }}: <strong>{{ formatValue(medianAge.value, lang) }}</strong>
        </p>
      </div>

      <figure class="young__field">
        <canvas ref="canvas" role="img" :aria-label="t('young.fieldAlt', { n: totalDots })"></canvas>
        <figcaption>
          <span class="young__key young__key--lit" aria-hidden="true"></span>
          {{ current ? tr(current.k.label) : '' }}
          <span class="young__scale">· {{ t('young.perDot') }}</span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.young__grid {
  display: grid;
  gap: clamp(2.5rem, 6vw, 4rem);
  align-items: center;
}

@media (min-width: 60rem) {
  .young__grid {
    grid-template-columns: minmax(0, 26rem) minmax(0, 1fr);
  }
}

h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}
.young__lead {
  margin-block-start: 1.5rem;
  color: var(--ink);
  font-size: 1.1rem;
}
.young__body {
  margin-block-start: 0.6rem;
}

.cohorts {
  margin-block-start: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.cohorts__btn {
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s, background-color 0.18s;
}
.cohorts__btn:hover {
  border-color: var(--teal);
  color: var(--ink);
}
.cohorts__btn[aria-checked='true'] {
  background: var(--teal);
  border-color: var(--teal);
  color: var(--night);
  font-weight: 600;
}

.readout {
  margin-block-start: 1.75rem;
  display: grid;
  gap: 0.25rem;
}
.readout__value {
  font-size: clamp(2.5rem, 6vw, 4rem);
  line-height: 1;
}
.readout__label {
  font-size: 0.9rem;
  color: var(--ink-dim);
}

.young__median {
  margin-block-start: 1.25rem;
  font-size: 0.9rem;
  color: var(--ink-dim);
}
.young__median strong {
  color: var(--ink);
}

.young__field {
  margin: 0;
}
.young__field canvas {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
}
.young__field figcaption {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block-start: 1rem;
  font-size: 0.8rem;
  color: var(--ink-dim);
}
.young__key {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.14);
}
.young__key--lit {
  background: var(--teal);
}
/* No opacity: --ink-dim is already the lightest tone that clears AA on this
   surface (5:1), and 75% of it falls to 3.4:1. */
.young__scale {
  color: var(--ink-dim);
}
</style>
