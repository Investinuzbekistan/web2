<script setup lang="ts">
/**
 * The full reading of one project, as an overlay.
 *
 * Everything shown here is lifted straight out of the regional one-pager the
 * organiser supplied. Fields the deck left blank are simply absent — nothing is
 * filled in, and the investment figure carries the deck's own wording in its
 * title so a reader can see what was actually written.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Project } from '../lib/forum-types';
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
  const region = props.project ? names?.[props.project.region] : undefined;
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

/** label/value pairs, in the order the one-pagers present them. */
const rows = computed(() => {
  const p = props.project;
  if (!p) return [];
  const pairs: [string, string | null][] = [
    ['landArea', p.landArea],
    ['capacity', p.capacity],
    ['activity', p.activity],
    ['jobs', p.jobs],
    ['status', p.status],
    ['structure', p.structure],
    ['payback', p.payback],
    ['opening', p.opening],
    ['utilities', p.utilities],
    ['access', p.access],
    ['place', p.place],
    ['address', p.address],
  ];
  return pairs.filter((pair): pair is [string, string] => Boolean(pair[1]));
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
      returnFocus = document.activeElement as HTMLElement | null;
      await nextTick();
      closeButton.value?.focus();
    } else if (!next && previous) {
      returnFocus?.focus();
      returnFocus = null;
    }
  },
);

onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <Teleport to="body">
    <div v-if="project" class="panel">
      <button type="button" class="panel__scrim" :aria-label="t('portfolio.close')" @click="emit('close')" />

      <div class="panel__sheet" role="dialog" aria-modal="true" :aria-label="project.displayTitle ?? project.title">
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
          <!-- The deck's own wording, so a reader can check our arithmetic. -->
          <strong
            v-if="money"
            class="figure"
            :title="t('portfolio.asStated', { raw: project.investmentDisplay ?? '' })"
          >
            {{ money }}
          </strong>
          <strong v-else class="figure panel__money--none">{{ t('portfolio.noFigure') }}</strong>
          <small v-if="project.currency === 'UZS'">{{ t('portfolio.uzsNote') }}</small>
        </p>

        <dl v-if="rows.length" class="panel__rows">
          <div v-for="[key, value] in rows" :key="key">
            <dt>{{ t(`portfolio.labels.${key}`) }}</dt>
            <dd>{{ value }}</dd>
          </div>
        </dl>

        <template v-if="project.overview">
          <h4 class="panel__heading">{{ t('portfolio.labels.overview') }}</h4>
          <p class="panel__overview">{{ project.overview }}</p>
        </template>

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
  width: min(100%, 36rem);
  height: 100%;
  overflow-y: auto;
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
  color: var(--ink-dim);
}
.panel__money small {
  font-size: 0.8rem;
  color: var(--ink-dim);
}

.panel__rows {
  display: grid;
  gap: 0;
  margin: 0;
}
.panel__rows > div {
  display: grid;
  grid-template-columns: minmax(0, 10rem) minmax(0, 1fr);
  gap: 1rem;
  padding-block: 0.7rem;
  border-block-end: 1px solid var(--hairline);
}
.panel__rows dt {
  font-size: 0.8rem;
  color: var(--ink-dim);
}
.panel__rows dd {
  margin: 0;
  font-size: 0.92rem;
  color: var(--ink);
}

.panel__heading {
  margin-block-start: 2rem;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.panel__overview {
  margin-block-start: 0.6rem;
  font-size: 0.95rem;
}

.panel__note {
  margin-block: 2rem 0;
  font-size: 0.75rem;
  color: var(--ink-dim);
}
</style>
