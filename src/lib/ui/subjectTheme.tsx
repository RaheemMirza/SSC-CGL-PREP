import type { ComponentType } from "react";
import {
  Calculator,
  Puzzle,
  BookOpenText,
  Globe2,
  MonitorSmartphone,
  BarChart3,
  Landmark,
  type LucideProps,
} from "lucide-react";
import type { SubjectId } from "@/types";

export type SubjectColor = "brand" | "violet" | "rose" | "amber" | "teal";

interface ColorClasses {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
  ring: string;
  fill: string; // for progress bars / charts
}

const COLOR_MAP: Record<SubjectColor, ColorClasses> = {
  brand: { text: "text-brand-600 dark:text-brand-400", bg: "bg-brand-600", bgSoft: "bg-brand-50 dark:bg-brand-900/20", border: "border-brand-200 dark:border-brand-800", ring: "ring-brand-500", fill: "#3d56f5" },
  violet: { text: "text-violet-600 dark:text-violet-400", bg: "bg-accent-violet", bgSoft: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-200 dark:border-violet-800", ring: "ring-violet-500", fill: "#8b5cf6" },
  rose: { text: "text-rose-600 dark:text-rose-400", bg: "bg-accent-rose", bgSoft: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800", ring: "ring-rose-500", fill: "#e0526b" },
  amber: { text: "text-amber-600 dark:text-amber-400", bg: "bg-accent-amber", bgSoft: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", ring: "ring-amber-500", fill: "#e0972d" },
  teal: { text: "text-teal-600 dark:text-teal-400", bg: "bg-accent-teal", bgSoft: "bg-teal-50 dark:bg-teal-900/20", border: "border-teal-200 dark:border-teal-800", ring: "ring-teal-500", fill: "#0f9b8e" },
};

export function colorClassesFor(color: string): ColorClasses {
  return COLOR_MAP[(color as SubjectColor) in COLOR_MAP ? (color as SubjectColor) : "brand"];
}

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Calculator,
  Puzzle,
  BookOpenText,
  Globe2,
  MonitorSmartphone,
  BarChart3,
  Landmark,
};

export function iconFor(name: string): ComponentType<LucideProps> {
  return ICON_MAP[name] ?? Calculator;
}

/** Fallback theme for contexts with only a SubjectId, not the full Subject
 * record (rare, but the exam runner's per-question rendering is one). */
export const SUBJECT_FALLBACK_COLOR: Record<SubjectId, SubjectColor> = {
  quant: "brand",
  reasoning: "violet",
  english: "rose",
  ga: "amber",
  "tier2-math": "brand",
  "tier2-reasoning": "violet",
  "tier2-english": "rose",
  "tier2-ga": "amber",
  "tier2-computer": "teal",
  "tier2-statistics": "teal",
  "tier2-finance-economics": "teal",
};
