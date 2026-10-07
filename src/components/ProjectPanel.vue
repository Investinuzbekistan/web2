<script setup lang="ts">
/**
 * The full reading of one project, as an overlay.
 *
 * Everything shown here is lifted straight out of the sheet the organiser
 * supplied, in the sheet's own words: the labels are not translated and not
 * renamed, because three generations of the template use different ones and
 * mapping them onto a fixed list is how a project loses the one figure that
 * made it interesting. Fields a sheet left blank are simply absent, and the
 * investment figure carries the sheet's own wording in its title so a reader
 * can see what was actually written.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Project } from '../lib/forum-types';
import { lockPageScroll, unlockPageScroll } from '../lib/motion';
import { formatMoney } from '../lib/money';
import { tr, useStore } from '../lib/state';

const props = defineProps<{ project: Project | null }>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const { forum, lang } = useStore();
const closeButton = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;

const regionName = computed(() => {
  const names = forum.value?.portfolio.regionNames;
  const region = props.project?.region ? names?.[props.project.region] : undefined;
  return region ? tr(region) : '';
});

const themeName = computed(() => {
  const theme = forum.value?.themes.find((x) => x.id === props.project?.segment);
  return theme ? tr(theme.title) : '';
});

const money = computed(() => {
  const p = props.project;
  if (!p?.investment || !p.currency) return null;
  return formatMoney(p.investment, p.currency, lang.value);
});

/** The headline chips, minus the investment, which has its own block above. */
const metrics = computed(() =>
  (props.project?.metrics ?? []).filter((m) => !/^INVESTMENT$/i.test(m.label)),
);

/**
 * The label/value blocks, in the order a sheet presents them.
 *
 * The sheets repeat themselves — a destination named in PROJECT CONCEPT turns
 * up again under INVESTMENT OPPORTUNITY and a third time in WHY INVEST — so a
 * value that has already been shown is dropped from the later block. Only an
 * exact repeat is dropped; a longer sentence that happens to mention the same
 * place is left alone. Blocks that empty out disappear with it.
 */
const blocks = computed(() => {
  const p = props.project;
  if (!p) return [];
  const shown = new Set((p.metrics ?? []).map((m) => m.value.trim().toLowerCase()));
  return [
    { key: 'concept', rows: p.concept },
    { key: 'opportunity', rows: p.opportunity },
    { key: 'whyInvest', rows: p.whyInvest },
    { key: 'place', rows: p.place },
  ]
    .map((block) => ({
      key: block.key,
      rows: block.rows.filter((row) => {
        const value = row.value.trim().toLowerCase();
        if (shown.has(value)) return false;
        shown.add(value);
        return true;
      }),
    }))
    .filter((b) => b.rows.length > 0);
});

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.project) {
    event.preventDefault();
    emit('close');
  }
}

watch(
  () => props.project,
  async (next, previous) => {
    if (next && !previous) {
      lockPageScroll();
      returnFocus = document.activeElement as HTMLElement | null;
      await nextTick();
      closeButton.value?.focus();
    } else if (!next && previous) {
      unlockPageScroll();
      returnFocus?.focus();
      returnFocus = null;
    }
  },
);

onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey);
  if (props.project) unlockPageScroll();
});
</script>

