# Aster

Aster is a mobile-first, evidence-first Vedic astrology Q&A prototype for the
Melooha Engineering Challenge. It is an independent project and is not affiliated
with Melooha. The name, interface, and visual identity are original; the
planetary gallery uses locally bundled NASA mission images with expandable
source credits. Its orbital animation is a stylized, not-to-scale visualization.

## Current status

The app now includes the mobile-first UI, signed guest demo sessions, persistent
question balances and a credit ledger, atomic/idempotent demo top-ups and
question charges, database-backed evidence retrieval, evidence ID validation,
Gemini-primary/Groq-fallback provider selection, validated SSE answer delivery,
saved answers, recent-question history, browser-native voice input/output, and
a private Cosmic Journey timeline with persisted journal reflections. The
question and reviewed evidence flow is available in English, Hindi, Spanish,
French, German, and Portuguese; each answer stores its language and is composed
from explicitly reviewed translations rather than free-form model translation.
It also includes a browsable guide to all twelve Rashis, with convention-aware
traditional sign associations, individual pages, interactive planetary
galleries, reflection prompts, and links that carry a chosen question back to
the Q&A composer. Chart Learning presents a draggable
three-dimensional educational chart model with selectable house and Navagraha
concepts and carries a chosen concept into Vaani. The Rashi galleries use
locally served NASA photos with expandable credits and a not-to-scale animation.
The home discovery suggestion uses the guest's recent question topics when
available and explains why it appears.
`/birth-chart` calculates planetary sign/house placements and a simplified
Vimshottari period in the browser tab; birth details are not uploaded or saved.
Its optional “Fill sample values” action uses clearly labeled, fictional
New Delhi inputs to make the chart flow easy to try.
`/scan` uses bundled MediaPipe face/hand landmark models for local framing
detection. It does not interpret palm lines or infer traits or predictions.
`/sky` is a draggable 3D-style celestial sphere for twelve zodiac constellations
with rounded J2000 star positions and a cited SIMBAD source. It explicitly
distinguishes IAU constellations from sidereal 30-degree Rashis.
`/panchang` calculates local sunrise, tithi, nakshatra, yoga, karana, and
weekday for New Delhi by default, with selectable cities and dates. It uses
Astronomy Engine and an approximate Lahiri-style convention; traditional
calendars can differ, and the result is an educational reference rather than a
forecast.
`/style-guide` is a living page for shared visual tokens, typography, and
component patterns.

The app never renders free-form model answer text: providers can only select
IDs from the retrieved evidence set, and the server builds answer text from
those stored facts. With no provider keys configured it uses an explicit
curated-evidence mode. Unsupported questions return an insufficient-evidence
response. The current fact set is intentionally small and transparently
labelled as Aster-curated notes; it is a prototype reference set, not a complete
astrology knowledge base. Saving an answer schedules an idempotent background
job that generates a short summary. A fixed nine-question evaluation dataset
checks retrieval coverage and unsupported-question behavior.

PostgreSQL integration tests require a running database. Live-provider calls,
camera permission, and browser end-to-end flows require their respective local
configuration. The MediaPipe WASM runtime is loaded from a pinned jsDelivr
release; image frames are never sent to that service. Chart calculations use an
approximate Lahiri-style ayanamsa and are educational, not certified readings.
Public deployment and repository links will be added after provisioning and
mobile verification.

## Local development

Requirements: Node.js 20.9 or newer, npm, and a local PostgreSQL instance.
Docker is not required.

```bash
npm run local
```

After installing dependencies, copy `.env.example` to `.env` once and set
`DATABASE_URL` to your local PostgreSQL database plus a `DEMO_SESSION_SECRET`
of at least 32 characters. From then on, one command starts the app:
`npm run local`. It checks the database, applies migrations, seeds the reviewed
demo fact set idempotently, and starts Next.js.
To have the script start a local PostgreSQL cluster for you, also set
`LOCAL_POSTGRES_BIN` to its `bin` directory and `LOCAL_POSTGRES_DATA` to an
initialized cluster directory. Open
[http://localhost:3000](http://localhost:3000). Add Gemini and/or Groq API keys
to `.env` to try provider-backed evidence selection; with both keys blank, the
app demonstrates the curated evidence path without pretending a model ran.

To stop the app, press `Ctrl+C`. The PostgreSQL service is started separately
from the app and its data stays in the configured local database directory.
For manual development, start PostgreSQL, set `DATABASE_URL` and
`DEMO_SESSION_SECRET`, run `npm run db:migrate`, then `npm run dev`.

Useful checks:

```bash
npm run lint
npm test
npm run evaluate
npm run build
```

For PostgreSQL-backed tests, start a compatible database, set `DATABASE_URL`
and `DEMO_SESSION_SECRET`, then run:

```bash
npm run test:integration
```

GitHub Actions runs lint, unit and PostgreSQL integration tests, evaluation,
production dependency audit, and the production build.

No payment details are used or accepted.

## Product direction

Help a curious user move from question discovery to a clear explanation, see
what evidence supports it, save an insight, and return later. The initial
content scope is general Vedic astrology education, not personalized prediction.
The key trust behavior is to say when the reviewed evidence does not support an
answer rather than improvise.

## Project notes

- [Exploration write-up (with screenshots)](./docs/exploration.md)
- [Idea, audience, metric, and tracking](./docs/product-idea.md)
- [Architecture note and data model](./docs/architecture.md)
- [Functional audit and feature status](./docs/functional-audit.md)
- [Cosmic Journey and local data API](./docs/api.md#cosmic-journey)
- [API contract](./docs/api.md)
- [Evaluation methodology and limitations](./docs/evaluation.md)
- [Two-minute demo script](./docs/demo-script.md)
- [Living design system](./docs/design-system.md)

## Challenge research and limitations

The public Melooha site was inspected on 2026-10-31. The logged-out page exposed
Vaani and Astropedia modes, suggested questions, a recent-readings area, and a
question-purchase dialog. An anonymous Astropedia question returned an answer,
and the composer then displayed “Sign in to continue.” The public FAQ describes
Astropedia as free and unlimited, so the relationship between that description
and the observed sign-in prompt remains unverified. No personal chart reading or
purchase was attempted. The FAQ and store listings mention additional features
that were not independently tested.

See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for milestones and
[AI_USAGE.md](./AI_USAGE.md) for the AI-assisted work trail.
