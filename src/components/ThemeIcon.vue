<script setup lang="ts">
/**
 * Line icons for the eight thematic directions.
 *
 * Drawn here rather than pulled from an icon package: eight glyphs is not worth
 * a dependency, and a hand-drawn set on one 24-unit grid with one stroke weight
 * sits better next to the wordmark than a borrowed set would.
 */
const props = defineProps<{ name: string }>();

const PATHS: Record<string, string> = {
  // A hotel block with windows.
  hotel: 'M4 20V7l8-3 8 3v13M4 20h16M9 10h2m3 0h2M9 14h2m3 0h2M10.5 20v-3h3v3',
  // A folded map.
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14',
  // A dome and two minarets.
  heritage: 'M6 20V9m12 11V9M9 20v-7a3 3 0 0 1 6 0v7M4 20h16M12 3v3M6 9a1.5 1.5 0 0 1 3 0M15 9a1.5 1.5 0 0 1 3 0',
  // A ridge line with a sun.
  mountain: 'm3 19 5.5-8 3.5 5 2.5-3.5L21 19H3Zm13-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  // A leaf over a drop — wellness and water.
  wellness: 'M12 21c0-5 2-8 7-9-1 6-3 9-7 9Zm0 0c0-5-2-8-7-9 1 6 3 9 7 9Zm0-9V3',
  // A lectern facing rows of seats.
  mice: 'M4 20h16M7 20v-6h10v6M9 14V9h6v5M12 9V4M8 4h8',
  // Two figures, one small.
  family: 'M8 21v-5H6l1.5-5a2 2 0 0 1 3.8 0L13 16h-2v5M9 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm8 13.5v-4h-1.2l1-3.5a1.5 1.5 0 0 1 2.9 0l1 3.5H19v4M17.5 10a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z',
  // A plane over a runway.
  transport: 'm3 13 18-7-4.5 8.5L14 13l-2 5-1.5-4.5L3 13Zm2 7h14',
};

const d = () => PATHS[props.name] ?? PATHS.map;
</script>

<template>
  <svg
    class="theme-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="d()" />
  </svg>
</template>

<style scoped>
.theme-icon {
  width: 2rem;
  height: 2rem;
}
</style>
