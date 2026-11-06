import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isOutsideEducationalScope } from "../src/lib/grounding/scope";
import { rankEvidenceFacts } from "../src/lib/grounding/retrieve";
import { seedFacts } from "../src/lib/grounding/seed-facts";

type EvaluationCase = {
  id: string;
  question: string;
  expectedFactIds: string[];
  expectInsufficient: boolean;
};

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dataset = JSON.parse(
  readFileSync(resolve(root, "evaluation/questions.json"), "utf8"),
) as EvaluationCase[];

const results = dataset.map((testCase) => {
  const outsideScope = isOutsideEducationalScope(testCase.question);
  const retrieved = outsideScope ? [] : rankEvidenceFacts(testCase.question, seedFacts);
  const selected = retrieved.slice(0, 3);
  const expected = new Set(testCase.expectedFactIds);
  const selectedIds = selected.map((fact) => fact.id);
  const relevantCount = selectedIds.filter((id) => expected.has(id)).length;
  const precision = selectedIds.length === 0
    ? (testCase.expectInsufficient ? 1 : 0)
    : relevantCount / selectedIds.length;
  const recall = testCase.expectedFactIds.length === 0
    ? (selectedIds.length === 0 ? 1 : 0)
    : relevantCount / testCase.expectedFactIds.length;
  const relevance = precision + recall === 0
    ? 0
    : (2 * precision * recall) / (precision + recall);
  const insufficient = selectedIds.length === 0;
  const evidenceById = new Map(seedFacts.map((fact) => [fact.id, fact.content]));
  const groundedCount = selected.filter((fact) => evidenceById.get(fact.id) === fact.content).length;
  const unsupportedCount = selectedIds.filter((id) => !expected.has(id)).length;
  const unsupportedRate = selectedIds.length === 0 ? 0 : unsupportedCount / selectedIds.length;
  const failed =
    insufficient !== testCase.expectInsufficient ||
    relevance < 0.8 ||
    groundedCount !== selected.length;

  return {
    id: testCase.id,
    question: testCase.question,
    expectedFactIds: testCase.expectedFactIds,
    retrievedFactIds: selectedIds,
    expectedInsufficient: testCase.expectInsufficient,
    actualInsufficient: insufficient,
    factualGrounding: selected.length === 0 ? 1 : groundedCount / selected.length,
    relevance,
    unsupportedClaimRate: unsupportedRate,
    failed,
  };
});

const average = (values: number[]) =>
  values.length === 0 ? 1 : values.reduce((total, value) => total + value, 0) / values.length;
const report = {
  generatedAt: new Date().toISOString(),
  datasetVersion: "1",
  questionCount: results.length,
  scores: {
    factualGrounding: average(results.map((result) => result.factualGrounding)),
    relevance: average(results.map((result) => result.relevance)),
    unsupportedClaimRate: average(results.map((result) => result.unsupportedClaimRate)),
    insufficientEvidenceAccuracy: average(results.map((result) =>
      Number(result.expectedInsufficient === result.actualInsufficient))),
  },
  failureExamples: results.filter((result) => result.failed),
  results,
  methodology: [
    "The fixed dataset labels expected evidence IDs and whether a conservative refusal is expected.",
    "The harness runs the same lexical retrieval and personal-question scope checks as the API against the seeded fact set.",
    "Factual grounding checks whether every selected claim is an exact stored fact; unsupported-claim rate also treats facts outside the expected question-specific evidence IDs as unsupported.",
    "Relevance is the F1 score between retrieved fact IDs and the annotated expected IDs.",
    "The model-generated path is not called: the dataset check is deterministic and does not require credentials.",
  ],
  limitations: [
    "The dataset is small and hand-labelled; these scores do not establish real-world answer quality.",
    "Exact fact-ID matching does not measure semantic entailment or whether the underlying astrology content is true.",
    "The model's provider-specific selection behavior requires a separate credentialed evaluation.",
    "The curated prototype corpus is small and intentionally limited to general educational topics.",
  ],
};

const reportDirectory = resolve(root, "reports");
mkdirSync(reportDirectory, { recursive: true });
writeFileSync(
  resolve(reportDirectory, "evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify(report.scores, null, 2));
console.log(`Questions: ${report.questionCount}; failures: ${report.failureExamples.length}`);

if (report.failureExamples.length > 0) process.exitCode = 1;
