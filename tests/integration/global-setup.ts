import { startTestDatabase, stopTestDatabase } from "./test-db";

export async function setup() {
  await startTestDatabase();
}

export async function teardown() {
  // Allow worker connections to finish closing cleanly before stopping server
  await new Promise((resolve) => setTimeout(resolve, 500));
  await stopTestDatabase();
}
