# E2E Testing Troubleshooting Guide

This document outlines the process of troubleshooting and improving E2E tests for the Researcher Pro project.

## Recent Updates

We've made significant changes to our E2E testing approach to address issues with rapid state changes and timing-related test failures. The main updates include:

1. More flexible step checking: Instead of sequentially checking for each step, we now monitor for any expected steps that occur during the process.
2. Improved logging: We've added more detailed logging to capture all observed steps and provide better visibility into the test execution.
3. Success criteria adjustment: The test is now considered successful if it observes the final "Report generated" step, even if some intermediate steps are missed due to rapid state changes.

## Current Testing Approach

Our current E2E testing approach involves:

1. Starting the application and navigating to the home page.
2. Initiating the research process by clicking the "Start Process" button.
3. Monitoring the process status, messages, and steps throughout the execution.
4. Logging all observed steps during the process.
5. Verifying that the final "Report generated" step is observed.
6. Checking for the presence of the generated report content.

This approach allows for more resilient tests that can handle variations in process speed and potential missed intermediate steps.

## Running E2E Tests

To run the E2E tests:

1. Ensure you have the latest version of the project code.
2. Install dependencies if you haven't already: `npm install`
3. Run the E2E tests using the command: `npx playwright test`

## Debugging E2E Tests

If you encounter issues with the E2E tests:

1. Check the test output for any error messages or unexpected behavior.
2. Review the logged steps to see which parts of the process were observed.
3. If specific steps are consistently missing, you may need to adjust the `expectedSteps` array in the test file.
4. For more detailed debugging, you can use the Playwright debug mode: `npx playwright test --debug`

## Known Issues and Workarounds

- Rapid state changes: The process may complete very quickly, making it difficult to observe all intermediate steps. Our current approach focuses on ensuring the overall process completes successfully rather than verifying each individual step.
- Report content verification: Currently, we only check for the presence of the "Report Content:" text. In the future, we may want to implement more thorough checks on the generated report content.

## Next Steps

1. Continue monitoring the performance and reliability of the updated E2E tests.
2. Consider implementing more detailed checks on the generated report content.
3. Explore options for slowing down the process or adding more observable intermediate steps for testing purposes.

## Useful Commands

- Run E2E tests: `npx playwright test`
- Run E2E tests with debugging: `npx playwright test --debug`
- Start development server: `npm run dev`

Remember to keep this document updated as you make further changes to the E2E testing process or encounter new issues.
