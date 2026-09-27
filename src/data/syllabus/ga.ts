import type { Chapter, Topic } from "@/types";
import { buildChapter, buildTopics } from "./builders";

const SUBJECT = "ga" as const;

export const gaChapters: Chapter[] = [
  buildChapter(SUBJECT, "History", 1),
  buildChapter(SUBJECT, "Geography", 2),
  buildChapter(SUBJECT, "Polity", 3),
  buildChapter(SUBJECT, "Economics", 4),
  buildChapter(SUBJECT, "General Science", 5),
  buildChapter(SUBJECT, "Physics", 6),
  buildChapter(SUBJECT, "Chemistry", 7),
  buildChapter(SUBJECT, "Biology", 8),
  buildChapter(SUBJECT, "Static GK", 9),
  buildChapter(SUBJECT, "Current Affairs", 10, "Separated by month/year — never presented as evergreen fact."),
  buildChapter(SUBJECT, "Art & Culture", 11),
  buildChapter(SUBJECT, "Environment", 12),
  buildChapter(SUBJECT, "Government Schemes", 13),
  buildChapter(SUBJECT, "Awards & Honours", 14),
  buildChapter(SUBJECT, "Sports", 15),
  buildChapter(SUBJECT, "Books & Authors", 16),
  buildChapter(SUBJECT, "Important Days", 17),
  buildChapter(SUBJECT, "Organizations (National & International)", 18),
  buildChapter(SUBJECT, "Miscellaneous GK", 19),
];

const [
  history, geography, polity, economics, generalScience, physics, chemistry, biology,
  staticGk, currentAffairs, artCulture, environment, schemes, awards, sports, books,
  days, organizations, misc,
] = gaChapters;

