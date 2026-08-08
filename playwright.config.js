import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for Hospital Report System
 * Supports testing local Vite/Express dev servers and live Vercel deployments.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    // Base URL for the web application (defaults to live Vercel deployment or local Vite server)
    baseURL: process.env.TEST_URL || 'https://hospital-report-system.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
      },
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 7'],
        viewport: { width: 393, height: 851 },
        isMobile: true
      },
    },
    {
      name: 'mobile-iphone',
      use: { 
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
        isMobile: true
      },
    }
  ],
});
