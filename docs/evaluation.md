# Evaluation methodology

Run `npm run evaluate`. The script reads the fixed, hand-labelled dataset in
`evaluation/questions.json`, applies the application's deterministic fact
retriever, and writes `reports/evaluation-report.json`. The report includes
scores and any failed cases.

Current dataset size is nine cases. Scores cover:

- **Factual grounding:** supported questions select only IDs present in their
  labelled relevant-fact set.
- **Relevance:** selected facts overlap the expected relevant-fact set.
- **Unsupported-claim rate:** selected fact IDs outside that set relative to
  selected facts.
- **Insufficient-evidence accuracy:** unsupported questions are declined.

Latest local run: grounding `1.0`, relevance `1.0`, unsupported-claim rate
`0.0`, and insufficient-evidence accuracy `1.0`, with zero failures.

These are deterministic retrieval checks, not a benchmark of Gemini or Groq
output, medical/safety correctness, astrology validity, user satisfaction, or
generalization to real traffic. The dataset is small and manually curated;
scores should not be interpreted as production accuracy. Provider selection
needs separate recorded tests with controlled fixtures and reviewed examples.
