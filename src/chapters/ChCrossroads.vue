<script setup lang="ts">
/**
 * Chapter I — the corridor. A stylised Silk Road route draws itself west to
 * east as the chapter scrubs past. The shape is schematic on purpose: it is a
 * diagram of a trade corridor, not a map, so it makes no territorial claim.
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useChapterTimeline } from '../lib/motion';

const { t } = useI18n();
const root = ref<HTMLElement | null>(null);

useChapterTimeline(
  () => root.value,
  ({ gsap, root: el }) => {
    const route = el.querySelector<SVGPathElement>('.route__line');
    const stops = el.querySelectorAll('.route__stop');
    if (!route) return;

    const length = route.getTotalLength();
    gsap.set(route, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(stops, { scale: 0, transformOrigin: 'center' });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: 0.8,
      },
    });

    timeline
      .to(route, { strokeDashoffset: 0, ease: 'none', duration: 1 })
      .to(stops, { scale: 1, stagger: 0.12, ease: 'back.out(2)', duration: 0.3 }, 0.25)
      .from(el.querySelectorAll('.route__text > *'), { y: 24, opacity: 0, stagger: 0.1 }, 0.1);
  },
);
</script>

<template>
  <section id="crossroads" ref="root" class="chapter crossroads">
    <div class="shell crossroads__grid">
      <div class="route__text">
        <p class="eyebrow">{{ t('chapters.crossroads.n') }}</p>
        <h2>{{ t('chapters.crossroads.title') }}</h2>
        <p class="crossroads__lead">{{ t('crossroads.lead') }}</p>
        <p class="crossroads__body">{{ t('crossroads.body') }}</p>
      </div>

      <figure class="crossroads__figure">
        <svg viewBox="0 0 900 340" role="img" :aria-label="t('crossroads.body')">
          <defs>
            <linearGradient id="route-gradient" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stop-color="#00AA95" />
              <stop offset="1" stop-color="#006FB9" />
            </linearGradient>
          </defs>

          <text x="16" y="44" class="route__cap">{{ t('crossroads.europe') }}</text>
          <text x="884" y="44" class="route__cap" text-anchor="end">{{ t('crossroads.asia') }}</text>

          <path
            class="route__line"
            d="M30 220 C 150 120, 250 250, 360 190 S 520 90, 620 160 S 790 250, 870 150"
            fill="none"
            stroke="url(#route-gradient)"
            stroke-width="3"
            stroke-linecap="round"
          />

          <g class="route__stops" fill="#00AA95">
            <circle class="route__stop" cx="30" cy="220" r="6" />
            <circle class="route__stop" cx="360" cy="190" r="6" />
            <circle class="route__stop" cx="470" cy="150" r="9" />
            <circle class="route__stop" cx="620" cy="160" r="6" />
            <circle class="route__stop" cx="870" cy="150" r="6" />
          </g>

          <text x="470" y="128" class="route__label" text-anchor="middle">Uzbekistan</text>
        </svg>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.crossroads__grid {
  display: grid;
  gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center;
}

@media (min-width: 60rem) {
  .crossroads__grid {
    grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  }
}

h2 {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  margin-block-start: 0.75rem;
}

.crossroads__lead {
  margin-block-start: 1.5rem;
  color: var(--ink);
  font-size: 1.1rem;
}

.crossroads__body {
  margin-block-start: 0.85rem;
}

.crossroads__figure {
  margin: 0;
}
.crossroads__figure svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.route__cap {
  font-family: var(--font-body);
  font-size: 15px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  fill: #76848f;
}

.route__label {
  font-family: var(--font-display);
  font-size: 22px;
  fill: #ffffff;
}
</style>
