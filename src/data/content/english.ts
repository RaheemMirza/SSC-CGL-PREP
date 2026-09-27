import type { LessonContent } from "@/types";

export const ENGLISH_LESSONS: LessonContent[] = [
  {
    topicId: "english-grammar--error-detection-spotting-the-error",
    whatIsIt: ["A sentence is split into parts; you must find which part (if any) contains a grammatical error."],
    sscShortcuts: ["Check in a fixed order every time: subject-verb agreement → tense consistency → preposition usage → article usage → countable/uncountable quantifiers (few/less, many/much). Most errors fall into one of these five buckets."],
    commonTraps: ["Assuming a part is wrong just because it 'sounds unusual' — check it against an actual rule before marking it as the error.", "Missing a subject-verb agreement error when the subject and verb are far apart in a long sentence."],
    quickRevision: [
      "Check subject-verb agreement first — the single most common error type.",
      "Then check tense consistency across the whole sentence.",
      "Then prepositions, articles, and countable/uncountable quantifiers.",
      "'No error' is a valid, correct answer choice — don't force an error where none exists.",
    ],
  },
  {
    topicId: "english-grammar--sentence-improvement",
    whatIsIt: ["A sentence (or an underlined part of it) may be awkward, redundant, or ungrammatical; choose the option that best replaces it while keeping the original meaning."],
    sscShortcuts: ["Read the whole sentence with each option substituted in — an option that's grammatically correct in isolation can still be wrong if it changes the sentence's meaning or tense."],
    commonTraps: ["Picking an option that fixes the grammar but subtly changes the intended meaning or tense of the original sentence."],
    quickRevision: [
      "The replacement must preserve the original meaning, not just be grammatically valid on its own.",
      "Read the full sentence with the candidate replacement substituted in before deciding.",
      "'No improvement needed' is a valid choice when offered.",
    ],
  },
  {
    topicId: "english-grammar--fill-in-the-blanks",
    whatIsIt: ["Choose the word or phrase that correctly completes a sentence, based on grammar, meaning, and idiomatic usage."],
    sscShortcuts: ["Read the whole sentence first (not just up to the blank) — later words often determine which tense/preposition the blank needs."],
    commonTraps: ["Picking a word that's grammatically valid but doesn't fit the sentence's intended meaning or common idiomatic pairing (e.g. wrong preposition after a specific verb)."],
    quickRevision: [
      "Read the entire sentence before choosing — context after the blank matters as much as before it.",
      "Watch for idiomatic verb+preposition pairings (depend ON, insist ON, differ FROM) which are tested often.",
    ],
  },
  {
    topicId: "english-grammar--active-and-passive-voice",
    whatIsIt: ["Active voice: subject performs the action. Passive voice: subject receives the action. Converting between them requires matching the tense exactly."],
    keyFormulas: [{ formula: "Active: Subject+Verb+Object → Passive: Object+be(matching tense)+V3(past participle)+by+Subject", note: "The 'be' verb's tense must match the original sentence's tense exactly." }],
    sscShortcuts: ["Identify the tense of the active sentence FIRST, then pick the matching form of 'be' for the passive version — this is the step most errors come from skipping."],
    commonTraps: ["Using the wrong tense of 'be' in the passive form (e.g. using 'is' when the original was in past tense, needing 'was').", "Forgetting modal verbs (can, must, should) need 'be + V3' in the passive, not a bare V3."],
    quickRevision: [
      "Passive = Object + be(matching original tense) + V3 + by + Subject.",
      "Identify the original tense before converting — the 'be' verb must match it exactly.",
      "Modal verbs (can/must/should) become 'modal + be + V3' in the passive.",
    ],
  },
  {
    topicId: "english-grammar--direct-and-indirect-speech",
    whatIsIt: ["Direct speech quotes exact words; indirect (reported) speech reports them without quotation marks, requiring tense/pronoun/time-word shifts."],
    keyFormulas: [{ formula: "Past reporting verb → tense generally shifts one step back (present→past, past→past perfect)", note: "'This/here/now' become 'that/there/then'." }],
    sscShortcuts: ["Change pronouns to match the new speaker's perspective FIRST, then shift tense, then shift time/place words — doing it in a fixed order avoids missing a step."],
    commonTraps: ["Forgetting to shift 'this/here/now' style words to 'that/there/then' even when the tense shift is done correctly.", "Over-shifting tense when the reporting verb itself is in the present tense (no backward shift needed then)."],
    quickRevision: [
      "If the reporting verb is past tense, shift the quoted tense one step back.",
      "This→that, here→there, now→then, today→that day.",
      "Pronouns change to match the new speaker's/listener's perspective.",
      "No tense shift is needed if the reporting verb is in the present tense.",
    ],
  },
  {
    topicId: "english-grammar--para-jumbles-sentence-rearrangement",
    whatIsIt: ["Rearrange a set of jumbled sentences into their original, logically coherent order."],
    sscShortcuts: ["Find the OPENING sentence first (usually introduces the subject/topic generally, without pronouns referring back to something not yet mentioned) — this anchors the whole order.", "Look for linking clues: pronouns ('it', 'this', 'they') that must refer to something in an earlier sentence, and connector words (however, therefore, because) that hint at what precedes them."],
    commonTraps: ["Starting with a sentence that begins with a pronoun or connector word referring to something — those almost never open the passage."],
    quickRevision: [
      "Find the true opening sentence — general topic introduction, no dangling pronoun references.",
      "Use pronouns and connectors as clues linking sentences to their predecessors.",
      "Build the chain from both ends (confirm the opening AND the closing sentence) if unsure of the middle.",
    ],
  },
  {
    topicId: "english-grammar--spelling-and-commonly-confused-words",
    whatIsIt: ["Identify correct spelling, or choose the right word among commonly confused pairs (their/there, affect/effect, its/it's, principal/principle)."],
    sscShortcuts: ["Learn confused-word pairs by their DISTINCT meaning, not just spelling — e.g. 'affect' is usually a verb, 'effect' is usually a noun."],
    commonTraps: ["Relying purely on how a word 'looks right' — commonly confused words are specifically chosen because both spellings look plausible."],
    quickRevision: [
      "Learn confused pairs by meaning/part-of-speech, not just spelling: affect(verb)/effect(noun), its(possessive)/it's(it is), their(possessive)/there(place)/they're(they are).",
      "When unsure, substitute the full/expanded meaning mentally (e.g. 'it is' for 'it's') to check it still makes sense.",
    ],
  },
  {
    topicId: "english-vocabulary--synonyms-and-antonyms",
    whatIsIt: ["Choose the word closest in meaning (synonym) or opposite in meaning (antonym) to a given word."],
    sscShortcuts: ["Sort the options by whether they feel positive, negative, or neutral in tone before recalling exact definitions — the correct answer almost always shares the same emotional register as the question word, letting you eliminate options even with partial vocabulary."],
    commonTraps: ["Picking a word that's merely 'related' to the topic rather than a true synonym/antonym in meaning."],
    quickRevision: [
      "Match the emotional tone (positive/negative/neutral) of the question word first — it narrows the options fast.",
      "A true synonym/antonym must match in BOTH meaning and typically part of speech.",
      "Build vocabulary in themed clusters rather than isolated word lists — it aids recall under time pressure.",
    ],
  },
  {
    topicId: "english-vocabulary--one-word-substitution",
    whatIsIt: ["A phrase/definition is given; find the single word that means the same thing."],
    sscShortcuts: ["Learn substitutions in themed clusters by suffix pattern: -phobia (fear of), -logy (study of), -cide (killing of), -cracy (rule by) — clustering by pattern is far faster to recall than a flat alphabetical list."],
    commonTraps: ["Confusing two similar-sounding one-word substitutions that describe subtly different but related concepts (e.g. someone who studies X vs someone who collects X)."],
    quickRevision: [
      "Cluster by suffix meaning: -phobia (fear), -logy (study), -cide (killing), -cracy (governance).",
      "Read the FULL definition carefully — a small wording difference often points to a different specific word.",
    ],
  },
  {
    topicId: "english-vocabulary--idioms-and-phrases",
    whatIsIt: ["Choose the meaning of a given idiom/phrase, or the idiom that matches a given meaning — the words' LITERAL meaning is usually irrelevant."],
    sscShortcuts: ["Never translate an idiom literally — always think of it as a single fixed unit of meaning learned by exposure, not derived from its individual words."],
    commonTraps: ["Trying to reason out an idiom's meaning from its individual words' literal definitions — idioms are fixed expressions, not literal phrases."],
    quickRevision: [
      "Treat each idiom as one fixed unit of meaning — never translate word-by-word.",
      "Build a working list of high-frequency SSC idioms and their meanings ahead of time; recall, don't derive.",
    ],
  },
  {
    topicId: "english-reading-and-comprehension--cloze-test",
    whatIsIt: ["A passage with several blanks, each with 4 options; fill every blank so the whole passage reads coherently."],
    sscShortcuts: ["Read the ENTIRE passage once before filling any blank — later sentences often disambiguate an earlier blank's required tense, tone, or topic. Fill the blanks you're most confident about first."],
    commonTraps: ["Filling each blank in isolation as you read, without considering how it fits the passage's overall tone/argument established later on."],
    quickRevision: [
      "Read the whole passage first, blanks and all, before answering any of them.",
      "Fill your most confident blanks first — surrounding filled words help disambiguate the harder ones.",
      "Maintain consistent tense and tone with the rest of the passage.",
    ],
  },
  {
    topicId: "english-reading-and-comprehension--reading-comprehension",
    whatIsIt: ["A passage followed by questions testing literal understanding, inference, vocabulary-in-context, and the author's tone/main idea."],
    sscShortcuts: ["Skim the passage once for overall structure/main idea, then go question-by-question, returning to the relevant part of the passage rather than relying on memory.", "For 'main idea' questions, the answer usually mirrors the passage's opening or closing sentence, not a minor supporting detail."],
    commonTraps: ["Answering from general knowledge about the topic instead of strictly what the passage states or implies.", "Picking an option that's true in general but not actually supported by THIS passage."],
    quickRevision: [
      "Answer strictly from the passage — not from outside knowledge about the topic.",
      "For main-idea questions, check the opening/closing sentences first.",
      "Return to the specific paragraph for detail questions rather than relying on memory of the whole passage.",
    ],
  },
];
