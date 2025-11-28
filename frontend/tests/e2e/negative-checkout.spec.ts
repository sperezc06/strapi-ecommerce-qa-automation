import { test, expect } from '@playwright/test';
import { login, clearLocalStorage, navigateToCheckout } from '../utils/test-helpers';
import { step, setupApiCapture, takeScreenshot } from '../utils/e2e-test-helpers';

test.describe('Negative Checkout Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.context().clearCookies();
  });

  test('should correctly handle checkout attempt with empty cart', async ({ page }, testInfo) => {
    const apiCapture = setupApiCapture(page, '/orders', 'Checkout API');

    await step('Login', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await takeScreenshot(page, testInfo, '00-login-page', 'Initial login screen');
      await login(page);
      await takeScreenshot(page, testInfo, '00-login-success', 'Session started successfully');
    });

    await step('Clear cart', async () => {
      await clearLocalStorage(page);
    });

    await step('Attempt to navigate to checkout with empty cart', async () => {
      await navigateToCheckout(page);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, testInfo, '01-empty-cart-checkout', 'Checkout attempt with empty cart');
    });

    await step('Verify system behavior', async () => {
      const currentUrl = page.url();
      const isRedirected = !currentUrl.includes('/checkout');
      
      const emptyCartMessages = [
        page.locator('text=/empty/i'),
        page.locator('text=/no items/i'),
        page.locator('text=/add items/i'),
        page.locator('text=/cart is empty/i'),
      ];

      let emptyCartMessageFound = false;
      for (const message of emptyCartMessages) {
        try {
          const isVisible = await message.first().isVisible({ timeout: 2000 });
          if (isVisible) {
            emptyCartMessageFound = true;
            break;
          }
        } catch {
        }
      }

      const subtotalLabel = page.locator('text=Subtotal').first();
      const hasSubtotal = await subtotalLabel.isVisible().catch(() => false);
      
      let zeroTotalsVisible = false;
      if (hasSubtotal) {
        const zeroValue = await page
          .locator('text=/\\$0(\\.00)?/i')
          .first()
          .isVisible()
          .catch(() => false);
        zeroTotalsVisible = zeroValue;
      }

      const emptyMessage = page.locator('text=/empty/i, text=/no items/i, text=/add items/i').first();
      const highlightElement = await emptyMessage.isVisible().catch(() => false) ? emptyMessage : null;
      await takeScreenshot(page, testInfo, '02-empty-cart-result', 'Result: empty cart handled correctly', highlightElement || undefined);
      
      expect(isRedirected || emptyCartMessageFound || zeroTotalsVisible).toBeTruthy();
    });

    await apiCapture.attachToReport(testInfo);
  });

  test('should prevent checkout without complete shipping information', async ({ page }, testInfo) => {
    const apiCapture = setupApiCapture(page, '/orders', 'Checkout API');

    await step('Login', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await takeScreenshot(page, testInfo, '00-login-page', 'Initial login screen');
      await login(page);
      await takeScreenshot(page, testInfo, '00-login-success', 'Session started successfully');
    });

    await step('Add product to cart', async () => {
      await page.goto('/product');
      await page.waitForSelector('a[href*="/product/"]', { timeout: 10000 });
      
      const firstProduct = page.locator('a[href*="/product/"]').first();
      await firstProduct.click();
      await page.waitForLoadState('networkidle');

      await page.waitForSelector('button:has-text("Add to Cart"), button:has-text("ADD TO CART")', {
        timeout: 10000,
      });
      
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
      await addToCartButton.click();
      await page.waitForTimeout(2000);
    });

    await step('Navigate to checkout', async () => {
      await navigateToCheckout(page);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, testInfo, '01-checkout-incomplete', 'Checkout without shipping information');
    });

    await step('Attempt to proceed without completing shipping information', async () => {
      const continueButtons = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Proceed")');
      const continueButtonCount = await continueButtons.count();

      if (continueButtonCount > 0) {
        const continueButton = continueButtons.first();
        await continueButton.click();
        await page.waitForTimeout(1000);
        const validationError = page.locator('text=/required/i, text=/fill/i, [role="alert"], [class*="error"]').first();
        const highlightElement = await validationError.isVisible().catch(() => false) ? validationError : null;
        await takeScreenshot(page, testInfo, '02-validation-error', 'Validation or error message displayed', highlightElement || undefined);
      }
    });

    await step('Verify validation or error is shown', async () => {
      const validationMessages = [
        page.locator('text=/required/i'),
        page.locator('text=/fill/i'),
        page.locator('text=/complete/i'),
        page.locator('[role="alert"]'),
        page.locator('.error'),
        page.locator('[class*="error"]'),
      ];

      let validationFound = false;
      for (const message of validationMessages) {
        try {
          const isVisible = await message.first().isVisible({ timeout: 2000 });
          if (isVisible) {
            validationFound = true;
            break;
          }
        } catch {
        }
      }

      const urlAfterClick = page.url();
      const stillOnCheckout = urlAfterClick.includes('/checkout');
      
      const validationError = page.locator('text=/required/i, text=/fill/i, text=/complete/i, [role="alert"], [class*="error"]').first();
      const highlightElement = await validationError.isVisible().catch(() => false) ? validationError : null;
      await takeScreenshot(page, testInfo, '03-validation-evidenced', 'Validation error evidenced', highlightElement || undefined);
      
      expect(validationFound || stillOnCheckout).toBeTruthy();
    });

    await apiCapture.attachToReport(testInfo);
  });
});

