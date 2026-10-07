/**
 * Types for public/data/forum-2026.json.
 *
 * Written by hand to mirror what scripts/build-forum-data.mjs emits. Only site 2
 * reads this file, so it lives here rather than in shared/lib.
 */
import type { I18nText } from './shared/content-types';

export interface ForumEvent {
  name: I18nText;
  shortName: I18nText;
  edition: I18nText;
  dateStart: string;
  dateEnd: string;
  city: I18nText;
  country: I18nText;
  within: I18nText;
  organiser: I18nText;
  motto: { line1: I18nText; line2: I18nText };
  format: I18nText;
  source: string;
}

export interface ForumTheme {
  id: string;
  icon: string;
  title: I18nText;
  body: I18nText;
}

export interface ForumParticipant {
  id: string;
  category: I18nText;
  who: I18nText;
}

export interface ForumSession {
  id: string;
  number: number;
  title: I18nText;
  workingTitle: string;
  topics: I18nText;
}

export interface ProgrammeItem {
  start: string;
  end: string;
  kind: 'break' | 'opening' | 'keynote' | 'plenary' | 'showcase' | 'b2b' | 'closing';
  plenary?: number;
  title: I18nText;
  body?: I18nText;
  bullets?: I18nText[];
}

export interface ForumProgramme {
  day: I18nText;
  note: I18nText;
  items: ProgrammeItem[];
  source: string;
}

export interface StandardBlock {
  n: number;
  block: I18nText;
  body: I18nText;
}

export interface MechanismStep {
  n: number;
  title: I18nText;
  body: I18nText;
}

export interface PreparationStage extends MechanismStep {
  roman: string;
}

/** One investment project, as parsed out of its regional one-pager. */
export interface Project {
  id: string;
  region: string;
  segment: string;
  title: string;
  displayTitle?: string;
  subtitle: string | null;
  /** Normalised to whole units of `currency`; null when the deck left it open. */
  investment: number | null;
  currency: 'USD' | 'UZS' | null;
  /** The figure exactly as the deck writes it, for the tooltip. */
  investmentDisplay: string | null;
  landArea: string | null;
  capacity: string | null;
  activity: string | null;
  jobs: string | null;
  place: string | null;
  status: string | null;
  payback: string | null;
  utilities: string | null;
  access: string | null;
  address: string | null;
  structure: string | null;
  opening: string | null;
  overview: string | null;
  source: string;
  /** Machine-detected problems in the source deck; shown to nobody, used in QA. */
  issues: string[];
  alsoIn?: string[];
}

export interface ForumSourceRef {
  id: string;
  title: I18nText;
  publisher: I18nText;
  document: string;
  asOf: string;
}

export interface ForumData {
  meta: {
    version: string;
    collected_at: string;
    languages: string[];
    default_language: string;
    disclaimer_enabled: boolean;
    note: string;
    generated_by: string;
  };
  event: ForumEvent;
  intro: { purpose: I18nText; paragraphs: I18nText[]; source: string };
  goals: I18nText[];
  themes: ForumTheme[];
  participants: ForumParticipant[];
  sessions: ForumSession[];
  programme: ForumProgramme;
  standard: StandardBlock[];
  criteria: { items: I18nText[]; note: I18nText };
  mechanism: MechanismStep[];
  stages: PreparationStage[];
  outcomes: {
    quantitative: I18nText[];
    quantitativeNote: I18nText;
    qualitative: I18nText[];
    source: string;
  };
  promotion: I18nText[];
  portfolio: {
    projects: Project[];
    regionNames: Record<string, I18nText>;
    regionCounts: Record<string, number>;
    segmentCounts: Record<string, number>;
    totalUsd: number;
    statedUsdCount: number;
    contributedBy: I18nText[];
  };
  sources: ForumSourceRef[];
}

export const FORUM_URL = 'data/forum-2026.json';

export async function loadForum(signal?: AbortSignal): Promise<ForumData> {
  const res = await fetch(FORUM_URL, { signal: signal ?? null });
  if (!res.ok) throw new Error(`forum-2026.json responded ${res.status}`);
  return (await res.json()) as ForumData;
}
