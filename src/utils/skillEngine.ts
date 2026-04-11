// ============================================================
//  Dynamic Skills Engine  —  src/utils/skillEngine.ts
//  Derives real proficiency scores from project usage data.
//  No arbitrary numbers. 100% deterministic + auditable.
// ============================================================

import { Project, Skill } from '../data';

// ── Scoring constants ────────────────────────────────────────
const BASE_SCORE       = 70;
const FREQ_MULTIPLIER  = 4;
const COMPLEXITY_BONUS = { low: 0, medium: 3, high: 6 } as const;
const LEVEL_WEIGHT     = { core: 1.0, supporting: 0.7, exposure: 0.4 } as const;
const SCORE_CAP        = 95;

// ── Icon / colour registry for known tags ────────────────────
//    Any tag not in this map will fall back to a neutral style.
const TAG_META: Record<string, { icon: string; color: string }> = {
  // === Frontend Frameworks ===
  'Vue 3':        { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg',           color: '#41b883' },
  'Vue':          { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg',           color: '#41b883' },
  'React':        { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',           color: '#61dafb' },
  'TypeScript':   { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg', color: '#3178C6' },
  'JavaScript':   { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', color: '#f7df1e' },
  'HTML':         { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',           color: '#e34f26' },
  'CSS':          { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',             color: '#1572b6' },
  'Tailwind CSS': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', color: '#38bdf8' },
  'Next.js':      { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',         color: '#ffffff' },
  // === Backend / APIs ===
  'Node.js':      { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',         color: '#339933' },
  'Laravel':      { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg',       color: '#ff2d20' },
  'Express':      { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg',       color: '#ffffff' },
  'DummyJSON':    { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/json/json-original.svg',             color: '#f59e0b' },
  // === AI / ML ===
  'Python':       { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',         color: '#3776ab' },
  'TensorFlow':   { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg', color: '#ff6f00' },
  'PyTorch':      { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg',       color: '#ee4c2c' },
  'scikit-learn': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg', color: '#f7931e' },
  // === DevOps / Tooling ===
  'Git':          { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',               color: '#f05032' },
  'Docker':       { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',         color: '#2496ED' },
  'Firebase':     { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg',     color: '#ffca28' },
  'Vite':         { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg',         color: '#646cff' },
};

const FALLBACK_META = {
  icon:  'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/devicon/devicon-original.svg',
  color: '#00abf0',
};

// ── Internal accumulator shape ────────────────────────────────
interface Accumulator {
  rawScore:  number;
  frequency: number;
  icon:      string;
  color:     string;
}

// ── Public API ────────────────────────────────────────────────
/**
 * Derives `Skill[]` from project usage — sorted by proficiency desc.
 *
 * Scoring formula per project × tag:
 *   points = (BASE + FREQ_BUMP + COMPLEXITY_BONUS) × LEVEL_WEIGHT × projectWeight
 */
export function deriveTechnicalSkills(projects: Project[]): Skill[] {
  const map = new Map<string, Accumulator>();

  for (const project of projects) {
    const complexityBonus = COMPLEXITY_BONUS[project.complexity];

    for (const tag of project.tags) {
      const levelWeight     = LEVEL_WEIGHT[tag.level];
      const existingEntry   = map.get(tag.name);
      const freqBump        = existingEntry ? FREQ_MULTIPLIER : 0;

      // Points contributed by THIS project × tag combination
      const points =
        (BASE_SCORE + freqBump + complexityBonus) * levelWeight * project.weight;

      const meta = TAG_META[tag.name] ?? FALLBACK_META;

      if (existingEntry) {
        map.set(tag.name, {
          rawScore:  existingEntry.rawScore + points,
          frequency: existingEntry.frequency + 1,
          icon:      existingEntry.icon,
          color:     existingEntry.color,
        });
      } else {
        map.set(tag.name, {
          rawScore:  points,
          frequency: 1,
          icon:      meta.icon,
          color:     meta.color,
        });
      }
    }
  }

  // ── Normalise scores to 0–95 range ──────────────────────────
  const entries = Array.from(map.entries());
  const maxRaw  = Math.max(...entries.map(([, v]) => v.rawScore), 1);

  return entries
    .map(([name, acc]): Skill => ({
      name,
      icon:        acc.icon,
      color:       acc.color,
      proficiency: Math.min(Math.round((acc.rawScore / maxRaw) * SCORE_CAP), SCORE_CAP),
      frequency:   acc.frequency,
    }))
    .sort((a, b) => b.proficiency - a.proficiency);
}
