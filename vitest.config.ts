import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
    // Runs before any module is imported in every test worker — sets required env vars.
    setupFiles: ["tests/setup-env.ts"],
    globalSetup: ["tests/integration/global-setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        lines: 45,
        statements: 45,
        functions: 38,
        branches: 35
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  }
});

