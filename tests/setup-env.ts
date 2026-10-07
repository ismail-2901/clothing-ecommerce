// tests/setup-env.ts
// Runs in every test worker BEFORE any test module is imported.
// Sets required environment variables that auth.ts validates at load time.

if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET =
    "test-only-secret-do-not-use-in-production-must-be-32-chars-min";
}
