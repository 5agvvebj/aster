# The idea: learn with evidence, not guesswork

## Who it is for

Aster is for a curious beginner who wants to understand a Vedic astrology
concept without handing over birth details or relying on a confident,
unsupported personal prediction. A user can ask a general question, inspect the
reviewed facts behind the answer, and save a useful insight. The optional
Rashi, sky, Panchang, and chart-learning experiences offer paths to explore
without implying scientific certainty.

## One metric

The metric is **7-day repeat-learning rate**: the share of guest sessions with
a first evidence-supported answer that submit another supported question
within seven days. The hypothesis is that visible sources, reviewed answers in
six languages, and relevant next steps make learning feel safe and useful
enough to return.

The `answers` table stores session ID, status, and timestamp, so this metric can
be computed from first-party data without third-party analytics. The SQL
measurement groups completed answers by guest session: choose sessions whose
first supported answer was 7–14 days ago, then count those with another
supported answer within seven days. No analytics dashboard or real-user
validation exists yet; clearing a guest cookie creates a new session and can
undercount return visits. `insufficient_evidence` is a trust guardrail, not an
outcome to hide.

## Why this build

The MVP retrieves from a small reviewed corpus; a model may select matching
fact IDs, but the server validates them and composes the displayed answer from
the stored evidence. When nothing supports a question, the app declines
instead of improvising. This narrows topic coverage compared with an
unconstrained chatbot, but keeps claims inspectable and behavior testable.
Personalized prediction is intentionally not the product promise.
