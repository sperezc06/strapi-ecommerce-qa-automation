import { test, expect } from '@playwright/test';
import { login, clearLocalStorage, navigateToProducts, navigateToCheckout, TEST_DATA } from '../utils/test-helpers';
import { step, takeScreenshot } from '../utils/e2e-test-helpers';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.context().clearCookies();
  });

  test('should complete checkout successfully', async ({ page }, testInfo) => {
    await step('Login', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await takeScreenshot(page, testInfo, '00-login-page', 'Initial login screen');
      await login(page);
      await takeScreenshot(page, testInfo, '00-login-success', 'Session started successfully');
    });

    await step('Add product to cart', async () => {
      await navigateToProducts(page);
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
      await takeScreenshot(page, testInfo, '00-product-added', 'Product added to cart');
    });

    await step('Navigate to checkout', async () => {
      await navigateToCheckout(page);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/checkout/);
      await expect(page.getByRole('heading', { name: 'Shipping Information' })).toBeVisible();
      await takeScreenshot(page, testInfo, '01-checkout-initial', 'Initial checkout page');
    });

    await step('Complete shipping information', async () => {
      await page.waitForSelector('input[name*="name"], input[type="text"]', { timeout: 10000 });

      const fillIfVisible = async (selector: string, value: string) => {
        const input = page.locator(selector).first();
        if (await input.isVisible().catch(() => false)) {
          await input.fill(value);
        }
      };

      await fillIfVisible('input[name*="name"], input[placeholder*="name" i]', TEST_DATA.address.name);
      await fillIfVisible('input[type="email"], input[name*="email"]', TEST_DATA.address.email);
      await fillIfVisible('input[name*="phone"], input[type="tel"]', TEST_DATA.address.phone);
      await fillIfVisible('input[name*="address"], input[name*="street"]', TEST_DATA.address.street);
      await fillIfVisible('input[name*="city"]', TEST_DATA.address.city);
      await fillIfVisible('input[name*="zip"], input[name*="postal"]', TEST_DATA.address.zip);

      const shippingForm = page.locator('form, [class*="form"]').first();
      const highlightElement = await shippingForm.isVisible().catch(() => false) ? shippingForm : null;
      await takeScreenshot(page, testInfo, '02-shipping-info-filled', 'Shipping information completed', highlightElement || undefined);

      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Continue Shipping")').first();
      await takeScreenshot(page, testInfo, '02-continue-button', 'Continue Shipping button highlighted', continueButton);
      await continueButton.click();
    });

    await step('Select shipping service', async () => {
      await page.getByText("Select Shipping", { exact: false }).waitFor({ state: 'visible', timeout: 15000 });

      const shippingOption = page.locator(".cursor-pointer").filter({ hasText: "$" }).first();
      await shippingOption.waitFor({ state: "visible", timeout: 15000 });
      await takeScreenshot(page, testInfo, '03-shipping-option', 'Shipping option highlighted', shippingOption);
      await shippingOption.click();
      await takeScreenshot(page, testInfo, '03-shipping-selected', 'Shipping service selected', shippingOption);

      const continuePaymentButton = page.locator('button:has-text("Continue Payment")').first();
      await takeScreenshot(page, testInfo, '03-continue-payment-button', 'Continue Payment button highlighted', continuePaymentButton);
      await continuePaymentButton.click();
    });

    await step('Complete payment', async () => {
      await page.waitForURL(/\/transaction\//, { timeout: 20000 });
      const payNowButton = page.getByRole("button", { name: "Pay Now" });
      await payNowButton.waitFor({ state: 'visible', timeout: 15000 });
      await takeScreenshot(page, testInfo, '04-payment-summary', 'Payment summary before confirming');
      await takeScreenshot(page, testInfo, '04-pay-now-button', 'Pay Now button highlighted', payNowButton);
      await payNowButton.click();
    });

    await step('Verify payment success', async () => {
      await page.waitForURL(/\/payment\/success/, { timeout: 20000 });
      const successMessage = page.getByText("Payment Done!");
      await successMessage.waitFor({ state: 'visible', timeout: 10000 });
      await takeScreenshot(page, testInfo, '05-payment-success', 'Payment completed successfully', successMessage);
    });
  });

  test('should display cart products on checkout page', async ({ page }, testInfo) => {
    await step('Login', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await takeScreenshot(page, testInfo, '00-login-page', 'Initial login screen');
      await login(page);
      await takeScreenshot(page, testInfo, '00-login-success', 'Session started successfully');
    });
    
    await step('Add product to cart', async () => {
      await navigateToProducts(page);
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
      await takeScreenshot(page, testInfo, '00-product-added', 'Product added to cart');
    });

    await step('Verify products in checkout', async () => {
      await navigateToCheckout(page);
      await page.waitForLoadState('networkidle');
      
      const cartItems = page.locator('[class*="cart"], [class*="item"], article').first();
      const highlightElement = await cartItems.isVisible().catch(() => false) ? cartItems : null;
      await takeScreenshot(page, testInfo, 'checkout-with-products', 'Products visible on checkout page', highlightElement || undefined);
      
      expect(await page.locator('[class*="cart"], [class*="item"], article').count()).toBeGreaterThan(0);
    });
  });
});

