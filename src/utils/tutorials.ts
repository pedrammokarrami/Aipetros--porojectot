import type { AmbientColorRGB } from './media';

export interface TutorialChapter {
  id: string;
  index: number;
  title: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  ambientColor: AmbientColorRGB;
  keyFormula: string;
  caption: string;
}

export interface BuiltInTutorial {
  id: 'wave-optics' | 'distributed-consensus';
  courseCode: string;
  title: string;
  instructor: string;
  duration: number;
  chapters: TutorialChapter[];
}

export const BUILT_IN_TUTORIALS: Record<BuiltInTutorial['id'], BuiltInTutorial> = {
  'wave-optics': {
    id: 'wave-optics',
    courseCode: 'PHYS 314 · Lecture 07',
    title: 'Wave Optics & Coherent Interference',
    instructor: 'Dr. Elena Lindholm',
    duration: 240,
    chapters: [
      {
        id: 'superposition',
        index: 1,
        title: '01. Principle of Linear Superposition',
        startTime: 0,
        endTime: 60,
        ambientColor: { r: 112, g: 168, b: 218 },
        keyFormula: 'E(x, t) = E₁ cos(kx − ωt) + E₂ cos(kx − ωt + φ)',
        caption: 'Two coherent wavefronts combine linearly; phase difference φ determines constructive or destructive amplitude.',
      },
      {
        id: 'double-slit',
        index: 2,
        title: '02. Young’s Double-Slit Fringe Geometry',
        startTime: 60,
        endTime: 120,
        ambientColor: { r: 94, g: 184, b: 196 },
        keyFormula: 'd · sin(θ) = m · λ    (m = 0, ±1, ±2, ...)',
        caption: 'Path length difference Δr = d sin(θ) projects stable intensity fringes onto the observation screen.',
      },
      {
        id: 'thin-film',
        index: 3,
        title: '03. Optical Path & Phase Inversion',
        startTime: 120,
        endTime: 180,
        ambientColor: { r: 198, g: 158, b: 108 },
        keyFormula: '2 · n · t · cos(θ₂) = (m + ½) · λ',
        caption: 'Anti-reflective projector lens coatings exploit quarter-wavelength interference to suppress stray reflection.',
      },
      {
        id: 'fourier-aperture',
        index: 4,
        title: '04. Fraunhofer Diffraction Envelope',
        startTime: 180,
        endTime: 240,
        ambientColor: { r: 136, g: 154, b: 214 },
        keyFormula: 'I(θ) = I₀ · [sin(β) / β]² · cos²(α)',
        caption: 'Finite slit width modulates the interference maxima beneath a sinc² diffraction envelope.',
      },
    ],
  },
  'distributed-consensus': {
    id: 'distributed-consensus',
    courseCode: 'CS 422 · Lecture 04',
    title: 'Distributed Consensus & Log Replication',
    instructor: 'Prof. Marcus Chen',
    duration: 210,
    chapters: [
      {
        id: 'quorum',
        index: 1,
        title: '01. Quorum Intersection & Safety',
        startTime: 0,
        endTime: 70,
        ambientColor: { r: 102, g: 176, b: 154 },
        keyFormula: '|Q₁ ∩ Q₂| ≥ 1   when   |Q| > N / 2',
        caption: 'Any two majority quorums share at least one node, guaranteeing continuity of committed state.',
      },
      {
        id: 'leader-election',
        index: 2,
        title: '02. Randomized Election Timeouts',
        startTime: 70,
        endTime: 140,
        ambientColor: { r: 196, g: 144, b: 96 },
        keyFormula: 'T_election ∈ [150ms, 300ms]  ≫  RTT_broadcast',
        caption: 'Staggered timers break split-vote symmetry so a single candidate secures majority votes in one round.',
      },
      {
        id: 'log-matching',
        index: 3,
        title: '03. Replicated State Machine Commits',
        startTime: 140,
        endTime: 210,
        ambientColor: { r: 118, g: 158, b: 222 },
        keyFormula: 'CommitIndex(t) = max { i : replicated(i) > N / 2 }',
        caption: 'Entries become durable once replicated to a majority, then apply deterministically across every node.',
      },
    ],
  },
};

export interface ChapterState {
  chapter: TutorialChapter;
  chapterProgress: number; // 0..1 within chapter
  overallProgress: number; // 0..1 within tutorial
}

export function getChapterStateAtTime(
  tutorial: BuiltInTutorial,
  rawTime: number
): ChapterState {
  const clampedTime = Math.min(tutorial.duration, Math.max(0, Number.isFinite(rawTime) ? rawTime : 0));
  const chapter =
    tutorial.chapters.find((c) => clampedTime >= c.startTime && clampedTime < c.endTime) ??
    tutorial.chapters[tutorial.chapters.length - 1];

  const span = Math.max(0.001, chapter.endTime - chapter.startTime);
  const chapterProgress = Math.min(1, Math.max(0, (clampedTime - chapter.startTime) / span));
  const overallProgress = Math.min(1, Math.max(0, clampedTime / Math.max(1, tutorial.duration)));

  return {
    chapter,
    chapterProgress,
    overallProgress,
  };
}
