import {
  createWorkerAbortController,
  finishWorkerProcess,
  runWorker,
} from "../src/lib/jobs/worker";

const controller = createWorkerAbortController();

try {
  await runWorker(controller.signal);
} finally {
  await finishWorkerProcess();
}
