<script setup lang="ts">
/**
 * The registration page.
 *
 * A page of its own rather than a section of the site: it is the one thing
 * on this project somebody arrives at with a job to do, and a form buried
 * four screens down a scrolling narrative is a form people abandon. It is
 * also its own Vite entry, so it carries neither GSAP nor three.js — the
 * whole page is the form.
 *
 * Validation is done twice on purpose. Here, so that the reader is told
 * which field is wrong without a round trip; and again in the API, because
 * anything a browser checks is a suggestion.
 */
import { computed, onMounted, reactive, ref } from 'vue';

/**
 * The mark as raw SVG rather than through ForumMark.
 *
 * ForumMark animates the lockup line by line, which means it imports GSAP,
 * which put a hundred and twelve kilobytes of scroll-animation library into
 * a page whose whole job is a form. Here the mark is a static image, which
 * is all a page header needs it to be.
 *
 * The compact lockup, for the same reason the site's bar uses it: in a header
 * this size "First International" sets at about six pixels, and it takes a
 * fifth off the three lines that can still be read.
 */
import lockupWhite from '../assets/forum-lockup-compact-white.svg?raw';
import {
  DIRECTION_IDS,
  LANG_NAMES,
  MESSAGES,
  ORGANISER_EMAIL,
  type Lang,
} from './messages';

/**
 * Where a registration is sent.
 *
 * Relative by default, which is right when nginx serves the built site and
 * the API from the same host — see server/README.md. Set
 * VITE_REGISTER_ENDPOINT to an absolute URL while the site is still on
 * GitHub Pages and the API is on the organiser's server.
 */
const ENDPOINT = import.meta.env.VITE_REGISTER_ENDPOINT || '/api/register';

const LANG_KEY = 'iu-lang';
const LANGS: Lang[] = ['uz', 'ru', 'en'];
const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as string[]).includes(v);

function initialLang(): Lang {
  const fromQuery = new URLSearchParams(location.search).get('lang');
  if (isLang(fromQuery)) return fromQuery;
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* private window, or storage switched off; the default is fine */
  }
  return 'uz';
}

const lang = ref<Lang>(initialLang());
const t = computed(() => MESSAGES[lang.value]);

function setLang(next: Lang): void {
  lang.value = next;
  try {
    localStorage.setItem(LANG_KEY, next);
  } catch {
    /* as above */
  }
  const url = new URL(location.href);
  url.searchParams.set('lang', next);
  history.replaceState(null, '', url);
  applyHead();
}

function applyHead(): void {
  document.documentElement.lang = lang.value;
  document.title = t.value.docTitle;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', t.value.docDescription);
}

onMounted(applyHead);

/* ----------------------------------------------------------------- form */

const REQUIRED = ['full_name', 'organisation', 'position', 'country', 'email', 'phone'] as const;
type Required = (typeof REQUIRED)[number];

const form = reactive({
  role: 'guest' as 'guest' | 'speaker',
  full_name: '',
  organisation: '',
  position: '',
  country: '',
  email: '',
  phone: '',
  direction: '',
  note: '',
  /** The honeypot. No human sees this; a bot that fills every input does. */
  website: '',
});

const errors = reactive<Partial<Record<Required | 'role', boolean>>>({});
const state = ref<'idle' | 'sending' | 'done' | 'failed'>('idle');
const failure = ref<'network' | 'rate' | 'server' | 'fields' | ''>('');
const reference = ref(0);

/** The same rule the API applies, so the two never disagree about an address. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(): boolean {
  for (const key of REQUIRED) {
    const value = form[key].trim();
    errors[key] = key === 'email' ? !EMAIL.test(value) : value.length < 2;
  }
  errors.role = form.role !== 'guest' && form.role !== 'speaker';
  return !Object.values(errors).some(Boolean);
}

/** Re-checks a field once it has been wrong, so the mark clears as you type. */
function recheck(key: Required): void {
  if (!errors[key]) return;
  const value = form[key].trim();
  errors[key] = key === 'email' ? !EMAIL.test(value) : value.length < 2;
}

const firstBadField = computed(() => REQUIRED.find((key) => errors[key]));

