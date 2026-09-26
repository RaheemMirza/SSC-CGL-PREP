// =========================================================================
// Procedural Reasoning generators. Series/coding/blood-relations/direction
// sense are all "closed logical systems" — the correct answer is derived
// from a rule the generator itself applies, so correctness never depends
// on a fact that could be wrong (unlike, say, classification/odd-one-out,
// which needs real-world category judgement and is deliberately NOT
// proceduralised here — that stays hand-curated).
// =========================================================================

import type { DifficultyLevel, Question } from "@/types";
import { reasoningTopics } from "../../data/syllabus/reasoning";
import { findTopic } from "../../data/questions/builders";
import { randomInt, randomChoice, round, makeGeneratedId, makeNumericOptions, makeChoiceOptions, shuffleArray } from "../rng";

function baseQuestion(topicSlug: string, difficulty: DifficultyLevel, expectedTimeSeconds: number, tags: string[] = []): Omit<Question, "question" | "options" | "answerIndex" | "explanation"> {
  const topic = findTopic(reasoningTopics, topicSlug);
  return {
    id: makeGeneratedId(topicSlug),
    subjectId: topic.subjectId,
    chapterId: topic.chapterId,
    topicId: topic.id,
    difficulty,
    type: "practice",
    category: "MCQ",
    tier: "Tier 1",
    sourceVerified: false,
    expectedTimeSeconds,
    tags: [...tags, "procedural"],
  };
}

// -------------------------------------------------------------------------
// Number / Alphabet Series
// -------------------------------------------------------------------------

