import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
}

export const TEST_USER: TestUser = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'Test123456!',
};

// Login helper with automatic retry on failure
export async function login(page: Page, user: TestUser = TEST_USER): Promise<void> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    const emailInput = page.locator('input#email, input[type="email"]').first();
    const passwordInput = page.locator('input#password, input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    await submitButton.click();
    
    try {
      await page.waitForURL(/\/profile/, { timeout: 15000 });
      return; // Login successful
    } catch {
      // Retry on failure
      if (attempt < 2) {
        await page.waitForTimeout(2000);
        await page.reload({ waitUntil: 'networkidle' });
      }
    }
  }
  
  await page.waitForURL(/\/profile/, { timeout: 30000 });
}

// Clears localStorage before page loads and after
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.addInitScript(() => localStorage.clear());
  await page.evaluate(() => localStorage.clear()).catch(() => {});
}

// Gets cart items from browser localStorage
export async function getCartFromStorage(page: Page): Promise<any[]> {
  return await page.evaluate(() => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  });
}

export async function navigateToProducts(page: Page): Promise<void> {
  await page.goto('/product', { waitUntil: 'networkidle' });
}

export async function navigateToCheckout(page: Page): Promise<void> {
  await page.goto('/checkout', { waitUntil: 'networkidle' });
}

// Common test data
export const TEST_DATA = {
  address: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    street: '123 Test Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    country: 'US',
  },
  shipping: {
    id: 'rate_1',
    id_rate: 'rate_1',
    name: 'Standard Shipping',
    price: '10.00',
  },
};

// Common selectors
export const SELECTORS = {
  emailInput: 'input#email, input[type="email"]',
  passwordInput: 'input#password, input[type="password"]',
  submitButton: 'button[type="submit"]',
  addToCartButton: 'button:has-text("Add to Cart"), button:has-text("ADD TO CART")',
  productLink: 'a[href*="/product/"]',
};

// Common timeouts (in milliseconds)
export const TIMEOUTS = {
  short: 2000,
  medium: 5000,
  long: 10000,
  veryLong: 15000,
  navigation: 20000,
  login: 30000,
};

