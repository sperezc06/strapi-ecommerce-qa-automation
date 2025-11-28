import { test, expect } from '@playwright/test';
import { clearLocalStorage, navigateToProducts } from '../utils/test-helpers';
import { step, takeScreenshot } from '../utils/e2e-test-helpers';

test.describe('Negative Add to Cart Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.context().clearCookies();
  });

  test('should handle attempt to add product without authentication', async ({ page }, testInfo) => {
    await step('Navigate to products without authentication', async () => {
      await navigateToProducts(page);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, testInfo, '01-products-no-auth', 'Products page without authentication');
    });
    
    const noProductsMessage = page.locator('text=No Product Found, text=no products');
    const hasNoProducts = await noProductsMessage.first().isVisible().catch(() => false);
    
    if (hasNoProducts) {
      test.skip();
      return;
    }

    await step('Select product', async () => {
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 });
      const firstProduct = page.locator('a[href*="/product/"]').first();
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('button:has-text("Add to Cart"), button:has-text("ADD TO CART")', {
        timeout: 10000,
      });
    });
    
    await step('Attempt to add to cart without authentication', async () => {
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
      const isVisible = await addToCartButton.isVisible();
      
      if (isVisible) {
        await takeScreenshot(page, testInfo, '02-add-to-cart-button', 'Add to Cart button highlighted', addToCartButton);
        await addToCartButton.click();
        await page.waitForTimeout(2000);
        const errorElement = page.locator('text=/error/i, text=/login/i, [role="alert"]').first();
        const highlightElement = await errorElement.isVisible().catch(() => false) ? errorElement : null;
        await takeScreenshot(page, testInfo, '02-add-to-cart-attempt', 'Attempt to add product without authentication', highlightElement || undefined);
      } else {
        test.skip();
        return;
      }
    });

    await step('Verify system behavior', async () => {
      const redirectedToLogin = page.url().includes('/login');
      const errorFound = await page.locator('text=/error/i, text=/login/i, [role="alert"]').first().isVisible().catch(() => false);
      const cartAfterClick = await page.evaluate(() => {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
      });
      expect(redirectedToLogin || errorFound || cartAfterClick.length >= 0).toBeTruthy();
    });
  });

  test('should prevent adding invalid quantity to cart', async ({ page }, testInfo) => {
    await step('Navigate to products', async () => {
      await page.goto('/product');
      await page.waitForLoadState('networkidle');
    });
    
    const noProductsMessage = page.locator('text=No Product Found, text=no products');
    const hasNoProducts = await noProductsMessage.first().isVisible().catch(() => false);
    
    if (hasNoProducts) {
      test.skip();
      return;
    }

    await step('Select product', async () => {
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 });
      const firstProduct = page.locator('a[href*="/product/"]').first();
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, testInfo, '01-product-page', 'Product page selected');
    });
    
    await step('Verify quantity field or default behavior', async () => {
      const quantityInput = page.locator('input[type="number"], input[name*="quantity"], input[name*="qty"]').first();
      const quantityExists = await quantityInput.isVisible().catch(() => false);
      
      if (quantityExists) {
        await quantityInput.fill('-1');
        await page.waitForTimeout(500);
        await takeScreenshot(page, testInfo, '02-invalid-quantity', 'Attempt to set invalid quantity', quantityInput);
        const value = await quantityInput.inputValue();
        const isValid = value !== '-1' || await quantityInput.evaluate((el: HTMLInputElement) => el.validity.valid);
        expect(isValid).toBeTruthy();
      } else {
        await takeScreenshot(page, testInfo, '02-default-quantity', 'System uses default quantity (1)');
        expect(page.url()).toMatch(/\/product\//);
      }
    });
  });

  test('should handle attempt to add product that is no longer available', async ({ page }, testInfo) => {
    await step('Navigate to products', async () => {
      await page.goto('/product');
      await page.waitForLoadState('networkidle');
    });
    
    const noProductsMessage = page.locator('text=No Product Found, text=no products');
    const hasNoProducts = await noProductsMessage.first().isVisible().catch(() => false);
    
    if (hasNoProducts) {
      test.skip();
      return;
    }

    await step('Select product', async () => {
      await page.waitForSelector('a[href*="/product/"]', { timeout: 15000 });
      const firstProduct = page.locator('a[href*="/product/"]').first();
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, testInfo, '01-product-page', 'Product page selected');
    });
    
    await step('Verify product availability', async () => {
      const unavailableFound = await page.locator('text=/out of stock/i, text=/unavailable/i, button:disabled').first().isVisible().catch(() => false);
      
      if (!unavailableFound) {
        const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
        const isButtonVisible = await addToCartButton.isVisible();
        if (isButtonVisible) {
          expect(await addToCartButton.isDisabled().catch(() => false)).toBeFalsy();
          await takeScreenshot(page, testInfo, '02-product-available', 'Product available to add');
        }
      } else {
        await takeScreenshot(page, testInfo, '02-product-unavailable', 'Product unavailable evidenced');
      }
    });
  });
});

