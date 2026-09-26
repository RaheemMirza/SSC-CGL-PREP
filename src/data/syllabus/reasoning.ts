import type { Chapter, Topic } from "@/types";
import { buildChapter, buildTopics } from "./builders";

const SUBJECT = "reasoning" as const;

export const reasoningChapters: Chapter[] = [
  buildChapter(SUBJECT, "Verbal Reasoning", 1),
  buildChapter(SUBJECT, "Analytical Reasoning", 2),
  buildChapter(SUBJECT, "Non-Verbal & Figure Reasoning", 3),
  buildChapter(SUBJECT, "Miscellaneous Reasoning", 4),
];

const [verbal, analytical, nonVerbal, misc] = reasoningChapters;

export const reasoningTopics: Topic[] = [
  ...buildTopics(verbal, [
    {
      name: "Analogy",
      summary: "Spotting the relationship between a given pair and applying it to find the matching pair.",
      difficulty: "Easy",
      subtopics: ["Word analogy", "Number analogy", "Letter analogy"],
      tags: ["high-frequency"],
    },
    {
      name: "Classification (Odd One Out)",
      summary: "Finding the item that doesn't share the common property of the rest of the group.",
      difficulty: "Easy",
      subtopics: ["Word classification", "Number classification"],
      tags: ["high-frequency"],
    },
    {
      name: "Series (Number, Alphabet, Mixed)",
      summary: "Detecting the pattern that generates a sequence and extending or completing it.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["Number series", "Alphabet series", "Mixed series", "Series with two operations"],
      tags: ["high-frequency"],
    },
    {
      name: "Coding-Decoding",
      summary: "Reverse-engineering a hidden rule that maps letters/numbers/words to a code, then applying it.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["Letter coding", "Number coding", "Substitution coding", "Matrix coding"],
      tags: ["high-frequency"],
    },
    {
      name: "Blood Relations",
      summary: "Tracing family relationships from statements, including coded blood relations.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["Direct relation statements", "Coded blood relations", "Family-tree puzzles"],
      tags: ["high-frequency"],
    },
    {
      name: "Direction Sense",
      summary: "Tracking movement/turns to determine final direction and shortest distance.",
      difficulty: "Easy",
      subtopics: ["Basic direction problems", "Shadow-based direction", "Distance after multiple turns"],
    },
    {
      name: "Ranking & Order",
      summary: "Determining position from the top/bottom in a line or list, including comparative ranking.",
      difficulty: "Easy",
      subtopics: ["Linear ranking", "Ranking from both ends"],
    },
    {
      name: "Syllogism",
      summary: "Drawing valid conclusions from given statements using Venn-diagram logic.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["Two-statement syllogism", "Three-statement syllogism", "Possibility cases"],
      tags: ["high-frequency"],
    },
    {
      name: "Statement & Conclusion",
      summary: "Deciding which conclusions logically follow from given statements.",
      difficulty: "Medium",
      subtopics: ["Direct conclusions", "Course of action"],
    },
    {
      name: "Statement & Assumption",
      summary: "Identifying implicit assumptions behind a statement.",
      difficulty: "Medium",
      subtopics: ["Implicit assumption identification"],
    },
  ]),
  ...buildTopics(analytical, [
    {
      name: "Mathematical Operations",
      summary: "Decoding symbol-for-operator substitutions and solving the resulting expression.",
      difficulty: "Easy",
      subtopics: ["Symbol substitution", "BODMAS after substitution"],
    },
    {
      name: "Missing Number",
      summary: "Finding the pattern within a matrix/grid/figure to determine the missing value.",
      difficulty: "Medium",
      subtopics: ["Grid-based missing number", "Analogy-based missing number"],
    },
    {
      name: "Matrix-Based Reasoning",
      summary: "Row/column coding puzzles where a value is read off intersecting coordinates.",
      difficulty: "Medium",
      subtopics: ["Row-column coordinate coding"],
    },
    {
      name: "Venn Diagrams",
      summary: "Representing and interpreting overlapping-set relationships visually.",
      difficulty: "Medium",
      subtopics: ["Set relationships", "Counting regions"],
    },
  ]),
  ...buildTopics(nonVerbal, [
    { name: "Figure-Based Series & Analogy", summary: "Applying series/analogy logic to shapes instead of words or numbers.", difficulty: "Medium", subtopics: ["Figure series", "Figure analogy"] },
    { name: "Mirror & Water Image", summary: "Predicting how a figure appears when reflected in a mirror or in water.", difficulty: "Easy", subtopics: ["Mirror image", "Water image"] },
    { name: "Paper Folding & Cutting", summary: "Visualising the result of folds and punches/cuts once the paper is unfolded.", difficulty: "Medium", subtopics: ["Paper folding", "Paper cutting"] },
    { name: "Embedded Figures", summary: "Locating a given simple figure hidden within a complex one.", difficulty: "Easy", subtopics: ["Figure identification"] },
    { name: "Counting Figures", summary: "Systematically counting triangles/lines/shapes in a complex figure without missing or double-counting.", difficulty: "Medium", subtopics: ["Counting triangles", "Counting lines/regions"] },
    { name: "Dice & Cubes", summary: "Determining opposite/adjacent faces from given dice orientations.", difficulty: "Medium", subtopics: ["Standard dice", "Open dice (net)", "Cube cutting into smaller cubes"] },
  ]),
  ...buildTopics(misc, [
    { name: "Calendar", summary: "Working out the day of the week for a given date using the odd-days method.", difficulty: "Medium", subtopics: ["Odd days method", "Leap year rules"] },
    { name: "Clock", summary: "Angle between hands, coincidence/opposite-hand timings, and faulty-clock problems.", difficulty: "Medium", subtopics: ["Angle between hands", "Coincidence of hands", "Faulty clocks"] },
  ]),
];
