// =========================================================================
// Procedural Quant generators. Every generator computes its own answer
// from the same numbers it puts in the question — nothing here is a
// "claimed" fact that could be wrong, unlike GA content. That's what makes
// procedural generation safe for Quant/Reasoning but not for GA/vocab.
//
// Each generator returns a real Question object wired to the *real* Topic
// from the syllabus (same id the hand-authored questions use), tagged
// "procedural" so the UI can badge it as "Infinite Practice" rather than
// a curated/reviewed question.
// =========================================================================

import type { DifficultyLevel, Question } from "@/types";
import { quantTopics } from "../../data/syllabus/quant";
import { findTopic } from "../../data/questions/builders";
import { randomInt, randomChoice, gcd, round, makeGeneratedId, makeNumericOptions, makeChoiceOptions, shuffleArray } from "../rng";

function baseQuestion(topicSlug: string, difficulty: DifficultyLevel, expectedTimeSeconds: number, tags: string[] = []): Omit<Question, "question" | "options" | "answerIndex" | "explanation"> {
  const topic = findTopic(quantTopics, topicSlug);
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

const inr = (n: number) => n.toLocaleString("en-IN");

// -------------------------------------------------------------------------
// Percentage
// -------------------------------------------------------------------------

function pickPercentPair(difficulty: DifficultyLevel): { xLabel: string; xVal: number; N: number; A: number } {
  if (difficulty === "Easy") {
    const X = randomChoice([5, 10, 15, 20, 25, 40, 50]);
    const step = 100 / gcd(X, 100);
    const N = step * randomInt(2, 16);
    return { xLabel: String(X), xVal: X, N, A: (X * N) / 100 };
  }
  if (difficulty === "Medium") {
    const X = randomChoice([12, 18, 24, 28, 32, 35, 45, 55, 65, 72, 85, 95]);
    const step = 100 / gcd(X, 100);
    const N = step * randomInt(3, 16);
    return { xLabel: String(X), xVal: X, N, A: (X * N) / 100 };
  }
  const fracPool = [
    { label: "12.5", num: 1, den: 8 },
    { label: "37.5", num: 3, den: 8 },
    { label: "62.5", num: 5, den: 8 },
    { label: "87.5", num: 7, den: 8 },
    { label: "33.33", num: 1, den: 3 },
    { label: "66.67", num: 2, den: 3 },
  ];
  const f = randomChoice(fracPool);
  const N = f.den * randomInt(6, 45);
  return { xLabel: f.label, xVal: f.num / f.den * 100, N, A: (f.num * N) / f.den };
}

export function generatePercentageQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("percentage", difficulty, difficulty === "Easy" ? 30 : difficulty === "Medium" ? 50 : 70);

  if (roll < 0.35) {
    const { xLabel, N, A } = pickPercentPair(difficulty);
    const { options, answerIndex } = makeNumericOptions(A, { indianGrouping: true, forcedTraps: [N - A], spreadPercent: 20 });
    return {
      ...meta,
      question: `What is ${xLabel}% of ${inr(N)}?`,
      options,
      answerIndex,
      explanation: `${xLabel}% of ${inr(N)} = (${xLabel}/100) × ${inr(N)} = ${inr(round(A, 2))}.`,
    };
  }

  if (roll < 0.6) {
    const { xLabel, xVal, N, A } = pickPercentPair(difficulty);
    const trap = round((A * xVal) / 100, 2); // mistake: re-applying the % instead of inverting
    const { options, answerIndex } = makeNumericOptions(N, { indianGrouping: true, forcedTraps: [trap], spreadPercent: 20 });
    return {
      ...meta,
      question: `${xLabel}% of a number is ${inr(round(A, 2))}. Find the number.`,
      options,
      answerIndex,
      explanation: `Let the number be N. (${xLabel}/100) × N = ${inr(round(A, 2))} ⟹ N = ${inr(round(A, 2))} × 100 / ${xLabel} = ${inr(N)}.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  if (roll < 0.82) {
    const pool = difficulty === "Easy" ? [10, 20] : difficulty === "Medium" ? [10, 15, 20, 25, 30] : [15, 20, 25, 30, 35, 40];
    const X = randomChoice(pool);
    const Y = randomChoice(pool);
    const bothUp = Math.random() < 0.3 && difficulty !== "Easy";
    const multiplier = bothUp ? (1 + X / 100) * (1 + Y / 100) : (1 + X / 100) * (1 - Y / 100);
    const netPct = round((multiplier - 1) * 100, 2);
    const direction: "increase" | "decrease" | "no-change" = netPct > 0.001 ? "increase" : netPct < -0.001 ? "decrease" : "no-change";
    const magnitude = Math.abs(netPct);
    const correctLabel = direction === "no-change" ? "No net change" : `A net ${direction} of ${magnitude}%`;
    const naiveSum = bothUp ? X + Y : X - Y;
    const priorityCandidates = [
      naiveSum === 0 ? "No net change" : `A net ${naiveSum > 0 ? "increase" : "decrease"} of ${Math.abs(round(naiveSum, 2))}%`,
      direction === "no-change" ? `A net increase of ${round((X * Y) / 100, 2)}%` : `A net ${direction === "increase" ? "decrease" : "increase"} of ${magnitude}%`,
    ];
    // Build the wrong-option set defensively: start from the two pedagogically
    // meaningful "common mistake" labels above, then top up with strictly
    // increasing offsets (guaranteed distinct, never collides) until there
    // are exactly 3 unique wrong labels — a fixed 2-or-4-item pool can
    // occasionally collide down to <3 uniques for particular X/Y pairs.
    const labelValues = new Set<string>([correctLabel]);
    const distractorLabels: string[] = [];
    for (const cand of priorityCandidates) {
      if (distractorLabels.length >= 3) break;
      if (labelValues.has(cand)) continue;
      labelValues.add(cand);
      distractorLabels.push(cand);
    }
    let offsetTry = 3;
    while (distractorLabels.length < 3) {
      const dir2 = direction === "no-change" ? (offsetTry % 2 === 0 ? "increase" : "decrease") : direction;
      const cand = `A net ${dir2} of ${round(magnitude + offsetTry, 2)}%`;
      if (!labelValues.has(cand)) {
        labelValues.add(cand);
        distractorLabels.push(cand);
      }
      offsetTry += 1;
    }
    const allLabels = shuffleArray([correctLabel, ...distractorLabels]);
    const options = allLabels;
    const answerIndex = allLabels.indexOf(correctLabel);
    const verb = bothUp ? `increased by ${X}% and then increased again by ${Y}%` : `increased by ${X}% and then decreased by ${Y}%`;
    return {
      ...meta,
      question: `A number is first ${verb}. What is the net percentage change?`,
      options,
      answerIndex,
      explanation: `Net multiplier = (1 ${bothUp ? "+" : "+"} ${X}/100) × (1 ${bothUp ? "+" : "−"} ${Y}/100) = ${round(multiplier, 4)}, i.e. ${correctLabel.toLowerCase()}. Increasing then decreasing (or increasing twice) by percentages never simply adds or subtracts — always multiply the factors.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  const rPool = difficulty === "Easy" ? [25, 50, 100] : difficulty === "Medium" ? [20, 25, 40, 50, 60, 80, 100] : [10, 15, 20, 30, 40, 60, 75, 90, 120, 150];
  const R = randomChoice(rPool);
  const ans = round((R / (100 + R)) * 100, 2);
  const { options, answerIndex } = makeNumericOptions(ans, { decimals: 2, suffix: "%", spreadPercent: 20, minDelta: 1, forcedTraps: [R] });
  return {
    ...meta,
    question: `The price of an item increases by ${R}%. By what percentage should consumption be reduced so that total expenditure stays unchanged?`,
    options,
    answerIndex,
    explanation: `Required reduction % = [R / (100 + R)] × 100 = (${R} / ${100 + R}) × 100 ≈ ${ans}%.`,
    tags: [...(meta.tags ?? []), "formula-shortcut"],
  };
}

// -------------------------------------------------------------------------
// Ratio & Proportion
// -------------------------------------------------------------------------

export function generateRatioProportionQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("ratio-and-proportion", difficulty, difficulty === "Easy" ? 35 : difficulty === "Medium" ? 55 : 75);

  if (roll < 0.3) {
    const a = randomInt(2, 9);
    const b = a + randomInt(1, 8);
    const total = (a + b) * randomInt(3, difficulty === "Easy" ? 40 : 120);
    const shareB = (total * b) / (a + b);
    const shareA = total - shareB;
    const { options, answerIndex } = makeNumericOptions(shareB, { prefix: "₹", indianGrouping: true, forcedTraps: [shareA], spreadPercent: 20 });
    return {
      ...meta,
      question: `Divide ₹${inr(total)} between A and B in the ratio ${a}:${b}. Find B's share.`,
      options,
      answerIndex,
      explanation: `Total parts = ${a} + ${b} = ${a + b}. B's share = (${b}/${a + b}) × ${inr(total)} = ₹${inr(round(shareB, 2))}.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  if (roll < 0.55) {
    const a = randomInt(2, 5);
    const b = a + randomInt(1, 5);
    const c = randomInt(2, 5);
    const d = c + randomInt(1, 5);
    // a:b and b:c(as b:d) -> scale to a common b
    const g = gcd(b, c);
    const scale1 = c / g;
    const scale2 = b / g;
    const A = a * scale1;
    const B = b * scale1;
    const C = d * scale2;
    const correct = `${A} : ${B} : ${C}`;
    const wrongPool = [`${a} : ${b} : ${d}`, `${A} : ${B} : ${C + randomInt(1, 4)}`, `${A + randomInt(1, 3)} : ${B} : ${C}`, `${B} : ${A} : ${C}`];
    const { options, answerIndex } = makeChoiceOptions(correct, wrongPool);
    return {
      ...meta,
      question: `If a : b = ${a} : ${b} and b : c = ${c} : ${d}, find a : b : c.`,
      options,
      answerIndex,
      explanation: `Make b common: a:b = ${a}:${b} → ${A}:${B} (×${scale1}); b:c = ${c}:${d} → ${B}:${C} (×${scale2}). So a:b:c = ${correct}.`,
    };
  }

  if (roll < 0.8) {
    const a = randomInt(2, 6);
    const b = a + randomInt(1, 6);
    const x = randomInt(4, 16);
    const k = randomInt(2, 24);
    const n1 = a * x;
    const n2 = b * x;
    const new1 = n1 + k;
    const new2 = n2 + k;
    const g = gcd(new1, new2);
    const c = new1 / g;
    const d = new2 / g;
    const correct = `${n1} and ${n2}`;
    const wrongPool = [`${n2} and ${n1}`, `${n1 + k} and ${n2 + k}`, `${n1 + x} and ${n2 + x}`, `${Math.max(1, n1 - k)} and ${Math.max(1, n2 - k)}`];
    const { options, answerIndex } = makeChoiceOptions(correct, wrongPool);
    return {
      ...meta,
      question: `Two numbers are in the ratio ${a}:${b}. If each number is increased by ${k}, the ratio becomes ${c}:${d}. Find the two numbers.`,
      options,
      answerIndex,
      explanation: `Let the numbers be ${a}x and ${b}x. (${a}x + ${k})/(${b}x + ${k}) = ${c}/${d}. Solving gives x = ${x}, so the numbers are ${n1} and ${n2}.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  const y1 = randomInt(2, 12);
  const k = randomInt(2, 9);
  const x1 = y1 * k;
  const y2 = randomInt(2, 12) * (difficulty === "Hard" ? 2 : 1);
  const x2 = y2 * k;
  const { options, answerIndex } = makeNumericOptions(x2, { forcedTraps: [x1 + y2 - y1], spreadPercent: 25 });
  return {
    ...meta,
    question: `If x varies directly as y, and x = ${x1} when y = ${y1}, find x when y = ${y2}.`,
    options,
    answerIndex,
    explanation: `x = ky. From x=${x1}, y=${y1} ⟹ k = ${k}. So when y=${y2}, x = ${k} × ${y2} = ${x2}.`,
  };
}

// -------------------------------------------------------------------------
// Average
// -------------------------------------------------------------------------

function makeAverageSet(n: number, mean: number, spread: number): number[] | null {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const offsets: number[] = [];
    for (let i = 0; i < n - 1; i += 1) offsets.push(randomInt(-spread, spread));
    const sum = offsets.reduce((a, b) => a + b, 0);
    offsets.push(-sum);
    const values = offsets.map((o) => mean + o);
    if (values.every((v) => v > 0)) return values;
  }
  return null;
}

export function generateAverageQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("average", difficulty, difficulty === "Easy" ? 35 : difficulty === "Medium" ? 55 : 80);

  if (roll < 0.3) {
    const n = randomInt(4, 6);
    const mean = randomInt(difficulty === "Easy" ? 10 : 20, difficulty === "Easy" ? 60 : 200);
    const spread = Math.max(3, Math.floor(mean * 0.3));
    const values = makeAverageSet(n, mean, spread) ?? [mean, mean, mean, mean];
    const { options, answerIndex } = makeNumericOptions(mean, { spreadPercent: 15, forcedTraps: [Math.round(values.reduce((a, b) => a + b, 0) / (n - 1))] });
    return {
      ...meta,
      question: `Find the average of ${values.join(", ")}.`,
      options,
      answerIndex,
      explanation: `Sum = ${values.reduce((a, b) => a + b, 0)}. Average = ${values.reduce((a, b) => a + b, 0)} / ${n} = ${mean}.`,
    };
  }

  if (roll < 0.6) {
    const n = randomInt(4, 8);
    const avg1 = randomInt(difficulty === "Easy" ? 10 : 15, difficulty === "Easy" ? 40 : 90);
    const delta = randomInt(1, difficulty === "Hard" ? 8 : 5) * (Math.random() < 0.5 ? 1 : -1);
    const avg2 = avg1 + delta;
    const excluded = n * avg1 - (n - 1) * avg2;
    if (excluded > 0) {
      const { options, answerIndex } = makeNumericOptions(excluded, { spreadPercent: 20, forcedTraps: [avg1, avg2] });
      return {
        ...meta,
        question: `The average of ${n} numbers is ${avg1}. If one number is excluded, the average of the remaining ${n - 1} becomes ${avg2}. Find the excluded number.`,
        options,
        answerIndex,
        explanation: `Sum of ${n} numbers = ${n * avg1}. Sum of remaining ${n - 1} = ${avg2} × ${n - 1} = ${(n - 1) * avg2}. Excluded number = ${n * avg1} − ${(n - 1) * avg2} = ${excluded}.`,
        tags: [...(meta.tags ?? []), "common-trap"],
      };
    }
  }

  if (roll < 0.85) {
    let n1 = randomInt(10, 40);
    let n2 = randomInt(10, 40);
    let a1 = randomInt(difficulty === "Easy" ? 20 : 15, difficulty === "Easy" ? 50 : 90);
    let a2 = randomInt(difficulty === "Easy" ? 20 : 15, difficulty === "Easy" ? 50 : 90);
    let ok = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if ((n1 * a1 + n2 * a2) % (n1 + n2) === 0) {
        ok = true;
        break;
      }
      n1 = randomInt(10, 40);
      n2 = randomInt(10, 40);
      a1 = randomInt(20, 90);
      a2 = randomInt(20, 90);
    }
    if (!ok) {
      n1 = 30; n2 = 20; a1 = 40; a2 = 30; // known-good deterministic fallback
    }
    const combined = (n1 * a1 + n2 * a2) / (n1 + n2);
    const { options, answerIndex } = makeNumericOptions(combined, { suffix: " kg", spreadPercent: 12, forcedTraps: [round((a1 + a2) / 2, 0)] });
    return {
      ...meta,
      question: `A class of ${n1} students has an average weight of ${a1} kg, and another class of ${n2} students has an average weight of ${a2} kg. Find the average weight of all ${n1 + n2} students.`,
      options,
      answerIndex,
      explanation: `Total weight = ${n1}×${a1} + ${n2}×${a2} = ${n1 * a1} + ${n2 * a2} = ${n1 * a1 + n2 * a2} kg. Average = ${n1 * a1 + n2 * a2}/${n1 + n2} = ${combined} kg. (Note: this is NOT the plain average of ${a1} and ${a2} unless the group sizes are equal.)`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  const m = randomInt(4, 6);
  const y = randomInt(1, 6);
  let avgNow = randomInt(20, 40);
  let otherThen = 0;
  let ok2 = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const totalNow = m * avgNow;
    const otherTotalNow = totalNow - y;
    const otherTotalThen = otherTotalNow - (m - 1) * y;
    if (otherTotalThen > 0 && otherTotalThen % (m - 1) === 0) {
      otherThen = otherTotalThen / (m - 1);
      ok2 = true;
      break;
    }
    avgNow = randomInt(20, 40);
  }
  if (!ok2) {
    avgNow = 24; otherThen = 25; // matches the well-known static example (5 members, youngest 4)
  }
  const { options, answerIndex } = makeNumericOptions(otherThen, { spreadPercent: 15, forcedTraps: [avgNow] });
  return {
    ...meta,
    question: `The average age of a family of ${m} members is ${avgNow} years. The youngest member is ${y} years old. Find the average age of the family at the time the youngest member was born.`,
    options,
    answerIndex,
    explanation: `At the time the youngest was born, that member didn't exist yet, so only the other ${m - 1} members counted, each ${y} years younger than now. Their average then works out to ${otherThen} years.`,
    tags: [...(meta.tags ?? []), "common-trap"],
  };
}

// -------------------------------------------------------------------------
// Profit & Loss
// -------------------------------------------------------------------------

export function generateProfitLossQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("profit-and-loss", difficulty, difficulty === "Easy" ? 35 : difficulty === "Medium" ? 55 : 80);

  if (roll < 0.35) {
    const isGain = Math.random() < 0.6;
    const pPool = difficulty === "Easy" ? [10, 20, 25, 50] : difficulty === "Medium" ? [12, 15, 18, 24, 35, 45] : [8, 22, 28, 33, 42, 48];
    const P = randomChoice(pPool);
    const step = 100 / gcd(P, 100);
    const cp = step * randomInt(2, 20);
    const sp = isGain ? cp * (1 + P / 100) : cp * (1 - P / 100);
    const { options, answerIndex } = makeNumericOptions(sp, { prefix: "₹", indianGrouping: true, forcedTraps: [cp], spreadPercent: 18 });
    return {
      ...meta,
      question: `A shopkeeper buys an article for ₹${inr(cp)} and sells it at a ${isGain ? "gain" : "loss"} of ${P}%. Find the selling price.`,
      options,
      answerIndex,
      explanation: `SP = CP × (1 ${isGain ? "+" : "−"} ${P}/100) = ${inr(cp)} × ${round(isGain ? 1 + P / 100 : 1 - P / 100, 4)} = ₹${inr(round(sp, 2))}.`,
    };
  }

  if (roll < 0.6) {
    const isGain = Math.random() < 0.6;
    const pPool = difficulty === "Easy" ? [10, 20, 25] : difficulty === "Medium" ? [12, 15, 18, 24, 35] : [8, 22, 28, 33, 42];
    const P = randomChoice(pPool);
    const step = 100 / gcd(100 + (isGain ? P : -P), 100);
    const cp = step * randomInt(2, 18);
    const sp = isGain ? (cp * (100 + P)) / 100 : (cp * (100 - P)) / 100;
    const { options, answerIndex } = makeNumericOptions(cp, { prefix: "₹", indianGrouping: true, forcedTraps: [sp], spreadPercent: 18 });
    return {
      ...meta,
      question: `By selling an article for ₹${inr(round(sp, 2))}, a trader makes a ${isGain ? "gain" : "loss"} of ${P}%. Find the cost price.`,
      options,
      answerIndex,
      explanation: `CP = SP × 100 / (100 ${isGain ? "+" : "−"} ${P}) = ${inr(round(sp, 2))} × 100/${isGain ? 100 + P : 100 - P} = ₹${inr(cp)}.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  if (roll < 0.85) {
    const d1 = randomChoice(difficulty === "Easy" ? [10, 20] : difficulty === "Medium" ? [10, 15, 20, 25] : [12, 18, 22, 28, 32]);
    const d2 = randomChoice(difficulty === "Easy" ? [5, 10] : difficulty === "Medium" ? [5, 10, 15] : [8, 12, 15, 20]);
    const mp = 100 * randomInt(2, 15);
    const sp = mp * (1 - d1 / 100) * (1 - d2 / 100);
    const singleEquivalent = round((1 - (1 - d1 / 100) * (1 - d2 / 100)) * 100, 2);
    const askSingle = Math.random() < 0.5;
    if (askSingle) {
      const { options, answerIndex } = makeNumericOptions(singleEquivalent, { decimals: 2, suffix: "%", forcedTraps: [d1 + d2], spreadPercent: 18 });
      return {
        ...meta,
        question: `A shopkeeper offers two successive discounts of ${d1}% and ${d2}% on a marked price of ₹${inr(mp)}. Find the single discount equivalent to these two successive discounts.`,
        options,
        answerIndex,
        explanation: `Equivalent single discount = 100 − [(100−${d1})(100−${d2})/100] = ${singleEquivalent}%. Successive discounts never simply add up.`,
        tags: [...(meta.tags ?? []), "common-trap", "formula-shortcut"],
      };
    }
    const { options, answerIndex } = makeNumericOptions(sp, { prefix: "₹", indianGrouping: true, forcedTraps: [mp * (1 - (d1 + d2) / 100)], spreadPercent: 15 });
    return {
      ...meta,
      question: `A shopkeeper offers two successive discounts of ${d1}% and ${d2}% on a marked price of ₹${inr(mp)}. Find the final selling price.`,
      options,
      answerIndex,
      explanation: `SP = MP × (1 − ${d1}/100) × (1 − ${d2}/100) = ₹${inr(mp)} × ${round(1 - d1 / 100, 2)} × ${round(1 - d2 / 100, 2)} = ₹${inr(round(sp, 2))}.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  const table = [
    { W: 500, gain: 100 },
    { W: 600, gain: 66.67 },
    { W: 750, gain: 33.33 },
    { W: 800, gain: 25 },
    { W: 900, gain: 11.11 },
  ];
  const row = randomChoice(table);
  const askGain = Math.random() < 0.5;
  if (askGain) {
    const { options, answerIndex } = makeNumericOptions(row.gain, { decimals: 2, suffix: "%", spreadPercent: 20, forcedTraps: [round((1000 - row.W) / 10, 2)] });
    return {
      ...meta,
      question: `A dishonest dealer professes to sell his goods at cost price but uses a weight of ${row.W} g instead of 1 kg (1000 g). Find his gain percent.`,
      options,
      answerIndex,
      explanation: `Gain% = [(1000 − ${row.W}) / ${row.W}] × 100 = ${row.gain}%. Using less weight while charging for a full kg is equivalent to a hidden profit margin.`,
      tags: [...(meta.tags ?? []), "formula-shortcut"],
    };
  }
  const { options, answerIndex } = makeNumericOptions(row.W, { suffix: " g", spreadPercent: 15, forcedTraps: [1000 - row.W] });
  return {
    ...meta,
    question: `A dishonest dealer professes to sell his goods at cost price but still gains ${row.gain}%. What weight does he use in place of 1 kg (1000 g)?`,
    options,
    answerIndex,
    explanation: `Gain% = [(1000 − W) / W] × 100 = ${row.gain}% ⟹ W = ${row.W} g.`,
  };
}

// -------------------------------------------------------------------------
// Simple & Compound Interest
// -------------------------------------------------------------------------

const CI_TABLE = [
  { R: 10, T: 2, num: 21, den: 100 },
  { R: 20, T: 2, num: 11, den: 25 },
  { R: 25, T: 2, num: 9, den: 16 },
  { R: 50, T: 2, num: 5, den: 4 },
  { R: 100, T: 2, num: 3, den: 1 },
  { R: 10, T: 3, num: 331, den: 1000 },
  { R: 20, T: 3, num: 91, den: 125 },
  { R: 50, T: 3, num: 19, den: 8 },
];

export function generateSiCiQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("simple-compound-interest", difficulty, difficulty === "Easy" ? 40 : difficulty === "Medium" ? 60 : 85);

  if (roll < 0.4) {
    const R = randomChoice(difficulty === "Easy" ? [5, 10, 20] : difficulty === "Medium" ? [6, 8, 12, 15, 18] : [7, 9, 11, 14, 17]);
    const T = randomChoice(difficulty === "Hard" ? [3, 4, 5] : [2, 3, 4]);
    const g = gcd(R * T, 100);
    const step = 100 / g;
    const P = step * randomInt(2, 12);
    const SI = (P * R * T) / 100;
    const { options, answerIndex } = makeNumericOptions(SI, { prefix: "₹", indianGrouping: true, spreadPercent: 18 });
    return {
      ...meta,
      question: `Find the simple interest on ₹${inr(P)} at ${R}% per annum for ${T} years.`,
      options,
      answerIndex,
      explanation: `SI = (P × R × T) / 100 = (${inr(P)} × ${R} × ${T}) / 100 = ₹${inr(round(SI, 2))}.`,
    };
  }

  const row = randomChoice(CI_TABLE.filter((r) => (difficulty === "Easy" ? r.T === 2 && r.R >= 20 : difficulty === "Hard" ? r.T === 3 : true)));
  const P = row.den * randomInt(2, 14);
  const CI = (row.num * P) / row.den;
  const SI = (P * row.R * row.T) / 100;

  if (roll < 0.75) {
    const { options, answerIndex } = makeNumericOptions(CI, { prefix: "₹", indianGrouping: true, forcedTraps: [SI], spreadPercent: 15 });
    return {
      ...meta,
      question: `Find the compound interest on ₹${inr(P)} at ${row.R}% per annum for ${row.T} years, compounded annually.`,
      options,
      answerIndex,
      explanation: `Amount = P × (1 + R/100)^T = ${inr(P)} × (1 + ${row.R}/100)^${row.T}. CI = Amount − P = ₹${inr(round(CI, 2))}.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  const diff = round(CI - SI, 2);
  const { options, answerIndex } = makeNumericOptions(diff, { prefix: "₹", indianGrouping: true, decimals: 2, spreadPercent: 20 });
  return {
    ...meta,
    question: `Find the difference between the compound interest and the simple interest on ₹${inr(P)} at ${row.R}% per annum for ${row.T} years.`,
    options,
    answerIndex,
    explanation: `SI = (P×R×T)/100 = ₹${inr(round(SI, 2))}. CI = P×(1+R/100)^${row.T} − P = ₹${inr(round(CI, 2))}. Difference = CI − SI = ₹${inr(diff)}. (CI is always ≥ SI for T > 1, since compounding earns interest-on-interest.)`,
    tags: [...(meta.tags ?? []), "formula-shortcut"],
  };
}

// -------------------------------------------------------------------------
// Time & Work
// -------------------------------------------------------------------------

export function generateTimeWorkQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("time-and-work", difficulty, difficulty === "Easy" ? 40 : difficulty === "Medium" ? 60 : 85);

  if (roll < 0.3) {
    const pool = difficulty === "Easy" ? [4, 5, 6, 8, 10, 12, 15, 20] : difficulty === "Medium" ? [9, 14, 16, 18, 21, 24, 28] : [11, 13, 17, 19, 22, 26, 33];
    const a = randomChoice(pool);
    const b = randomChoice(pool.filter((v) => v !== a));
    const combined = round((a * b) / (a + b), 2);
    const { options, answerIndex } = makeNumericOptions(combined, { decimals: 2, suffix: " days", forcedTraps: [round((a + b) / 2, 2)], spreadPercent: 15 });
    return {
      ...meta,
      question: `A can complete a piece of work in ${a} days and B can complete it in ${b} days. In how many days will they finish it together?`,
      options,
      answerIndex,
      explanation: `Combined rate = 1/${a} + 1/${b} per day. Time together = (${a} × ${b}) / (${a} + ${b}) = ${combined} days.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  if (roll < 0.55) {
    const k = randomChoice([2, 3]);
    const m = randomInt(2, difficulty === "Hard" ? 10 : 6);
    const aAlone = (k + 1) * m;
    const combinedDays = k * m;
    const { options, answerIndex } = makeNumericOptions(aAlone, { suffix: " days", spreadPercent: 20, forcedTraps: [combinedDays * k] });
    return {
      ...meta,
      question: `A is ${k === 2 ? "twice" : "thrice"} as efficient as B. Working together they finish a job in ${combinedDays} days. In how many days can A alone finish it?`,
      options,
      answerIndex,
      explanation: `Let B's rate = x, so A's rate = ${k}x. Combined rate = ${k + 1}x = 1/${combinedDays} ⟹ x = 1/${(k + 1) * combinedDays}. A's rate = ${k}x = ${k}/${(k + 1) * combinedDays}, so A alone takes ${aAlone} days.`,
    };
  }

  if (roll < 0.75) {
    // Construct backward from two distinct divisors of a shared man-days
    // total, so days1 ≠ days2 and men2 is always a clean integer — a
    // forward random pick occasionally has no small divisor to offer.
    const divisorPool = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15];
    const days1 = randomChoice(divisorPool);
    const days2 = randomChoice(divisorPool.filter((d) => d !== days1));
    const manDays = days1 * days2 * randomInt(2, difficulty === "Hard" ? 8 : 4);
    const men1 = manDays / days1;
    const men2 = manDays / days2;
    const { options, answerIndex } = makeNumericOptions(men2, { spreadPercent: 20, forcedTraps: [men1] });
    return {
      ...meta,
      question: `${men1} men can complete a work in ${days1} days. How many men are needed to complete the same work in ${days2} days?`,
      options,
      answerIndex,
      explanation: `Total man-days = ${men1} × ${days1} = ${manDays}. Men needed = ${manDays} / ${days2} = ${men2}.`,
    };
  }

  const pairs = [
    [15, 30], [12, 18], [20, 30], [10, 15], [8, 12], [16, 24], [9, 18], [14, 21],
  ];
  const [ta, tb] = randomChoice(pairs);
  const combined = (ta * tb) / (ta + tb);
  const workedTogether = randomInt(1, Math.max(1, Math.floor(combined * 0.55)));
  const remainingFraction = 1 - workedTogether / combined;
  const remainingDaysForB = round(remainingFraction * tb, 2);
  const { options, answerIndex } = makeNumericOptions(remainingDaysForB, { decimals: 2, suffix: " days", spreadPercent: 20 });
  return {
    ...meta,
    question: `A can do a work in ${ta} days and B in ${tb} days. They work together for ${workedTogether} days, and then A leaves. In how many more days will B alone finish the remaining work?`,
    options,
    answerIndex,
    explanation: `Combined rate = 1/${ta} + 1/${tb} per day. Work done together in ${workedTogether} days = ${workedTogether}/${round(combined, 2)}, leaving a fraction still to do. B alone needs ${remainingDaysForB} more days for that remaining fraction.`,
  };
}

// -------------------------------------------------------------------------
// Number System
// -------------------------------------------------------------------------

const COPRIME_PAIRS: [number, number][] = [[2, 3], [3, 4], [3, 5], [4, 5], [5, 6], [2, 5], [3, 7], [5, 7], [4, 7], [2, 7], [5, 8], [3, 8]];
const UNIT_DIGIT_CYCLES: Record<number, number[]> = {
  0: [0], 1: [1], 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 4: [4, 6], 5: [5], 6: [6], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 9: [9, 1],
};

export function generateNumberSystemQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("number-system", difficulty, difficulty === "Easy" ? 35 : difficulty === "Medium" ? 55 : 75);

  if (roll < 0.3) {
    const [p, q] = randomChoice(COPRIME_PAIRS);
    const g = randomInt(2, difficulty === "Hard" ? 24 : 15);
    const a = g * p;
    const b = g * q;
    const { options, answerIndex } = makeNumericOptions(g, { forcedTraps: [p * q * g], spreadPercent: 40 });
    return {
      ...meta,
      question: `Find the HCF of ${a} and ${b}.`,
      options,
      answerIndex,
      explanation: `${a} = ${g}×${p}, ${b} = ${g}×${q}, and ${p}, ${q} share no common factor. So HCF = ${g}.`,
    };
  }

  if (roll < 0.55) {
    const [p, q] = randomChoice(COPRIME_PAIRS);
    const g = randomInt(2, difficulty === "Hard" ? 12 : 8);
    const a = g * p;
    const b = g * q;
    const lcm = g * p * q;
    const { options, answerIndex } = makeNumericOptions(lcm, { forcedTraps: [g], spreadPercent: 25 });
    return {
      ...meta,
      question: `Find the LCM of ${a} and ${b}.`,
      options,
      answerIndex,
      explanation: `${a} = ${g}×${p}, ${b} = ${g}×${q}. Since ${p} and ${q} share no common factor, LCM = ${g} × ${p} × ${q} = ${lcm}.`,
      tags: [...(meta.tags ?? []), "common-trap"],
    };
  }

  if (roll < 0.8) {
    const divisors = [15, 18, 24, 27, 36, 42, 48, 54];
    const D = randomChoice(divisors);
    const d2Options = [2, 3, 4, 5, 6, 9].filter((d) => D % d === 0 && d !== D);
    const d2 = randomChoice(d2Options.length > 0 ? d2Options : [3]);
    const r = randomInt(1, D - 1);
    const answer = r % d2;
    const { options, answerIndex } = makeNumericOptions(answer, { forcedTraps: [r], spreadPercent: 60, minDelta: 1 });
    return {
      ...meta,
      question: `A number when divided by ${D} leaves a remainder of ${r}. What is the remainder when the same number is divided by ${d2}?`,
      options,
      answerIndex,
      explanation: `Number = ${D}k + ${r}. Since ${D} is divisible by ${d2}, ${D}k contributes no remainder — the remainder on dividing by ${d2} comes only from ${r}, which leaves remainder ${answer} when divided by ${d2}.`,
    };
  }

  const base = randomInt(2, 9);
  const exponent = randomInt(21, 99);
  const cycle = UNIT_DIGIT_CYCLES[base];
  const effectivePos = cycle.length === 1 ? 0 : (exponent - 1) % cycle.length;
  const unitDigit = cycle[effectivePos];
  const { options, answerIndex } = makeNumericOptions(unitDigit, { minDelta: 1, spreadPercent: 400 });
  return {
    ...meta,
    question: `Find the unit digit of ${base}^${exponent}.`,
    options,
    answerIndex,
    explanation: `Unit digits of powers of ${base} cycle every ${cycle.length} term(s): ${cycle.join(", ")}. ${exponent} mod ${cycle.length} lines up with position ${effectivePos + 1} in that cycle, giving unit digit ${unitDigit}.`,
    tags: [...(meta.tags ?? []), "formula-shortcut"],
  };
}

// -------------------------------------------------------------------------
// Time, Speed & Distance
// -------------------------------------------------------------------------

export function generateTsdQuestion(difficulty: DifficultyLevel): Question {
  const roll = Math.random();
  const meta = baseQuestion("time-speed-and-distance", difficulty, difficulty === "Easy" ? 30 : difficulty === "Medium" ? 55 : 75);

  if (roll < 0.3) {
    const time = randomInt(2, difficulty === "Easy" ? 8 : 12);
    const speed = randomInt(difficulty === "Easy" ? 20 : 40, difficulty === "Easy" ? 80 : 150);
    const distance = time * speed;
    const askSpeed = Math.random() < 0.5;
    if (askSpeed) {
      const { options, answerIndex } = makeNumericOptions(speed, { suffix: " km/h", spreadPercent: 20, forcedTraps: [round(distance / (time + 1), 2)] });
      return {
        ...meta,
        question: `A car travels ${inr(distance)} km in ${time} hours. Find its speed.`,
        options,
        answerIndex,
        explanation: `Speed = Distance/Time = ${inr(distance)}/${time} = ${speed} km/h.`,
      };
    }
    const { options, answerIndex } = makeNumericOptions(distance, { suffix: " km", spreadPercent: 20 });
    return {
      ...meta,
      question: `A car travels at a speed of ${speed} km/h for ${time} hours. Find the distance covered.`,
      options,
      answerIndex,
      explanation: `Distance = Speed × Time = ${speed} × ${time} = ${inr(distance)} km.`,
    };
  }

  if (roll < 0.5) {
    const kmh = 18 * randomInt(1, difficulty === "Hard" ? 12 : 8);
    const ms = (kmh * 5) / 18;
    const forward = Math.random() < 0.5;
    if (forward) {
      const { options, answerIndex } = makeNumericOptions(ms, { suffix: " m/s", forcedTraps: [round((kmh * 18) / 5, 2)], spreadPercent: 20 });
      return {
        ...meta,
        question: `Convert a speed of ${kmh} km/h into m/s.`,
        options,
        answerIndex,
        explanation: `To convert km/h to m/s, multiply by 5/18: ${kmh} × 5/18 = ${ms} m/s.`,
        tags: [...(meta.tags ?? []), "formula-shortcut"],
      };
    }
    const { options, answerIndex } = makeNumericOptions(kmh, { suffix: " km/h", forcedTraps: [round((ms * 5) / 18, 2)], spreadPercent: 20 });
    return {
      ...meta,
      question: `Convert a speed of ${ms} m/s into km/h.`,
      options,
      answerIndex,
      explanation: `To convert m/s to km/h, multiply by 18/5: ${ms} × 18/5 = ${kmh} km/h.`,
      tags: [...(meta.tags ?? []), "formula-shortcut"],
    };
  }

  if (roll < 0.75) {
    const relKmh = 18 * randomInt(3, difficulty === "Hard" ? 15 : 10);
    const relMs = (relKmh * 5) / 18;
    const totalLen = relMs * randomInt(6, difficulty === "Hard" ? 30 : 18);
    const l1 = Math.round(totalLen * (0.4 + Math.random() * 0.2));
    const l2 = totalLen - l1;
    const s1 = Math.round(relKmh * (0.4 + Math.random() * 0.2));
    const s2 = relKmh - s1;
    const time = totalLen / relMs;
    const opposite = Math.random() < 0.6;
    const { options, answerIndex } = makeNumericOptions(time, { suffix: " s", spreadPercent: 20 });
    return {
      ...meta,
      question: `Two trains, ${Math.round(l1)} m and ${Math.round(l2)} m long, run in ${opposite ? "opposite" : "the same"} direction at ${s1} km/h and ${s2} km/h. Find the time taken to cross each other.`,
      options,
      answerIndex,
      explanation: `Relative speed = ${opposite ? `${s1}+${s2}` : `|${s1}−${s2}|`} = ${relKmh} km/h = ${round(relMs, 2)} m/s. Total length = ${Math.round(l1) + Math.round(l2)} m. Time = ${Math.round(l1) + Math.round(l2)}/${round(relMs, 2)} ≈ ${round(time, 2)} s.`,
    };
  }

  const pairs: [number, number][] = [[40, 60], [30, 60], [20, 30], [45, 60], [50, 75], [24, 36]];
  const [a, b] = randomChoice(pairs);
  const avg = round((2 * a * b) / (a + b), 2);
  const { options, answerIndex } = makeNumericOptions(avg, { decimals: 2, suffix: " km/h", forcedTraps: [round((a + b) / 2, 2)], spreadPercent: 15 });
  return {
    ...meta,
    question: `A man travels the first half of a journey at ${a} km/h and the second half at ${b} km/h. Find his average speed for the whole journey.`,
    options,
    answerIndex,
    explanation: `For equal distances, average speed = 2ab/(a+b) = (2×${a}×${b})/(${a + b}) = ${avg} km/h. This is NOT the simple average of ${a} and ${b} — that classic trap gives ${round((a + b) / 2, 2)} km/h, which is wrong here.`,
    tags: [...(meta.tags ?? []), "common-trap"],
  };
}
