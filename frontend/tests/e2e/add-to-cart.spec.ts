import { test, expect } from '@playwright/test';
import { login, clearLocalStorage, getCartFromStorage, navigateToProducts } from '../utils/test-helpers';
import { step, takeScreenshot } from '../utils/e2e-test-helpers';

test.describe('Add to Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.context().clearCookies();
  });

  test('should add a product to cart and update counter', async ({ page }, testInfo) => {
    await step('Login', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await takeScreenshot(page, testInfo, '00-login-page', 'Initial login screen');
      await login(page);
      await takeScreenshot(page, testInfo, '00-login-success', 'Session started successfully');
    });

    await step('Navigate to products page', async () => {
      await navigateToProducts(page);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, testInfo, '01-products-page', 'Products page loaded');
    });
    
    if (await page.locator('text=No Product Found').first().isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    await step('Select first product', async () => {
      const firstProduct = page.locator('a[href*="/product/"]').first();
      await firstProduct.waitFor({ state: 'visible', timeout: 15000 });
      await takeScreenshot(page, testInfo, '01-product-selected', 'First product selected from list', firstProduct);
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, testInfo, '02-product-detail', 'Product detail page');
    });

    await step('Add product to cart', async () => {
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
      await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
      await takeScreenshot(page, testInfo, '03-add-to-cart-button', 'Add to Cart button highlighted', addToCartButton);
      await addToCartButton.click();
      await page.waitForTimeout(1500);
      
      const cartElement = page.locator('[class*="cart"], [class*="sidebar"], text=/My Cart/i').first();
      await cartElement.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      await takeScreenshot(page, testInfo, '03-product-added', 'Product added to cart', cartElement);
    });

    await step('Verify cart was updated', async () => {
      const cart = await getCartFromStorage(page);
      expect(cart.length).toBeGreaterThan(0);
      expect(cart[cart.length - 1]).toHaveProperty('productId');
      expect(cart[cart.length - 1]).toHaveProperty('qty');
      
      const cartItem = page.locator('[class*="cart-item"], [class*="item"]').first();
      const cartSidebar = page.locator('[class*="cart"], [class*="sidebar"]').first();
      const highlightElement = await cartItem.isVisible().catch(() => false) 
        ? cartItem 
        : await cartSidebar.isVisible().catch(() => false) 
          ? cartSidebar 
          : null;
      await takeScreenshot(page, testInfo, '04-cart-updated', 'Cart successfully updated with product', highlightElement || undefined);
    });
  });

  test('should be able to add multiple products to cart', async ({ page }, testInfo) => {
    await step('Login', async () => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await takeScreenshot(page, testInfo, '00-login-page', 'Initial login screen');
      await login(page);
      await takeScreenshot(page, testInfo, '00-login-success', 'Session started successfully');
    });

    await step('Navigate to products page', async () => {
      await navigateToProducts(page);
      await page.waitForLoadState('networkidle');
      await takeScreenshot(page, testInfo, '01-products-page', 'Products page loaded');
    });
    
    if (await page.locator('text=No Product Found').first().isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    await step('Add first product to cart', async () => {
      await page.locator('a[href*="/product/"]').first().click();
      await page.waitForLoadState('networkidle');
      
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
      await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
      await takeScreenshot(page, testInfo, '01-add-to-cart-button-1', 'Add to Cart button highlighted', addToCartButton);
      await addToCartButton.click();
      await page.waitForTimeout(2000);
      
      const cart = await getCartFromStorage(page);
      expect(cart.length).toBeGreaterThanOrEqual(1);
      await page.evaluate((c) => localStorage.setItem('cart', JSON.stringify(c)), cart);
      
      const cartElement = page.locator('[class*="cart"], [class*="sidebar"], text=/My Cart/i').first();
      await cartElement.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      await takeScreenshot(page, testInfo, '01-first-product-added', 'First product added to cart', cartElement);
    });

    await step('Add second product to cart', async () => {
      const savedCart = JSON.stringify(await getCartFromStorage(page));
      await page.goto('/product', { waitUntil: 'networkidle' });
      await page.evaluate((c) => localStorage.setItem('cart', c), savedCart);
      
      const products = page.locator('a[href*="/product/"]');
      expect(await products.count()).toBeGreaterThan(1);
      await products.nth(1).click();
      await page.waitForLoadState('networkidle');
      await page.evaluate((c) => localStorage.setItem('cart', c), savedCart);
      
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")').first();
      await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
      await takeScreenshot(page, testInfo, '02-add-to-cart-button-2', 'Add to Cart button highlighted', addToCartButton);
      await addToCartButton.click();
      await page.waitForTimeout(3000);
      
      const cartElement = page.locator('[class*="cart"], [class*="sidebar"], text=/My Cart/i').first();
      await cartElement.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      await takeScreenshot(page, testInfo, '02-second-product-added', 'Second product added to cart', cartElement);
    });

    await step('Verify multiple products in cart', async () => {
      const finalCart = await getCartFromStorage(page);
      expect(finalCart.length).toBeGreaterThanOrEqual(2);
      await takeScreenshot(page, testInfo, '03-multiple-products', 'Multiple products in cart verified');
    });
  });
});

