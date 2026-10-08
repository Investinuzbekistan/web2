<script setup lang="ts">
/**
 * Epilogue — a three-step enquiry wizard, what the forum expects to come of
 * it, who will be in the room, the contacts, the sources and the disclaimer.
 *
 * No backend: the wizard POSTs to VITE_FORM_ENDPOINT when one is configured and
 * otherwise hands the message to the visitor's mail client.
 *
 * Both question lists come from the data file rather than being written here —
 * the six participant categories and the eight thematic directions are the
 * organiser's own, and a visitor should be choosing from the same vocabulary
 * the forum uses.
 */
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ForumMark from '../components/ForumMark.vue';
import SourceTag from '../components/SourceTag.vue';
import { setLang, tr, useStore } from '../lib/state';
import { formatDate } from '../lib/shared/content';

const { t } = useI18n();
const { content, forum, lang } = useStore();

const step = ref(0);
const status = ref<'idle' | 'submitting' | 'sent' | 'failed'>('idle');
const form = reactive({ role: '', theme: '', name: '', email: '', message: '' });
const errors = reactive<{ role?: string; name?: string; email?: string }>({});

const org = computed(() => content.value?.organization);
const contact = computed(() => forum.value?.contact);

/**
 * The map, from OpenStreetMap's own embed — no key, no account, and the data is
 * ODbL, which the credit under it satisfies. The coordinates were resolved from
 * the committee's address through Nominatim rather than guessed.
 */
