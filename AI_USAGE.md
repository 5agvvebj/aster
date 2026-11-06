# AI usage trail

This log records AI-assisted research and implementation for the challenge.
No AI-generated content is presented as an observed product behavior unless
independently checked against a public source.

## 2026-11-06 — Submission enhancements

- The user prioritized a 3D constellation explorer, daily Hindu-calendar
  insights, six-language support, a living design guide, and submission
  materials. Existing code and documented architecture were inspected before
  changes.
- Added a sourced, rounded J2000 star dataset and a CSS 3D draggable globe.
  The view distinguishes IAU constellations from sidereal Rashis and credits
  SIMBAD; the schematic is not represented as a live telescope image.
- Added Panchang calculations using Astronomy Engine and an approximate
  Lahiri-style convention. Date, city, sunrise basis, and limitations are
  visible; no predictive advice is produced.
- Added reviewed translations and search aliases for six supported question
  facts. The server still validates evidence IDs and composes output only from
  the reviewed records. Answer locale is stored for consistent history and
  personal-reading scope checks cover each supported language.
- Added `/style-guide`, updated the architecture/product/demo/audit notes, and
  added focused grounding and Panchang tests.
- No production deployment, public repository, live-provider behavior, or
  authoritative calendar is claimed.

## 2026-10-31 — Milestones 1–9

### Research and direction

- Asked the assistant to inspect the challenge PDF, assess the available
  workspace, and propose product opportunities and an architecture before
  implementation.
- Asked the assistant to research the public Melooha product. The assistant
  inspected the public homepage, FAQ, Play Store and App Store listings, and
  public AstroTalk and AstroSage pages; it also submitted one anonymous
  Astropedia educational question.
- Research notes distinguish direct interaction from official FAQ/store copy.
  Login-protected personal chart flows and payments were not attempted.

### Generated or modified areas

- `src/app/page.tsx`: generated the responsive question-discovery, composer,
  demo top-up, streamed answer/evidence, saved-insight, and mobile-navigation
  interface.
- `src/app/globals.css`: generated the design tokens, responsive layout, visual
  states, CSS celestial globe/orbit animation, and reduced-motion behavior.
- `src/app/layout.tsx`: replaced starter metadata and remote-font setup.
- `src/app/api/` and `src/lib/`: implemented session and credit routes,
  evidence retrieval, provider selection, response validation, SSE, storage,
  rate limits, job processing, and error handling.
- `src/lib/db/schema.ts`, `drizzle/`, and Docker configuration: created the
  database model, migration, seed process, and local development stack.
- `integration/`, `src/**/*.test.ts`, `evaluation/`, `scripts/evaluate.ts`, and
  `reports/`: added automated unit/integration checks and a fixed labelled
  retrieval evaluation.
- `.github/workflows/ci.yml`, `docs/`, `README.md`, and this log: documented
  the API, architecture, product choice, research boundaries, evaluation
  limits, local setup, and demo script.
- `package.json` and lockfile: added UI, database, schema, and test dependencies
  plus their scripts.

### Human-directed changes and constraints

- The user approved the provisional evidence-first direction and asked for an
  original project in a new `melooha-challenge` folder, with premium 3D-style
  UI motion.
- Kept the animation lightweight and CSS-based. Added a reduced-motion media
  query and mobile-specific sizing.
- Left the assignment PDF untouched; did not copy Melooha branding assets.
- Did not fabricate credentials, model responses, personal app observations, or
  deployment status.

### Verification

- `npm run lint`, `npm test` (14 tests), `npm run build`, and `npm run evaluate`
  passed locally.
- Evaluation scored 1.0 grounding, 1.0 relevance, 0.0 unsupported-claim rate,
  and 1.0 insufficient-evidence accuracy across nine test cases. This does not
  measure live model output or production accuracy.
- The integration suite and browser end-to-end behavior remain unverified
  because PostgreSQL/Docker was unavailable. No provider keys or deployment
  credentials were supplied; no live provider call or deployment is claimed.
- `npm audit --omit=dev` reported zero production findings. A full audit still
  reports 20 moderate development-only transitive dependency findings; the
  suggested forced changes are breaking downgrades and were not applied.
