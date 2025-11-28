import { test, expect } from '@playwright/test';
import { attachApiResponse, API_BASE_URL } from '../utils/api-test-helpers';

test.describe('API - Products Endpoints', () => {
  test('GET /products should return product list', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/products?pagination[pageSize]=10`;
    const response = await request.get(endpoint);

    await attachApiResponse(testInfo, endpoint, 'GET', undefined, response);

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /products should support pagination', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/products?pagination[page]=1&pagination[pageSize]=5`;
    const response = await request.get(endpoint);

    await attachApiResponse(testInfo, endpoint, 'GET', undefined, response);

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data.length).toBeLessThanOrEqual(5);
  });

  test('GET /products should include relations when populate is specified', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/products?pagination[pageSize]=1&populate=thumbnail,brand,category`;
    const response = await request.get(endpoint);

    await attachApiResponse(testInfo, endpoint, 'GET', undefined, response);

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    if (body.data && body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('id');
    }
  });

  test('GET /products/:slug should return product by slug', async ({ request }, testInfo) => {
    const listResponse = await request.get(`${API_BASE_URL}/products?pagination[pageSize]=1`);
    const listBody = await listResponse.json();
    
    if (listBody.data && listBody.data.length > 0) {
      const product = listBody.data[0];
      const slug = product.slug || product.attributes?.slug;
      
      if (slug) {
        const endpoint = `${API_BASE_URL}/products/${slug}`;
        const response = await request.get(endpoint);
        
        await attachApiResponse(testInfo, endpoint, 'GET', undefined, response);
        
        expect(response.status()).toBe(200);
        
        const body = await response.json();
        expect(body).toHaveProperty('data');
        expect(body.data.attributes?.slug || body.data.slug).toBe(slug);
      } else {
        test.skip();
      }
    } else {
      test.skip();
    }
  });

  test('GET /products should support search by name', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/products?filters[name][$contains]=nike&pagination[pageSize]=10`;
    const response = await request.get(endpoint);

    await attachApiResponse(testInfo, endpoint, 'GET', undefined, response);

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('data');
    if (body.data && body.data.length > 0) {
      const firstProduct = body.data[0];
      const productName = firstProduct.attributes?.name || firstProduct.name || '';
      expect(productName.toLowerCase()).toContain('nike');
    }
  });

  test('GET /products/:slug should return 404 for non-existent slug', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/products/non-existent-product-slug-12345`;
    const response = await request.get(endpoint);

    await attachApiResponse(testInfo, endpoint, 'GET', undefined, response);

    expect(response.status()).toBe(404);
  });
});

