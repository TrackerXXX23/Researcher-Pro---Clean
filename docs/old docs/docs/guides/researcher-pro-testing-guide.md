# Comprehensive Testing Guide for Researcher Pro

## Project Overview

Researcher Pro is an AI-driven system for automated industry research, trend analysis, and opportunity identification. The project uses TypeScript, Next.js, and integrates with APIs like Perplexity and OpenAI.

## Testing Setup

- **Framework**: Jest
- **Configuration**: 
  - Jest config: `jest.config.mjs`
  - TypeScript config for tests: `tsconfig.jest.json`
  - Test setup: `jest.setup.js`
- **Dependencies**: Jest, ts-jest, @types/jest (check `package.json` for versions)

## Directory Structure

Tests are located in `__tests__` directories next to the files they're testing:

```
src/
  utils/
    __tests__/
      dataProcessing.test.ts
      dataCategorization.test.ts
      advancedPCMClientAIPromptGenerator.test.ts
  services/
    __tests__/
      perplexityApi.test.ts
      aiAnalysisService.test.ts
```

## Writing Effective Tests

### 1. Basic Test Structure

Use `describe` for test suites and `it` for individual test cases:

```typescript
import { functionToTest } from '../fileUnderTest';

describe('functionToTest', () => {
  it('should handle normal input correctly', () => {
    // Test code
  });

  it('should handle edge cases', () => {
    // Test code
  });
});
```

### 2. Mocking External Dependencies

Use Jest's mocking capabilities, especially for API calls:

```typescript
import axios from 'axios';
jest.mock('axios');

describe('perplexityApi', () => {
  it('should make a POST request with correct parameters', async () => {
    const mockResponse = { data: { choices: [{ message: { content: 'Test answer' } }] } };
    jest.spyOn(axios, 'post').mockResolvedValue(mockResponse);

    // Test code
    
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.perplexity.ai/chat/completions',
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        }),
      })
    );
  });
});
```

### 3. Testing Asynchronous Code

Use async/await for testing asynchronous functions:

```typescript
it('should perform analysis asynchronously', async () => {
  const result = await aiAnalysisService.performAnalysis(/* params */);
  expect(result).toHaveProperty('marketTrends');
  // More assertions...
});
```

### 4. Environment Variables

Manage environment variables in tests:

```typescript
describe('perplexityApi', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, PERPLEXITY_API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Tests...
});
```

### 5. Error Handling

Test both successful scenarios and error cases:

```typescript
it('should throw an error if API key is missing', async () => {
  delete process.env.PERPLEXITY_API_KEY;
  await expect(perplexityApi.query('Test prompt')).rejects.toThrow('PERPLEXITY_API_KEY is not set');
});
```

## Testing Specific Components

### 1. AI Analysis Service (aiAnalysisService.ts)

- Mock `promptGenerator` and `perplexityApi`
- Test `performAnalysis` with various parameters
- Verify parsing of analysis results
- Test report generation

```typescript
jest.mock('../utils/advancedPCMClientAIPromptGenerator');
jest.mock('./perplexityApi');

describe('aiAnalysisService', () => {
  it('should perform analysis and generate report', async () => {
    // Mock setup
    (promptGenerator.generatePrompts as jest.Mock).mockReturnValue(['Test prompt']);
    (perplexityApi.query as jest.Mock).mockResolvedValue(JSON.stringify({
      marketTrends: [{ trend: 'Test trend', impact: 'High' }],
      // ... other mock data
    }));

    const result = await aiAnalysisService.performAnalysis('acquisition', 'high net worth individuals', 'Canada');
    
    expect(result).toHaveProperty('marketTrends');
    expect(result.marketTrends[0]).toEqual({ trend: 'Test trend', impact: 'High' });
    // More assertions...
  });
});
```

### 2. Data Processing (dataProcessing.ts)

- Test data cleaning functions
- Verify handling of different input types
- Test integration with other modules

### 3. Perplexity API (perplexityApi.ts)

- Mock axios for API calls
- Test query function with different inputs
- Verify error handling

## Best Practices

1. **Isolation**: Ensure each test is independent.
2. **Descriptive Names**: Use clear, descriptive test names.
3. **Complete Coverage**: Test normal cases, edge cases, and error scenarios.
4. **Mock External Deps**: Always mock API calls and database operations.
5. **Fast Execution**: Keep tests quick to run.
6. **Maintain Coverage**: Aim for high test coverage, especially for critical logic.

## Continuous Integration

- Ensure tests run on every push and pull request
- Generate and review coverage reports
- Set up alerts for failing tests

## Troubleshooting

