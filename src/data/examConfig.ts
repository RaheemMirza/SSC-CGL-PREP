// =========================================================================
// SSC CGL exam pattern — kept as plain data, deliberately separate from any
// application logic, so it can be corrected in one place the moment SSC
// publishes a new notification. Nothing in this app hard-codes marks,
// timers or section names anywhere else; every screen reads from here.
//
// Seeded from the SSC CGL 2026 notification as summarised by several
// coaching/exam-tracking sites in September 2026. Treat the numbers below
// as "best available at last check", not gospel — SSC's own PDF is the
// only authority. Re-verify every application cycle (the commission has
// changed sectional timing, added a new Tier-2 paper, etc. in recent
// cycles) and bump `lastVerifiedOn` when you do.
// =========================================================================

export const EXAM_CONFIG_META = {
  lastVerifiedOn: "2026-09-26",
  sourceNote:
    "Cross-checked against multiple SSC CGL 2026 exam-pattern summaries. Always confirm against the official notification PDF at ssc.gov.in before trusting exact marks/timings.",
  officialSiteUrl: "https://ssc.gov.in",
};

export interface ExamSectionConfig {
  id: string;
  name: string;
  subjectId: string;
  questions: number;
  maxMarks: number;
  marksPerCorrect: number;
  marksPerWrong: number;
  sectionalTimeMinutes: number | null; // null = shared pool, not sectional
  qualifyingOnly?: boolean;
}

export interface ExamPaperConfig {
  id: string;
  name: string;
  appliesTo: string; // who needs to take it
  totalQuestions: number;
  totalMarks: number;
  totalDurationMinutes: number;
  sections: ExamSectionConfig[];
  notes: string[];
}

export const TIER1_CONFIG: ExamPaperConfig = {
  id: "tier1",
  name: "Tier 1",
  appliesTo: "All candidates — qualifying stage, shortlists for Tier 2",
  totalQuestions: 100,
  totalMarks: 200,
  totalDurationMinutes: 60,
  sections: [
    { id: "t1-reasoning", name: "General Intelligence & Reasoning", subjectId: "reasoning", questions: 25, maxMarks: 50, marksPerCorrect: 2, marksPerWrong: 0.5, sectionalTimeMinutes: 15 },
    { id: "t1-ga", name: "General Awareness", subjectId: "ga", questions: 25, maxMarks: 50, marksPerCorrect: 2, marksPerWrong: 0.5, sectionalTimeMinutes: 15 },
    { id: "t1-quant", name: "Quantitative Aptitude", subjectId: "quant", questions: 25, maxMarks: 50, marksPerCorrect: 2, marksPerWrong: 0.5, sectionalTimeMinutes: 15 },
    { id: "t1-english", name: "English Comprehension", subjectId: "english", questions: 25, maxMarks: 50, marksPerCorrect: 2, marksPerWrong: 0.5, sectionalTimeMinutes: 15 },
  ],
  notes: [
    "Each of the 4 sections now has its own fixed 15-minute timer — once it expires the section auto-locks and unused time cannot move to another section.",
    "Tier 1 is qualifying only; marks are not added to the final merit list, only used for the Tier 1 cutoff.",
    "Bilingual (English + Hindi) except the English Comprehension section.",
  ],
};

export const TIER2_PAPER1_CONFIG: ExamPaperConfig = {
  id: "tier2-paper1",
  name: "Tier 2 — Paper I",
  appliesTo: "All candidates — compulsory, decides final merit",
  totalQuestions: 150,
  totalMarks: 450,
  totalDurationMinutes: 150,
  sections: [
    { id: "t2-math", name: "Mathematical Abilities", subjectId: "tier2-math", questions: 30, maxMarks: 90, marksPerCorrect: 3, marksPerWrong: 1, sectionalTimeMinutes: 30 },
    { id: "t2-reasoning", name: "Reasoning & General Intelligence", subjectId: "tier2-reasoning", questions: 30, maxMarks: 90, marksPerCorrect: 3, marksPerWrong: 1, sectionalTimeMinutes: 30 },
    { id: "t2-english", name: "English Language & Comprehension", subjectId: "tier2-english", questions: 45, maxMarks: 135, marksPerCorrect: 3, marksPerWrong: 1, sectionalTimeMinutes: 40 },
    { id: "t2-ga", name: "General Awareness", subjectId: "tier2-ga", questions: 25, maxMarks: 75, marksPerCorrect: 3, marksPerWrong: 1, sectionalTimeMinutes: 20 },
    { id: "t2-computer", name: "Computer Knowledge Test", subjectId: "tier2-computer", questions: 20, maxMarks: 60, marksPerCorrect: 3, marksPerWrong: 1, sectionalTimeMinutes: 15, qualifyingOnly: true },
    { id: "t2-dest", name: "Data Entry Speed Test (DEST)", subjectId: "tier2-computer", questions: 1, maxMarks: 0, marksPerCorrect: 0, marksPerWrong: 0, sectionalTimeMinutes: 15, qualifyingOnly: true },
  ],
  notes: [
    "Computer Knowledge and DEST are qualifying only — they don't add to merit, but you must clear them.",
    "Section-wise timers apply within Paper I (roughly 30/30/40/20/15/15 minutes across the modules above).",
  ],
};

export const TIER2_PAPER2_CONFIG: ExamPaperConfig = {
  id: "tier2-paper2",
  name: "Tier 2 — Paper II (Statistics)",
  appliesTo: "Junior Statistical Officer (JSO) / Statistical Investigator Grade-II applicants only",
  totalQuestions: 100,
  totalMarks: 200,
  totalDurationMinutes: 120,
  sections: [
    { id: "t2p2-stats", name: "Statistics", subjectId: "tier2-statistics", questions: 100, maxMarks: 200, marksPerCorrect: 2, marksPerWrong: 0.5, sectionalTimeMinutes: null },
  ],
  notes: ["Only relevant if you are targeting a JSO / Statistical Investigator post."],
};

export const TIER2_PAPER3_CONFIG: ExamPaperConfig = {
  id: "tier2-paper3",
  name: "Tier 2 — Paper III (General Studies: Finance & Economics)",
  appliesTo: "Assistant Audit Officer / Assistant Accounts Officer (AAO) applicants only",
  totalQuestions: 100,
  totalMarks: 200,
  totalDurationMinutes: 120,
  sections: [
    { id: "t2p3-finance", name: "Finance & Accounts", subjectId: "tier2-finance-economics", questions: 40, maxMarks: 80, marksPerCorrect: 2, marksPerWrong: 0.5, sectionalTimeMinutes: null },
    { id: "t2p3-economics", name: "Economics & Governance", subjectId: "tier2-finance-economics", questions: 60, maxMarks: 120, marksPerCorrect: 2, marksPerWrong: 0.5, sectionalTimeMinutes: null },
  ],
  notes: ["Counts directly toward final AAO merit — not a qualifying formality. Only relevant for AAO aspirants."],
};

export const ALL_PAPERS: ExamPaperConfig[] = [
  TIER1_CONFIG,
  TIER2_PAPER1_CONFIG,
  TIER2_PAPER2_CONFIG,
  TIER2_PAPER3_CONFIG,
];

export function getPaperById(id: string): ExamPaperConfig | undefined {
  return ALL_PAPERS.find((p) => p.id === id);
}
