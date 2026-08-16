import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    /**
     * Integration suites share ONE Postgres and mutate it (create/delete
     * products, assessments, incidents, reports). Running test files in
     * parallel raced them against each other: a suite passing alone would
     * 500 or 404 in the full run when a sibling deleted the rows under it —
     * flakiness that read as "31 known failures" for weeks (issue #62).
     * Sequential files match the one-shared-database reality. Tests within
     * a file still run in order; pure unit suites lose nothing measurable.
     */
    fileParallelism: false,
  },
});
