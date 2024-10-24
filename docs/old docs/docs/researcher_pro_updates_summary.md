# Researcher Pro Updates Summary

## Running E2E Tests

To run the E2E tests locally:

```bash
npx playwright test
```

This will run the Playwright tests in headless mode.

To run the tests with a visible browser:

```bash
npx playwright test --headed
```

## Updating E2E Tests

When adding new functionality, update the E2E tests to cover:

- New UI components or pages.
- Changes in the process flow.
- Additional API endpoints.

Ensure that tests are comprehensive and cover both successful paths and error handling.

**Example:**

```typescript
// tests/new_feature.spec.ts

import { test, expect } from '@playwright/test';

test.describe('New Feature E2E Test', () => {
  test('should perform the new functionality correctly', async ({ page }) => {
    // Test steps here
    await page.goto('/');
    await page.click('button:has-text("New Feature")');
    await expect(page.locator('.result')).toContainText('Expected Result');
  });
});
```

## Troubleshooting

If you encounter issues such as empty reports or errors during the process:

- Check the logs in `logs/combined.log` and `logs/error.log` for detailed error messages.
- Ensure that all environment variables are correctly set.
- Verify that the Perplexity API and OpenAI API keys are valid.
- Use the database client to inspect data in the database tables.

**Common Issues:**

- **No data from Perplexity API:** Check API key and network connectivity.
- **AI analysis errors:** Verify OpenAI API key and input data formatting.
- **Empty reports:** Ensure data is correctly passed to the report generation function.

## Environment Setup

- Copy `.env.example` to `.env` and fill in the required variables:
  ```
  cp .env.example .env
  ```
- Ensure that the database is set up and accessible:
  ```
  npx prisma db push
  ```
- For testing, you may use a test database or in-memory database.
- Install dependencies:
  ```
  npm install
  ```
- Run the development server:
  ```
  npm run dev
  ```

Remember to keep your environment variables secure and never commit them to version control.

## Recent Updates

- Implemented detailed logging throughout the data processing pipeline.
- Enhanced UI with real-time process flow updates.
- Added comprehensive E2E tests using Playwright.
- Updated documentation with troubleshooting steps and environment setup instructions.

## Next Steps

- Monitor application performance and gather user feedback.
- Optimize data processing and AI analysis steps for better performance.
- Implement caching mechanisms where appropriate to reduce API calls.
- Continuously update and expand E2E tests as new features are added.
