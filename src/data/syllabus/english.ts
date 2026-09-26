import type { Chapter, Topic } from "@/types";
import { buildChapter, buildTopics } from "./builders";

const SUBJECT = "english" as const;

export const englishChapters: Chapter[] = [
  buildChapter(SUBJECT, "Grammar", 1),
  buildChapter(SUBJECT, "Vocabulary", 2),
  buildChapter(SUBJECT, "Reading & Comprehension", 3),
];

const [grammar, vocab, reading] = englishChapters;

export const englishTopics: Topic[] = [
  ...buildTopics(grammar, [
    {
      name: "Error Detection (Spotting the Error)",
      summary: "Locating the ungrammatical part of a sentence quickly by pattern-checking subject-verb agreement, tenses, and prepositions.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["Subject-verb agreement", "Tense errors", "Preposition errors", "Article errors", "Pronoun errors"],
      tags: ["high-frequency"],
    },
    {
      name: "Sentence Improvement",
      summary: "Selecting the most grammatically correct and natural replacement for an underlined part of a sentence.",
      difficulty: "Medium",
      subtopics: ["Improving underlined phrases", "Redundancy removal"],
      tags: ["high-frequency"],
    },
    {
      name: "Fill in the Blanks",
      summary: "Choosing the word/phrase that fits both grammatically and contextually.",
      difficulty: "Easy",
      subtopics: ["Single blank", "Double blank", "Preposition-based blanks"],
    },
    {
      name: "Active & Passive Voice",
      summary: "Converting between active and passive constructions correctly, including tense-preserving transformations.",
      difficulty: "Medium",
      subtopics: ["Simple tense conversion", "Modal-verb sentences", "Question-form conversion"],
    },
    {
      name: "Direct & Indirect Speech",
      summary: "Reported speech rules: tense shifts, pronoun changes, and reporting-verb conventions.",
      difficulty: "Medium",
      subtopics: ["Statements", "Questions", "Commands & requests", "Exclamations"],
    },
    {
      name: "Para Jumbles / Sentence Rearrangement",
      summary: "Reordering scrambled sentences into a logically coherent paragraph using linking cues.",
      difficulty: "Medium",
      subtopics: ["Linking words as cues", "Identifying the opening/closing sentence"],
    },
    {
      name: "Spelling & Commonly Confused Words",
      summary: "Correct spellings and words that are frequently confused (e.g. 'stationary' vs 'stationery').",
      difficulty: "Easy",
      subtopics: ["Commonly misspelled words", "Confusable word pairs"],
    },
  ]),
  ...buildTopics(vocab, [
    {
      name: "Synonyms & Antonyms",
      summary: "High-frequency word lists tested directly, plus context-based synonym/antonym questions.",
      difficulty: "Easy",
      hasFullContent: true,
      subtopics: ["High-frequency synonym sets", "High-frequency antonym sets", "Context-based usage"],
      tags: ["high-frequency"],
    },
    {
      name: "One Word Substitution",
      summary: "The single word that replaces a descriptive phrase — a pure recall topic that rewards a good word list.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["Common OWS list", "OWS by theme (law, people, places)"],
      tags: ["high-frequency"],
    },
    {
      name: "Idioms & Phrases",
      summary: "Meaning of common idiomatic expressions as used in exam sentences.",
      difficulty: "Medium",
      subtopics: ["Frequently repeated idioms", "Idiom-in-context questions"],
    },
  ]),
  ...buildTopics(reading, [
    {
      name: "Cloze Test",
      summary: "Filling multiple blanks in a passage so the whole paragraph reads coherently.",
      difficulty: "Medium",
      subtopics: ["Vocabulary-based cloze", "Grammar-based cloze"],
    },
    {
      name: "Reading Comprehension",
      summary: "Answering direct, inferential and vocabulary-in-context questions from an unseen passage.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["Direct/factual questions", "Inferential questions", "Vocabulary-in-context", "Tone & main idea"],
      tags: ["high-frequency"],
    },
  ]),
];
