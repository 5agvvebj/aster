# Functional audit and enhancement status

This audit covers the current application surfaces and the enhancement request.
It distinguishes existing working flows from features that are not implemented;
visual elements are not treated as proof of backend functionality.

## Existing home experience

| Surface | Current behavior | Status |
| --- | --- | --- |
| Ask a question | Validates non-empty text in the browser and server, streams validated answer events, and reports errors | Connected to backend |
| Suggested questions | Fills and focuses the question composer | Functional |
| Surprise me | Selects one of the existing suggestions | Functional |
| Question balance | Loads from the session API and opens the demo-credit dialog | Connected to backend |
| Demo top-up | Posts an idempotent request, updates persisted balance, and reports success or failure | Connected to backend |
| Save insight | Adds/removes a saved answer through the API and refreshes saved state | Connected to backend |
| Saved insights / recent questions | Loads session-specific history; selecting an item restores its answer and evidence | Connected to backend |
| Evidence disclosure | Expands/collapses the validated supporting facts and links to their sources | Functional |
| Mobile navigation | Opens and closes the navigation drawer and backdrop | Functional |
| Profile control | Opens the About page with scope and privacy information | Functional |
| Topic label | Indicates the only supported question domain; it is intentionally not presented as a dropdown | Informational |
| Source/trust link | Scrolls to the evidence and limitation explanation | Functional |

## Added in this enhancement

- `/sky` provides a pointer/keyboard-operable, draggable celestial sphere,
  selectable constellations, named stars, and rounded J2000 coordinates with a
  SIMBAD catalog credit. Zodiac sign sectors and IAU constellations are clearly
  distinguished.
- `/panchang` computes local sunrise, tithi, nakshatra, yoga, karana, and
  weekday for a selected date and city (New Delhi by default). Approximate
  conventions and non-predictive scope are disclosed.
- English, Hindi, Spanish, French, German, and Portuguese can be selected and
  persist in local storage. The Q&A API uses reviewed fact translations and
  lexical aliases, records answer locale, localizes the insufficient-evidence
  response, and applies explicit personal-prediction scope patterns in each
  supported language.
- `/style-guide` presents the shared design tokens, type hierarchy, controls,
  and interaction principles.

- `/rashi` lists all twelve signs and links to their own stable detail routes.
- `/rashi/[slug]` includes sign-specific conventional associations, themes,
  reflection prompts, and previous/next navigation.
- The sign question action returns to the home composer with its question
  prefilled.
- The Rashi gallery uses locally served NASA planetary photos and responds to
  pointer/touch dragging with animated orbital paths. It is stylized, not to
  scale, and does not imply a personal chart placement.
- Rashi information is static educational reference data. It does not derive
  personal chart placements or generate predictions.
- `/about` documents answer provenance, demo scope, and developer credit.
- `/journey` merges saved answers with persisted, user-authored reflections;
  owners can delete their own journal entries.
- Browser-native voice input is offered only when the browser supports the
  Speech Recognition API. Browser-native speech synthesis can read the validated
  answer text. Speech-recognition processing and retention depend on the
  browser/device implementation; support and voice quality vary.
- `/chart` is an interactive, pointer-rotatable 3D-style educational model for
  twelve house concepts and nine Navagrahas, including Rahu and Ketu. It is
  not a calculated chart; selections attach only a general concept question to
  Vaani.
- `/rashi` and all twelve sign pages show the animated planetary gallery, with
  expandable source links and NASA image credits.
- `/birth-chart` calculates Sun, Moon, visible Navagrahas, mean Rahu/Ketu,
  ascendant, whole-sign houses, and an approximate Vimshottari Mahadasha in the
  browser. Birth inputs are not sent to an API or persisted. It uses
  Astronomy Engine, a linear Lahiri-style ayanamsa approximation, and a
  simplified 365.2425-day Vimshottari year; its interpretations are not
  deterministic predictions or professional ephemeris output.
- The birth-chart form has an opt-in sample button with clearly labeled
  illustrative New Delhi inputs (1998-05-15, 10:30, UTC+05:30). The visitor
  must press Calculate to produce a chart; sample placements are not shown as
  personal data or readings.
- `/scan` runs local MediaPipe face/hand landmark detection after explicit
  camera permission. Camera frames remain in the browser and are not saved.
  The hand model does not detect palm creases; the face model does not infer
  identity, health, character, or future. The WASM runtime is loaded from a
  pinned jsDelivr package release; model files are served by the local app.
- The home discovery suggestion selects from recent question topics in the
  current session and displays its reason. With no matching activity, it falls
  back to a general learning question.

## Not implemented; do not present as available

- Prediction of real-life outcomes or advice based on astrology.
- Palm crease analysis or personalized palm-reading predictions.
- Personality, health, identity, or future inference from face imagery.
- Notification service, share-card export, or actual computed chart events in
  the Cosmic Journey timeline.
- Photorealistic WebGL planetary rendering or astronomical placement rendering
  in the chart-learning demo.
- An authoritative regional Panchang, live telescope view, or exact
  constellation-boundary projection.

These limitations are stated in the UI. Do not present the educational
interpretations or reflective prompts as validated predictions.

## Verification

The current check run passed ESLint, TypeScript (`npx tsc --noEmit`), the
production build, and all 35 unit tests across 9 test files. Browser smoke
checks confirmed that the sample birth-chart values calculate a chart, the
home, sky, Panchang, birth-chart, and style-guide routes respond locally, and
the sky explorer has no horizontal overflow at a 375-pixel viewport.
PostgreSQL-backed automated integration tests still require a configured
database, and live AI behavior requires a provider key.
