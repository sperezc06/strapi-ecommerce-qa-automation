import { Page, TestInfo } from '@playwright/test';
import { test } from '@playwright/test';

// Captures API responses matching the pattern for reporting
export function setupApiCapture(page: Page, endpointPattern: string | RegExp, description?: string) {
  const responses: any[] = [];
  const handler = async (response: any) => {
    const url = response.url();
    const matches = typeof endpointPattern === 'string' ? url.includes(endpointPattern) : endpointPattern.test(url);
    if (matches) {
      try {
        const status = response.status();
        let body: any;
        // Try to parse as JSON, fallback to text
        try {
          body = await response.json();
        } catch {
          try {
            body = await response.text();
          } catch {
            body = 'Could not parse response';
          }
        }
        responses.push({ url, status, statusText: response.statusText(), body });
      } catch {}
    }
  };
  page.on('response', handler);
  return {
    attachToReport: async (testInfo: TestInfo) => {
      page.off('response', handler);
      if (responses.length > 0) {
        await test.step(`API Response${description ? `: ${description}` : ''}`, async () => {
          for (const resp of responses) {
            const summary = `URL: ${resp.url}\nStatus: ${resp.status}\n\nResponse:\n${JSON.stringify(resp.body, null, 2)}`;
            await testInfo.attach(`API Response - ${resp.status}`, { body: summary, contentType: 'text/plain' });
          }
        });
      }
    },
  };
}

// Wrapper for test.step to hide internal Playwright actions in reports
export async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return test.step(name, fn, { box: true });
}

// Takes screenshot with optional element highlighting
export async function takeScreenshot(
  page: Page, 
  testInfo: TestInfo, 
  name: string, 
  description?: string,
  locator?: any
): Promise<void> {
  // Clear any previous highlights
  await page.evaluate(() => {
    const highlighted = document.querySelectorAll('[style*="outline"], [style*="box-shadow"]');
    highlighted.forEach((el: any) => {
      if (el.style.outline && el.style.outline.includes('3px solid')) {
        el.style.outline = '';
        el.style.boxShadow = '';
      }
    });
  }).catch(() => {});
  
  // Highlight element if provided
  if (locator) {
    try {
      if (typeof locator.highlight === 'function') {
        await locator.highlight();
        await page.waitForTimeout(300);
      } else {
        await locator.evaluate((el: HTMLElement) => {
          el.style.outline = '3px solid #ff0000';
          el.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        });
        await page.waitForTimeout(300);
      }
    } catch {}
  }
  
  // Take screenshot and attach to report
  const screenshot = await page.screenshot({ fullPage: true, timeout: 5000 }).catch(() => null);
  if (!screenshot) return;
  await testInfo.attach(description || name, { body: screenshot, contentType: 'image/png' });
  
  // Clear highlight after screenshot
  if (locator) {
    try {
      await locator.evaluate((el: HTMLElement) => {
        el.style.outline = '';
        el.style.boxShadow = '';
      }).catch(() => {});
    } catch {}
  }
}

