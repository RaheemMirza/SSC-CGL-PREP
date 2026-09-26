import type { Chapter, Subject, Topic } from "@/types";
import { quantChapters, quantTopics } from "./quant";
import { reasoningChapters, reasoningTopics } from "./reasoning";
import { englishChapters, englishTopics } from "./english";
import { gaChapters, gaTopics } from "./ga";
import { tier2Chapters, tier2Topics } from "./tier2";

export const SUBJECTS: Subject[] = [
  { id: "quant", name: "Quantitative Aptitude", shortName: "Quant", tier: "Tier 1", color: "brand", icon: "Calculator", description: "Number sense, arithmetic, algebra, geometry, mensuration, trigonometry & DI." },
  { id: "reasoning", name: "General Intelligence & Reasoning", shortName: "Reasoning", tier: "Tier 1", color: "violet", icon: "Puzzle", description: "Verbal, analytical and figure-based reasoning." },
  { id: "english", name: "English Comprehension", shortName: "English", tier: "Tier 1", color: "rose", icon: "BookOpenText", description: "Grammar, vocabulary, and reading comprehension." },
  { id: "ga", name: "General Awareness", shortName: "GA", tier: "Tier 1", color: "amber", icon: "Globe2", description: "History, geography, polity, economy, science & current affairs." },
  { id: "tier2-math", name: "Mathematical Abilities", shortName: "Maths (T2)", tier: "Tier 2", color: "brand", icon: "Calculator", description: "Tier 1 Quant topics at higher difficulty & speed." },
  { id: "tier2-reasoning", name: "Reasoning & General Intelligence", shortName: "Reasoning (T2)", tier: "Tier 2", color: "violet", icon: "Puzzle", description: "Includes heavier puzzles & seating arrangement not emphasised in Tier 1." },
  { id: "tier2-english", name: "English Language & Comprehension", shortName: "English (T2)", tier: "Tier 2", color: "rose", icon: "BookOpenText", description: "Tier 1 English topics at higher difficulty, plus longer passages." },
  { id: "tier2-ga", name: "General Awareness (Tier 2)", shortName: "GA (T2)", tier: "Tier 2", color: "amber", icon: "Globe2", description: "Same GA categories as Tier 1, tested in greater depth." },
  { id: "tier2-computer", name: "Computer Knowledge & DEST", shortName: "Computer", tier: "Tier 2", color: "teal", icon: "MonitorSmartphone", description: "Computer fundamentals, internet & security, MS Office, and the typing test." },
  { id: "tier2-statistics", name: "Statistics (Paper II)", shortName: "Statistics", tier: "Tier 2", color: "teal", icon: "BarChart3", description: "For JSO / Statistical Investigator Grade-II applicants only." },
  { id: "tier2-finance-economics", name: "Finance & Economics (Paper III)", shortName: "Finance & Economics", tier: "Tier 2", color: "teal", icon: "Landmark", description: "For AAO / Assistant Accounts Officer applicants only." },
];

export const ALL_CHAPTERS: Chapter[] = [
  ...quantChapters, ...reasoningChapters, ...englishChapters, ...gaChapters, ...tier2Chapters,
];

export const ALL_TOPICS: Topic[] = [
  ...quantTopics, ...reasoningTopics, ...englishTopics, ...gaTopics, ...tier2Topics,
];

export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getChaptersBySubject(subjectId: string): Chapter[] {
  return ALL_CHAPTERS.filter((c) => c.subjectId === subjectId).sort((a, b) => a.order - b.order);
}

export function getChapterById(id: string): Chapter | undefined {
  return ALL_CHAPTERS.find((c) => c.id === id);
}

export function getTopicsByChapter(chapterId: string): Topic[] {
  return ALL_TOPICS.filter((t) => t.chapterId === chapterId).sort((a, b) => a.order - b.order);
}

export function getTopicsBySubject(subjectId: string): Topic[] {
  return ALL_TOPICS.filter((t) => t.subjectId === subjectId);
}

export function getTopicById(id: string): Topic | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}

export function getTier1Subjects(): Subject[] {
  return SUBJECTS.filter((s) => s.tier === "Tier 1");
}

export function getTier2Subjects(): Subject[] {
  return SUBJECTS.filter((s) => s.tier === "Tier 2");
}

export function getHeroTopics(): Topic[] {
  return ALL_TOPICS.filter((t) => t.hasFullContent);
}
