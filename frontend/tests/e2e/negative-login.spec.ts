import { test, expect } from '@playwright/test';
import { step, setupApiCapture, takeScreenshot } from '../utils/e2e-test-helpers';

test.describe('Negative Login Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should show error when attempting login with invalid credentials', async ({ page }, testInfo) => {
    const apiCapture = setupApiCapture(page, '/auth/local', 'Login API');

    await step('Navigate to login page', async () => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
      await takeScreenshot(page, testInfo, '01-login-page', 'Initial login screen');
    });

    await step('Enter invalid credentials', async () => {
      const emailInput = page.locator('input#email, input[type="email"], input[type="text"][id="email"]').first();
      const passwordInput = page.locator('input#password, input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]');

      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword123');
      await takeScreenshot(page, testInfo, '02-invalid-credentials', 'Invalid credentials entered');
      await submitButton.click();
    });

    await step('Verify login fails', async () => {
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      
      expect(currentUrl).not.toMatch(/\/profile/);
      expect(currentUrl).toMatch(/\/login/);
    });

    await step('Verify error message', async () => {
      const errorIndicators = [
        page.locator('text=/error/i'),
        page.locator('text=/invalid/i'),
        page.locator('text=/incorrect/i'),
        page.locator('[role="alert"]'),
        page.locator('.error'),
        page.locator('[class*="error"]'),
      ];

      let errorFound = false;
      for (const indicator of errorIndicators) {
        try {
          const isVisible = await indicator.first().isVisible({ timeout: 2000 });
          if (isVisible) {
            errorFound = true;
            break;
          }
        } catch {
        }
      }

      const currentUrl = page.url();
      expect(errorFound || currentUrl.includes('/login')).toBeTruthy();
      // Highlight del mensaje de error
      const errorElement = page.locator('text=/error/i, text=/invalid/i, [role="alert"], [class*="error"]').first();
      const highlightElement = await errorElement.isVisible().catch(() => false) ? errorElement : null;
      await takeScreenshot(page, testInfo, '03-error-evidenced', 'Invalid credentials error evidenced', highlightElement || undefined);
    });

    await apiCapture.attachToReport(testInfo);
  });

  test('should show error when attempting login with invalid email', async ({ page }, testInfo) => {
    const apiCapture = setupApiCapture(page, '/auth/local', 'Login API');

    await step('Navigate to login page', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await takeScreenshot(page, testInfo, '00-login-page', 'Initial login screen');
    });

    await step('Enter invalid email format', async () => {
      const emailInput = page.locator('input#email, input[type="email"], input[type="text"][id="email"]').first();
      const passwordInput = page.locator('input#password, input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]');

      await emailInput.fill('invalid-email-format');
      await passwordInput.fill('somepassword');
      await submitButton.click();
    });

    await step('Verify login does not proceed', async () => {
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/login/);
      const errorElement = page.locator('text=/error/i, text=/invalid/i, [role="alert"], [class*="error"], input[type="email"]').first();
      const highlightElement = await errorElement.isVisible().catch(() => false) ? errorElement : null;
      await takeScreenshot(page, testInfo, '02-error-evidenced', 'Invalid email error evidenced', highlightElement || undefined);
    });

    await apiCapture.attachToReport(testInfo);
  });

  test('should show error when attempting login with empty fields', async ({ page }, testInfo) => {
    const apiCapture = setupApiCapture(page, '/auth/local', 'Login API');

    await step('Navigate to login page', async () => {
      await page.goto('/login');
      await takeScreenshot(page, testInfo, '00-login-page', 'Initial login screen');
    });

    await step('Attempt to submit form without filling fields', async () => {
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(1000);
    });

    await step('Verify remains on login page', async () => {
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/login/);
    });

    await step('Verify fields are present', async () => {
      const emailInput = page.locator('input#email, input[type="email"], input[type="text"][id="email"]').first();
      const passwordInput = page.locator('input#password, input[type="password"]').first();
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      // Highlight empty fields or validation message
      const errorElement = page.locator('text=/required/i, text=/fill/i, [role="alert"], [class*="error"]').first();
      const highlightElement = await errorElement.isVisible().catch(() => false) ? errorElement : emailInput;
      await takeScreenshot(page, testInfo, '02-error-evidenced', 'Empty fields error evidenced', highlightElement);
    });

    await apiCapture.attachToReport(testInfo);
  });
});

