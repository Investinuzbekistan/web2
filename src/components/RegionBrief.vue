<script setup lang="ts">
/**
 * The panel beside the map: the fourteen regions until one is chosen, and then
 * what that region brought.
 *
 * Master and detail share one place on purpose. A map with a list beside it and
 * a third panel somewhere else makes the reader hold three things at once; here
 * the list is what you steer with and the detail is what comes back, in the
 * same column, so nothing moves on the page except the panel's contents.
 *
 * Everything shown is handed in already formatted — this component decides
 * layout and nothing else.
 */
import { useI18n } from 'vue-i18n';

import type { MapRegion } from './RegionMap.vue';

export interface RegionDetail {
  id: string;
  name: string;
  countText: string;
  /** Already carrying its unit word, or the "not stated" phrase. */
  soughtText: string;
  directions: { id: string; label: string; count: number }[];
  top: { id: string; title: string; money: string }[];
}

const props = defineProps<{
  regions: MapRegion[];
  active: string;
  detail: RegionDetail | null;
  /**
   * Projects filed under no region at all. The column below adds up to one
   * less than the portfolio without them, and a column that does not add up
   * is a column nobody trusts.
   */
  nationwide: number;
}>();

const emit = defineEmits<{ pick: [id: string]; open: [id: string]; seeAll: [] }>();

const { t } = useI18n();

const busiest = () => Math.max(1, ...props.regions.map((r) => r.count));
</script>

<template>
  <!-- One region -------------------------------------------------------- -->
  <section v-if="detail" class="brief card" :aria-label="detail.name">
    <button type="button" class="brief__back" @click="emit('pick', 'all')">
      <span aria-hidden="true">←</span> {{ t('portfolio.map.back') }}
    </button>

    <h3 class="brief__name">{{ detail.name }}</h3>
    <p class="brief__count">{{ detail.countText }}</p>

    <p class="brief__label">{{ t('portfolio.map.sought') }}</p>
    <p class="brief__sought figure">{{ detail.soughtText }}</p>

    <template v-if="detail.directions.length">
      <p class="brief__label">{{ t('portfolio.map.directions') }}</p>
      <ul class="brief__dirs">
        <li v-for="d in detail.directions" :key="d.id">
          <span>{{ d.label }}</span>
          <span class="brief__n">{{ d.count }}</span>
        </li>
      </ul>
    </template>

    <template v-if="detail.top.length">
      <p class="brief__label">{{ t('portfolio.map.top') }}</p>
      <ul class="brief__top">
        <li v-for="p in detail.top" :key="p.id">
          <button type="button" @click="emit('open', p.id)">
            <span class="brief__title">{{ p.title }}</span>
            <span class="brief__money">{{ p.money }}</span>
          </button>
        </li>
      </ul>
    </template>

    <button type="button" class="btn brief__all" @click="emit('seeAll')">
      {{ t('portfolio.map.seeAll') }}
    </button>
  </section>

  <!-- Every region ------------------------------------------------------ -->
  <section v-else class="brief brief--list" :aria-label="t('portfolio.byRegion')">
    <h3 class="brief__label brief__label--head">{{ t('portfolio.byRegion') }}</h3>
    <ul class="brief__regions">
      <li v-for="region in regions" :key="region.id">
        <button
          type="button"
          :disabled="!region.count"
          :aria-pressed="active === region.id"
          @click="emit('pick', region.id)"
        >
          <span class="brief__rname">{{ region.name }}</span>
          <span class="brief__track" aria-hidden="true">
            <span class="brief__fill" :style="{ inlineSize: `${(region.count / busiest()) * 100}%` }" />
          </span>
          <span class="brief__n">{{ region.count || '—' }}</span>
        </button>
      </li>
    </ul>
    <p v-if="nationwide" class="brief__aside">
      {{ t('portfolio.map.nationwide', { count: nationwide }) }}
    </p>
    <p class="brief__hint">{{ t('portfolio.map.pickHint') }}</p>
  </section>
