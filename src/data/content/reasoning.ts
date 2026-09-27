import type { LessonContent } from "@/types";

export const REASONING_LESSONS: LessonContent[] = [
  {
    topicId: "reasoning-verbal-reasoning--analogy",
    whatIsIt: ["Analogy asks you to find the relationship between a given pair of words/numbers and apply the same relationship to a new pair or find its match."],
    sscShortcuts: ["Name the relationship in your own words first (e.g. 'part of', 'opposite of', 'used for') before scanning the options — this stops you from being distracted by superficially similar wrong options."],
    commonTraps: ["Picking an option that's merely in the same category as the original pair, without sharing the same specific relationship."],
    quickRevision: [
      "First identify the exact relationship in the given pair (cause-effect, part-whole, synonym, opposite, degree, etc.).",
      "Apply that SAME relationship, in the same order, to find the answer.",
      "Category membership alone isn't enough — the relationship must match precisely.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--classification-odd-one-out",
    whatIsIt: ["Given a set of items, find the one that doesn't share the common property/category the others share."],
    sscShortcuts: ["Check multiple possible groupings (by category, by property, by pattern in spelling/numbers) — the 'obvious' grouping isn't always the intended one."],
    commonTraps: ["Stopping at the first grouping that seems to work when a different, more precise grouping actually explains all four/five items better."],
    quickRevision: [
      "Look for what 3 (or 4) items share that the odd one doesn't.",
      "Consider multiple angles: meaning, category, numeric property, spelling pattern.",
      "The 'odd one' is usually odd in exactly one specific, nameable way.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--series-number-alphabet-mixed",
    whatIsIt: ["Find the pattern in a sequence of numbers, letters, or both, and extend it or spot the term that breaks it."],
    sscShortcuts: ["Compute first differences between consecutive terms; if not constant, compute second differences — a constant second difference signals a quadratic pattern.", "For letter series, convert to numbers (A=1...Z=26) to spot the arithmetic pattern, then convert back."],
    commonTraps: ["Missing that a series alternates between two interleaved patterns (e.g. odd positions follow one rule, even positions another)."],
    quickRevision: [
      "Check first differences, then second differences, for numeric series.",
      "Convert letters to their alphabet position to find numeric patterns.",
      "Watch for two interleaved sub-series within one sequence.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--coding-decoding",
    whatIsIt: ["A word/number is 'coded' by some consistent rule (letter shift, mirror substitution, number assignment); you must decode a new word or find its code using the same rule."],
    sscShortcuts: ["Compare letter positions (A=1...Z=26) between the original and coded word to spot a constant shift.", "If a constant shift doesn't fit, try the mirror rule (A↔Z, B↔Y, i.e. position + mirrored position = 27)."],
    commonTraps: ["Assuming a shift cipher when the actual rule is a mirror/reversal — always verify the found rule against ALL letters, not just the first one."],
    quickRevision: [
      "Try letter-position shift first (check it holds for every letter, not just one).",
      "If shift doesn't work, try the mirror rule (A↔Z, B↔Y...).",
      "Some codes reverse the whole word's letter order as well as substituting.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--blood-relations",
    whatIsIt: ["Deduces family relationships (uncle, cousin, in-law, etc.) from a chain of statements linking people."],
    sscShortcuts: ["Sketch a quick family tree as you read: mark gender (M/F) next to each name, draw a line down for parent→child and across for siblings/spouses.", "Track gender explicitly — most wrong answers come from losing track of gender partway through a long chain."],
    commonTraps: ["Assuming a sibling's spouse's relation without checking gender (brother-in-law vs sister-in-law depends on whose side and which gender)."],
    quickRevision: [
      "Draw the family tree as you read each statement — don't try to hold it all in your head.",
      "Mark gender explicitly for every person mentioned.",
      "Re-read the final question carefully — it often asks for the relation from a DIFFERENT person's viewpoint than the one you were tracking.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--direction-sense",
    whatIsIt: ["Tracks a person's position and facing direction through a series of moves and turns, to find the final direction or shortest distance from the start."],
    keyFormulas: [{ formula: "Shortest distance from start = √(net east-west²+net north-south²)", note: "Pythagoras applied to the net displacement." }],
    sscShortcuts: ["Facing North: right turn→East, left turn→West (rotate the same pattern for any starting direction). Track (x,y) position as you go — North/South changes y, East/West changes x.", "The 'shortest distance from start' is always the straight-line (Pythagorean) distance, not the total distance walked."],
    commonTraps: ["Confusing a left turn with a right turn partway through a long sequence of moves — go slowly and re-derive the new facing direction at each step."],
    quickRevision: [
      "Track net (x,y) displacement as you read each move.",
      "Right/left turns rotate your facing direction 90° — work it out fresh at each turn, don't guess.",
      "Final 'distance from start' = straight-line distance via Pythagoras, not total path length.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--ranking-and-order",
    whatIsIt: ["Determines a person's position in a line/rank from clues like 'X is 5th from the left' or comparisons between two people's ranks."],
    keyFormulas: [{ formula: "Total in a line = (position from left) + (position from right) − 1", note: "The standard formula for these 'total people in a row' questions." }],
    commonTraps: ["Off-by-one errors — forgetting to subtract 1 (the person is counted from both directions) in the total-people formula."],
    quickRevision: [
      "Total = position from left + position from right − 1.",
      "Draw a simple number line/row and place each clue on it as you read.",
      "Double check whether the question means position from the front/left vs back/right — it's easy to flip.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--syllogism",
    whatIsIt: ["Given two or more statements ('All A are B', 'Some B are C'), determine which conclusions logically follow — regardless of whether the statements match real-world facts."],
    sscShortcuts: ["Draw the simplest possible Venn diagram consistent with the statements. A conclusion is only valid if it holds in EVERY possible diagram, not just the one you drew first.", "'Some' means 'at least one', which is also technically true when 'all' is true — don't assume 'some' excludes 'all'."],
    commonTraps: ["Treating statements as if they must match real-world truth — syllogism is pure logic, answer only from what's given.", "Concluding 'some A are not C' from 'all A are B, some B are C' — this doesn't logically follow; draw the diagram to check."],
    quickRevision: [
      "Answer purely from the given statements, ignoring real-world knowledge.",
      "Draw the Venn diagram — a conclusion is valid only if true in every diagram consistent with the statements, not just one.",
      "'Some' includes the possibility of 'all'.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--statement-and-conclusion",
    whatIsIt: ["Given a statement, decide which of the offered conclusions follow logically from it alone."],
    commonTraps: ["Using outside knowledge or 'common sense' about the topic instead of strictly what the statement says."],
    quickRevision: [
      "A conclusion must follow ONLY from the given statement — not from general knowledge about the topic.",
      "If a conclusion could be true OR false given the statement, it does not 'follow'.",
    ],
  },
  {
    topicId: "reasoning-verbal-reasoning--statement-and-assumption",
    whatIsIt: ["An assumption is something that must be taken for granted for the statement/argument to make sense — distinct from a conclusion, which is what follows FROM the statement."],
    sscShortcuts: ["Ask: 'does the statement fall apart if this assumption is false?' If yes, it's a valid implicit assumption."],
    commonTraps: ["Confusing an assumption (unstated but necessary) with a conclusion (a valid derived result) — they answer different questions."],
    quickRevision: [
      "An assumption is implicit and necessary for the statement to hold — test it by imagining it's false.",
      "Don't confuse 'assumption' questions with 'conclusion' questions; they're testing different logical relationships.",
    ],
  },
  {
    topicId: "reasoning-analytical-reasoning--mathematical-operations",
    whatIsIt: ["Symbols are reassigned to different operations (e.g. '+' means '×'); you must substitute correctly and then compute using normal BODMAS."],
    sscShortcuts: ["Rewrite the whole expression with the REAL operations substituted in before calculating anything — don't try to substitute and calculate in the same pass."],
    commonTraps: ["Reverting to the symbol's normal meaning halfway through a long expression out of habit."],
    quickRevision: [
      "First substitute every symbol with its reassigned real operation, fully rewriting the expression.",
      "Then apply normal BODMAS to the rewritten expression.",
    ],
  },
  {
    topicId: "reasoning-analytical-reasoning--missing-number",
    whatIsIt: ["Find the missing number in a grid/pattern/series where rows, columns or a shape follow a consistent arithmetic rule."],
    sscShortcuts: ["Check rows AND columns (and sometimes diagonals) for a consistent operation — the rule might be row-wise even if you first tried columns."],
    commonTraps: ["Fixating on one direction (rows only) when the actual pattern runs the other way (columns), or is a combination."],
    quickRevision: [
      "Test simple operations (sum, product, difference) across rows, then columns, then diagonals.",
      "The same rule should explain every complete row/column, not just one.",
    ],
  },
  {
    topicId: "reasoning-analytical-reasoning--matrix-based-reasoning",
    whatIsIt: ["A grid of letters/numbers where each cell can be described by a two-part code (its row and column identifiers); questions ask you to find the code for a given cell or vice versa."],
    sscShortcuts: ["Set up the row and column headers clearly first, then read off (row, column) pairs mechanically rather than searching the grid repeatedly."],
    commonTraps: ["Swapping the row/column order in the code convention used by that specific question."],
    quickRevision: [
      "Confirm the code order (row-first or column-first) from the example given before answering.",
      "Build the coordinate system once, then look up cells mechanically.",
    ],
  },
  {
    topicId: "reasoning-analytical-reasoning--venn-diagrams",
    whatIsIt: ["Uses overlapping circles to represent categories and their intersections — often paired with counting how many items fall into specific overlapping regions."],
    sscShortcuts: ["Label each region of the diagram with its count as you read the data, rather than trying to compute the final answer in your head."],
    commonTraps: ["Double-counting items that belong to an overlapping region when adding up totals for a single category."],
    quickRevision: [
      "Fill in every distinct region's count as you extract the data.",
      "Total for one category = sum of ALL regions that include that category, without double-counting overlaps twice.",
    ],
  },
  {
    topicId: "reasoning-non-verbal-and-figure-reasoning--figure-based-series-and-analogy",
    whatIsIt: ["Like number/letter series and analogy, but the pattern is visual: rotation, shading, addition of elements, or a repeating cycle of shapes."],
    sscShortcuts: ["Track one visual property at a time across the sequence (rotation angle, number of sides, shading pattern) rather than trying to absorb the whole figure at once."],
    commonTraps: ["Missing that TWO properties are changing simultaneously (e.g. both rotating and gaining an extra line each step)."],
    quickRevision: [
      "Isolate one visual attribute at a time: shape count, rotation, shading, size.",
      "Check whether multiple attributes change together in a consistent combined pattern.",
    ],
  },
  {
    topicId: "reasoning-non-verbal-and-figure-reasoning--mirror-and-water-image",
    whatIsIt: ["A mirror image flips left-right (mirror held vertically, to the side); a water image flips top-bottom (mirror held horizontally, below, as if reflected in water)."],
    sscShortcuts: ["For letters/numbers, mentally flip the character AND reverse the order of the whole string — both happen together for a true mirror image."],
    commonTraps: ["Applying a left-right flip when the question actually asks for a water (top-bottom) image, or vice versa."],
    quickRevision: [
      "Mirror image = left-right flip (vertical mirror line).",
      "Water image = top-bottom flip (horizontal mirror line, as if reflected in a pond below).",
      "For a string of characters, both the characters AND their order get mirrored.",
    ],
  },
  {
    topicId: "reasoning-non-verbal-and-figure-reasoning--paper-folding-and-cutting",
    whatIsIt: ["Visualises how a piece of paper, folded one or more times and then punched/cut, looks when unfolded."],
    sscShortcuts: ["Work backwards one fold at a time from the final punched image, mirroring the hole pattern across each fold line in reverse order."],
    commonTraps: ["Unfolding in the wrong order (folds must be undone in reverse of how they were made)."],
    quickRevision: [
      "Unfold in the exact REVERSE order the folds were made.",
      "Each unfold mirrors the current hole pattern across that fold's line.",
    ],
  },
  {
    topicId: "reasoning-non-verbal-and-figure-reasoning--embedded-figures",
    whatIsIt: ["Find a given smaller figure hidden within a more complex larger figure."],
    sscShortcuts: ["Trace the smaller figure's exact outline shape first, then scan the larger figure for that same outline, ignoring extra lines around it."],
    commonTraps: ["Getting distracted by the larger figure's extra lines instead of focusing purely on the target shape's outline."],
    quickRevision: [
      "Memorise the target shape's outline before scanning.",
      "Ignore all lines in the larger figure that aren't part of the shape you're searching for.",
    ],
  },
  {
    topicId: "reasoning-non-verbal-and-figure-reasoning--counting-figures",
    whatIsIt: ["Count how many triangles, squares, or other shapes appear in a given complex figure, including ones formed by combining smaller pieces."],
    sscShortcuts: ["Count systematically by size (smallest individual shapes first, then shapes formed by combining 2, then 3, etc.) rather than scanning randomly, and mark each one as you count it."],
    commonTraps: ["Missing larger shapes formed by combining multiple smaller ones, or double-counting the same shape twice."],
    quickRevision: [
      "Count smallest shapes first, then progressively larger combinations.",
      "Mark/cross off shapes as counted to avoid double-counting.",
    ],
  },
  {
    topicId: "reasoning-non-verbal-and-figure-reasoning--dice-and-cubes",
    whatIsIt: ["Deduces which face is opposite/adjacent to another on a cube or die, usually from two or more given views of the same cube."],
    sscShortcuts: ["On a standard die, opposite faces always sum to 7 (1-6, 2-5, 3-4) — use this instantly if the question is a standard die.", "For a non-standard cube, use the 'rule of position': compare two views that share two common faces to deduce the third."],
    commonTraps: ["Assuming the standard 1-6/2-5/3-4 opposite-pairing applies to a NON-standard die with letters/symbols instead of numbers — that rule is specific to standard numbered dice."],
    quickRevision: [
      "Standard numbered die: opposite faces sum to 7.",
      "For lettered/symbol cubes, deduce opposite faces by comparing shared faces across two given views.",
      "A face never shown in ANY view could be opposite to a face shown in ALL views — use elimination.",
    ],
  },
  {
    topicId: "reasoning-miscellaneous-reasoning--calendar",
    whatIsIt: ["Determines the day of the week for a given date, using the fact that the calendar repeats with known regularities (leap years, 7-day cycles)."],
    keyFormulas: [{ formula: "A normal year has 365 days = 52 weeks + 1 odd day; a leap year has 366 days = 52 weeks + 2 odd days", note: "Odd days accumulate and determine the day-of-week shift between years." }],
    sscShortcuts: ["If given one known date-to-day mapping, count the number of odd days to the target date and shift forward that many days from the known weekday."],
    commonTraps: ["Forgetting to count February as 29 days in a leap year when computing odd days across that month.", "Miscounting whether a century year (like 2000) is a leap year — divisible by 400, not just 4, for century years."],
    quickRevision: [
      "Normal year = 1 odd day; leap year = 2 odd days.",
      "Leap year rule: divisible by 4, EXCEPT century years, which must be divisible by 400.",
      "Shift the known weekday forward by the total odd days to the target date.",
    ],
  },
  {
    topicId: "reasoning-miscellaneous-reasoning--clock",
    whatIsIt: ["Angle and time problems involving a clock's hour and minute hands — their relative speed and the angle between them."],
    keyFormulas: [
      { formula: "Minute hand moves 6°/minute; hour hand moves 0.5°/minute", note: "Relative speed of minute hand over hour hand = 5.5°/minute." },
      { formula: "Angle between hands at H hours M minutes = |30H − 5.5M|", note: "Take the smaller of this value and 360° minus it if it exceeds 180°." },
    ],
    sscShortcuts: ["The hands overlap roughly every 65+5/11 minutes, not every 60 — a common shortcut fact for 'when do the hands coincide' questions."],
    commonTraps: ["Forgetting the hour hand also moves continuously (not staying fixed) as minutes pass — it moves 0.5° every minute, not just on the hour."],
    quickRevision: [
      "Minute hand: 6°/min. Hour hand: 0.5°/min. Relative speed: 5.5°/min.",
      "Angle formula: |30H−5.5M|, adjusted to be ≤180°.",
      "Hands coincide roughly every 65 5/11 minutes, not exactly every hour.",
    ],
  },
];
