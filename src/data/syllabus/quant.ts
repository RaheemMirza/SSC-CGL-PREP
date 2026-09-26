import type { Chapter, Topic } from "@/types";
import { buildChapter, buildTopics } from "./builders";

const SUBJECT = "quant" as const;

export const quantChapters: Chapter[] = [
  buildChapter(SUBJECT, "Number System & Simplification", 1, "The foundation everything else in Quant builds on."),
  buildChapter(SUBJECT, "Arithmetic", 2, "The single highest-weightage area in SSC CGL Quant."),
  buildChapter(SUBJECT, "Algebra", 3),
  buildChapter(SUBJECT, "Geometry", 4),
  buildChapter(SUBJECT, "Mensuration", 5),
  buildChapter(SUBJECT, "Trigonometry & Heights-Distances", 6),
  buildChapter(SUBJECT, "Data Interpretation & Statistics", 7),
];

const [numberSystem, arithmetic, algebra, geometry, mensuration, trig, di] = quantChapters;

export const quantTopics: Topic[] = [
  ...buildTopics(numberSystem, [
    {
      name: "Number System",
      summary: "Divisibility, factors, HCF/LCM, remainders, and the number properties SSC leans on for quick elimination.",
      difficulty: "Easy",
      subtopics: ["Types of numbers", "Divisibility rules", "HCF & LCM", "Remainder theorem basics", "Unit digit & last-two-digit tricks"],
      tags: ["foundation", "high-frequency"],
    },
    {
      name: "Simplification & Approximation",
      summary: "BODMAS-driven simplification, surds & indices, and fast approximation for multi-step expressions.",
      difficulty: "Easy",
      subtopics: ["BODMAS/VBODMAS", "Surds & indices", "Fractions & decimals", "Approximation techniques"],
      tags: ["foundation", "high-frequency"],
    },
    {
      name: "Square Roots & Cube Roots",
      summary: "Fast square/cube root extraction — a direct speed multiplier for later arithmetic topics.",
      difficulty: "Easy",
      subtopics: ["Perfect squares/cubes table", "Division method", "Estimation shortcuts"],
    },
  ]),
  ...buildTopics(arithmetic, [
    {
      name: "Percentage",
      summary: "Converts between fractions and percentages fast, and underlies almost every other arithmetic topic below.",
      difficulty: "Easy",
      hasFullContent: true,
      subtopics: ["Basic percentage", "Percentage increase/decrease", "Successive percentage change", "Population/price-based questions", "Exam-level applications"],
      tags: ["high-frequency", "foundation-for-arithmetic"],
    },
    {
      name: "Ratio & Proportion",
      summary: "Comparing quantities and scaling relationships — feeds directly into Partnership and Mixture & Alligation.",
      difficulty: "Easy",
      hasFullContent: true,
      subtopics: ["Simple & compound ratio", "Proportion & variation", "Componendo-dividendo", "Ratio in real-life word problems"],
      tags: ["high-frequency"],
    },
    {
      name: "Average",
      summary: "Mean of a data set, and the shortcut techniques for weighted/combined averages that SSC tests directly.",
      difficulty: "Easy",
      hasFullContent: true,
      subtopics: ["Simple average", "Weighted average", "Average of combined groups", "Age-based average problems"],
    },
    {
      name: "Profit & Loss",
      summary: "Cost price/selling price relationships, discount stacking, and the traps SSC builds into 'successive' profit questions.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["CP, SP, profit/loss %", "Successive profit/loss", "Marked price & discount", "False weight problems"],
      tags: ["high-frequency"],
    },
    {
      name: "Discount",
      summary: "Single and successive discounts, and how they interact with profit/loss.",
      difficulty: "Medium",
      subtopics: ["Single discount", "Successive discount", "Discount vs. profit combined problems"],
    },
    {
      name: "Simple Interest & Compound Interest",
      summary: "Interest growth over time — SI/CI formulas, the difference between them, and installment-based problems.",
      difficulty: "Medium",
      hasFullContent: true,
      slug: "simple-compound-interest",
      subtopics: ["Simple interest basics", "Compound interest basics", "SI vs CI difference problems", "Half-yearly/quarterly compounding", "Installments"],
      tags: ["high-frequency"],
    },
    {
      name: "Partnership",
      summary: "Splitting profit/loss by capital and time invested.",
      difficulty: "Medium",
      subtopics: ["Simple partnership", "Compound (capital + time) partnership"],
    },
    {
      name: "Mixture & Alligation",
      summary: "Combining two quantities at different rates/concentrations — the alligation rule and its shortcuts.",
      difficulty: "Medium",
      subtopics: ["Rule of alligation", "Mixture replacement problems", "Milk-and-water classics"],
    },
    {
      name: "Time & Work",
      summary: "Work-rate reasoning: individual rates, combined work, and efficiency ratios.",
      difficulty: "Medium",
      hasFullContent: true,
      subtopics: ["Basic time & work", "Work + wages", "Efficiency-based problems", "Work equivalence (man-days)"],
      tags: ["high-frequency"],
    },
    {
      name: "Pipes & Cisterns",
      summary: "Time & Work applied to filling/emptying tanks, including inlet-outlet combinations.",
      difficulty: "Medium",
      subtopics: ["Filling & emptying pipes", "Combined pipes", "Leak/outlet problems"],
    },
    {
      name: "Time, Speed & Distance",
      summary: "Speed-distance-time relationships, relative speed, and the unit conversions SSC tests directly.",
      difficulty: "Medium",
      subtopics: ["Basic TSD", "Relative speed", "Trains", "Average speed for a journey"],
      tags: ["high-frequency"],
    },
    {
      name: "Boats & Streams",
      summary: "TSD applied to upstream/downstream motion.",
      difficulty: "Medium",
      subtopics: ["Upstream & downstream speed", "Time for a round trip"],
    },
  ]),
  ...buildTopics(algebra, [
    {
      name: "Basic Algebraic Identities",
      summary: "The identity toolkit (a+b)², a³+b³, etc. that turns messy algebra into a 10-second lookup.",
      difficulty: "Easy",
      subtopics: ["Standard identities", "Value-substitution shortcuts"],
    },
    {
      name: "Linear & Quadratic Equations",
      summary: "Solving for unknowns, and the SSC-style 'find the value of the expression' variants.",
      difficulty: "Medium",
      subtopics: ["Linear equations in one/two variables", "Quadratic roots", "Nature of roots"],
    },
    {
      name: "Polynomials",
      summary: "Factor theorem, remainder theorem, and polynomial value problems.",
      difficulty: "Medium",
      subtopics: ["Factor & remainder theorem", "Factorisation techniques"],
    },
  ]),
  ...buildTopics(geometry, [
    {
      name: "Lines & Angles",
      summary: "Angle properties on straight lines and parallel-line transversal problems.",
      difficulty: "Easy",
      subtopics: ["Complementary/supplementary angles", "Parallel lines & transversals"],
    },
    {
      name: "Triangles",
      summary: "Congruence, similarity, centroid/incentre/circumcentre, and the property-based questions SSC favours.",
      difficulty: "Medium",
      subtopics: ["Congruence & similarity", "Centres of a triangle", "Pythagoras applications", "Angle-bisector & median properties"],
      tags: ["high-frequency"],
    },
    {
      name: "Circles",
      summary: "Chord, tangent and angle properties of circles.",
      difficulty: "Medium",
      subtopics: ["Tangent-chord properties", "Angle subtended by arcs", "Common tangents to two circles"],
    },
    {
      name: "Quadrilaterals & Polygons",
      summary: "Properties of standard quadrilaterals and regular polygon angle sums.",
      difficulty: "Easy",
      subtopics: ["Parallelogram/rhombus/trapezium properties", "Interior/exterior angles of polygons"],
    },
    {
      name: "Coordinate Geometry",
      summary: "Distance, section, and slope formulas applied to SSC's short, direct questions.",
      difficulty: "Medium",
      subtopics: ["Distance & section formula", "Slope & equation of a line", "Area of a triangle by coordinates"],
    },
  ]),
  ...buildTopics(mensuration, [
    {
      name: "2D Mensuration",
      summary: "Area and perimeter of standard plane figures.",
      difficulty: "Easy",
      subtopics: ["Triangle, square, rectangle", "Circle & sector", "Rhombus, trapezium, parallelogram"],
      tags: ["high-frequency"],
    },
    {
      name: "3D Mensuration",
      summary: "Surface area and volume of solids — a common source of easy marks if formulas are memorised well.",
      difficulty: "Medium",
      subtopics: ["Cube & cuboid", "Cylinder, cone, sphere", "Frustum", "Combined solids"],
      tags: ["high-frequency"],
    },
  ]),
  ...buildTopics(trig, [
    {
      name: "Trigonometric Ratios & Identities",
      summary: "Core ratios, standard angle values, and the identities used to simplify trig expressions.",
      difficulty: "Medium",
      subtopics: ["Standard angle values (0°-90°)", "Core identities", "Trigonometric simplification"],
    },
    {
      name: "Heights & Distances",
      summary: "Angle-of-elevation/depression word problems — a direct, formula-light application of trig ratios.",
      difficulty: "Medium",
      subtopics: ["Angle of elevation", "Angle of depression", "Two-observation problems"],
      tags: ["high-frequency"],
    },
  ]),
  ...buildTopics(di, [
    {
      name: "Data Interpretation (Tables, Bar, Pie, Line)",
      summary: "Reading and computing from tables and charts under time pressure — mostly arithmetic applied to given data.",
      difficulty: "Medium",
      subtopics: ["Tables", "Bar graphs", "Pie charts", "Line graphs", "Mixed/caselet DI"],
      tags: ["high-frequency"],
    },
    {
      name: "Statistics",
      summary: "Mean, median, mode and basic measures of central tendency for grouped/ungrouped data.",
      difficulty: "Medium",
      subtopics: ["Mean, median, mode", "Grouped data basics"],
    },
    {
      name: "Probability",
      summary: "Classical probability of simple events — appears occasionally, keep it light unless time permits.",
      difficulty: "Medium",
      subtopics: ["Classical probability", "Cards, dice, coins"],
    },
  ]),
];
