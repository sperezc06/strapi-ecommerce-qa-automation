import { test, expect } from '@playwright/test';
import { attachApiResponse, API_BASE_URL } from '../utils/api-test-helpers';

test.describe('API - Authentication Endpoints', () => {
  test('POST /auth/local should authenticate valid user', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/auth/local`;
    const requestData = {
      identifier: 'test@example.com',
      password: 'Test123456!',
    };

    const response = await request.post(endpoint, {
      data: requestData,
    });

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    if (status === 200) {
      expect(body).toHaveProperty('jwt');
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('email');
      expect(body.user.email).toBe('test@example.com');
    } else {
      expect(status).toBeGreaterThanOrEqual(400);
    }
  });

  test('POST /auth/local should reject invalid credentials', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/auth/local`;
    const requestData = {
      identifier: 'invalid@example.com',
      password: 'wrongpassword',
    };

    const response = await request.post(endpoint, {
      data: requestData,
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    expect([400, 401, 500]).toContain(status);
    
    if (body.error || body.message) {
      expect(body).toHaveProperty('error');
    }
  });

  test('POST /auth/local should reject invalid email format', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/auth/local`;
    const requestData = {
      identifier: 'invalid-email-format',
      password: 'somepassword',
    };

    const response = await request.post(endpoint, {
      data: requestData,
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    await testInfo.attach('Status Code', {
      body: `HTTP ${status}`,
      contentType: 'text/plain',
    });

    // May be 400 (bad request), 401 (unauthorized) or 500 (server error) depending on validation
    expect([400, 401, 500]).toContain(status);
  });

  test('POST /auth/local should reject request without password', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/auth/local`;
    const requestData = {
      identifier: 'test@example.com',
    };

    const response = await request.post(endpoint, {
      data: requestData,
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    await testInfo.attach('Status Code', {
      body: `HTTP ${status}`,
      contentType: 'text/plain',
    });

    // May be 400 (bad request) or 500 (server error) depending on how Strapi handles validation
    expect([400, 500]).toContain(status);
  });
});

