import type { Chapter, Topic } from "@/types";
import { buildChapter, buildTopics } from "./builders";

// ---- Tier 2 Mathematical Abilities -------------------------------------
const mathChapters: Chapter[] = [
  buildChapter("tier2-math", "Advanced Arithmetic", 1, "Builds directly on Tier 1 Arithmetic, at a higher difficulty & speed expectation."),
  buildChapter("tier2-math", "Advanced Algebra & Geometry", 2),
  buildChapter("tier2-math", "Advanced Mensuration & Trigonometry", 3),
  buildChapter("tier2-math", "Data Interpretation (Advanced)", 4),
];
const [advArith, advAlgGeo, advMensTrig, advDi] = mathChapters;

const mathTopics: Topic[] = [
  ...buildTopics(advArith, [
    { name: "Arithmetic — Tier 2 Level", summary: "Percentage, Profit & Loss, SI/CI, Time & Work, TSD revisited with multi-step, exam-level problems. Master the Tier 1 topic pages first, then use this for higher-difficulty drilling.", difficulty: "Hard", subtopics: ["Multi-concept arithmetic problems", "Data-heavy word problems"] },
  ]),
  ...buildTopics(advAlgGeo, [
    { name: "Algebra — Tier 2 Level", summary: "Equations, identities and polynomial problems at a faster, more layered difficulty than Tier 1.", difficulty: "Hard", subtopics: ["Multi-variable equations", "Higher-degree identities"] },
    { name: "Geometry — Tier 2 Level", summary: "Triangle/circle property questions combined with mensuration for multi-step SSC CGL Tier 2 problems.", difficulty: "Hard", subtopics: ["Combined geometry properties", "Coordinate geometry (advanced)"] },
  ]),
  ...buildTopics(advMensTrig, [
    { name: "Mensuration — Tier 2 Level", summary: "3D mensuration combined with ratio/algebra — a common Tier 2 question style.", difficulty: "Hard", subtopics: ["Combined solids", "Mensuration + ratio problems"] },
    { name: "Trigonometry & Heights-Distances — Tier 2 Level", summary: "Trig identities and heights-distances problems with more steps than Tier 1.", difficulty: "Hard", subtopics: ["Multi-angle identities", "Multi-observer height problems"] },
  ]),
  ...buildTopics(advDi, [
    { name: "Data Interpretation — Tier 2 Level", summary: "Denser tables/graphs and caselet-style DI sets requiring faster computation.", difficulty: "Hard", subtopics: ["Caselet DI", "Multi-graph combined DI"] },
  ]),
];

// ---- Tier 2 Reasoning & General Intelligence ---------------------------
const reasoningChapters: Chapter[] = [
  buildChapter("tier2-reasoning", "Verbal Reasoning — Tier 2 Level", 1),
  buildChapter("tier2-reasoning", "Puzzles & Arrangements", 2, "Emphasised far more heavily in Tier 2 than Tier 1."),
  buildChapter("tier2-reasoning", "Non-Verbal Reasoning — Tier 2 Level", 3),
];
const [t2VerbalCh, puzzlesCh, t2NonVerbalCh] = reasoningChapters;

const reasoningTopics: Topic[] = [
  ...buildTopics(t2VerbalCh, [
    { name: "Analogy, Classification & Series — Tier 2 Level", summary: "Same core skills as Tier 1, tested with denser and multi-layered patterns.", difficulty: "Hard", subtopics: ["Complex analogy", "Multi-step series"] },
    { name: "Coding-Decoding, Blood Relations & Syllogism — Tier 2 Level", summary: "The Tier 1 fundamentals, now combined with longer chains and coded statements.", difficulty: "Hard", subtopics: ["Coded blood relations (advanced)", "Multi-statement syllogism"] },
  ]),
  ...buildTopics(puzzlesCh, [
    { name: "Seating Arrangement (Linear & Circular)", summary: "Placing people/objects around a line or circle from partial clues — a Tier 2 staple, rarely seen in Tier 1.", difficulty: "Hard", subtopics: ["Linear seating", "Circular seating", "Double-row seating"] },
    { name: "Puzzles (Floor, Box, Comparison)", summary: "Multi-attribute puzzles requiring elimination-table logic to fix every entity's attributes.", difficulty: "Hard", subtopics: ["Floor-based puzzles", "Box-based puzzles", "Comparison/ranking puzzles"] },
    { name: "Input-Output", summary: "Tracking a step-by-step rearrangement/operation rule applied to a word-number arrangement.", difficulty: "Hard", subtopics: ["Word-number rearrangement rules"] },
  ]),
  ...buildTopics(t2NonVerbalCh, [
    { name: "Figure & Pattern Reasoning — Tier 2 Level", summary: "Mirror/water image, paper folding, and figure series at a faster pace than Tier 1.", difficulty: "Hard", subtopics: ["Advanced figure series", "Advanced mirror/water image"] },
  ]),
];

