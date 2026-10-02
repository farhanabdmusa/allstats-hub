// vitest.setup.ts
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Auto cleanup DOM setelah setiap test case selesai
afterEach(() => {
  cleanup();
});