async function submit(): Promise<void> {
  if (state.value === 'sending') return;
  failure.value = '';

  if (!validate()) {
    failure.value = 'fields';
    // Taken to the first field that needs fixing rather than left to hunt.
    const id = firstBadField.value;
    if (id) document.getElementById(id)?.focus();
    return;
  }

  state.value = 'sending';
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, lang: lang.value }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: number;
      fields?: string[];
      error?: string;
    };

    if (res.ok && body.ok) {
      reference.value = Number(body.id) || 0;
      state.value = 'done';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (res.status === 422 && Array.isArray(body.fields)) {
      // The server found something the browser let through; mark the same
      // fields so the reader sees one consistent story.
      for (const key of body.fields) {
        if ((REQUIRED as readonly string[]).includes(key)) errors[key as Required] = true;
      }
      failure.value = 'fields';
    } else if (res.status === 429) {
      failure.value = 'rate';
    } else {
      failure.value = 'server';
    }
    state.value = 'failed';
  } catch {
    // Offline, DNS, a blocked request: all the same thing to the reader.
    failure.value = 'network';
    state.value = 'failed';
  }
}

function again(): void {
  for (const key of REQUIRED) form[key] = '';
  form.direction = '';
  form.note = '';
  reference.value = 0;
  state.value = 'idle';
  failure.value = '';
}

/** The site, in whatever language this page is being read in. */
const siteHref = computed(() => `./?lang=${lang.value}`);

/**
 * The same answers as an email, offered when the API could not be reached.
 *
 * Which is not a hypothetical: while the site is published on GitHub Pages
 * and the API is on the organiser's own server, a build that has not been
 * given VITE_REGISTER_ENDPOINT posts into nothing. Somebody who has just
 * typed nine fields should not be told only that it failed.
 */
const mailHref = computed(() => {
  const lines = [
    `${t.value.roleLabel}: ${t.value.roles[form.role]}`,
    `${t.value.fields.full_name}: ${form.full_name}`,
    `${t.value.fields.organisation}: ${form.organisation}`,
    `${t.value.fields.position}: ${form.position}`,
    `${t.value.fields.country}: ${form.country}`,
    `${t.value.fields.email}: ${form.email}`,
    `${t.value.fields.phone}: ${form.phone}`,
  ];
  if (form.direction) {
    lines.push(`${t.value.fields.direction}: ${t.value.directions[form.direction]}`);
  }
  if (form.note.trim()) lines.push(`${t.value.fields.note}: ${form.note.trim()}`);
  return (
    `mailto:${ORGANISER_EMAIL}` +
    `?subject=${encodeURIComponent(t.value.mailSubject)}` +
    `&body=${encodeURIComponent(lines.join('\n'))}`
  );
});
</script>

