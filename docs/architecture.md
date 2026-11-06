# Architecture note

## System

```text
 Mobile browser ───── Next.js UI (same-origin JSON / SSE)
   │                          │
   │ birth inputs stay        ▼
   │ in browser         Next.js API routes
   │                          │ signed guest cookie
   ▼                          ▼
 Local chart calc       session + rate limit
                              │
                    retrieval from reviewed facts
                              │
                 Gemini/Groq selects fact IDs only
                              │ validate IDs; compose text
                              ▼
                         PostgreSQL
                   Drizzle migrations/schema
                     │               ▲
       answers / credits / saves     │
       journal / background jobs ─ worker

 Daily Panchang API ─ Astronomy Engine + allow-listed cities
 Static sourced datasets ─ Rashi / star atlas ─ browser UI
```

The Next.js application is a single service: UI, same-origin API, and streaming
answer route deploy together. PostgreSQL holds guest sessions, balances,
reviewed facts, answers, saved items, journal entries, rate limits, and
background jobs. A worker claims summary jobs with `SKIP LOCKED` and retries
failures.

## Answer and data flow

An answer request is validated and scoped to a signed guest session. The
server retrieves active, language-aware reviewed facts; an optional model
chooses IDs from that set. The server rejects IDs outside the set and writes
the answer using the exact reviewed text—it never displays free-form model
prose. If providers are absent, curated selection follows the same validation
path. Unsupported topics receive an explicit evidence-gap response. Selection
and validation finish before server-sent events begin; delivery streams the
validated answer, not upstream model tokens. Answer, locale, and ledger debit
are persisted transactionally with idempotency protection.

## Data model

```text
demo_sessions 1 ── * credit_ledger
demo_sessions 1 ── * answers 1 ── * saved_insights
demo_sessions 1 ── * journal_entries
demo_sessions 1 ── * background_jobs
evidence_facts ── answers.evidence_ids (JSONB references)
demo_sessions 1 ── * rate_limit_buckets
```

`demo_sessions` is a server-issued demo identity, not authentication.
`credit_ledger` records idempotent balance changes. `evidence_facts` stores
topic, language tags, source, and active state. `answers` stores question,
status, server-composed text, evidence IDs, provider label, and locale.
`saved_insights` links answers; `journal_entries` are guest-authored
reflections; `background_jobs` stores retry and lease state. Drizzle schema
and SQL migrations define the persistence contract.

## Trade-offs and limits

One service and PostgreSQL keep local setup and transactional behavior simple,
at the cost of scaling the API and worker independently. A small reviewed
corpus limits coverage but makes answer provenance testable. Guest cookies
provide isolation with low friction, not durable identity; clearing them
creates a new session and weakens abuse controls. Public deployment therefore
needs real abuse monitoring, quotas, retention/privacy policy, and secret
management.

Birth-chart inputs remain in the browser. Panchang accepts only a date and
allow-listed city ID; its sunrise, tithi, nakshatra, and yoga use approximate
astronomical conventions, not an authoritative regional calendar. Rashi and
sky data are static and sourced, with schematic constellation lines. These
choices avoid presenting illustrative features as personalized certainty.
Reviewed translations and language-specific scope checks are finite and need
ongoing human review.