export function generateSeriesQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("series-number-alphabet-mixed", difficulty, difficulty === "Easy" ? 35 : difficulty === "Medium" ? 50 : 70);

  if (roll < 0.3) {
    const d = randomChoice(difficulty === "Easy" ? [2, 3, 4, 5] : difficulty === "Medium" ? [6, 7, 8, 9, -3, -4, -5] : [11, 13, -7, -9, 15]);
    const s = randomInt(2, 45);
    const terms = [0, 1, 2, 3, 4].map((i) => s + i * d);
    const next = s + 5 * d;
    const { options, answerIndex } = makeNumericOptions(next, { forcedTraps: [next + d, terms[4] + Math.abs(d) - 1], spreadPercent: 25, minDelta: Math.max(1, Math.abs(d) - 1), allowNegative: true });
    return {
      ...meta,
      question: `Find the next number in the series: ${terms.join(", ")}, ?`,
      options,
      answerIndex,
      explanation: `Each term ${d >= 0 ? "increases" : "decreases"} by ${Math.abs(d)} compared to the previous term. Next term = ${terms[4]} ${d >= 0 ? "+" : "−"} ${Math.abs(d)} = ${next}.`,
    };
  }

  if (roll < 0.55) {
    let d = randomChoice(difficulty === "Easy" ? [1, 2, 3] : difficulty === "Medium" ? [2, 3, 4] : [3, 4, 5]);
    let maxStart = 26 - 5 * d;
    while (maxStart < 1) {
      d -= 1;
      maxStart = 26 - 5 * d;
    }
    const s = randomInt(1, maxStart);
    const positions = [0, 1, 2, 3, 4].map((i) => s + i * d);
    const letters = positions.map((p) => String.fromCharCode(64 + p));
    const nextPos = s + 5 * d;
    const nextLetter = String.fromCharCode(64 + nextPos);
    // Pick distractor *positions* (not letters) with a retry loop so they
    // can never collide with the correct position or each other even near
    // the A/Z boundary, then convert to letters last.
    const usedPositions = new Set<number>([nextPos]);
    const distractorPositions: number[] = [];
    let posGuard = 0;
    while (distractorPositions.length < 3 && posGuard < 100) {
      posGuard += 1;
      const offset = randomInt(1, 9) * (Math.random() < 0.5 ? -1 : 1);
      const cand = Math.max(1, Math.min(26, nextPos + offset));
      if (usedPositions.has(cand)) continue;
      usedPositions.add(cand);
      distractorPositions.push(cand);
    }
    const wrongPool = distractorPositions.map((p) => String.fromCharCode(64 + p));
    const { options, answerIndex } = makeChoiceOptions(nextLetter, wrongPool);
    return {
      ...meta,
      question: `Find the next letter in the series: ${letters.join(", ")}, ?`,
      options,
      answerIndex,
      explanation: `Each letter moves ${d} place(s) forward in the alphabet from the previous one (${letters.join(" → ")} → ${nextLetter}).`,
    };
  }

  if (roll < 0.8) {
    const r = randomChoice([2, 3]);
    const s = r === 2 ? randomInt(1, 6) : randomInt(1, 3);
    const terms = [0, 1, 2, 3].map((i) => s * Math.pow(r, i));
    const next = s * Math.pow(r, 4);
    const arithmeticTrap = terms[3] + (terms[3] - terms[2]);
    const { options, answerIndex } = makeNumericOptions(next, { forcedTraps: [arithmeticTrap], spreadPercent: 20 });
    return {
      ...meta,
      question: `Find the next number in the series: ${terms.join(", ")}, ?`,
      options,
      answerIndex,
      explanation: `Each term is multiplied by ${r} to get the next term (a geometric progression). Next term = ${terms[3]} × ${r} = ${next}.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  const a0 = randomInt(1, 10);
  const d0 = randomInt(2, 6);
  const inc = randomInt(1, 3);
  const terms: number[] = [a0];
  let diff = d0;
  for (let i = 1; i < 5; i += 1) {
    terms.push(terms[i - 1] + diff);
    diff += inc;
  }
  const next = terms[4] + diff;
  const { options, answerIndex } = makeNumericOptions(next, { forcedTraps: [terms[4] + d0], spreadPercent: 20 });
  const diffsShown = [d0, d0 + inc, d0 + 2 * inc, d0 + 3 * inc];
  return {
    ...meta,
    question: `Find the next number in the series: ${terms.join(", ")}, ?`,
    options,
    answerIndex,
    explanation: `Look at the differences between consecutive terms: ${diffsShown.join(", ")} — each one is ${inc} more than the last. The next difference is ${diff}, so the next term = ${terms[4]} + ${diff} = ${next}.`,
    tags: [...(meta.tags ?? []), "formula-shortcut"],
  };
}

// -------------------------------------------------------------------------
// Coding-Decoding
// -------------------------------------------------------------------------

const WORD_POOL = [
  "LEADER", "GARDEN", "WINDOW", "MARKET", "FRIEND", "TEACHER", "COMPUTER", "MOUNTAIN",
  "STATION", "FLOWER", "BUILDING", "JOURNEY", "KITCHEN", "PICTURE", "STUDENT", "CHAIRS",
  "WINTER", "SUMMER", "PENCIL", "NATURE", "CRICKET", "HOSPITAL",
];

function shiftLetter(ch: string, k: number): string {
  const base = ch.charCodeAt(0) - 65;
  const shifted = ((base + k) % 26 + 26) % 26;
  return String.fromCharCode(shifted + 65);
}
function shiftWord(word: string, k: number): string {
  return word.split("").map((c) => shiftLetter(c, k)).join("");
}
function mirrorWord(word: string): string {
  return word.split("").map((c) => String.fromCharCode(90 - (c.charCodeAt(0) - 65))).join("");
}

export function generateCodingDecodingQuestion(difficulty: DifficultyLevel): Question {
  const meta = baseQuestion("coding-decoding", difficulty, difficulty === "Easy" ? 35 : difficulty === "Medium" ? 50 : 70);
  const useMirror = difficulty === "Hard" ? Math.random() < 0.4 : Math.random() < 0.15;
  const [w1, w2] = shuffleArray(WORD_POOL).slice(0, 2);
  const k = randomInt(difficulty === "Easy" ? 1 : 2, difficulty === "Easy" ? 4 : difficulty === "Medium" ? 8 : 15);
  const encode = useMirror ? mirrorWord : (w: string) => shiftWord(w, k);
  const enc1 = encode(w1);
  const enc2 = encode(w2);
  const candidates = [shiftWord(w2, k + 1), shiftWord(w2, k - 1), shiftWord(w2, k + 2), shiftWord(w2, 26 - k), mirrorWord(w2), w2.split("").reverse().join("")];
  const wrongPool = candidates.filter((c) => c !== enc2);
  const { options, answerIndex } = makeChoiceOptions(enc2, wrongPool);
  const rule = useMirror
    ? "each letter is replaced by its mirror-image letter in the alphabet (A↔Z, B↔Y, and so on)"
    : `each letter is shifted forward by ${k} position(s) in the alphabet (wrapping from Z back to A)`;
  const decodeDirection = Math.random() < 0.5;
  if (decodeDirection) {
    return {
      ...meta,
      question: `In a certain code, ${w1} is written as ${enc1}. How is ${w2} written in that same code?`,
      options,
      answerIndex,
      explanation: `The coding rule here is: ${rule}. Applying the same rule to ${w2} gives ${enc2}.`,
    };
  }
  // Reversed phrasing: give the code, ask for the original word. The wrong
  // options here must be *other real words* from the pool, not decoded
  // gibberish — otherwise the one option that looks like a real English
  // word gives the answer away without needing the coding rule at all.
  const decoyWords = shuffleArray(WORD_POOL.filter((w) => w !== w1 && w !== w2)).slice(0, 3);
  const { options: opts2, answerIndex: ai2 } = makeChoiceOptions(w2, decoyWords);
  return {
    ...meta,
    question: `In a certain code, ${w1} is written as ${enc1}. If ${enc2} is written in the same code, what is the original word?`,
    options: opts2,
    answerIndex: ai2,
    explanation: `The coding rule here is: ${rule}. Reversing that rule on ${enc2} recovers the original word ${w2}.`,
  };
}

// -------------------------------------------------------------------------
// Blood Relations
// -------------------------------------------------------------------------

const MALE_NAMES = ["Rohan", "Aman", "Vikram", "Suresh", "Ramesh", "Ajay", "Vijay", "Karan", "Manoj", "Deepak", "Anil", "Sanjay", "Rahul", "Naveen"];
const FEMALE_NAMES = ["Priya", "Neha", "Anita", "Sunita", "Kavita", "Pooja", "Meena", "Rekha", "Geeta", "Sonia", "Radha", "Nisha", "Divya", "Seema"];

type Gender = "M" | "F";
function opposite(g: Gender): Gender {
  return g === "M" ? "F" : "M";
}
function pickName(used: Set<string>, gender: Gender): string {
  const pool = gender === "M" ? MALE_NAMES : FEMALE_NAMES;
  let name = randomChoice(pool);
  let guard = 0;
  while (used.has(name) && guard < 30) {
    name = randomChoice(pool);
    guard += 1;
  }
  used.add(name);
  return name;
}
function randomGender(): Gender {
  return Math.random() < 0.5 ? "M" : "F";
}

interface RelationTemplate {
  question: string;
  answer: string;
  wrongPool: string[];
}

function tplDirect(): RelationTemplate {
  const used = new Set<string>();
  const parentGender = randomGender();
  const childGender = randomGender();
  const parentName = pickName(used, parentGender);
  const childName = pickName(used, childGender);
  const parentLabel = parentGender === "M" ? "father" : "mother";
  const answer = childGender === "M" ? "Son" : "Daughter";
  return {
    question: `${parentName} is the ${parentLabel} of ${childName}. How is ${childName} related to ${parentName}?`,
    answer,
    wrongPool: ["Son", "Daughter", "Brother", "Sister", "Nephew", "Niece"].filter((w) => w !== answer),
  };
}

function tplGrandparent(): RelationTemplate {
  const used = new Set<string>();
  const g1 = randomGender();
  const midGender = randomGender();
  const X = pickName(used, g1);
  const Y = pickName(used, midGender);
  const Z = pickName(used, randomGender());
  const label1 = g1 === "M" ? "father" : "mother";
  const label2 = midGender === "M" ? "father" : "mother";
  const answer = g1 === "M" ? "Grandfather" : "Grandmother";
  return {
    question: `${X} is the ${label1} of ${Y}. ${Y} is the ${label2} of ${Z}. How is ${X} related to ${Z}?`,
    answer,
    wrongPool: ["Grandfather", "Grandmother", "Father", "Mother", "Uncle", "Aunt"].filter((w) => w !== answer),
  };
}

function tplUncleAunt(): RelationTemplate {
  const used = new Set<string>();
  const xGender = randomGender();
  const yGender = randomGender();
  const zGender = randomGender();
  const X = pickName(used, xGender);
  const Y = pickName(used, yGender);
  const Z = pickName(used, zGender);
  const siblingLabel = xGender === "M" ? "brother" : "sister";
  const parentLabel = yGender === "M" ? "father" : "mother";
  const side = yGender === "M" ? "Paternal" : "Maternal";
  const role = xGender === "M" ? "uncle" : "aunt";
  const answer = `${side} ${role}`;
  return {
    question: `${X} is the ${siblingLabel} of ${Y}. ${Y} is the ${parentLabel} of ${Z}. How is ${X} related to ${Z}?`,
    answer,
    wrongPool: ["Paternal uncle", "Maternal uncle", "Paternal aunt", "Maternal aunt"].filter((w) => w !== answer),
  };
}

function tplNephewNiece(): RelationTemplate {
  const used = new Set<string>();
  const xGender = randomGender();
  const yGender = randomGender();
  const zGender = randomGender();
  const X = pickName(used, xGender);
  const Y = pickName(used, yGender);
  const Z = pickName(used, zGender);
  const siblingLabel = xGender === "M" ? "brother" : "sister";
  const parentLabel = yGender === "M" ? "father" : "mother";
  const answer = zGender === "M" ? "Nephew" : "Niece";
  return {
    question: `${X} is the ${siblingLabel} of ${Y}. ${Y} is the ${parentLabel} of ${Z}. How is ${Z} related to ${X}?`,
    answer,
    wrongPool: ["Nephew", "Niece", "Son", "Daughter", "Cousin"].filter((w) => w !== answer),
  };
}

function tplParentInLaw(): RelationTemplate {
  const used = new Set<string>();
  const xGender = randomGender();
  const yGender = opposite(xGender);
  const zGender = randomGender();
  const X = pickName(used, xGender);
  const Y = pickName(used, yGender);
  const Z = pickName(used, zGender);
  const spouseLabel = xGender === "M" ? "husband" : "wife";
  const parentLabel = zGender === "M" ? "father" : "mother";
  const answer = zGender === "M" ? "Father-in-law" : "Mother-in-law";
  return {
    question: `${X} is the ${spouseLabel} of ${Y}. ${Z} is the ${parentLabel} of ${Y}. How is ${Z} related to ${X}?`,
    answer,
    wrongPool: ["Father-in-law", "Mother-in-law", "Father", "Mother", "Uncle", "Aunt"].filter((w) => w !== answer),
  };
}

function tplSiblingInLaw(): RelationTemplate {
  const used = new Set<string>();
  const xGender = randomGender();
  const yGender = opposite(xGender);
  const zGender = randomGender();
  const X = pickName(used, xGender);
  const Y = pickName(used, yGender);
  const Z = pickName(used, zGender);
  const spouseLabel = xGender === "M" ? "husband" : "wife";
  const siblingLabel = zGender === "M" ? "brother" : "sister";
  const answer = zGender === "M" ? "Brother-in-law" : "Sister-in-law";
  return {
    question: `${X} is the ${spouseLabel} of ${Y}. ${Z} is the ${siblingLabel} of ${Y}. How is ${Z} related to ${X}?`,
    answer,
    wrongPool: ["Brother-in-law", "Sister-in-law", "Brother", "Sister", "Cousin"].filter((w) => w !== answer),
  };
}

function tplCousin(): RelationTemplate {
  const used = new Set<string>();
  const pGender = randomGender();
  const qGender = randomGender();
  const zGender = randomGender();
  const X = pickName(used, randomGender());
  const P = pickName(used, pGender);
  const Q = pickName(used, qGender);
  const Z = pickName(used, zGender);
  const parentLabel = pGender === "M" ? "father" : "mother";
  const siblingLabel = qGender === "M" ? "brother" : "sister";
  const childLabel = zGender === "M" ? "son" : "daughter";
  return {
    question: `${P} is the ${parentLabel} of ${X}. ${Q} is the ${siblingLabel} of ${P}. ${Z} is the ${childLabel} of ${Q}. How is ${Z} related to ${X}?`,
    answer: "Cousin",
    wrongPool: ["Nephew", "Niece", "Brother", "Sister"],
  };
}

export function generateBloodRelationsQuestion(difficulty: DifficultyLevel): Question {
  const pool: (() => RelationTemplate)[] =
    difficulty === "Easy"
      ? [tplDirect, tplGrandparent]
      : difficulty === "Medium"
        ? [tplUncleAunt, tplNephewNiece, tplGrandparent]
        : [tplParentInLaw, tplSiblingInLaw, tplCousin];
  const tpl = randomChoice(pool)();
  const { options, answerIndex } = makeChoiceOptions(tpl.answer, tpl.wrongPool);
  const meta = baseQuestion("blood-relations", difficulty, difficulty === "Easy" ? 40 : difficulty === "Medium" ? 60 : 85);
  return {
    ...meta,
    question: tpl.question,
    options,
    answerIndex,
    explanation: `Work through the chain one relation at a time from the last-named person back to the first. Here, ${tpl.answer} is the relation that fits every clue given.`,
  };
}

// -------------------------------------------------------------------------
// Direction Sense
// -------------------------------------------------------------------------

const DIR_NAMES = ["North", "East", "South", "West"];
const PYTHAG_TRIPLES: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29], [12, 16, 20]];

function simulateWalk(startIndex: number, turnDir: "right" | "left", legs: number[]): { x: number; y: number } {
  const vecs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let idx = startIndex;
  let x = 0;
  let y = 0;
  legs.forEach((len, i) => {
    const [vx, vy] = vecs[idx];
    x += vx * len;
    y += vy * len;
    if (i < legs.length - 1) idx = turnDir === "right" ? (idx + 1) % 4 : (idx + 3) % 4;
  });
  return { x, y };
}

function buildLegs(legCount: number, p: number, q: number): number[] {
  if (legCount === 2) return [p, q];
  if (legCount === 3) {
    const c = randomInt(2, 8);
    return [c + p, q, c];
  }
  const c = randomInt(2, 8);
  const d = randomInt(2, 8);
  return [c + p, d + q, c, d];
}

function classifyDirection(x: number, y: number): string {
  const ns = y > 0.001 ? "North" : y < -0.001 ? "South" : "";
  const ew = x > 0.001 ? "East" : x < -0.001 ? "West" : "";
  if (ns && ew) return `${ns}-${ew}`;
  if (ns) return ns;
  if (ew) return ew;
  return "the same point";
}

export function generateDirectionSenseQuestion(difficulty: DifficultyLevel): Question {
  const legCount = difficulty === "Easy" ? 2 : difficulty === "Medium" ? 3 : 4;
  const [p, q, hyp] = randomChoice(PYTHAG_TRIPLES);
  const startIndex = randomInt(0, 3);
  const turnDir: "right" | "left" = Math.random() < 0.5 ? "right" : "left";
  const legs = buildLegs(legCount, p, q);
  const { x, y } = simulateWalk(startIndex, turnDir, legs);
  const distance = round(Math.sqrt(x * x + y * y), 2);
  const direction = classifyDirection(x, y);

  let idxTrack = startIndex;
  const parts: string[] = [`starts from point O and walks ${legs[0]} km towards the ${DIR_NAMES[startIndex]}`];
  for (let i = 1; i < legs.length; i += 1) {
    idxTrack = turnDir === "right" ? (idxTrack + 1) % 4 : (idxTrack + 3) % 4;
    parts.push(`then turns ${turnDir} and walks ${legs[i]} km`);
  }
  const narrative = parts.join(", ");
  const meta = baseQuestion("direction-sense", difficulty, difficulty === "Easy" ? 35 : difficulty === "Medium" ? 55 : 75);
  const askDistance = Math.random() < 0.55;

  if (askDistance) {
    const { options, answerIndex } = makeNumericOptions(distance, { suffix: " km", spreadPercent: 20, forcedTraps: [legs.reduce((a, b) => a + b, 0)] });
    return {
      ...meta,
      question: `A person ${narrative}. Find the shortest distance between the starting point and his current position.`,
      options,
      answerIndex,
      explanation: `Plotting the path on a grid, the net displacement works out to ${Math.round(Math.abs(x))} km along one axis and ${Math.round(Math.abs(y))} km along the other. By the Pythagorean theorem, the straight-line distance = √(${Math.round(Math.abs(x))}² + ${Math.round(Math.abs(y))}²) = ${distance} km. (The total distance walked, ${legs.reduce((a, b) => a + b, 0)} km, is a common — but wrong — trap answer here.)`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  const wrongPool = ["North-East", "North-West", "South-East", "South-West", "North", "South", "East", "West"].filter((w) => w !== direction);
  const { options, answerIndex } = makeChoiceOptions(direction, wrongPool);
  return {
    ...meta,
    question: `A person ${narrative}. In which direction is he now from his starting point?`,
    options,
    answerIndex,
    explanation: `Tracking each turn on a compass grid from the starting point, the person's final position lies to the ${direction} of point O.`,
  };
}
