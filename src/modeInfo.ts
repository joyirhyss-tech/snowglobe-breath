// Educational metadata about each breathing technique. Surfaced in the
// Settings panel via a small info icon next to each mode. Citations link to
// the primary research source where available, plus a reputable overview
// page so users can dig in regardless of paywall.
//
// Copy is English-only for v1 — i18n keys can be added later if we localize
// the descriptions. Keep prose plain, secular, no medical claims.

import type { ModeId } from './modes';

export type ModeInfo = {
  technique: string;     // one-line pattern summary
  description: string;   // ~2–3 sentences on what it does and why
  research: Array<{
    label: string;       // visible link text
    url: string;         // destination
  }>;
};

export const MODE_INFO: Record<ModeId, ModeInfo> = {
  silver: {
    technique: '5-second inhale, 7-second exhale × 5 cycles',
    description:
      'A longer exhale than inhale activates the parasympathetic ("rest and digest") branch of the nervous system, lowering heart rate and inducing calm. The 5/7 ratio sits near the well-studied resonant range while emphasizing the calming exhale.',
    research: [
      {
        label: 'Bernardi et al., Hypertension 2006 (slow breathing & baroreflex)',
        url: 'https://www.ahajournals.org/doi/10.1161/01.HYP.0000208510.39411.de',
      },
      {
        label: 'Cleveland Clinic: diaphragmatic & paced breathing',
        url: 'https://health.clevelandclinic.org/diaphragmatic-breathing',
      },
    ],
  },
  gold: {
    technique: 'Box breathing: 5s inhale, 5s hold, 5s exhale, 5s hold × 3 cycles',
    description:
      'Equal phases anchor attention and balance the autonomic nervous system. Originally codified for US Navy SEAL stress regulation, now widely used by athletes, first responders, and clinicians for focus under pressure.',
    research: [
      {
        label: 'Cleveland Clinic: what is box breathing',
        url: 'https://health.clevelandclinic.org/box-breathing-benefits',
      },
      {
        label: 'APA: controlled breathing & stress',
        url: 'https://www.apa.org/topics/mindfulness/meditation',
      },
    ],
  },
  rainbow: {
    technique: 'Coherent breathing: 5s inhale, 5s exhale × 6 cycles',
    description:
      "Breathing at about 6 breaths per minute approximates the heart's resonant frequency, maximizing heart rate variability (HRV), a marker of autonomic flexibility and emotional regulation. HeartMath research uses this rate to support coherence between heart, breath, and emotion.",
    research: [
      {
        label: 'Lehrer & Gevirtz, Frontiers in Psychology 2014 (HRV biofeedback)',
        url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2014.00756/full',
      },
      {
        label: 'HeartMath Institute: research library',
        url: 'https://www.heartmath.org/research/research-library/',
      },
    ],
  },
};