<template>
  <div class="reg stage">
    <header class="reg__bar">
      <!-- The SVG is this repository's own, generated by process-logos.mjs;
           v-html is inlining a build-time asset, not anything a reader can
           reach. -->
      <a class="reg__logo" :href="siteHref" aria-label="Tourism Investment Forum 2026">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="lockupWhite" />
      </a>

      <div class="reg__barRight">
        <nav class="reg__langs" :aria-label="LANG_NAMES[lang]">
          <button
            v-for="code in LANGS"
            :key="code"
            type="button"
            :aria-current="code === lang ? 'true' : undefined"
            @click="setLang(code)"
          >
            {{ code.toUpperCase() }}
            <span class="sr-only">{{ LANG_NAMES[code] }}</span>
          </button>
        </nav>
        <a class="btn reg__back" :href="siteHref">{{ t.back }}</a>
      </div>
    </header>

    <main class="reg__shell">
      <!-- Done ---------------------------------------------------------- -->
      <section v-if="state === 'done'" class="reg__done card">
        <h1>{{ t.doneTitle }}</h1>
        <p>{{ t.doneBody }}</p>
        <p v-if="reference" class="reg__ref">
          {{ t.doneRef }}: <strong>№ {{ reference }}</strong>
        </p>
        <div class="reg__doneActions">
          <button type="button" class="btn btn--solid" @click="again">{{ t.again }}</button>
          <a class="btn" :href="siteHref">{{ t.back }}</a>
        </div>
      </section>

      <!-- The form ------------------------------------------------------ -->
      <template v-else>
        <h1 class="reg__title">{{ t.title }}</h1>
        <p class="reg__dates">{{ t.dates }}</p>
        <p class="reg__lead">{{ t.lead }}</p>

        <div v-if="failure" class="reg__alert" role="alert">
          <p>{{ failure === 'fields' ? t.errors.summary : t.errors[failure] }}</p>
          <!-- Only when the request itself did not land. A wrong field is
               the reader's to fix here, not something to email about. -->
          <p v-if="failure === 'network' || failure === 'server'" class="reg__alertMail">
            {{ t.byEmail }}
            <a :href="mailHref">{{ ORGANISER_EMAIL }}</a>
          </p>
        </div>

        <form class="reg__form" novalidate @submit.prevent="submit">
          <fieldset class="reg__roles">
            <legend>{{ t.roleLabel }}</legend>
            <label v-for="role in (['guest', 'speaker'] as const)" :key="role" class="reg__role">
              <input v-model="form.role" type="radio" name="role" :value="role" />
              <span class="reg__roleBody">
                <strong>{{ t.roles[role] }}</strong>
                <small>{{ t.roleHint[role] }}</small>
              </span>
            </label>
          </fieldset>

          <div class="reg__grid">
            <p class="field field--wide">
              <label for="full_name">{{ t.fields.full_name }}</label>
              <input
                id="full_name"
                v-model="form.full_name"
                type="text"
                autocomplete="name"
                :aria-invalid="errors.full_name ? 'true' : undefined"
                :aria-describedby="errors.full_name ? 'e-full_name' : undefined"
                @blur="recheck('full_name')"
              />
              <small v-if="errors.full_name" id="e-full_name" class="field__err">
                {{ t.errors.full_name }}
              </small>
            </p>

            <p class="field">
              <label for="organisation">{{ t.fields.organisation }}</label>
              <input
                id="organisation"
                v-model="form.organisation"
                type="text"
                autocomplete="organization"
                :aria-invalid="errors.organisation ? 'true' : undefined"
                :aria-describedby="errors.organisation ? 'e-organisation' : undefined"
                @blur="recheck('organisation')"
              />
              <small v-if="errors.organisation" id="e-organisation" class="field__err">
                {{ t.errors.organisation }}
              </small>
            </p>

            <p class="field">
              <label for="position">{{ t.fields.position }}</label>
              <input
                id="position"
                v-model="form.position"
                type="text"
                autocomplete="organization-title"
                :aria-invalid="errors.position ? 'true' : undefined"
                :aria-describedby="errors.position ? 'e-position' : undefined"
                @blur="recheck('position')"
              />
              <small v-if="errors.position" id="e-position" class="field__err">
                {{ t.errors.position }}
              </small>
            </p>

            <p class="field">
              <label for="country">{{ t.fields.country }}</label>
              <input
                id="country"
                v-model="form.country"
                type="text"
                autocomplete="country-name"
                :aria-invalid="errors.country ? 'true' : undefined"
                :aria-describedby="errors.country ? 'e-country' : undefined"
                @blur="recheck('country')"
              />
              <small v-if="errors.country" id="e-country" class="field__err">
                {{ t.errors.country }}
              </small>
            </p>

            <p class="field">
              <label for="phone">{{ t.fields.phone }}</label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                :aria-invalid="errors.phone ? 'true' : undefined"
                :aria-describedby="errors.phone ? 'e-phone' : undefined"
                @blur="recheck('phone')"
              />
              <small v-if="errors.phone" id="e-phone" class="field__err">
                {{ t.errors.phone }}
              </small>
            </p>

            <p class="field field--wide">
              <label for="email">{{ t.fields.email }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                inputmode="email"
                autocomplete="email"
                :aria-invalid="errors.email ? 'true' : undefined"
                :aria-describedby="errors.email ? 'e-email' : undefined"
                @blur="recheck('email')"
              />
              <small v-if="errors.email" id="e-email" class="field__err">
                {{ t.errors.email }}
              </small>
            </p>

            <p class="field field--wide">
              <label for="direction">
                {{ t.fields.direction }} <span class="field__opt">({{ t.optional }})</span>
              </label>
              <select id="direction" v-model="form.direction">
                <option value="">{{ t.directionNone }}</option>
                <option v-for="id in DIRECTION_IDS" :key="id" :value="id">
                  {{ t.directions[id] }}
                </option>
              </select>
            </p>

            <p class="field field--wide">
              <label for="note">
                {{ t.fields.note }} <span class="field__opt">({{ t.optional }})</span>
              </label>
              <textarea id="note" v-model="form.note" rows="4" maxlength="1200" />
            </p>
          </div>

          <!-- Not display:none — a bot that reads the stylesheet skips that.
               Off-screen, not reachable by tab, and announced to nobody. -->
          <div class="reg__trap" aria-hidden="true">
            <label for="website">Website</label>
            <input id="website" v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
          </div>

          <div class="reg__actions">
            <button type="submit" class="btn btn--solid" :disabled="state === 'sending'">
              {{ state === 'sending' ? t.sending : t.submit }}
            </button>
            <small class="reg__privacy">{{ t.privacy }}</small>
          </div>
        </form>
      </template>

    </main>
  </div>
</template>

<style scoped>
/* The page is one lit stage: the form is the only thing on it, so it gets
   the surface the title card uses rather than the paper the chapters do. */
.reg {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.reg__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding-block: 0.9rem;
  padding-inline: max(var(--gutter), env(safe-area-inset-left));
}
.reg__logo {
  display: block;
  height: clamp(2.5rem, 6vw, 3.5rem);
}
.reg__logo :deep(svg) {
  display: block;
  block-size: 100%;
  inline-size: auto;
}
.reg__barRight {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.reg__langs {
  display: flex;
  gap: 0.15rem;
}
.reg__langs button {
  min-block-size: var(--tap);
  min-inline-size: var(--tap);
  padding: 0.4rem 0.6rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--ink-dim);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
}
.reg__langs button[aria-current='true'] {
  border-color: var(--hairline-strong);
  color: var(--gold);
}
@media (hover: hover) {
  .reg__langs button:hover {
    color: var(--ink);
  }
}

.reg__shell {
  width: var(--shell);
  max-width: 44rem;
  margin-inline: auto;
  padding-block: clamp(1.5rem, 5vh, 3rem) clamp(3rem, 8vh, 5rem);
  flex: 1;
}

.reg__title {
  font-size: clamp(2rem, 5vw, 3rem);
}
.reg__dates {
  margin-block-start: 0.6rem;
  color: var(--gold);
  font-size: 0.95rem;
}
.reg__lead {
  margin-block-start: 1rem;
  max-width: 34rem;
}

.reg__alert {
  margin-block-start: 1.5rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--danger);
  border-radius: 0.3rem;
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  color: var(--ink);
  font-size: 0.9rem;
}