const mapSrc = computed(() => {
  const c = contact.value;
  if (!c) return '';
  const d = 0.004;
  const box = [c.lon - d, c.lat - d / 2, c.lon + d, c.lat + d / 2].map((n) => n.toFixed(5)).join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${c.lat}%2C${c.lon}`;
});
const event = computed(() => forum.value?.event);
const roles = computed(() => forum.value?.participants ?? []);
const themes = computed(() => forum.value?.themes ?? []);
const outcomes = computed(() => forum.value?.outcomes);

// Vue templates are parsed as expressions, where `import.meta` is not valid —
// so the flag is resolved here.
const hasEndpoint = Boolean(import.meta.env.VITE_FORM_ENDPOINT);

function next() {
  if (step.value === 0) {
    errors.role = form.role ? undefined : t('epilogue.errors.role');
    if (errors.role) return;
  }
  step.value = Math.min(2, step.value + 1);
}

function back() {
  step.value = Math.max(0, step.value - 1);
}

function validateFinal(): boolean {
  errors.name = form.name.trim() ? undefined : t('epilogue.errors.name');
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())
    ? undefined
    : t('epilogue.errors.email');
  return !errors.name && !errors.email;
}

async function submit() {
  if (!validateFinal()) return;
  status.value = 'submitting';

  const role = roles.value.find((r) => r.id === form.role);
  const theme = themes.value.find((x) => x.id === form.theme);
  const body = [
    event.value ? `${tr(event.value.name)} — ${event.value.dateStart}/${event.value.dateEnd}` : '',
    '',
    `${t('epilogue.q1')} ${role ? tr(role.category) : ''}`,
    `${t('epilogue.q2')} ${theme ? tr(theme.title) : t('epilogue.themeAny')}`,
    `${t('epilogue.name')}: ${form.name}`,
    `${t('epilogue.email')}: ${form.email}`,
    '',
    form.message,
  ].join('\n');

  const endpoint = import.meta.env.VITE_FORM_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, lang: lang.value }),
      });
      if (!res.ok) throw new Error(String(res.status));
      status.value = 'sent';
    } catch {
      status.value = 'failed';
    }
    return;
  }

  const to = contact.value?.email ?? org.value?.contacts.emails[0] ?? 'uzipa@invest.gov.uz';
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(t('epilogue.submit'))}&body=${encodeURIComponent(body)}`;
  status.value = 'sent';
}
</script>

<template>
  <section id="epilogue" class="chapter stage epilogue">
    <div class="shell">
      <p class="eyebrow">{{ t('chapters.epilogue.n') }}</p>
      <h2>{{ t('epilogue.lead') }}</h2>
      <p class="epilogue__body">{{ t('epilogue.body') }}</p>

      <div class="epilogue__grid">
        <div class="wizard">
          <template v-if="status === 'sent'">
            <h3>{{ t('epilogue.sentTitle') }}</h3>
            <p class="wizard__note">
              {{ hasEndpoint ? t('epilogue.sentPosted') : t('epilogue.sentMailto') }}
            </p>
          </template>

          <template v-else>
            <p class="wizard__progress">
              {{ t('epilogue.step') }} {{ step + 1 }} {{ t('epilogue.of') }} 3
            </p>

            <fieldset v-show="step === 0">
              <legend>{{ t('epilogue.q1') }}</legend>
              <div class="wizard__choices">
                <label v-for="role in roles" :key="role.id">
                  <input v-model="form.role" type="radio" name="role" :value="role.id" />
                  <span>{{ tr(role.category) }}</span>
                </label>
              </div>
              <p v-if="errors.role" class="wizard__error" role="alert">{{ errors.role }}</p>
            </fieldset>

            <fieldset v-show="step === 1">
              <legend>{{ t('epilogue.q2') }}</legend>
              <label class="wizard__field">
                <select v-model="form.theme">
                  <option value="">{{ t('epilogue.themeAny') }}</option>
                  <option v-for="theme in themes" :key="theme.id" :value="theme.id">
                    {{ tr(theme.title) }}
                  </option>
                </select>
              </label>
            </fieldset>

            <fieldset v-show="step === 2">
              <legend>{{ t('epilogue.q3') }}</legend>
              <label class="wizard__field">
                <span>{{ t('epilogue.name') }}</span>
                <input v-model="form.name" type="text" autocomplete="name" :aria-invalid="!!errors.name" />
                <small v-if="errors.name" class="wizard__error" role="alert">{{ errors.name }}</small>
              </label>
              <label class="wizard__field">
                <span>{{ t('epilogue.email') }}</span>
                <input v-model="form.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" />
                <small v-if="errors.email" class="wizard__error" role="alert">{{ errors.email }}</small>
              </label>
              <label class="wizard__field">
                <span>{{ t('epilogue.message') }}</span>
                <textarea v-model="form.message" rows="3" />
              </label>
            </fieldset>

            <div class="wizard__actions">
              <button v-if="step > 0" type="button" class="btn" @click="back">
                {{ t('epilogue.back') }}
              </button>
              <button v-if="step < 2" type="button" class="btn btn--solid" @click="next">
                {{ t('epilogue.next') }}
              </button>
              <button
                v-else
                type="button"
                class="btn btn--solid"
                :disabled="status === 'submitting'"
                @click="submit"
              >
                {{ status === 'submitting' ? t('epilogue.submitting') : t('epilogue.submit') }}
              </button>
            </div>

            <p v-if="status === 'failed'" class="wizard__error" role="alert">{{ t('epilogue.failed') }}</p>
          </template>
        </div>

        <address v-if="contact" class="contacts">
          <p class="contacts__org">
            <small>{{ t('contact.organiser') }}</small>
            {{ tr(contact.organisation) }}
          </p>
          <p>
            <small>{{ t('contact.email') }}</small>
            <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
          </p>
          <p>
            <small>{{ t('contact.phone') }}</small>
            <a :href="contact.phoneHref">{{ contact.phone }}</a>
            <em>{{ t('contact.shortPhone', { n: contact.shortPhone }) }}</em>
          </p>
          <p>
            <small>{{ t('contact.address') }}</small>
            {{ contact.postcode }}, {{ tr(contact.address) }}
          </p>

          <div class="contacts__map">
            <iframe
              :src="mapSrc"
              :title="t('contact.mapTitle')"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>
          <p class="contacts__credit">
            <a :href="contact.mapUrl" target="_blank" rel="noopener noreferrer">{{ t('contact.map') }}</a>
            <span>{{ t('contact.mapCredit') }}</span>
          </p>

          <p v-if="org" class="contacts__also">
            <small>{{ t('contact.agency') }}</small>
            <a :href="`mailto:${org.contacts.emails[0]}`">{{ org.contacts.emails[0] }}</a>
            <a :href="org.contacts.phone_href">{{ org.contacts.phone }}</a>
          </p>
        </address>
      </div>

      <!-- What is expected to come of it ----------------------------------- -->
      <div v-if="outcomes" class="outcomes">
        <h3 class="epilogue__sub">{{ t('epilogue.outcomesTitle') }}</h3>
        <div class="outcomes__cols">
          <div>
            <p class="eyebrow">{{ t('epilogue.outcomesQuantitative') }}</p>
            <ul>
              <li v-for="(item, i) in outcomes.quantitative" :key="i">{{ tr(item) }}</li>
            </ul>
            <p class="outcomes__note">{{ tr(outcomes.quantitativeNote) }}</p>
          </div>
          <div>
            <p class="eyebrow">{{ t('epilogue.outcomesQualitative') }}</p>
            <ul>
              <li v-for="(item, i) in outcomes.qualitative" :key="i">{{ tr(item) }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Who is in the room ------------------------------------------------ -->
      <h3 class="epilogue__sub">{{ t('epilogue.participantsTitle') }}</h3>
      <dl class="who">
        <div v-for="role in roles" :key="role.id">
          <dt>{{ tr(role.category) }}</dt>
          <dd>{{ tr(role.who) }}</dd>
        </div>
      </dl>

      <footer v-if="content && forum" class="footer">
        <div class="footer__cols">
          <div>
            <h3>{{ t('footer.links') }}</h3>
            <ul>
              <li v-for="link in content.useful_links" :key="link.url">
                <a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>{{ t('sources.title') }}</h3>
            <p class="footer__note">{{ t('sources.body') }}</p>

            <p class="footer__label">{{ t('sources.documents') }}</p>
            <ol class="footer__sources footer__sources--docs">
              <li v-for="source in forum.sources" :key="source.id">
                <span class="footer__sid">{{ source.id }}</span>
                <span class="footer__doc">{{ tr(source.title) }} — {{ tr(source.publisher) }}</span>
                <em>{{ formatDate(source.asOf, lang) }}</em>
              </li>
            </ol>

            <p class="footer__label">{{ t('sources.contributedBy') }}</p>
            <ul class="footer__contrib">
              <li v-for="(who, i) in forum.portfolio.contributedBy" :key="i">{{ tr(who) }}</li>
            </ul>

            <ol class="footer__sources">
              <li v-for="source in content.sources" :key="source.id">
                <span>{{ source.id }}</span>
                <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}</a>
                <em>{{ formatDate(source.accessed, lang) }}</em>
              </li>
            </ol>
            <p class="footer__note">
              {{ t('sources.projectLanguage') }}
              <SourceTag :id="undefined" />
            </p>
          </div>
        </div>

        <p v-if="content.meta.disclaimer_enabled" class="footer__disclaimer">
          <strong>{{ t('footer.disclaimerTitle') }}.</strong> {{ t('footer.disclaimer') }}
        </p>
        <p v-if="lang === 'ru' && content.meta.ru_machine" class="footer__note">
          {{ t('sources.machine') }}
        </p>

        <div class="footer__end">
          <ForumMark form="lockup" variant="white" class="footer__mark" />
          <div class="footer__langs">
            <button v-for="code in ['uz', 'ru', 'en'] as const" :key="code" type="button" @click="setLang(code)">
              {{ code }}
            </button>
          </div>
        </div>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.epilogue {
  align-content: start;
  padding-block-start: clamp(5rem, 14vh, 9rem);
}

h2 {
  font-size: clamp(2.25rem, 6vw, 4.5rem);
  margin-block-start: 0.75rem;
}
.epilogue__body {
  margin-block-start: 1.25rem;
  max-width: 34rem;
}
.epilogue__sub {
  margin-block-start: clamp(3.5rem, 10vh, 6rem);
  font-size: clamp(1.4rem, 3vw, 2.25rem);
}

.epilogue__grid {
  margin-block-start: clamp(2.5rem, 7vh, 4rem);
  display: grid;
  gap: 2rem;
}
@media (min-width: 60rem) {
  .epilogue__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 20rem);
  }
}

