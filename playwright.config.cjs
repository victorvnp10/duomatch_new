const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  globalSetup: './e2e/global-setup.cjs',
  testDir: './e2e', testMatch: '**/*.spec.cjs', fullyParallel: true,
  workers: 2, retries: 0, timeout: 45000,
  expect: { timeout: 12000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { actionTimeout: 12000, baseURL: 'http://127.0.0.1:4175', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm start -- --mode e2e --host 127.0.0.1 --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175', reuseExistingServer: false,
    env: {
      REACT_APP_FIREBASE_API_KEY: 'demo-api-key',
      REACT_APP_FIREBASE_AUTH_DOMAIN: 'demo-duomatch-e2e.firebaseapp.com',
      REACT_APP_FIREBASE_PROJECT_ID: 'demo-duomatch-e2e',
      REACT_APP_FIREBASE_STORAGE_BUCKET: 'demo-duomatch-e2e.appspot.com',
      REACT_APP_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      REACT_APP_FIREBASE_APP_ID: '1:123456789:web:e2e',
    },
  },
});
