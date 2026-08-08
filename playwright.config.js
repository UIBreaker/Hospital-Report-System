import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for Hospital Report System
 * Supports testing local Vite/Express dev servers and live Vercel deployments.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    // Base URL for the web application
    baseURL: process.env.TEST_URL || 'https://hospital-report-system.vercel.app',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
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
        defaultBrowserType: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
      },
    }
  ],
});
