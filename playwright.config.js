import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5180',
    headless: true,
  },
  webServer: [
    {
      command: 'npm run start -w server',
      port: 3001,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev -w client',
      port: 5180,
      reuseExistingServer: true,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
