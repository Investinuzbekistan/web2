<script setup lang="ts">
/**
 * Epilogue — a three-step enquiry wizard, the Agency's contacts, the source
 * list and the disclaimer.
 *
 * No backend: the wizard POSTs to VITE_FORM_ENDPOINT when one is configured and
 * otherwise hands the message to the visitor's mail client.
 */
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import SourceTag from '../components/SourceTag.vue';
import { setLang, tr, useStore } from '../lib/state';
import { formatDate } from '../lib/shared/content';

const { t } = useI18n();
const { content, lang } = useStore();

const ROLES = ['investor', 'fund', 'advisor', 'other'] as const;
type Role = (typeof ROLES)[number];

const step = ref(0);
const status = ref<'idle' | 'submitting' | 'sent' | 'failed'>('idle');
const form = reactive({ role: '' as Role | '', sector: '', name: '', email: '', message: '' });
const errors = reactive<{ role?: string; name?: string; email?: string }>({});

const org = computed(() => content.value?.organization);
const sectors = computed(() => content.value?.sectors.items ?? []);

// Vue templates are parsed as expressions, where `import.meta` is not valid —
// so the flag is resolved here.
const hasEndpoint = Boolean(import.meta.env.VITE_FORM_ENDPOINT);

/** Served from public/, written there by scripts/sync-shared.mjs. */
const LOGO_WHITE = 'brand/logo-white.svg';

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

  const sectorName = sectors.value.find((s) => s.id === form.sector);
  const body = [
    `${t('epilogue.q1')} ${t(`epilogue.roles.${form.role || 'other'}`)}`,
    `${t('epilogue.q2')} ${sectorName ? tr(sectorName) : t('epilogue.sectorAny')}`,
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

  const to = org.value?.contacts.emails[0] ?? 'uzipa@invest.gov.uz';
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(t('epilogue.submit'))}&body=${encodeURIComponent(body)}`;
  status.value = 'sent';
}
</script>

<template>
  <section id="epilogue" class="chapter epilogue">
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
                <label v-for="role in ROLES" :key="role">
                  <input v-model="form.role" type="radio" name="role" :value="role" />
                  <span>{{ t(`epilogue.roles.${role}`) }}</span>
                </label>
              </div>
              <p v-if="errors.role" class="wizard__error" role="alert">{{ errors.role }}</p>
            </fieldset>

            <fieldset v-show="step === 1">
              <legend>{{ t('epilogue.q2') }}</legend>
              <label class="wizard__field">
                <select v-model="form.sector">
                  <option value="">{{ t('epilogue.sectorAny') }}</option>
                  <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                    {{ tr(sector) }}
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
              <button v-if="step > 0" type="button" class="btn btn--ghost" @click="back">
                {{ t('epilogue.back') }}
              </button>
              <button v-if="step < 2" type="button" class="btn" @click="next">
                {{ t('epilogue.next') }}
              </button>
              <button v-else type="button" class="btn" :disabled="status === 'submitting'" @click="submit">
                {{ status === 'submitting' ? t('epilogue.submitting') : t('epilogue.submit') }}
              </button>
            </div>

            <p v-if="status === 'failed'" class="wizard__error" role="alert">{{ t('epilogue.failed') }}</p>
          </template>
        </div>

        <address v-if="org" class="contacts">
          <p>
            <small>{{ t('contact.phone') }}</small>
            <a :href="org.contacts.phone_href">{{ org.contacts.phone }}</a>
          </p>
          <p v-for="email in org.contacts.emails" :key="email">
            <small>{{ t('contact.email') }}</small>
            <a :href="`mailto:${email}`">{{ email }}</a>
          </p>
          <p>
            <small>{{ t('contact.address') }}</small>
            {{ tr(org.contacts.address) }}
            <a :href="org.contacts.map_url" target="_blank" rel="noopener noreferrer">
              {{ t('contact.map') }}
            </a>
          </p>
        </address>
      </div>

      <footer v-if="content" class="footer">
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
            <h3>{{ t('sources.title') }} <SourceTag :id="undefined" /></h3>
            <p class="footer__note">{{ t('sources.body') }}</p>
            <ol class="footer__sources">
              <li v-for="source in content.sources" :key="source.id">
                <span>{{ source.id }}</span>
                <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }}</a>
                <em>{{ formatDate(source.accessed, lang) }}</em>
              </li>
            </ol>
          </div>
        </div>

        <p v-if="content.meta.disclaimer_enabled" class="footer__disclaimer">
          <strong>{{ t('footer.disclaimerTitle') }}.</strong> {{ t('footer.disclaimer') }}
        </p>
        <p v-if="lang === 'ru' && content.meta.ru_machine" class="footer__note">
          {{ t('sources.machine') }}
        </p>

        <div class="footer__end">
          <img :src="LOGO_WHITE" alt="Invest in Uzbekistan" width="150" height="84" />
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
  border-radius: 4px;
  background: linear-gradient(160deg, rgb(255 255 255 / 0.05), transparent 60%);
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
  border-radius: 3px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.wizard__choices label:hover,
.wizard__choices label:has(input:checked) {
  border-color: var(--teal);
}
.wizard__choices input {
  accent-color: #00aa95;
}

.wizard__field {
  display: grid;
  gap: 0.35rem;
  margin-block-start: 1.25rem;
  font-size: 0.85rem;
  color: var(--ink-dim);
}
.wizard__field input,
.wizard__field select,
.wizard__field textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--hairline);
  border-radius: 3px;
  background: rgb(0 0 0 / 0.25);
  color: var(--ink);
  font: inherit;
  font-size: 0.95rem;
}
.wizard__field input:focus-visible,
.wizard__field select:focus-visible,
.wizard__field textarea:focus-visible {
  border-color: var(--teal);
}

.wizard__actions {
  margin-block-start: 1.75rem;
  display: flex;
  gap: 0.75rem;
}
.btn {
  padding: 0.85rem 1.6rem;
  border: 0;
  border-radius: 999px;
  background: var(--ink);
  color: var(--night);
  font: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn--ghost {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--hairline);
}

.wizard__error {
  margin-block-start: 0.75rem;
  color: #ffb4a8;
  font-size: 0.85rem;
}
.wizard__note {
  margin-block-start: 0.75rem;
  color: var(--ink-dim);
}

.contacts {
  font-style: normal;
  display: grid;
  gap: 1rem;
  align-content: start;
}
.contacts p {
  display: grid;
  gap: 0.2rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--hairline);
  border-radius: 3px;
  font-size: 0.95rem;
}
.contacts small {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-dim);
}
.contacts a {
  color: var(--ink);
  text-decoration: none;
}
.contacts a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.footer {
  margin-block-start: clamp(4rem, 12vh, 7rem);
  padding-block-start: 2.5rem;
  border-block-start: 1px solid var(--hairline);
}
.footer__cols {
  display: grid;
  gap: 2.5rem;
}
@media (min-width: 52rem) {
  .footer__cols {
    grid-template-columns: minmax(0, 16rem) minmax(0, 1fr);
    gap: 4rem;
  }
}
.footer h3 {
  font-family: var(--font-body);
  font-size: 0.8rem;
  letter-spacing: 0.16em;
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
  text-decoration: none;
}
.footer a:hover {
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.footer__note {
  margin-block-start: 0.6rem;
  font-size: 0.8rem;
  color: var(--ink-dim);
}
.footer__sources {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
  font-size: 0.8rem;
}
.footer__sources li {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 0.5rem;
  align-items: baseline;
}
.footer__sources span {
  color: var(--teal);
  font-variant-numeric: tabular-nums;
}
.footer__sources em {
  grid-column: 2;
  font-style: normal;
  color: var(--ink-dim);
}

.footer__disclaimer {
  margin-block-start: 2.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--hairline);
  border-radius: 3px;
  font-size: 0.85rem;
}
.footer__disclaimer strong {
  color: var(--ink);
}

.footer__end {
  margin-block-start: 2rem;
  padding-block: 1.5rem;
  border-block-start: 1px solid var(--hairline);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.footer__end img {
  height: 2rem;
  width: auto;
}
.footer__langs {
  display: flex;
  gap: 0.25rem;
}
.footer__langs button {
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--hairline);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-dim);
  font: inherit;
  font-size: 0.7rem;
  text-transform: uppercase;
  cursor: pointer;
}
</style>
