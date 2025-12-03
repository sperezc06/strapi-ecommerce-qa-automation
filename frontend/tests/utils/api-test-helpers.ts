import { APIRequestContext, TestInfo } from '@playwright/test';
import { test } from '@playwright/test';

// API base URL for all API tests
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

// Attaches API request and response details to Allure report
export async function attachApiResponse(
  testInfo: TestInfo,
  endpoint: string,
  method: string,
  requestData?: any,
  response?: any
) {
  // Attach request information to Allure report
  await test.step(`Request: ${method} ${endpoint}`, async () => {
    // Attach request body as formatted JSON
    if (requestData) {
      await testInfo.attach('Request Body', {
        body: JSON.stringify(requestData, null, 2),
        contentType: 'application/json',
      });
    }
    
    // Attach request metadata (method and endpoint)
    await testInfo.attach('Request Details', {
      body: `Method: ${method}\nEndpoint: ${endpoint}`,
      contentType: 'text/plain',
    });
  });

  if (response) {
    const status = response.status();
    const statusText = response.statusText();
    let body: any;
    
    // Parse response: try JSON first, fallback to text, then error message
    try {
      body = await response.json();
    } catch {
      try {
        body = await response.text();
      } catch {
        body = 'Could not parse response';
      }
    }

    // Attach response information to Allure report
    await test.step(`Response: ${status} ${statusText}`, async () => {
      // Attach formatted JSON response body
      await testInfo.attach('Response Body (JSON)', {
        body: JSON.stringify(body, null, 2),
        contentType: 'application/json',
      });

      const summary = `Status: ${status} ${statusText}\n\nResponse:\n${JSON.stringify(body, null, 2)}`;
      await testInfo.attach('Response Summary', {
        body: summary,
        contentType: 'text/plain',
      });

      const headers = response.headers();
      if (Object.keys(headers).length > 0) {
        await testInfo.attach('Response Headers', {
          body: JSON.stringify(headers, null, 2),
          contentType: 'application/json',
        });
      }
    });
  }
}

