import type { Chapter, DifficultyLevel, SubjectId, Subtopic, Topic, TopicPriority } from "@/types";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TopicSpec {
  name: string;
  summary: string;
  difficulty?: DifficultyLevel;
  /** Defaults to "should" if not set — only call out "must" (high-frequency,
   * study first) or "could" (lower-frequency, safe to deprioritise) topics
   * explicitly; everything else is a solid, regular "should". */
  priority?: TopicPriority;
  tags?: string[];
  subtopics?: string[];
  hasFullContent?: boolean;
  slug?: string;
}

export function buildChapter(
  subjectId: SubjectId,
  name: string,
  order: number,
  description?: string
): Chapter {
  return {
    id: `${subjectId}-${slugify(name)}`,
    subjectId,
    name,
    order,
    description,
  };
}

export function buildTopics(chapter: Chapter, specs: TopicSpec[]): Topic[] {
  return specs.map((spec, index) => {
    const slug = spec.slug ?? slugify(spec.name);
    const topicId = `${chapter.id}--${slug}`;
    const subtopics: Subtopic[] = (spec.subtopics ?? []).map((name, i) => ({
      id: `${topicId}-sub-${i + 1}`,
      topicId,
      name,
      order: i + 1,
    }));
    return {
      id: topicId,
      chapterId: chapter.id,
      subjectId: chapter.subjectId,
      name: spec.name,
      slug,
      order: index + 1,
      difficultyTag: spec.difficulty ?? "Medium",
      priority: spec.priority ?? "should",
      tags: spec.tags ?? [],
      subtopics,
      hasFullContent: spec.hasFullContent ?? false,
      summary: spec.summary,
    };
  });
}
