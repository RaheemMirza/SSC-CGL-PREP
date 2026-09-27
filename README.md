# SSC CGL Prep

A personal SSC CGL (Tier 1 & Tier 2) preparation and practice platform. Runs entirely
in your browser — no backend, no account, no server. Everything you do is stored in
`localStorage` on your own machine.

This README is written for **you, six months from now**, trying to remember how any
of this works, as much as for anyone else picking up the code.

---

## 1. What this actually does

- **Practice that never runs out.** A curated static question bank (~170 hand-written
  SSC-style questions) is blended with **procedural generators** for 12 of the
  highest-weightage Quant/Reasoning topics (percentage, profit & loss, time & work,
  blood relations, series, etc.). Those generators produce a genuinely unlimited
  stream of fresh, always-correct questions — the correct answer is *computed*, not
  claimed, so it can't drift out of sync with the question.
- **An exact-replica mock exam.** The Tier 1 mock is built directly from
  `src/data/examConfig.ts` — 100 questions, 4 sections of 25, independent 15-minute
  sectional timers that lock automatically, +2/−0.5 marking. Because it's assembled
  fresh from the practice pool every time (static-first, generator-filled), you can
  take a full mock as many times as you want and never see the exact same paper twice.
- **Real progress tracking.** Every attempt — practice or mock — is logged and turned
  into a weak-topic list, a slow-topic list, and a speed trend, all computed only from
  *your own* data (see `src/lib/adaptiveEngine.ts`). There is no seeded/fake progress
  anywhere.
- **Never a fabricated PYQ.** See §7 — this is a hard rule, not a suggestion.

## 2. Tech stack

- React 18 + TypeScript, Vite
- Tailwind CSS (custom tokens in `tailwind.config.js` — brand blue + per-subject
  accent colors)
- Zustand for state (3 stores — see §5)
- React Router v6 (`HashRouter` — deliberate, see §3b, so this deploys to a static
  host like GitHub Pages with no server rewrite rules needed)
- Recharts (Analytics page), lucide-react (icons)
- No backend. No database. `localStorage` only.

## 3. How to run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # preview the production build
```

Node 18+ recommended.

## 3b. Don't have Node installed? Two zero-setup options

**Option A — host it on GitHub Pages (just use the app, no install at all).**
This repo already includes a GitHub Actions workflow that builds and deploys it
automatically:

1. Create a new **public** GitHub repo and push this project to it (see the
   commands in the next section if you're starting from this zip).
2. In the repo, go to **Settings → Pages** and, under "Build and deployment",
   set **Source** to **GitHub Actions**. (You only need to do this once.)
3. Push to `main` (or go to the **Actions** tab and run "Deploy to GitHub
   Pages" manually). The workflow at `.github/workflows/deploy.yml` builds the
   app and deploys it.
4. Your app is live at `https://<your-username>.github.io/<repo-name>/` —
   the workflow already sets the correct base path for you, whatever you name
   the repo. Give the first run a couple of minutes.

The app uses a hash-based router (`/#/mock`, `/#/practice`, …) specifically so
this works with **zero server configuration** — GitHub Pages only serves
static files and can't run URL-rewrite rules, and a hash route never gets sent
to the server on refresh or a direct link, so there's nothing to configure.

