<script setup lang="ts">
/**
 * Chapter VI — how a proposal becomes a project.
 *
 * Four things from the concept document that belong together: the six-step
 * interaction mechanism, the ten blocks every project sheet has to fill, the
 * eight selection criteria, and the seven stages the organiser worked through
 * to get here.
 *
 * The caveat under the criteria is the organiser's own and is quoted rather
 * than summarised — it is the sentence that keeps the portfolio honest about
 * how ready these projects actually are.
 */
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DocTag from '../components/DocTag.vue';
import { useChapterTimeline } from '../lib/motion';
import { tr, useStore } from '../lib/state';

const { t } = useI18n();
const { forum } = useStore();
const root = ref<HTMLElement | null>(null);

const mechanism = computed(() => forum.value?.mechanism ?? []);
const standard = computed(() => forum.value?.standard ?? []);
const criteria = computed(() => forum.value?.criteria);
const stages = computed(() => forum.value?.stages ?? []);
const goals = computed(() => forum.value?.goals ?? []);

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    const rail = el.querySelector('.steps__rail');
    if (rail) {
      gsap.from(rail, {
        scrollTrigger: { trigger: el.querySelector('.steps'), start: 'top 75%', end: 'bottom 70%', scrub: 0.6 },
        scaleY: 0,
        transformOrigin: '50% 0%',
        ease: 'none',
      });
    }
    gsap.from(el.querySelectorAll('.steps__item'), {
      scrollTrigger: { trigger: el.querySelector('.steps'), start: 'top 78%' },
      opacity: 0,
      y: 22,
      duration: 0.55,
      stagger: 0.1,
      ease: 'power2.out',
    });
  },
);
</script>

<template>
  <section id="path" ref="root" class="chapter path">
    <div class="shell">
      <p class="eyebrow">{{ t('chapters.path.n') }}</p>
      <h2>{{ t('chapters.path.title') }}</h2>
      <p class="path__lead">{{ t('path.lead') }}</p>
      <p class="path__body">
        {{ t('path.body') }}
        <DocTag id="concept" />
      </p>

      <!-- The six-step mechanism ------------------------------------------- -->
      <ol class="steps">
        <span class="steps__rail" aria-hidden="true" />
        <li v-for="step in mechanism" :key="step.n" class="steps__item">
          <span class="steps__n">{{ step.n }}</span>
          <div>
            <h3>{{ tr(step.title) }}</h3>
            <p>{{ tr(step.body) }}</p>
          </div>
        </li>
      </ol>

      <!-- The ten-block project standard ------------------------------------ -->
      <h3 class="path__sub">{{ t('path.standardTitle') }}</h3>
      <p class="path__body">{{ t('path.standardBody') }}</p>

      <ol class="blocks">
        <li v-for="block in standard" :key="block.n" class="blocks__item">
          <span class="blocks__n">{{ String(block.n).padStart(2, '0') }}</span>
          <h4>{{ tr(block.block) }}</h4>
          <p>{{ tr(block.body) }}</p>
        </li>
      </ol>

      <!-- Selection criteria ------------------------------------------------ -->
      <div class="path__split">
        <div>
          <h3 class="path__sub path__sub--tight">{{ t('path.criteriaTitle') }}</h3>
          <ul v-if="criteria" class="checks">
            <li v-for="(item, i) in criteria.items" :key="i">{{ tr(item) }}</li>
          </ul>
          <blockquote v-if="criteria" class="path__quote">{{ tr(criteria.note) }}</blockquote>
        </div>

        <div>
          <h3 class="path__sub path__sub--tight">{{ t('path.goalsTitle') }}</h3>
          <ul class="checks checks--plain">
            <li v-for="(goal, i) in goals" :key="i">{{ tr(goal) }}</li>
          </ul>
        </div>
      </div>

      <!-- Preparation stages ------------------------------------------------ -->
      <h3 class="path__sub">{{ t('path.stagesTitle') }}</h3>
      <ol class="stages">
        <li v-for="stage in stages" :key="stage.n">
          <span class="stages__roman">{{ stage.roman }}</span>
          <h4>{{ tr(stage.title) }}</h4>
          <p>{{ tr(stage.body) }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.path {
  align-content: start;
  padding-block-start: clamp(5rem, 14vh, 9rem);
}
h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}
.path__lead {
  margin-block-start: 1.5rem;
  color: var(--ink);
  font-size: 1.1rem;
}
.path__body {
  margin-block-start: 0.6rem;
  max-width: 36rem;
}

