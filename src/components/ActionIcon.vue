<script setup lang="ts">
/**
 * Line icons for the things a reader can do, as opposed to the things they
 * can read about — those are ThemeIcon's.
 *
 * Same 24-unit grid and same stroke weight as ThemeIcon, so the two sets look
 * like one hand drew them, which is the only reason to draw rather than
 * install a package. A button's icon is not decoration: on a page this long
 * it is what the eye catches on the way past, and the two calls to action on
 * the title card had nothing to catch on at all.
 */
const props = defineProps<{ name: string }>();

const PATHS: Record<string, string> = {
  // A stack of project sheets, the top one lifted.
  portfolio: 'M4 8h10v12H4V8Zm3-3h10v12M10 2h10v12M7.5 12h3m-3 3.5h3',
  // An open envelope.
  enquiry: 'M3 7.5 12 13l9-5.5M3 7.5V18a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7.5M3 7.5 12 2l9 5.5',
  // The arrow a button carries when it moves you down the page.
  down: 'M12 4v15m0 0-6-6m6 6 6-6',
  // …and along it.
  right: 'M5 12h14m0 0-6-6m6 6-6 6',
};

const d = () => PATHS[props.name] ?? PATHS.right;
</script>

<template>
  <svg
    class="action-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="d()" />
  </svg>
</template>

<style scoped>
.action-icon {
  /* Sized from the type it sits beside, so it never looks bolted on. */
  inline-size: 1.15em;
  block-size: 1.15em;
  flex: 0 0 auto;
}
</style>