export const gaTopics: Topic[] = [
  ...buildTopics(history, [
    { name: "Ancient India", summary: "Indus Valley Civilisation through classical dynasties — sources, society, and administration.", difficulty: "Medium", subtopics: ["Indus Valley Civilisation", "Vedic period", "Mauryan & Gupta empires"] },
    { name: "Medieval India", summary: "Delhi Sultanate through the Mughal era — administration, culture, and key rulers.", difficulty: "Medium", subtopics: ["Delhi Sultanate", "Mughal Empire", "Regional kingdoms"] },
    {
      name: "Modern India & Freedom Struggle",
      summary: "British rule, socio-religious reform movements, and the freedom struggle timeline — the most heavily tested history area in SSC CGL.",
      difficulty: "Medium",
      priority: "must",
      hasFullContent: true,
      subtopics: ["Arrival of Europeans", "1857 Revolt", "Indian National Congress & major movements", "Key freedom fighters", "Post-independence integration"],
      tags: ["high-frequency"],
    },
  ]),
  ...buildTopics(geography, [
    { name: "Physical Geography", summary: "Landforms, rivers, climate, and natural resources of India and the world.", difficulty: "Medium", subtopics: ["Physiography of India", "Rivers & drainage", "Climate & monsoon"] },
    { name: "Indian Geography", summary: "States, agriculture, minerals, and industries of India.", difficulty: "Medium", priority: "must", subtopics: ["States & capitals", "Agriculture & cropping patterns", "Minerals & industries"] },
    { name: "World Geography", summary: "Continents, oceans, and globally significant physical features.", difficulty: "Medium", subtopics: ["Continents & oceans", "Important world physical features"] },
  ]),
  ...buildTopics(polity, [
    {
      name: "The Constitution & Fundamental Rights",
      summary: "Making of the Constitution, its salient features, Fundamental Rights, and Directive Principles — the backbone of the Polity section.",
      difficulty: "Medium",
      priority: "must",
      hasFullContent: true,
      subtopics: ["Making of the Constitution", "Preamble & salient features", "Fundamental Rights", "Fundamental Duties", "Directive Principles of State Policy"],
      tags: ["high-frequency"],
    },
    { name: "Union Executive & Legislature", summary: "President, PM, Council of Ministers, Parliament, and how bills become law.", difficulty: "Medium", subtopics: ["President & Vice-President", "Prime Minister & Council of Ministers", "Parliament & law-making"] },
    { name: "Judiciary & Constitutional Bodies", summary: "Supreme Court, High Courts, and bodies like the Election Commission and CAG.", difficulty: "Medium", priority: "could", subtopics: ["Supreme Court & High Courts", "Election Commission", "CAG & other constitutional bodies"] },
    { name: "Local Self-Government", summary: "Panchayati Raj and Municipal governance structures.", difficulty: "Easy", priority: "could", subtopics: ["Panchayati Raj (73rd Amendment)", "Municipalities (74th Amendment)"] },
  ]),
  ...buildTopics(economics, [
    { name: "Basic Economic Concepts", summary: "Micro/macro basics, GDP/GNP, and inflation as tested at SSC level.", difficulty: "Medium", subtopics: ["GDP, GNP, NDP, NNP", "Inflation & its types", "Demand & supply basics"] },
    { name: "Indian Economy & Five-Year Plans", summary: "Planning history, sectors of the economy, and major reforms.", difficulty: "Medium", priority: "could", subtopics: ["Five-Year Plans overview", "Sectors of the Indian economy", "Economic reforms (1991 onward)"] },
    { name: "Money, Banking & Budget", summary: "RBI functions, banking structure, and budget/fiscal terms.", difficulty: "Medium", priority: "could", subtopics: ["RBI & monetary policy", "Types of banks", "Union Budget basics"] },
  ]),
  ...buildTopics(generalScience, [
    {
      name: "Human Body & Everyday Science",
      summary: "Human body systems, common diseases, and the everyday-science facts SSC likes to test as one-liners.",
      difficulty: "Easy",
      priority: "must",
      hasFullContent: true,
      subtopics: ["Human body systems", "Common diseases & causes", "Everyday-life science facts"],
      tags: ["high-frequency"],
    },
    { name: "Inventions & Discoveries", summary: "Who discovered/invented what, and in which field.", difficulty: "Easy", subtopics: ["Major inventions", "Nobel-relevant discoveries"] },
  ]),
  ...buildTopics(physics, [
    { name: "Mechanics & Basic Forces", summary: "Motion, force, work-energy-power basics as tested at SSC level.", difficulty: "Medium", subtopics: ["Newton's laws", "Work, energy, power"] },
    { name: "Heat, Light & Sound", summary: "Everyday physics: temperature, reflection/refraction, sound properties.", difficulty: "Medium", subtopics: ["Heat & temperature", "Light: reflection & refraction", "Sound"] },
    { name: "Electricity & Magnetism", summary: "Basic circuits, magnetism, and common electrical facts/units.", difficulty: "Medium", subtopics: ["Basic circuits & units", "Magnetism basics"] },
  ]),
  ...buildTopics(chemistry, [
    { name: "Elements, Compounds & the Periodic Table", summary: "Basic periodic table facts, common compounds, and their everyday uses.", difficulty: "Medium", subtopics: ["Periodic table basics", "Common compounds & uses"] },
    { name: "Acids, Bases & Everyday Chemistry", summary: "pH, common acids/bases, and chemistry facts embedded in daily life.", difficulty: "Easy", subtopics: ["Acids & bases", "Everyday chemical reactions"] },
  ]),
  ...buildTopics(biology, [
    { name: "Cell Biology & Classification", summary: "Cell structure and the five/six-kingdom classification of living things.", difficulty: "Medium", subtopics: ["Cell structure", "Classification of organisms"] },
    { name: "Plant & Animal Physiology", summary: "Photosynthesis, respiration, and basic physiology facts tested as one-liners.", difficulty: "Medium", subtopics: ["Photosynthesis & respiration", "Animal physiology basics"] },
  ]),
  ...buildTopics(staticGk, [
    { name: "National Symbols & Firsts", summary: "National symbols, and 'first in India' / 'first in the world' fact lists.", difficulty: "Easy", priority: "must", subtopics: ["National symbols", "Notable firsts"] },
    { name: "Important Places & Institutions", summary: "Headquarters, monuments, and institutions frequently asked as static facts.", difficulty: "Easy", subtopics: ["Headquarters of institutions", "Famous monuments"] },
  ]),
  ...buildTopics(currentAffairs, [
    {
      name: "Monthly Current Affairs Capsule",
      summary: "Rolling, dated current-affairs notes grouped by month. Never treat an old entry here as still current — check the month tag.",
      difficulty: "Medium",
      priority: "must",
      subtopics: ["National affairs", "International affairs", "Appointments & summits"],
      tags: ["dated-content"],
    },
  ]),
  ...buildTopics(artCulture, [
    { name: "Classical Dance & Music", summary: "Classical dance forms, music gharanas, and associated states/artists.", difficulty: "Medium", subtopics: ["Classical dance forms", "Music traditions"] },
    { name: "Architecture, Festivals & UNESCO Sites", summary: "Temple architecture styles, major festivals, and UNESCO World Heritage sites in India.", difficulty: "Medium", priority: "could", subtopics: ["Architecture styles", "Major festivals", "UNESCO sites in India"] },
  ]),
  ...buildTopics(environment, [
    { name: "Ecosystems & Biodiversity", summary: "Ecosystem basics, biodiversity hotspots, and protected-area categories.", difficulty: "Medium", priority: "could", subtopics: ["Ecosystem basics", "Biodiversity hotspots in India", "National parks & sanctuaries"] },
    { name: "Environmental Issues & Conventions", summary: "Pollution, climate change basics, and major international environmental agreements.", difficulty: "Medium", priority: "could", subtopics: ["Pollution & climate change basics", "Key international conventions"] },
  ]),
  ...buildTopics(schemes, [
    { name: "Major Central Government Schemes", summary: "Flagship schemes, their launch year, and core objective — a fast-changing list, keep it updated.", difficulty: "Medium", priority: "could", subtopics: ["Social welfare schemes", "Financial inclusion schemes", "Skill/employment schemes"], tags: ["dated-content"] },
  ]),
  ...buildTopics(awards, [
    { name: "National & International Awards", summary: "Padma awards, Nobel Prize, Bharat Ratna, and major sporting/literary awards.", difficulty: "Medium", subtopics: ["Padma awards & Bharat Ratna", "Nobel Prize", "Sporting & literary awards"] },
  ]),
  ...buildTopics(sports, [
    { name: "Sports Terminology & Events", summary: "Terms, trophies, and venues associated with major sports.", difficulty: "Medium", subtopics: ["Sport-specific terminology", "Major trophies & tournaments"] },
    { name: "Recent Sporting Achievements", summary: "Recent tournament winners and record-holders — dated, verify before relying on it.", difficulty: "Medium", subtopics: ["Recent tournament winners"], tags: ["dated-content"] },
  ]),
  ...buildTopics(books, [
    { name: "Famous Books & Authors", summary: "Well-known books paired with their authors, including autobiographies of notable figures.", difficulty: "Easy", priority: "could", subtopics: ["Classic literary works", "Autobiographies"] },
  ]),
  ...buildTopics(days, [
    { name: "Important National & International Days", summary: "Dates and themes of commonly asked observance days.", difficulty: "Easy", subtopics: ["National observance days", "International observance days"] },
  ]),
  ...buildTopics(organizations, [
    { name: "International Organizations", summary: "UN bodies and other major international organizations — HQ, founding year, purpose.", difficulty: "Medium", priority: "could", subtopics: ["UN & its agencies", "Other major international bodies"] },
    { name: "National Organizations & Regulatory Bodies", summary: "Indian regulatory and apex bodies (RBI, SEBI, NITI Aayog, etc.).", difficulty: "Medium", priority: "could", subtopics: ["Financial regulators", "Apex national bodies"] },
  ]),
  ...buildTopics(misc, [
    { name: "Abbreviations & Full Forms", summary: "Common abbreviations tested directly as one-liners.", difficulty: "Easy", priority: "could", subtopics: ["Government & finance abbreviations", "Tech & science abbreviations"] },
    { name: "Miscellaneous One-Liners", summary: "A catch-all for static facts that don't fit neatly elsewhere but show up often.", difficulty: "Easy", priority: "could", subtopics: ["General miscellaneous facts"] },
  ]),
];
