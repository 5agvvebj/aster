# Development log

## 2026-10-31 — Milestone 1: repository and product foundation

### Research

- The challenge workspace originally contained only the assignment PDF; no
  starter project or existing source was supplied.
- Reviewed the live, logged-out Melooha website, its FAQ, Google Play and Apple
  App Store listings, and the public websites of AstroTalk and AstroSage.
- Submitted one anonymous Astropedia educational question. Personal Vaani
  onboarding, personal chart answers, account history persistence, and payment
  completion were not tested.
- Public homepage observations and published FAQ/store claims are kept distinct
  in the README and final milestone handoff.

### Product decision

- Provisionally selected evidence-first educational Q&A as the MVP: question
  discovery, a carefully scoped answer, visible support, a safe insufficient-
  evidence state, saved insights, and an uncharged demo top-up.
- Avoid personal chart claims until chart data and a verifiable chart-facts
  pipeline exist.
- The provisional success metric is the share of users who return within seven
  days after saving an answer. This is a hypothesis; instrumentation has not
  been implemented.

### Engineering choices

- Created a new Next.js App Router project with TypeScript, Tailwind CSS, and
  Lucide icons. The workspace PDF was left unchanged.
- Created an original visual identity and a CSS celestial globe with orbital
  animation, responsive sizing, and reduced-motion support. No Melooha assets
  were copied.
- Kept a supported sample answer tied to one exact reviewed prompt. Other
  submitted questions show an insufficient-evidence state rather than a
  success-shaped generic answer. The current UI state is a prototype, not the
  production backend.
- Selected Next.js as the initial full-stack framework. Database and model
  integration decisions remain pending implementation and free-tier deployment
  verification.

### Problems and fixes

- The starter scaffold used the default Next.js landing page, title, and
  network-loaded Google font. Replaced these with the product UI, metadata, and
  system font stack so local builds do not depend on fetching a font.
- Avoided broad “AI answer” claims in the prototype because there is no model
  pipeline yet.

### Verification

- Scaffold generation completed with npm. npm reported 16 moderate dependency
  audit findings; none were force-fixed because that could introduce
  unreviewed breaking changes.
- Lint/build and browser/mobile interaction checks are pending this milestone's
  validation.

### Remaining

- Audit and choose the production database/hosting path; implement migrations,
  isolated demo identities, persistent balance, and atomic ledger operations.
- Add stored facts, retrieval, claim/evidence validation, Gemini primary and
  Groq fallback using the same validation pipeline.
- Add validated streaming, saved-answer persistence, rate limits, structured
  logs, input schemas, and explicit error states.
- Implement retryable idempotent jobs and the fixed-set evaluation harness.
- Add automated tests, CI, Docker/local setup, docs, deployment, and demo script.
- Revisit product hypotheses once authenticated onboarding and personal
  Vaani-flow exploration can be performed safely.

## 2026-10-31 — MVP implementation and verification

### Implemented

- Added the PostgreSQL/Drizzle schema and migration for isolated guest sessions,
  a credit ledger, evidence facts, answers, saved insights, rate-limit buckets,
  and background jobs.
- Added signed HTTP-only demo sessions, persistent question balance,
  transactional/idempotent question spending and demo top-ups, request
  validation, same-origin checks, and per-session rate limits.
- Added database-backed fact retrieval and a scope guard. Gemini is the primary
  evidence selector and Groq is the fallback; model output is limited to
  retrieved evidence IDs, checked in application code, and never rendered as
  free-form answer prose. With no keys, the same pipeline uses an explicit
  curated mode.
- Added validated SSE events, answer history, save/unsave APIs, a retryable
  saved-insight summary worker, and a nine-question deterministic evaluation
  harness.
- Added PostgreSQL integration tests, GitHub Actions CI, API and architecture
  docs, product recommendation, exploration write-up, evaluation methodology,
  and demo script.

### Verification

- `npm run lint`: passed.
- `npm test`: passed, 4 test files and 14 tests.
- `npm run build`: passed; all App Router routes compiled.
- `npx tsc --noEmit`: passed, including the integration test sources.
- `docker compose config --quiet`: passed, and the local Next.js landing page
  returned HTTP 200 in a smoke check.
- `npm run evaluate`: passed, 9 cases; grounding 1.0, relevance 1.0,
  unsupported-claim rate 0.0, insufficient-evidence accuracy 1.0, no failures.
- `npm audit --omit=dev`: passed with zero production advisories. The
  full audit still reports 20 moderate development-dependency findings,
  primarily transitive `minimatch` and `esbuild` chains; npm's suggested forced
  fixes downgrade core tooling, so no breaking override was applied.
- `npm run test:integration`, database migration, live model calls, and
  browser end-to-end testing were not run: Docker's Linux engine was unavailable
  and no local PostgreSQL service was verified. The integration suite is wired
  to CI with PostgreSQL but has not yet been observed passing there.
- No production deployment, public GitHub repository, provider-backed response,
  or screenshot is claimed.

### Remaining before public use

- Run the PostgreSQL integration suite and manually verify UI/API/worker flows
  with Docker running.
- Add provider credentials only to local or deployment secret storage, then
  verify the Gemini-to-Groq fallback with controlled questions.
- Review the small curated fact corpus and its citations with a domain expert;
  it is not a validated astrology knowledge base.
- Create the public repository and deployment under the user's account, if
  desired; confirm free-tier service limits and secret handling first.
- Ask the user to check the mobile experience and final product fit; no logged-
  in Melooha personal flow was tested.
