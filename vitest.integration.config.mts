import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": resolve(root, "src") },
  },
  test: {
    environment: "node",
    include: ["integration/**/*.integration.test.ts"],
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