1. **Import Issues**: Double-check import paths, use absolute imports when possible.
2. **Type Errors**: Ensure all necessary types are imported and used correctly.
3. **Async Test Timeouts**: Increase timeout for longer-running tests if needed.
4. **Mocking Problems**: Verify mocks are set up correctly and cleared between tests.

## Keeping Tests Up-to-Date

- Update tests when modifying existing functionality
- Add new tests for new features
- Regularly review and refactor tests to maintain clarity and effectiveness

## Advanced Testing Techniques

### Snapshot Testing

Use snapshot testing for UI components or complex data structures that don't change often:

```typescript
it('should match the snapshot', () => {
  const tree = renderer.create(<MyComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### Parameterized Tests

For testing multiple scenarios with the same logic:

```typescript
describe('dataProcessing', () => {
  test.each([
    ['input1', 'expected1'],
    ['input2', 'expected2'],
    // More test cases...
  ])('processData(%s) should return %s', (input, expected) => {
    expect(processData(input)).toBe(expected);
  });
});
```

### Testing React Components

For testing React components, consider using React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
```

## Performance Testing

For critical paths, consider adding performance tests:

```typescript
it('should process large datasets efficiently', () => {
  const start = performance.now();
  const result = processLargeDataset(/* large input */);
  const end = performance.now();
  
  expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
  expect(result).toHaveLength(/* expected length */);
});
```

## Case Study: Fixing aiAnalysisService Tests

This case study demonstrates how we resolved issues in the `aiAnalysisService` tests, providing valuable insights into testing complex services with external dependencies.

### Initial Problems

1. The OpenAI mock was not being set up correctly, leading to "Cannot read properties of undefined (reading 'completions')" errors.
2. The `analyzeDataWithFunctions` backward compatibility test was failing due to improper mocking.

### Solutions Implemented

1. Refactored `AIAnalysisService` class:
   - Modified the constructor to accept an optional `OpenAI` instance:

   ```typescript
   export class AIAnalysisService {
     private openai: OpenAI;

     constructor(openai?: OpenAI) {
       this.openai = openai || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
     }

     // ... rest of the class implementation
   }
   ```

2. Updated `analyzeDataWithFunctions` for better testability:
   - Modified the function to accept an optional `AIAnalysisService` instance:

   ```typescript
   export const analyzeDataWithFunctions = (processedData: ProcessedData, service = aiAnalysisService) => 
     service.analyzeData(processedData);
   ```

3. Improved test setup in `aiAnalysisService.test.ts`:
   - Created a mock `OpenAI` instance and passed it to the `AIAnalysisService` constructor:

   ```typescript
   describe('AIAnalysisService', () => {
     let mockOpenAICreate: jest.Mock;
     let aiAnalysisService: AIAnalysisService;

     beforeEach(() => {
       jest.clearAllMocks();
       mockOpenAICreate = jest.fn();
       const mockOpenAI = {
         chat: {
           completions: {
             create: mockOpenAICreate
           }
         }
       } as unknown as OpenAI;
       aiAnalysisService = new AIAnalysisService(mockOpenAI);
     });

     // ... test cases
   });
   ```

4. Updated the backward compatibility test:
   - Used the mocked `AIAnalysisService` instance in the test:

   ```typescript
   it('should work with analyzeDataWithFunctions for backward compatibility', async () => {
     // ... test setup

     const result = await analyzeDataWithFunctions(processedData, aiAnalysisService);

     // ... assertions
   });
   ```

### Key Learnings

1. **Dependency Injection**: By allowing the `AIAnalysisService` to accept an `OpenAI` instance, we made the class more flexible and easier to test.

2. **Modular Design**: Separating the `analyzeDataWithFunctions` from the class implementation allowed for better backward compatibility and easier testing.

3. **Proper Mocking**: Creating a fully mocked `OpenAI` instance with the necessary methods (like `chat.completions.create`) is crucial for accurate testing.

4. **Consistent Test Environment**: Using `beforeEach` to set up a fresh mock for each test ensures test isolation and prevents inter-test dependencies.

5. **Backward Compatibility**: When maintaining backward compatibility, ensure that both the new and old methods are thoroughly tested.

### Best Practices Derived

1. Design services with testability in mind, allowing for dependency injection of external services.
2. When refactoring, maintain backward compatibility and test both new and old methods.
3. Create comprehensive mocks that accurately represent the behavior of external dependencies.
4. Use TypeScript's type system to ensure mock objects match the expected interface.
5. When dealing with complex external libraries (like OpenAI), mock only the methods you need for your tests.

By applying these practices, we were able to resolve the testing issues and create a more robust and maintainable test suite for the `aiAnalysisService`.

Remember to continuously improve this guide as you discover new testing patterns or encounter specific challenges in the Researcher Pro project.
