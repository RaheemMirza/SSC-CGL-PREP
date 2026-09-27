import type { LessonContent } from "@/types";
import { QUANT_LESSONS } from "./quant";
import { REASONING_LESSONS } from "./reasoning";
import { ENGLISH_LESSONS } from "./english";
import { GA_LESSONS } from "./ga";

export const ALL_LESSON_CONTENT: LessonContent[] = [...QUANT_LESSONS, ...REASONING_LESSONS, ...ENGLISH_LESSONS, ...GA_LESSONS];

export const LESSON_CONTENT_BY_TOPIC: Record<string, LessonContent> = Object.fromEntries(ALL_LESSON_CONTENT.map((l) => [l.topicId, l]));

export function getLessonContent(topicId: string): LessonContent | undefined {
  return LESSON_CONTENT_BY_TOPIC[topicId];
}