.wizard {
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border: 1px solid var(--hairline);
  border-radius: 1rem;
  background: linear-gradient(160deg, var(--raise), transparent 60%);
}
.wizard__progress {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.wizard fieldset {
  margin: 1.5rem 0 0;
  padding: 0;
  border: 0;
}
.wizard legend {
  padding: 0;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  color: var(--ink);
}
.wizard__choices {
  margin-block-start: 1.25rem;
  display: grid;
  gap: 0.5rem;
}
.wizard__choices label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--hairline);
  border-radius: 0.6rem;
  cursor: pointer;
  transition: border-color 0.18s, background-color 0.18s;
}
.wizard__choices label:hover {
  border-color: var(--accent);
}
.wizard__choices input {
  accent-color: var(--accent-soft);
}
.wizard__choices label:has(input:checked) {
  border-color: var(--accent-soft);
  background: var(--surface-2);
}

.wizard__field {
  display: grid;
  gap: 0.35rem;
  margin-block-start: 1.25rem;
}
.wizard__field > span {
  font-size: 0.8rem;
  color: var(--ink-dim);
}
.wizard__field input,
.wizard__field select,
.wizard__field textarea {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--hairline);
  border-radius: 0.6rem;
  background: var(--surface-2);
  color: var(--ink);
  font: inherit;
  font-size: 0.95rem;
}
.wizard__field textarea {
  resize: vertical;
}

.wizard__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-block-start: 1.75rem;
}

.wizard__error {
  margin-block-start: 0.6rem;
  color: var(--danger);
  font-size: 0.85rem;
}
.wizard__note {
  margin-block-start: 0.75rem;
}

