import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:5198",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm dev:emulator --port 5198 --strictPort",
      url: "http://127.0.0.1:5198",
      reuseExistingServer: false,
    },
    {
      command:
        "pnpm build && pnpm preview --host 127.0.0.1 --port 5199 --strictPort",
      url: "http://127.0.0.1:5199",
      reuseExistingServer: false,
    },
  ],
});