// ---- Tier 2 English ------------------------------------------------------
const englishChapters: Chapter[] = [
  buildChapter("tier2-english", "Advanced Grammar & Vocabulary", 1),
  buildChapter("tier2-english", "Advanced Comprehension", 2),
];
const [advGrammarCh, advCompCh] = englishChapters;

const englishTopics: Topic[] = [
  ...buildTopics(advGrammarCh, [
    { name: "Error Detection & Sentence Improvement — Tier 2 Level", summary: "The Tier 1 grammar rules, tested on longer and more nuanced sentences.", difficulty: "Hard", subtopics: ["Complex sentence error-spotting", "Idiomatic sentence improvement"] },
    { name: "Vocabulary — Tier 2 Level", summary: "A wider synonym/antonym/one-word-substitution word list than Tier 1.", difficulty: "Hard", subtopics: ["Extended synonym/antonym list", "Extended OWS list"] },
  ]),
  ...buildTopics(advCompCh, [
    { name: "Cloze Test & Reading Comprehension — Tier 2 Level", summary: "Longer passages with denser vocabulary and more inferential questions than Tier 1.", difficulty: "Hard", subtopics: ["Longer cloze passages", "Multi-paragraph RC"] },
    { name: "Para Jumbles — Tier 2 Level", summary: "Sentence-rearrangement questions with subtler linking cues.", difficulty: "Hard", subtopics: ["Advanced para jumbles"] },
  ]),
];

// ---- Tier 2 General Awareness --------------------------------------------
const gaChapters: Chapter[] = [buildChapter("tier2-ga", "General Awareness — Tier 2 Level", 1, "Same categories as Tier 1 GA, at greater depth.")];
const [t2GaCh] = gaChapters;
const gaTopics: Topic[] = [
  ...buildTopics(t2GaCh, [
    { name: "Static GK — Tier 2 Depth", summary: "The same static-GK categories as Tier 1, but expect finer detail and less obvious facts.", difficulty: "Hard", subtopics: ["Deeper static GK"] },
    { name: "Current Affairs — Tier 2 Depth", summary: "Current affairs at Tier 2 depth — still strictly month-tagged, never treated as evergreen.", difficulty: "Hard", subtopics: ["Deeper current affairs coverage"], tags: ["dated-content"] },
  ]),
];

// ---- Tier 2 Computer Knowledge --------------------------------------------
const computerChapters: Chapter[] = [
  buildChapter("tier2-computer", "Computer Fundamentals", 1),
  buildChapter("tier2-computer", "Software, Internet & Security", 2),
  buildChapter("tier2-computer", "MS Office & Data Entry Skills", 3),
];
const [compFundCh, compNetCh, compOfficeCh] = computerChapters;
const computerTopics: Topic[] = [
  ...buildTopics(compFundCh, [
    { name: "Computer Basics & Generations", summary: "Hardware/software basics, memory units, and generations of computers.", difficulty: "Easy", subtopics: ["Hardware vs software", "Memory & storage units", "Generations of computers"] },
    { name: "Number Systems & Computer Abbreviations", summary: "Binary/decimal conversions and common computer-related abbreviations.", difficulty: "Easy", subtopics: ["Binary/decimal/hex basics", "Common abbreviations"] },
  ]),
  ...buildTopics(compNetCh, [
    { name: "Operating Systems & Software", summary: "OS basics, types of software, and common file extensions.", difficulty: "Easy", subtopics: ["OS basics", "System vs application software"] },
    { name: "Internet, Networking & Cyber Security", summary: "Internet basics, network types, and common cyber-security terms.", difficulty: "Medium", subtopics: ["Internet & email basics", "Network types (LAN/WAN)", "Cyber security basics (virus, firewall, phishing)"] },
  ]),
  ...buildTopics(compOfficeCh, [
    { name: "MS Word, Excel & PowerPoint Basics", summary: "Common shortcuts and features tested for each MS Office application.", difficulty: "Easy", subtopics: ["MS Word basics", "MS Excel basics", "MS PowerPoint basics"] },
    { name: "Data Entry Speed Test (DEST) Practice", summary: "Typing-speed practice for the qualifying DEST module — accuracy matters as much as speed.", difficulty: "Easy", subtopics: ["Typing speed drills", "Accuracy under time pressure"] },
  ]),
];