</template>

<style scoped>
.brief {
  align-self: start;
  padding: 1.5rem 1.4rem;
}
.brief--list {
  padding-inline: 0;
  padding-block: 0;
}

.brief__label {
  margin-block-start: 1.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.17em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.brief__label--head {
  margin-block-start: 0;
  font-family: var(--font-body);
  color: var(--gold);
}

/* ---------------------------------------------------------- the detail */

.brief__back {
  padding: 0;
  border: 0;
  background: none;
  color: var(--accent-soft);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
@media (hover: hover) {
  .brief__back:hover {
    color: var(--ink);
  }
}

.brief__name {
  margin-block-start: 0.6rem;
  font-size: clamp(1.3rem, 2.4vw, 1.75rem);
}
.brief__count {
  margin-block-start: 0.2rem;
  font-size: 0.9rem;
  color: var(--ink-dim);
}

.brief__sought {
  margin-block-start: 0.2rem;
  font-size: 1.5rem;
  line-height: 1.2;
}

.brief__dirs,
.brief__top,
.brief__regions {
  list-style: none;
  margin: 0.45rem 0 0;
  padding: 0;
}

.brief__dirs li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.3rem;
  border-block-end: 1px solid var(--hairline);
  font-size: 0.88rem;
}
.brief__dirs li:last-child {
  border-block-end: 0;
}
.brief__n {
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}

.brief__top li button {
  display: grid;
  gap: 0.1rem;
  width: 100%;
  padding: 0.45rem 0.5rem;
  margin-inline: -0.5rem;
  border: 0;
  border-radius: 0.25rem;
  background: none;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}
@media (hover: hover) {
  .brief__top li button:hover {
    background: var(--raise);
  }
}
@media (pointer: coarse) {
  .brief__top li button {
    min-block-size: var(--tap);
  }
  .brief__back {
    min-block-size: var(--tap);
    display: inline-flex;
    align-items: center;
  }
}
.brief__title {
  color: var(--ink);
  font-size: 0.92rem;
}
.brief__money {
  font-size: 0.8rem;
  color: var(--gold);
}

.brief__all {
  margin-block-start: 1.4rem;
  width: 100%;
  justify-content: center;
}

/* ------------------------------------------------------------ the list */

.brief__regions li button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 3.5rem 1.9rem;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  padding: 0.38rem 0.5rem;
  border: 0;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--ink-soft);
  font: inherit;
  font-size: 0.86rem;
  text-align: start;
  cursor: pointer;
  transition: background-color 0.16s, color 0.16s;
}
/* Fourteen rows at reading density is right under a mouse and wrong under a
   thumb, so the rows grow where there is no mouse rather than everywhere. */
@media (pointer: coarse) {
  .brief__regions li button {
    min-block-size: var(--tap);
    font-size: 0.92rem;
  }
}
@media (hover: hover) {
  .brief__regions li button:hover:not(:disabled) {
    background: var(--surface-2);
    color: var(--ink);
  }
}
.brief__regions li button:disabled {
  opacity: 0.55;
  cursor: default;
}
.brief__rname {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.brief__track {
  block-size: 0.35rem;
  border-radius: 999px;
  background: var(--hairline);
  overflow: hidden;
}
.brief__fill {
  display: block;
  block-size: 100%;
  border-radius: 999px;
  background: var(--accent-deep);
  opacity: 0.6;
}
@media (hover: hover) {
  .brief__regions li button:hover .brief__fill {
    opacity: 1;
  }
}

/* Set apart from the fourteen rows above it, because it is not one of them. */
.brief__aside {
  margin-block-start: 0.7rem;
  padding-block-start: 0.7rem;
  border-block-start: 1px solid var(--hairline);
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.brief__hint {
  margin-block-start: 0.9rem;
  font-size: 0.78rem;
  color: var(--ink-dim);
}
</style>
