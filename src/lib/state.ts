/**
 * Content + language state for site 2.
 *
 * A module-level reactive store rather than provide//inject: every chapter needs
 * the same two things, and there is exactly one of each per page.
 */
import { computed, ref, watch } from 'vue';

import { loadContent } from './shared/content';
import { isLang, type Content, type Lang } from './shared/content-types';
import { applyDocumentSeo } from './shared/seo';
import { i18n, UI_META } from './i18n';

const LANG_KEY = 'iu-lang';

const content = ref<Content | null>(null);
const error = ref<string | null>(null);
const lang = ref<Lang>(readInitialLang());

function readInitialLang(): Lang {
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromQuery)) return fromQuery;
  const stored = localStorage.getItem(LANG_KEY);
  if (isLang(stored)) return stored;
  return 'uz';
}

let started = false;
export function startLoading(): void {
  if (started) return;
  started = true;
  loadContent()
    .then((data) => {
      content.value = data;
    })
    .catch((cause: unknown) => {
      error.value = cause instanceof Error ? cause.message : String(cause);
    });
}

export function retry(): void {
  error.value = null;
  started = false;
  startLoading();
}

export function setLang(next: Lang): void {
  lang.value = next;
}

watch(
  lang,
  (next) => {
    i18n.global.locale.value = next;
    localStorage.setItem(LANG_KEY, next);
    const meta = UI_META[next];
    applyDocumentSeo({ lang: next, title: meta.title, description: meta.description });
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
  },
  { immediate: true },
);

/**
 * The refs are handed out as-is rather than wrapped in `readonly()`: Vue's
 * DeepReadonly rewrites every array in Content to `readonly T[]`, which then no
 * longer matches the shared helper signatures. Mutation is discouraged by there
 * being no reason to — `setLang` and `retry` are the only writers.
 */
export const useStore = () => ({
  content,
  error,
  lang,
  isReady: computed(() => content.value !== null),
});

/** Read a {uz, ru, en} triple with the active language. */
export function tr(text: { uz: string; ru: string; en: string } | undefined): string {
  if (!text) return '';
  return text[lang.value] || text.en || text.uz;
}

/** Read a `prefix_uz` / `prefix_ru` / `prefix_en` family with the active language. */
export function trSuffixed<T>(row: Record<string, unknown>, prefix: string): T {
  return (row[`${prefix}_${lang.value}`] ?? row[`${prefix}_en`] ?? row[`${prefix}_uz`]) as T;
}
