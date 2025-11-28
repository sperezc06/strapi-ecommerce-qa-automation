import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * 
 * Framework: Playwright
 * Reasons:
 * - Excellent TypeScript support
 * - Smart auto-waiting for DOM elements
 * - Automatic screenshots and videos on failures
 * - High-quality integrated HTML reports
 * - Modern and easy-to-use API
 * - Multi-browser support (Chromium, Firefox, WebKit)
 * - Excellent for E2E testing of Next.js applications
 */
export default defineConfig({
  testDir: './tests',
  
  // Test timeout (60 seconds)
  timeout: 60000,
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail build in CI if test.only is left in code
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests only in CI
  retries: process.env.CI ? 2 : 0,
  
  // Use 1 worker to avoid timeout issues
  workers: process.env.CI ? 1 : 1,
  
  // Reporters configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      detail: false, // Hide internal Playwright steps
      suiteTitle: false,
    }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  // Shared settings for all tests
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on', // Always record videos
  },

  // Browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Optional: Auto-start Next.js server before tests
  // Note: It's recommended to start Next.js and Strapi manually before running tests
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});