// ---- Tier 2 Statistics (JSO / Statistical Investigator only) -------------
const statsChapters: Chapter[] = [
  buildChapter("tier2-statistics", "Collection, Classification & Presentation of Data", 1),
  buildChapter("tier2-statistics", "Measures of Central Tendency & Dispersion", 2),
  buildChapter("tier2-statistics", "Correlation, Regression & Probability", 3),
  buildChapter("tier2-statistics", "Sampling Theory & Statistical Inference", 4),
  buildChapter("tier2-statistics", "Analysis of Variance, Time Series & Index Numbers", 5),
];
const [statsCollCh, statsCentralCh, statsCorrCh, statsSampCh, statsAnovaCh] = statsChapters;
const statsTopics: Topic[] = [
  ...buildTopics(statsCollCh, [
    { name: "Data Collection & Classification", summary: "Primary/secondary data collection methods and classification/tabulation of data.", difficulty: "Hard", subtopics: ["Primary vs secondary data", "Classification & tabulation"] },
    { name: "Diagrammatic & Graphic Presentation", summary: "Choosing and constructing the right chart type for a given dataset.", difficulty: "Medium", subtopics: ["Diagrams", "Graphs & frequency distributions"] },
  ]),
  ...buildTopics(statsCentralCh, [
    { name: "Measures of Central Tendency", summary: "Mean, median, mode and their properties for grouped/ungrouped data.", difficulty: "Hard", subtopics: ["Mean, median, mode", "Properties & merits/demerits"] },
    { name: "Measures of Dispersion, Skewness & Kurtosis", summary: "Range, variance, standard deviation, and shape-of-distribution measures.", difficulty: "Hard", subtopics: ["Range, variance, SD", "Skewness & kurtosis"] },
  ]),
  ...buildTopics(statsCorrCh, [
    { name: "Correlation & Regression", summary: "Measuring and interpreting linear relationships between two variables.", difficulty: "Hard", subtopics: ["Correlation coefficient", "Regression lines"] },
    { name: "Probability Theory", summary: "Classical/axiomatic probability, conditional probability, and Bayes' theorem.", difficulty: "Hard", subtopics: ["Basic probability laws", "Conditional probability & Bayes' theorem"] },
    { name: "Random Variables & Probability Distributions", summary: "Discrete/continuous distributions commonly tested (Binomial, Poisson, Normal).", difficulty: "Hard", subtopics: ["Binomial & Poisson", "Normal distribution"] },
  ]),
  ...buildTopics(statsSampCh, [
    { name: "Sampling Theory", summary: "Sampling methods and sampling vs non-sampling error.", difficulty: "Hard", subtopics: ["Sampling methods", "Sampling error"] },
    { name: "Statistical Inference", summary: "Estimation and hypothesis testing basics.", difficulty: "Hard", subtopics: ["Point & interval estimation", "Hypothesis testing basics"] },
  ]),
  ...buildTopics(statsAnovaCh, [
    { name: "Analysis of Variance (ANOVA)", summary: "One-way classification ANOVA as tested at this level.", difficulty: "Hard", subtopics: ["One-way ANOVA"] },
    { name: "Time Series Analysis", summary: "Components of a time series and basic trend-fitting methods.", difficulty: "Hard", subtopics: ["Components of time series", "Trend fitting"] },
    { name: "Index Numbers", summary: "Construction and use of price/quantity index numbers.", difficulty: "Hard", subtopics: ["Construction of index numbers", "Uses & limitations"] },
  ]),
];

// ---- Tier 2 Paper III: Finance & Economics (AAO only) --------------------
const financeChapters: Chapter[] = [
  buildChapter("tier2-finance-economics", "Finance & Accounts", 1),
  buildChapter("tier2-finance-economics", "Economics & Governance", 2),
];
const [financeCh, econGovCh] = financeChapters;
const financeTopics: Topic[] = [
  ...buildTopics(financeCh, [
    { name: "Fundamental Principles & Financial Accounting", summary: "Basic accounting principles, financial statements, and the accounting cycle.", difficulty: "Hard", subtopics: ["Accounting principles", "Financial statements"] },
    { name: "Government Accounting & Audit", summary: "Role of the Comptroller & Auditor General, and government accounting structure.", difficulty: "Hard", subtopics: ["CAG's role", "Government accounting basics"] },
  ]),
  ...buildTopics(econGovCh, [
    { name: "Basic Concepts of Economics & Demand-Supply", summary: "Micro fundamentals: demand, supply, elasticity, and market equilibrium.", difficulty: "Hard", subtopics: ["Demand & supply theory", "Elasticity & equilibrium"] },
    { name: "Forms of Market & Production/Cost", summary: "Market structures and the theory of production and cost.", difficulty: "Hard", subtopics: ["Market structures", "Production & cost theory"] },
    { name: "Indian Economy, Money & Banking, Governance", summary: "Indian economic institutions, monetary policy, and the role of IT in governance.", difficulty: "Hard", subtopics: ["Money & banking", "Role of IT in governance", "Economic reforms"] },
  ]),
];

export const tier2Chapters: Chapter[] = [
  ...mathChapters, ...reasoningChapters, ...englishChapters, ...gaChapters,
  ...computerChapters, ...statsChapters, ...financeChapters,
];

export const tier2Topics: Topic[] = [
  ...mathTopics, ...reasoningTopics, ...englishTopics, ...gaTopics,
  ...computerTopics, ...statsTopics, ...financeTopics,
];