.reg__alert p {
  margin: 0;
}

.reg__alert p + p {
  margin-block-start: 0.5rem;
}

.reg__alertMail {
  color: var(--ink-soft);
}

.reg__alertMail a {
  color: var(--gold);
  overflow-wrap: anywhere;
}

.reg__form {
  margin-block-start: 2rem;
}

/* The two kinds of participant, as cards rather than two bare radios: the
   difference between them is the hint, and a hint beside a 16px dot is a
   hint nobody reads. */
.reg__roles {
  display: grid;
  gap: 0.6rem;
  margin: 0 0 1.75rem;
  padding: 0;
  border: 0;
}
.reg__roles legend {
  padding: 0;
  margin-block-end: 0.6rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
}
@media (min-width: 34rem) {
  .reg__roles {
    grid-template-columns: 1fr 1fr;
  }
  .reg__roles legend {
    grid-column: 1 / -1;
  }
}
.reg__role {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 0.9rem 1rem;
  border: 1px solid var(--hairline);
  border-radius: 0.3rem;
  background: var(--raise);
  cursor: pointer;
  transition: border-color 0.18s, background-color 0.18s;
}
.reg__role:has(input:checked) {
  border-color: var(--gold-leaf);
  background: color-mix(in srgb, var(--gold-leaf) 10%, transparent);
}
.reg__role:has(input:focus-visible) {
  outline: 2px solid var(--accent-soft);
  outline-offset: 2px;
}
.reg__role input {
  margin-block-start: 0.25rem;
  accent-color: var(--gold-leaf);
  inline-size: 1.05rem;
  block-size: 1.05rem;
  flex: 0 0 auto;
}
.reg__roleBody {
  display: grid;
  gap: 0.15rem;
}
.reg__roleBody strong {
  color: var(--ink);
}
.reg__roleBody small {
  font-size: 0.82rem;
  color: var(--ink-dim);
}

.reg__grid {
  display: grid;
  gap: 1rem;
}
@media (min-width: 34rem) {
  .reg__grid {
    grid-template-columns: 1fr 1fr;
  }
  .field--wide {
    grid-column: 1 / -1;
  }
}

.field {
  display: grid;
  gap: 0.35rem;
  margin: 0;
}
.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink);
}
.field__opt {
  font-weight: 400;
  color: var(--ink-dim);
}
.field input,
.field select,
.field textarea {
  min-block-size: var(--tap);
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--hairline);
  border-radius: 0.3rem;
  background: var(--raise);
  color: var(--ink);
  font: inherit;
}
.field textarea {
  resize: vertical;
}
.field input:focus-visible,
.field select:focus-visible,
.field textarea:focus-visible {
  outline: 2px solid var(--accent-soft);
  outline-offset: 1px;
}
.field [aria-invalid='true'] {
  border-color: var(--danger);
}
.field__err {
  font-size: 0.8rem;
  color: var(--danger);
}

.reg__trap {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.reg__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem 1.25rem;
  align-items: center;
  margin-block-start: 2rem;
}
.reg__privacy {
  flex: 1 1 16rem;
  font-size: 0.8rem;
  color: var(--ink-dim);
}

.reg__done {
  padding: clamp(1.5rem, 5vw, 2.5rem);
}
.reg__done h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}
.reg__done p {
  margin-block-start: 0.9rem;
  max-width: 34rem;
}
.reg__ref strong {
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}
.reg__doneActions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-block-start: 1.75rem;
}

</style>