.path__sub {
  margin-block-start: clamp(3.5rem, 10vh, 6rem);
  font-size: clamp(1.4rem, 3vw, 2.25rem);
}
.path__sub--tight {
  margin-block-start: clamp(2.5rem, 6vh, 3.5rem);
}

/* The mechanism, as a rail with six stops. */
.steps {
  position: relative;
  list-style: none;
  margin: clamp(2.5rem, 7vh, 4rem) 0 0;
  padding: 0 0 0 3.25rem;
  display: grid;
  gap: clamp(1.5rem, 4vh, 2.5rem);
}
.steps__rail {
  position: absolute;
  inset-block: 0.9rem;
  inset-inline-start: 1.15rem;
  width: 1px;
  background: linear-gradient(to bottom, var(--accent-soft), transparent);
}
.steps__item {
  position: relative;
  display: grid;
  gap: 0.35rem;
}
.steps__n {
  position: absolute;
  inset-inline-start: -3.25rem;
  inset-block-start: -0.1rem;
  display: grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: var(--night);
  color: var(--accent-soft);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
.steps h3 {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
}
.steps p {
  margin-block-start: 0.3rem;
  font-size: 0.92rem;
}

/* The ten blocks, as a dense grid of small cards. */
.blocks {
  list-style: none;
  margin: clamp(1.75rem, 4vh, 2.5rem) 0 0;
  padding: 0;
  display: grid;
  gap: 1px;
  background: var(--hairline);
  border: 1px solid var(--hairline);
  border-radius: 0.75rem;
  overflow: hidden;
}
@media (min-width: 40rem) {
  .blocks {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 68rem) {
  .blocks {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
.blocks__item {
  display: grid;
  gap: 0.25rem;
  align-content: start;
  padding: 1.1rem;
  background: var(--night);
}
.blocks__n {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: var(--accent-soft);
  font-variant-numeric: tabular-nums;
}
.blocks h4 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.05rem;
  color: var(--ink);
}
.blocks p {
  font-size: 0.82rem;
  color: var(--ink-dim);
}

.path__split {
  display: grid;
  gap: 2rem;
}
@media (min-width: 56rem) {
  .path__split {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3rem;
  }
}

.checks {
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}
.checks li {
  position: relative;
  padding-inline-start: 1.6rem;
  font-size: 0.92rem;
}
.checks li::before {
  content: '';
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0.55em;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--accent-deep);
}
.checks--plain li::before {
  border-radius: 0;
  width: 0.65rem;
  height: 1px;
  inset-block-start: 0.75em;
  background: var(--ink-dim);
}

.path__quote {
  margin: 1.5rem 0 0;
  padding-inline-start: 1.1rem;
  border-inline-start: 2px solid var(--accent-deep);
  font-family: var(--font-display);
  font-size: 1.02rem;
  color: var(--ink);
}

.stages {
  list-style: none;
  margin: clamp(1.75rem, 4vh, 2.5rem) 0 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
}
@media (min-width: 44rem) {
  .stages {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 72rem) {
  .stages {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
.stages li {
  display: grid;
  gap: 0.3rem;
  align-content: start;
  padding-block-start: 0.9rem;
  border-block-start: 2px solid var(--hairline);
}
.stages__roman {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: var(--accent-soft);
}
.stages h4 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.1rem;
  color: var(--ink);
}
.stages p {
  font-size: 0.85rem;
  color: var(--ink-dim);
}
</style>
