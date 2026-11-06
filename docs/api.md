# API contract

All routes are same-origin. Mutating routes accept `application/json`, validate
bounded request bodies, and use the signed HTTP-only demo-session cookie. Error
responses use `{ "error": { "code": "...", "message": "..." } }`.

## `GET /api/session`

Creates or resumes the guest demo session and returns its server-owned balance.

```json
{ "balance": 1 }
```

## `POST /api/answers`

Starts a Q&A request and returns `text/event-stream`. The body is:

```json
{
  "requestId": "UUID",
  "domain": "vedic_astrology",
  "question": "What does a birth chart represent?"
}
```

Supported SSE event sequence:

- `metadata`: `answerId`, `status`, selected `provider`, and remaining `balance`.
- `delta`: a validated text chunk.
- `evidence`: the supporting facts (`id`, `topic`, `content`, `sourceLabel`,
  optional `sourceUrl`).
- `done`: stream completion.

The server validates the model's evidence IDs and composes visible text from
database facts before streaming. Insufficient-evidence requests return an
explicit response and are persisted. Reusing the same request ID and payload
replays the stored answer without a second debit; reusing it for different
content returns `409 request_id_reused`. The route allows at most eight
requests per session per minute.

## `POST /api/credits/top-up`

Adds five demo credits; no payment is requested or processed. Requires a
UUID `requestId`, unique per session for idempotent retries. Rate limit: five
requests per session per minute.

```json
{ "requestId": "UUID" }
```

Returns the idempotent top-up result and current balance.

## `GET /api/history`

Returns up to 30 answers for the current guest session, including saved status,
evidence, summary, and background-job status. No other session's rows are
returned.

## `PUT` / `DELETE /api/saved/{answerId}`

Save or unsave an answer owned by the current guest session. A first save
enqueues one idempotent summary job. A successful response is
`{ "saved": true }` or `{ "saved": false }`.

## Cosmic Journey

### `GET /api/journey`

Returns up to 50 saved answers and 100 journal notes belonging to the current
demo session, merged newest-first. Saved answer events link back to the
original answer; journal entries contain only user-authored text.

### `POST /api/journey`

Create a journal reflection. Titles are limited to 100 characters and body
text to 2,000 characters. The entry is scoped to the signed guest session.
Creation is limited to ten requests per session per minute.

```json
{ "title": "A thought to revisit", "body": "My reflection..." }
```

### `DELETE /api/journey/{entryId}`

Delete a journal entry belonging to the current session. A UUID belonging to a
different session is indistinguishable from a missing entry and returns 404.

These endpoints do not create or infer astrological events. Timeline entries
are limited to saved answers and reflections the user authored.

Voice input and spoken answer playback use browser APIs and do not add server
routes. Browser speech-recognition implementations may process audio
differently; users should review the browser's microphone permission and
privacy behavior.

## Error behavior

Input validation returns `400`; oversized requests `413`; unsupported media
types `415`; origin mismatch `403`; depleted balance `402`; throttling `429`;
provider unavailability `503`; and unexpected failures `500`. User-facing
messages avoid exposing server secrets. Exact error codes and implementation
may evolve with the prototype.
