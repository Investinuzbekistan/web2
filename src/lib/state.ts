/**
 * Content + language state for site 2.
 *
 * A module-level reactive store rather than provide//inject: every chapter needs
 * the same two things, and there is exactly one of each per page.
 */
import { computed, ref, watch } from 'vue';

import { formatDateRange, loadContent } from './shared/content';
import { isLang, type Content, type Lang } from './shared/content-types';
import { applyDocumentSeo } from './shared/seo';
import { loadForum, type ForumData } from './forum-types';
import { i18n, UI_META } from './i18n';

const LANG_KEY = 'iu-lang';

const content = ref<Content | null>(null);
const forum = ref<ForumData | null>(null);
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
  // Both files or neither: every chapter after the prologue needs the forum
  // data, and a page that renders half its facts is worse than an error.
  Promise.all([loadContent(), loadForum()])
    .then(([site, event]) => {
      content.value = site;
      forum.value = event;
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

/**
 * Portfolio filter state.
 *
 * It lives here rather than inside the portfolio chapter because chapter III
 * links into it: picking a theme there sets the segment and scrolls down, and
 * the portfolio has to already be showing that segment when it arrives.
 */
export type PortfolioSort = 'largest' | 'smallest' | 'region' | 'name';

export const filters = ref({
  region: 'all',
  segment: 'all',
  query: '',
  sort: 'largest' as PortfolioSort,
});

export function showSegment(segment: string): void {
  filters.value = { ...filters.value, segment, region: 'all', query: '' };
}

export function clearFilters(): void {
  filters.value = { region: 'all', segment: 'all', query: '', sort: filters.value.sort };
}

/** The event dates as one string: "25-27 noyabr 2026". */
export function eventDates(): string {
  const event = forum.value?.event;
  if (!event) return '';
  return formatDateRange(`${event.dateStart}/${event.dateEnd}`, lang.value);
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
  forum,
  error,
  lang,
  isReady: computed(() => content.value !== null && forum.value !== null),
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
