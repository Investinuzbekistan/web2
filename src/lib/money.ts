/**
 * Money formatting for the project portfolio.
 *
 * Intl's compact notation is not usable here: Uzbek borrows ru-RU for digits
 * (see NUMBER_LOCALES in shared/content.ts), and compact notation would then
 * print the Russian word "млн" inside Uzbek copy. The unit words are therefore
 * written out per language and only the digits go through Intl.
 */
import type { Lang } from './shared/content-types';
import { formatNumber } from './shared/content';

const UNITS: Record<Lang, { m: string; bn: string; k: string }> = {
  uz: { m: 'mln', bn: 'mlrd', k: 'ming' },
  ru: { m: 'млн', bn: 'млрд', k: 'тыс.' },
  en: { m: 'M', bn: 'bn', k: 'K' },
};

const digits = (value: number, lang: Lang, decimals: number) =>
  formatNumber(value, lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** "38,5 mln USD" · "38,5 млн USD" · "38.5M USD" */
export function formatMoney(amount: number, currency: string, lang: Lang): string {
  const u = UNITS[lang];
  const scaled =
    amount >= 1e9
      ? `${digits(amount / 1e9, lang, amount % 1e9 === 0 ? 0 : 1)} ${u.bn}`
      : amount >= 1e6
        ? `${digits(amount / 1e6, lang, amount % 1e6 === 0 ? 0 : 1)} ${u.m}`
        : amount >= 1e3
          ? `${digits(amount / 1e3, lang, 0)} ${u.k}`
          : digits(amount, lang, 0);
  return `${scaled} ${currency}`;
}

/** The word for "million" in the active language, for a figure's suffix. */
export function millionWord(lang: Lang): string {
  return UNITS[lang].m;
}

/** Axis tick labels: no currency word, just the magnitude. */
export function formatTick(amount: number, lang: Lang): string {
  const u = UNITS[lang];
  if (amount >= 1e9) return `${digits(amount / 1e9, lang, 0)} ${u.bn}`;
  if (amount >= 1e6) return `${digits(amount / 1e6, lang, 0)} ${u.m}`;
  if (amount >= 1e3) return `${digits(amount / 1e3, lang, 0)} ${u.k}`;
  return digits(amount, lang, 0);
}