.contacts {
  font-style: normal;
  display: grid;
  gap: 1rem;
  align-content: start;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border: 1px solid var(--hairline);
  border-radius: 1rem;
}
.contacts__org {
  padding-block-end: 0.9rem;
  border-block-end: 1px solid var(--hairline);
  color: var(--ink);
  font-size: 0.95rem;
}
.contacts p em {
  font-style: normal;
  font-size: 0.8rem;
  color: var(--ink-dim);
}

/* The committee's own address on a map. Lazy, so it costs nothing until the
   epilogue is actually reached.
   
   The frame is taller than its box so the embed's own footer bar — a donation
   appeal and a link to the API terms — falls outside it. The attribution that
   ODbL actually requires is the line underneath, which is ours and stays. */
.contacts__map {
  position: relative;
  margin-block-start: 0.5rem;
  block-size: 13rem;
  border: 1px solid var(--hairline);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--surface-2);
}
.contacts__map iframe {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  display: block;
  inline-size: 100%;
  block-size: calc(100% + 5rem);
  border: 0;
  filter: saturate(0.82);
}
.contacts__credit {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.6rem;
  font-size: 0.72rem;
  color: var(--ink-dim);
}
.contacts__also {
  padding-block-start: 0.9rem;
  border-block-start: 1px solid var(--hairline);
}
.contacts__also a {
  font-size: 0.85rem;
}
.contacts p {
  display: grid;
  gap: 0.2rem;
  font-size: 0.92rem;
}
.contacts small {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.contacts a {
  color: var(--ink);
  text-decoration-color: var(--accent-deep);
  text-underline-offset: 3px;
}

.outcomes__cols {
  margin-block-start: 1.75rem;
  display: grid;
  gap: 2rem;
}
@media (min-width: 56rem) {
  .outcomes__cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 3rem;
  }
}
.outcomes ul {
  margin: 1rem 0 0;
  padding-inline-start: 1.1rem;
  display: grid;
  gap: 0.5rem;
  font-size: 0.92rem;
}
.outcomes__note {
  margin-block-start: 1rem;
  font-size: 0.82rem;
  color: var(--ink-dim);
}

.who {
  margin: 1.75rem 0 0;
  display: grid;
  gap: 0;
}
@media (min-width: 56rem) {
  .who {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 3rem;
  }
}
.who > div {
  padding-block: 1rem;
  border-block-end: 1px solid var(--hairline);
}
.who dt {
  color: var(--ink);
  font-size: 0.95rem;
}
.who dd {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-dim);
}

.footer {
  margin-block-start: clamp(4rem, 12vh, 7rem);
  padding-block-start: clamp(2rem, 5vh, 3rem);
  border-block-start: 1px solid var(--hairline);
}
.footer__cols {
  display: grid;
  gap: 2.5rem;
}
@media (min-width: 56rem) {
  .footer__cols {
    grid-template-columns: minmax(0, 16rem) minmax(0, 1fr);
    gap: 4rem;
  }
}
.footer h3 {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.footer ul {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.footer a {
  color: var(--ink-soft);
  text-decoration-color: var(--hairline);
  text-underline-offset: 3px;
}
.footer a:hover {
  color: var(--ink);
}
.footer__note {
  margin-block-start: 0.75rem;
  font-size: 0.8rem;
  color: var(--ink-dim);
}
.footer__label {
  margin-block-start: 1.5rem;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.footer__sources {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
  font-size: 0.82rem;
}
.footer__sources li {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: baseline;
}
/* The document ids are words ("concept", "programme"), not "S2" — they need a
   column of their own or they run under the title. */
.footer__sources--docs li {
  grid-template-columns: 6.5rem minmax(0, 1fr) auto;
}
.footer__sid {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
}
.footer__sources span:first-child {
  color: var(--ink-dim);
  font-variant-numeric: tabular-nums;
}
.footer__doc {
  color: var(--ink-soft);
}
.footer__sources em {
  font-style: normal;
  color: var(--ink-dim);
  white-space: nowrap;
}
.footer__contrib {
  margin-block-start: 0.75rem;
  font-size: 0.82rem;
  color: var(--ink-dim);
}

.footer__disclaimer {
  margin-block-start: clamp(2rem, 5vh, 3rem);
  padding: 1rem 1.25rem;
  border: 1px solid var(--hairline);
  border-radius: 0.75rem;
  font-size: 0.85rem;
}
.footer__disclaimer strong {
  color: var(--ink);
}

.footer__end {
  margin-block-start: clamp(2.5rem, 6vh, 4rem);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}
.footer__mark {
  width: clamp(7rem, 16vw, 9.5rem);
  opacity: 0.6;
}
.footer__langs {
  display: flex;
  gap: 0.25rem;
}
.footer__langs button {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-dim);
  font: inherit;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
}
.footer__langs button:hover {
  color: var(--ink);
  border-color: var(--accent);
}
</style>