<template>
  <Teleport to="body">
    <div v-if="project" class="panel">
      <button type="button" class="panel__scrim" :aria-label="t('portfolio.close')" @click="emit('close')" />

      <!-- data-lenis-prevent: this element scrolls itself, so the smooth-scroll
           driver must leave its wheel and touch events alone. -->
      <div
        class="panel__sheet"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        :aria-label="project.displayTitle ?? project.title"
      >
        <button ref="closeButton" type="button" class="panel__close" @click="emit('close')">
          {{ t('portfolio.close') }}
        </button>

        <p class="panel__where">
          {{ regionName }}
          <span v-if="themeName" class="panel__theme">· {{ themeName }}</span>
        </p>
        <h3 class="panel__title">{{ project.displayTitle ?? project.title }}</h3>
        <p v-if="project.subtitle" class="panel__sub">{{ project.subtitle }}</p>

        <p class="panel__money">
          <span class="eyebrow">{{ t('portfolio.labels.investment') }}</span>
          <!-- The sheet's own wording, so a reader can check our arithmetic. -->
          <strong
            v-if="money"
            class="figure"
            :title="t('portfolio.asStated', { raw: project.investmentDisplay ?? '' })"
          >
            {{ money }}
          </strong>
          <strong v-else class="figure panel__money--none">
            {{ project.investmentDisplay ?? t('portfolio.noFigure') }}
          </strong>
          <small v-if="project.currency === 'UZS'">{{ t('portfolio.uzsNote') }}</small>
        </p>

        <ul v-if="metrics.length" class="panel__chips">
          <li v-for="m in metrics" :key="m.label">
            <span>{{ m.label }}</span>
            <strong>{{ m.value }}</strong>
          </li>
        </ul>

        <template v-if="project.overview">
          <h4 class="panel__heading">{{ t('portfolio.labels.overview') }}</h4>
          <p class="panel__overview">{{ project.overview }}</p>
        </template>

        <template v-for="block in blocks" :key="block.key">
          <h4 class="panel__heading">{{ t(`portfolio.blocks.${block.key}`) }}</h4>
          <dl class="panel__rows">
            <div v-for="row in block.rows" :key="row.label">
              <dt>{{ row.label }}</dt>
              <dd>{{ row.value }}</dd>
            </div>
          </dl>
        </template>

        <p v-if="project.statusNote" class="panel__status">{{ project.statusNote }}</p>

        <p class="panel__note">{{ t('sources.projectLanguage') }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.panel {
  position: fixed;
  inset: 0;
  z-index: 95;
  display: grid;
  justify-items: end;
}
.panel__scrim {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgb(5 7 10 / 0.8);
  backdrop-filter: blur(6px);
  cursor: pointer;
}
.panel__sheet {
  position: relative;
  width: min(100%, 38rem);
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: clamp(1.5rem, 4vw, 3rem);
  background: var(--night-2);
  border-inline-start: 1px solid var(--hairline);
  animation: slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slide-in {
  from {
    transform: translateX(2rem);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .panel__sheet {
    animation: none;
  }
}

.panel__close {
  position: sticky;
  inset-block-start: 0;
  float: inline-end;
  /* The heading flows around it; without a gutter the eyebrow runs right up
     to the button on a narrow screen. */
  margin-inline-start: 1rem;
  margin-block-end: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: var(--night-2);
  color: var(--ink);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
.panel__close:hover {
  border-color: var(--accent);
}

.panel__where {
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent-soft);
}
.panel__theme {
  color: var(--ink-dim);
}
.panel__title {
  margin-block-start: 0.5rem;
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
}
.panel__sub {
  margin-block-start: 0.5rem;
  color: var(--ink-dim);
  font-size: 0.9rem;
}

.panel__money {
  display: grid;
  gap: 0.25rem;
  margin-block-start: 1.75rem;
  padding-block: 1.25rem;
  border-block: 1px solid var(--hairline);
}
.panel__money strong {
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 400;
}
.panel__money--none {
  font-size: clamp(1.1rem, 3vw, 1.5rem) !important;
  color: var(--ink-dim);
}
.panel__money small {
  font-size: 0.8rem;
  color: var(--ink-dim);
}

/* The headline chips, as a wrapping row — the sheet shows them side by side. */
/* Each chip carries its own border rather than the grid showing through a 1px
   gap: the chip count is whatever the sheet states, so the last row is usually
   short and a see-through grid leaves a lit empty cell beside it. */
.panel__chips {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: 0.5rem;
}
.panel__chips li {
  display: grid;
  gap: 0.15rem;
  align-content: start;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--hairline);
  border-radius: 0.6rem;
}
.panel__chips span {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: var(--ink-dim);
}
.panel__chips strong {
  font-weight: 400;
  font-size: 0.95rem;
  color: var(--ink);
}

.panel__heading {
  margin-block-start: 2rem;
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent-soft);
}
.panel__overview {
  margin-block-start: 0.6rem;
  font-size: 0.95rem;
}

.panel__rows {
  display: grid;
  gap: 0;
  margin: 0.6rem 0 0;
}
.panel__rows > div {
  display: grid;
  grid-template-columns: minmax(0, 11rem) minmax(0, 1fr);
  gap: 1rem;
  padding-block: 0.7rem;
  border-block-end: 1px solid var(--hairline);
}
.panel__rows dt {
  font-size: 0.78rem;
  color: var(--ink-dim);
  text-wrap: balance;
}
.panel__rows dd {
  margin: 0;
  font-size: 0.92rem;
  color: var(--ink);
}

.panel__status {
  margin-block-start: 1.5rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--hairline);
  border-radius: 0.6rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.panel__note {
  margin-block: 2rem 0;
  font-size: 0.75rem;
  color: var(--ink-dim);
}
</style>
