<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useStore } from '../lib/state';
import { formatDate, sourceById } from '../lib/shared/content';

const props = defineProps<{ id: string | undefined }>();
const { t } = useI18n();
const { content, lang } = useStore();

const source = computed(() =>
  content.value && props.id ? sourceById(content.value, props.id) : undefined,
);
const accessed = computed(() =>
  source.value ? formatDate(source.value.accessed, lang.value) : '',
);
</script>

<template>
  <!-- The accessible name starts with the visible text ("S2"): if the two
       disagree, assistive tech announces a name the user cannot see. -->
  <a
    v-if="source"
    class="source"
    :href="source.url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`${source.id} — ${t('sources.label')}: ${source.title}. ${t('sources.asOf', { date: accessed })}`"
    :title="`${source.title} — ${t('sources.asOf', { date: accessed })}`"
  >
    {{ source.id }}
  </a>
</template>

<style scoped>
/* A small superscript link rather than a hover card: on a dark, scrub-driven
   page a floating tooltip fights the pinning. The title and aria-label carry
   the full attribution. */
.source {
  display: inline-block;
  margin-inline-start: 0.35em;
  padding: 0.05em 0.4em;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 0.6em;
  letter-spacing: 0.06em;
  color: var(--ink-dim);
  text-decoration: none;
  vertical-align: super;
  transition: color 0.18s, border-color 0.18s;
}
.source:hover,
.source:focus-visible {
  color: var(--teal);
  border-color: var(--teal);
}
</style>
