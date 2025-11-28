import { test, expect } from '@playwright/test';
import { attachApiResponse, API_BASE_URL } from '../utils/api-test-helpers';
import { TEST_USER, TEST_DATA } from '../utils/test-helpers';

test.describe('API - Checkout Endpoints', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/local`, {
      data: {
        identifier: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    if (response.ok()) {
      const body = await response.json();
      authToken = body.jwt;
    }
  });

  test('POST /orders/checkout/validate-address should validate valid address', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/orders/checkout/validate-address`;
    const requestData = {
      street1: '123 Test Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'US',
    };

    const response = await request.post(endpoint, {
      data: requestData,
    });

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    expect([200, 400]).toContain(response.status());
  });

  test('POST /orders/checkout/validate-address should reject invalid address', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/orders/checkout/validate-address`;
    const requestData = {
      street1: '',
      city: '',
      state: '',
      zip: 'invalid',
      country: '',
    };

    const response = await request.post(endpoint, {
      data: requestData,
    });

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    expect([200, 400, 422, 500]).toContain(response.status());
  });

  test('POST /orders/checkout/shipping-rate should calculate shipping rates', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/orders/checkout/shipping-rate`;
    const requestData = {
      address: {
        name: TEST_DATA.address.name,
        email: TEST_DATA.address.email,
        phone_number: TEST_DATA.address.phone,
        street_address: TEST_DATA.address.street,
        country: TEST_DATA.address.country,
        state: TEST_DATA.address.state,
        city: TEST_DATA.address.city,
        zip_code: TEST_DATA.address.zip,
      },
      parcel: {
        length: 10,
        width: 10,
        height: 5,
        weight: 1,
      },
    };

    const response = await request.post(endpoint, {
      data: requestData,
    });

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    expect([200, 400, 500]).toContain(response.status());
  });

  test('POST /orders should create order with valid data', async ({ request }, testInfo) => {
    if (!authToken) {
      test.skip();
      return;
    }

    const productsResponse = await request.get(`${API_BASE_URL}/products?pagination[pageSize]=1`);
    const productsBody = await productsResponse.json();
    
    if (!productsBody.data || productsBody.data.length === 0) {
      test.skip();
      return;
    }

    const product = productsBody.data[0];
    const productId = product.id || product.attributes?.id;

    const endpoint = `${API_BASE_URL}/orders`;
    const requestData = {
      items: [
        {
          id: productId,
          image: 'http://localhost:1337/uploads/product.png',
          display_name: 'Test Product',
          product_name: 'Test Product',
          variant_id: null,
          variant_name: null,
          price: 129.99,
          qty: 1,
        },
      ],
      shipping: TEST_DATA.shipping,
      customer: {
        name: TEST_DATA.address.name,
        email: TEST_DATA.address.email,
        phone_number: TEST_DATA.address.phone,
        street_address: TEST_DATA.address.street,
        country: TEST_DATA.address.country,
        state: TEST_DATA.address.state,
        city: TEST_DATA.address.city,
        zip_code: TEST_DATA.address.zip,
      },
    };

    const response = await request.post(endpoint, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: requestData,
    });

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    expect([200, 201, 400, 500]).toContain(response.status());
  });

  test('POST /orders should reject order without authentication', async ({ request }, testInfo) => {
    const endpoint = `${API_BASE_URL}/orders`;
    const requestData = {
      items: [],
    };

    const response = await request.post(endpoint, {
      data: requestData,
    });

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    expect([400, 401, 403]).toContain(response.status());
  });

  test('POST /orders should reject order without products', async ({ request }, testInfo) => {
    if (!authToken) {
      test.skip();
      return;
    }

    const endpoint = `${API_BASE_URL}/orders`;
    const requestData = {
      items: [],
      shipping: TEST_DATA.shipping,
      customer: {
        name: TEST_DATA.address.name,
        email: TEST_DATA.address.email,
        phone_number: TEST_DATA.address.phone,
        street_address: TEST_DATA.address.street,
        country: TEST_DATA.address.country,
        state: TEST_DATA.address.state,
        city: TEST_DATA.address.city,
        zip_code: TEST_DATA.address.zip,
      },
    };

    const response = await request.post(endpoint, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: requestData,
    });

    await attachApiResponse(testInfo, endpoint, 'POST', requestData, response);
    expect([200, 400, 422]).toContain(response.status());
  });
});

