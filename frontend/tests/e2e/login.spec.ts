import { test, expect } from '@playwright/test';
import { login, TEST_USER } from '../utils/test-helpers';
import { step, takeScreenshot } from '../utils/e2e-test-helpers';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should allow successful login with valid credentials', async ({ page }, testInfo) => {
    await step('Navigate to login page', async () => {
      await page.goto('/login');
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('h1')).toContainText('Login to your account');
      await takeScreenshot(page, testInfo, '00-login-page-initial', 'Initial login screen');
    });

    await step('Verify form is visible', async () => {
      const emailInput = page.locator('input#email, input[type="email"]').first();
      const passwordInput = page.locator('input#password, input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      
      const loginForm = page.locator('form').first();
      const highlightElement = await loginForm.isVisible().catch(() => false) ? loginForm : submitButton;
      await takeScreenshot(page, testInfo, '01-form-visible', 'Login form elements visible', highlightElement);
    });

    await step('Fill credentials and perform login', async () => {
      const emailInput = page.locator('input#email, input[type="email"]').first();
      const passwordInput = page.locator('input#password, input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();

      await emailInput.fill(TEST_USER.email);
      await passwordInput.fill(TEST_USER.password);
      
      const loginForm = page.locator('form').first();
      const highlightElement = await loginForm.isVisible().catch(() => false) ? loginForm : emailInput;
      await takeScreenshot(page, testInfo, '02-credentials-filled', 'Form with credentials filled', highlightElement);
      await takeScreenshot(page, testInfo, '02-submit-button', 'Login button highlighted', submitButton);
      await submitButton.click();
    });

    await step('Verify successful redirect to profile', async () => {
      await page.waitForURL(/\/profile/, { timeout: 10000 });
      const profileHeading = page.locator('h1, h2, [class*="profile"]').first();
      const highlightElement = await profileHeading.isVisible().catch(() => false) ? profileHeading : null;
      await takeScreenshot(page, testInfo, '03-profile-page', 'Successful redirect to profile page', highlightElement || undefined);
      expect(page.url()).toMatch(/\/profile/);
    });
  });

  test('should display login form correctly', async ({ page }, testInfo) => {
    await step('Navigate to login page', async () => {
      await page.goto('/login');
      await takeScreenshot(page, testInfo, '00-login-page', 'Login page loaded');
    });

    await step('Verify form elements', async () => {
      await expect(page.locator('h1')).toContainText('Login to your account');
      await expect(page.locator('input#email, input[type="email"], input[type="text"][id="email"]').first()).toBeVisible();
      await expect(page.locator('input#password, input[type="password"]').first()).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('text=Register')).toBeVisible();
      const loginForm = page.locator('form, [class*="form"]').first();
      const highlightElement = await loginForm.isVisible().catch(() => false) ? loginForm : page.locator('h1').first();
      await takeScreenshot(page, testInfo, 'login-form-visible', 'Login form fully visible', highlightElement);
    });
  });
});

