<script setup lang="ts">
/**
 * Attribution for a figure that came out of one of the organiser's documents.
 *
 * Unlike SourceTag there is nothing to link to: these are files supplied for
 * this project, not published pages. The badge therefore carries the document's
 * title and date in its tooltip and accessible name, and the full list is
 * repeated in the Sources block of the epilogue.
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatDate } from '../lib/shared/content';
import { tr, useStore } from '../lib/state';

const props = defineProps<{ id: string }>();
const { t } = useI18n();
const { forum, lang } = useStore();

const source = computed(() => forum.value?.sources.find((s) => s.id === props.id));
const asOf = computed(() => (source.value ? formatDate(source.value.asOf, lang.value) : ''));
const label = computed(() =>
  source.value
    ? `${t('sources.label')}: ${tr(source.value.title)} — ${tr(source.value.publisher)}. ${t('sources.asOf', { date: asOf.value })}`
    : '',
);
</script>

<template>
  <abbr v-if="source" class="doc" :title="label" :aria-label="label">{{ source.id }}</abbr>
</template>

<style scoped>
.doc {
  display: inline-block;
  margin-inline-start: 0.35em;
  padding: 0.05em 0.45em;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  font-family: var(--font-body);
  /* Sized relative to its host, but never below the readable floor:
     inside the footer small print 0.6em comes out at 9px. */
  font-size: max(0.72rem, 0.62em);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-dim);
  text-decoration: none;
  vertical-align: super;
  cursor: help;
}
</style>