Since everything is stored in your browser's `localStorage`, your progress
lives on whichever device/browser you use the Pages URL from — it doesn't
sync between devices (there's no backend to sync through). Use Settings →
Export/Import if you want to move your data to another browser.

**Option B — edit/extend it with GitHub Codespaces (a full dev environment
in your browser, no local install).** Open the repo on GitHub, click the
green **Code** button → **Codespaces** tab → **Create codespace on main**.
A `.devcontainer/devcontainer.json` is already set up to run `npm install`
automatically and forward the dev server's port — once it's ready, run
`npm run dev` in the terminal and click the popup to open the app in a
browser tab.

### Pushing this project to a new GitHub repo for the first time

If you haven't put this on GitHub yet:

```bash
cd ssc-cgl-prep
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then follow Option A's steps 2–4 above.

## 3c. Must / Should / Could topic priority

Every Tier 1 topic (all 103) carries a `priority: "must" | "should" | "could"` —
a stable, general guide to how consistently that topic shows up in the real
exam, based on well-established SSC CGL prep-community consensus (not an exact
guaranteed question count, which varies shift to shift). It defaults to
`"should"`; only genuinely high-frequency (`"must"`) or narrower/lower-frequency
(`"could"`) topics are called out explicitly in `src/data/syllabus/{quant,reasoning,english,ga}.ts`.

This feeds three places:
- **Practice hub** — a "Drill must-do topics" card, plus a by-priority section.
- **Study Planner** — not-yet-started topics are sorted must-first before being
  rotated across the week.
- **Dashboard** — a "must-do topic coverage" widget (X/29 must-do topics
  attempted at least once), useful from day one even before any weak-topic
  data exists.

## 4. Project structure

```
src/
  types/index.ts          # The entire data model. Start here.
  data/
    examConfig.ts          # Tier 1 / Tier 2 paper structure — sections, marks, timers.
                            #   Change a number here and every mock reflects it.
    syllabus/               # Subjects → chapters → topics (the full syllabus tree).
    questions/              # ~170 static questions, grouped by subject.
    formulas.ts              # Quant/Reasoning/English formula & shortcut reference.
    content/                # (mostly empty — see §9, "what's not done")
  lib/
    persistence.ts          # The ONE place that touches localStorage.
    rng.ts                   # Shared random-number / MCQ-option-building helpers.
    generators/              # The 12 procedural question generators + registry.
    questionSelector.ts      # Blends static + generated questions, freshness-ranked.
    questionResolver.ts      # Resolves a question id (static or generated) back to
                              #   the actual Question object.
    mockTestEngine.ts        # Builds a MockTestBlueprint from an examConfig paper.
    scoring.ts                # Turns a finished mock's attempts into a scored result
                              #   + a topic-level "what to focus on" breakdown.
    mockHistory.ts            # Rebuilds a past mock's full analysis from just its
                              #   persisted result + session (used for history, too).
    sessionRuntime.ts          # The pure exam/practice state machine — timers,
                              #   sectional locking, answers, palette. No React here;
                              #   it's unit-testable on its own.
    adaptiveEngine.ts           # Weak/slow/strong topics, speed trend, recommendations.
    revisionScheduler.ts        # Spaced-repetition staging (1/3/7/14/30 days).
    gamification.ts             # XP, streaks, badges.
    studyPlanGenerator.ts       # Turns your progress + inputs into a daily plan.
    search.ts                   # Client-side global search.
  store/
    useSettingsStore.ts    # Theme, sound, reduced motion, BYO AI key/toggle.
    useDataStore.ts        # Everything derived from your activity — progress,
                            #   mistakes, bookmarks, revision, gamification, plan.
    useSessionStore.ts     # The active practice/mock runner. Orchestrates the
                            #   engine/scoring/adaptiveEngine/gamification modules
                            #   above and writes through persistence on submit.
  components/
    layout/AppShell.tsx     # Sidebar (desktop) + bottom nav (mobile).
    runner/ExamRunner.tsx    # Shared UI for both practice sessions and mocks.
    ui/Primitives.tsx         # Card, Button, Badge, ProgressBar, etc.
  pages/                       # One file per route — see src/App.tsx for the list.
```

## 5. The store layer, briefly

Three Zustand stores, each a thin wrapper over pure functions in `src/lib/`:

- **`useSettingsStore`** — appearance + the (currently unused, see §10) AI key.
- **`useDataStore`** — a live view over everything in `localStorage`. Every mutating
  action calls a `persistence.ts` function, then `refresh()`s itself from the updated
  snapshot. This is what most pages read from.
- **`useSessionStore`** — the *only* stateful, non-persisted store. Holds the
  in-progress practice/mock run (`sessionRuntime.SessionRuntime`). On `submit()`, it:
  1. Turns the runtime into real `AttemptRecord[]` + a `PracticeSession`.
  2. Writes them through `persistence.recordAttempts()` (one localStorage write).
  3. Recomputes `topicProgress` for **all** attempts via `adaptiveEngine.recomputeAllProgress`.
  4. Applies XP/streak/badges via `gamification.ts`.
  5. Auto-creates a revision schedule for any topic that just crossed 5 cumulative attempts.
  6. If it was a mock, scores it (`scoring.scoreMockTest`) and saves the result.

A page never talks to `localStorage` directly — always through one of the three stores.

## 6. How the mock engine builds an "exact replica"

`buildMockTest()` in `mockTestEngine.ts` reads a paper config from `examConfig.ts` and,
for each section, asks `questionSelector.selectQuestionsForSubject()` for exactly that
many questions. That function:

1. Splits the section's question count across the subject's topics (hero topics —
   the ones with a full authored lesson — get 1.6× the weight of breadth topics).
2. For each topic, blends static-bank questions (freshest-first, i.e. whatever you
   haven't seen recently) with procedurally-generated ones, if that topic has a
   generator.
3. If a topic's static pool runs dry, backfills from any *other* generator-covered
   topic in the same subject.
4. If there's truly no generator coverage anywhere (English, GA), falls back to
   reusing already-seen questions, oldest-seen-first — so a mock is **always**
   buildable, indefinitely, just with graceful degradation on the two subjects that
   deliberately have no procedural generation (see §7 for why).

Every question used (static or generated) gets cached (`persistence.cacheGeneratedQuestions`)
so it can still be shown on the results/review screen — even a past one — via
`questionResolver.resolveQuestion()`.

## 7. Content-quality policy — read this before adding questions

**A question is only ever labeled `"verified-pyq"` if its exact wording, year, and
shift have been checked against a real source.** `"unverified-pyq"` is for a claimed
PYQ whose source couldn't be fully confirmed. Everything else — the ~170 static
questions and everything the generators produce — is `"practice"` or `"ai-generated"`,
and is never presented as a genuine past paper question.

This is *why* the PYQ Bank (`/pyq`) is empty right now: no real PYQs have been added
yet, and the app will not pretend otherwise. To add real ones, append to
`src/data/questions/*.ts` with `type: "verified-pyq"`, a `year`, `shift`, and
`sourceReference`.

This is also why GA (General Awareness) and English vocabulary/RC have **no
procedural generators** — those are facts and passages, not formulas. Generating them
procedurally looks like the same "always-correct" guarantee the math/reasoning
generators have, but it isn't — you'd be one hallucinated fact away from mislabeled
content. If you want more GA/English volume, hand-author it (or see §10 for the AI
option, which still keeps AI-generated content clearly tagged `"ai-generated"`, never
merged into the PYQ bank).

## 8. Adding a new subject/topic/generator

- **New topic:** add it to the right file in `src/data/syllabus/`. It'll show up in
  the Syllabus page and Topic page automatically (with a "light content" badge if you
  haven't written a full lesson).
- **New static questions:** add a `QSpec` to `src/data/questions/<subject>.ts` via
  `buildQuestions()` — it resolves `subjectId`/`chapterId`/`topicId` from the real
  `Topic` object, so ids can't drift.
- **New generator:** write a function matching `(difficulty: DifficultyLevel) => Question`
  in `src/lib/generators/`, register it in `src/lib/generators/index.ts` against the
  topic's `slug`. That's the only line anything else needs — `questionSelector.ts`
  picks it up automatically. Test it directly with `tsx` (no bundler needed) — every
  existing generator was validated this way, running thousands of iterations checking
  for duplicate/invalid options before being wired in.

## 9. What's genuinely not done yet

Being direct about this rather than burying it:

- **All 103 Tier 1 topics now have real lesson content** (`src/data/content/{quant,reasoning,english,ga}.ts`
  — a brief explanation plus key formulas/facts, shortcuts, common traps, and a
  "key points" quick-revision list; worked examples where they add real value). The
  Topic page renders this above the practice button, before you'd start drilling
  questions. GA content deliberately sticks to stable, well-established facts
  (Constitution dates, physics/chemistry fundamentals, national symbols) and, for
  genuinely time-sensitive sub-topics (current affairs, recent sporting achievements,
  specific award winners, government scheme details), teaches the *study strategy*
  instead of asserting specific facts that would go stale or risk being wrong —
  consistent with this project's "never assert something as fact that might not be"
  policy. `GaNote[]` (a separate, more current-affairs-dated note format) still isn't
  populated — the `LessonContent` GA entries cover the stable material instead.
- **Tier 2 mocks** — `mockTestEngine.buildTier2Paper1Mock()` works structurally (reads
  `TIER2_PAPER1_CONFIG`, correctly skips the non-MCQ DEST typing section), but there's
  no Tier 2 question content yet, so it isn't wired into any UI button. Tier 1 is
  fully real end-to-end; Tier 2 needs a question bank before it's worth exposing.
- **Practice-session history list** — you can review the mock you just took, or any
  past mock (`/mock/results/:id`), but past *practice* sessions aren't individually
  browsable after you navigate away (only their aggregate effect on your topic
  progress persists). Mock history was prioritized since re-checking exam performance
  matters more than replaying a random practice set.
- **PWA polish** — the manifest/service worker/icons exist and the service worker is
  registered in production, but it's a hand-written app-shell cache, not
  `vite-plugin-pwa`. Fine for personal use; swap it if you want proper background sync.

None of the above are dead ends in the UI — every page that exists is fully wired to
real data and real actions. This list is about breadth of authored content, not
broken functionality.

## 10. Connecting a real AI API (optional, not built)

`Settings` already has a place to paste an Anthropic API key and a toggle — but
nothing calls it yet. If you want to add an AI tutor or GA/English content generator:

```js
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": apiKey, // from useSettingsStore().aiApiKey
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  },
  body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1024, messages: [...] }),
});
```

**Security note:** calling the API directly from the browser with a user-pasted key is
a reasonable pattern for a tool only you run locally. It is *not* safe to deploy this
app publicly as-is with that pattern — anyone opening devtools could read the key out
of `localStorage`. If you ever host this for others, proxy the call through a small
server you control instead. Any AI-generated question must be saved with
`type: "ai-generated"` — never merge it into the PYQ bank (§7).

## 11. Your data

Everything lives under one `localStorage` key (`ssc-cgl-prep:data`). Settings → Export
gives you the whole thing as JSON; Import merges a backup back in (dedupes by id);
Reset wipes it. There's no server round-trip anywhere — export the file yourself if
you want a real backup.
