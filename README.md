# Workline — AI request triage (practical test)

A small feature for a "connect users with craftsmen" app: a user describes a problem in plain
language, the app suggests a **category** and **priority**, the user can edit that suggestion,
confirm it, and see it in a request list. A single message describing more than one problem is
automatically split into separate requests.

## Stack & why

- **Next.js 14 (App Router) + TypeScript**, one project for both frontend and backend.
  Next.js API routes act as the "simple backend" the brief asks for, so the AI API key never
  reaches the browser — the frontend only ever talks to `/api/classify` and `/api/requests` on
  the same origin.
- **Tailwind CSS** for styling, mobile-first from the ground up (see "Web + Mobile" below).
- **Storage**: a flat JSON file (`data/requests.json`) via `lib/store.ts`. The brief explicitly
  allows "an in-memory array, a JSON file, or a simple SQLite" — a JSON file was the best fit for
  a few hours of work: no schema/migration overhead, but (unlike a pure in-memory array) it
  survives a server restart.
- No database, no ORM, no auth — out of scope for this test.

## Steps to run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

- **"New request"** (`/`) — describe a problem, get a suggestion, edit it, save it.
- **"All requests"** (`/requests`) — see everything that's been saved.

No environment variables are required to run the app — see "AI classification" below.

## AI classification

**Tools I used while building this:** Claude (via the Claude.ai chat interface) to scaffold the
Next.js project structure, write the heuristic mock classifier's keyword banks (English +
Arabic, since the brief itself is bilingual), and draft this README. I reviewed and adjusted
everything it produced — in particular the splitting heuristic in `lib/ai.ts` (`splitIntoSegments`)
went through a couple of iterations after testing it against the brief's own example sentences.

**How classification actually works** (`lib/ai.ts`, entry point `classifyProblem`):

1. If `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY` as a fallback) is set in the environment, the
   request text is sent to that provider with a system prompt asking it to return a JSON array of
   `{description, category, priority, confidence}` — the model handles both classification *and*
   the multi-problem split in one call, which is far more robust than the heuristic below.
2. **Otherwise (the default, no key required)**, a small keyword-based **mock classifier** runs
   locally:
   - Each category (`plumbing`, `electrical`, `carpentry`, `ac`, `insulation`, `flooring`) has a
     list of English + Arabic keywords; the category with the most keyword hits wins, defaulting
     to `other` if there are no hits.
   - A separate list of "urgent" signal words (flooding, no water/power, gas smell, fire, "عاجل",
     "غرق", "خطر", ...) sets priority regardless of category.
   - For the multi-problem case, the text is split on connector words ("and", "also", " و ",
     "؛", ...), but **only kept as a split if the resulting pieces land in different categories** —
     so "the sink is leaking and dripping under the cabinet" is *not* split (same category, one
     problem), while "leak in the kitchen and the power is out" *is* (two categories, two
     problems).

I didn't have a billed API key on hand while doing this test, so the mock is what actually
ships and runs by default — swapping in a real key is a one-line env var change, no code changes.
I'd use the real-LLM path in production: it's markedly better at splitting Arabic text (see
"Known limitations") and doesn't need a maintained keyword list.

**Why a backend proxy either way:** even for the mock path, routing through `/api/classify`
keeps the classification logic swappable and server-side, so adding a real key later doesn't
touch the frontend at all.

## Web + Mobile

Built as a **mobile-first responsive web app** (the brief's baseline requirement) rather than a
separate native app, given the time budget — a single Next.js/Tailwind codebase covers phone,
tablet, and desktop. The layout is a single centered column that reflows from stacked fields on
narrow screens to a two-column ticket layout at `sm:` breakpoints (see `TicketCard.tsx` and the
requests list). I did not build the optional native (Flutter/React Native) bonus version.

## Project structure

```
app/
  page.tsx                # "New request" flow (client component)
  requests/page.tsx        # "All requests" list (server component, reads the store directly)
  api/classify/route.ts    # POST text -> AI-suggested {category, priority} item(s)
  api/requests/route.ts    # GET all requests / POST confirmed items to save
  layout.tsx, globals.css
components/
  TicketCard.tsx           # editable category/priority card shown after classification
  NavTabs.tsx
lib/
  ai.ts                    # classification: mock + real-LLM paths
  store.ts                 # JSON file persistence
  types.ts                 # shared types + category list
data/requests.json         # the "database" — starts empty
```

## Technical decisions worth calling out

- **Split-then-classify vs. classify-then-split**: the mock splits the raw text first and
  classifies each piece independently, rather than classifying the whole text once. This keeps
  the logic easy to reason about and test, at the cost of being less accurate than letting an LLM
  see the whole message at once (which is what the real-LLM path does instead).
- **Confidence score**: shown as a small percentage on each ticket. For the mock it's a crude
  proxy (more keyword hits = higher shown confidence), not a calibrated probability — it's there
  mainly so the reviewer can see *some* signal for why a suggestion might need editing, which is
  the whole point of requirement #2 (manual edit before confirming).
- **One groupId per submission**: when a message is split into multiple requests, they're saved
  with a shared `groupId` so it would be trivial to later show "these came from one message" in
  the UI — not currently surfaced, but the data is there.
- **No client-side validation library**: the form is small enough that plain React state was
  simpler than pulling in a form library for this scope.

## Known limitations / what I'd improve with more time

- The mock splitter's Arabic handling is weak: Arabic "and" (و) is usually a *prefix* glued to
  the next word (e.g. `وبنفس`) rather than a separate token, so my space-delimited connector list
  misses it in some phrasings, even though the brief's own Arabic example uses that exact
  pattern. The real-LLM path doesn't have this problem — this is the clearest case where the
  mock's simplicity shows.
- Keyword ties (e.g. a sentence mentioning both "tile" and "sink") are broken by category order,
  not by which word is more central to the sentence — a real model call fixes this too.
- No editing/deleting of already-saved requests, no auth/multi-user separation, no pagination on
  the requests list, no automated tests. All reasonable next steps given more time, all
  deliberately cut to stay inside the test's time box.
- The JSON-file store isn't safe under concurrent writes — fine for a demo/single reviewer, not
  for production.
