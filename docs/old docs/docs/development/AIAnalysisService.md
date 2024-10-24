# AIAnalysisService Documentation

## Overview

The `AIAnalysisService` is a crucial component of our application that leverages OpenAI's GPT model to analyze financial data, perform calculations, and generate insights. This service is designed to process complex financial scenarios and provide structured, actionable information.

## Key Features

1. Data Analysis: Utilizes OpenAI's GPT model to analyze financial data.
2. Mathematical Calculations: Performs complex calculations based on input data.
3. Table Generation: Creates well-structured tables to present analysis results.
4. Insight Generation: Identifies market trends, opportunities, risks, and actionable insights.
5. Database Integration: Stores analysis results using Prisma ORM.

## Main Components

### AIAnalysisService Class

The core of this service is the `AIAnalysisService` class, which contains the following main method:

#### analyzeData(processedData: ProcessedData): Promise<AnalysisResult>

This method takes processed data as input and returns a promise that resolves to an `AnalysisResult` object. It performs the following steps:

1. Prepares messages for the OpenAI API, including system instructions and user data.
2. Defines functions for the OpenAI model to call, including `save_insights` and `calculate_tax_savings`.
3. Sends a request to the OpenAI API and processes the response.
4. Handles function calls returned by the API, executing the appropriate functions.
5. Saves the analysis results to the database.

### AnalysisResult Interface

The `AnalysisResult` interface defines the structure of the analysis output:

```typescript
interface AnalysisResult {
  marketTrends: string[];
  opportunities: string[];
  risks: string[];
  actionableInsights: string[];
  calculations: Record<string, number>;
  tables: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
}
```

### ProcessedData Interface

The `ProcessedData` interface is used as input for the `analyzeData` method. It represents the pre-processed data that will be analyzed. The interface is imported from '../interfaces' and includes the following properties:

```typescript
interface ProcessedData {
  id: number;
  prompt: string;
  category: string;
  clientSegment: string;
  legalJurisdiction: string;
  industryFocus: string;
  strategyType: string;
  date: Date;
}
```

### External Dependencies

#### calculateTaxSavings Function

The `calculateTaxSavings` function is imported from the `mathService` module. It is used to perform tax savings calculations during the analysis process. The function signature is:

```typescript
function calculateTaxSavings(args: { netIncome: number; taxRate: number }): number
```

## Usage Examples

### Basic Usage

```typescript
const aiAnalysisService = new AIAnalysisService();

const processedData: ProcessedData = {
  id: 1,
  prompt: "Analyze tax savings for a farmer in Saskatchewan...",
  category: "tax",
  clientSegment: "farmers",
  legalJurisdiction: "Saskatchewan",
  industryFocus: "agriculture",
  strategyType: "asset restructuring",
  date: new Date("2023-07-01")
};

const result = await aiAnalysisService.analyzeData(processedData);
```

### Handling Complex Scenarios

The service can handle complex scenarios involving multiple calculations and data points. For example, it can analyze tax savings potential for asset restructuring:

```typescript
const testPrompt = `
  Analyze the potential tax savings for a farmer in Saskatchewan with a net income of CAD 500,000 by restructuring assets under the Saskatchewan Farm Security Act as of 2023-07-01.

  Consider the following factors:
  1. Current tax rate: 30%
  2. Potential tax rate after restructuring: 25%
  3. Asset restructuring cost: CAD 20,000
`;

const processedData: ProcessedData = {
  id: 1,
  prompt: testPrompt,
  // ... other properties
};

const result = await aiAnalysisService.analyzeData(processedData);
```

The result will include market trends, opportunities, risks, actionable insights, calculations, and formatted tables.

### Integrating with Other Services

The `AIAnalysisService` integrates with other services, such as the `mathService` for specific calculations:

```typescript
// Inside AIAnalysisService
const availableFunctions = {
  calculate_tax_savings: async (args: { netIncome: number; taxRate: number }) => {
    const result = calculateTaxSavings(args);
    return { taxSavings: result };
  },
  // ... other functions
};
```

## Error Handling

The service includes robust error handling to manage API failures and unexpected responses:

```typescript
try {
  // ... analysis logic
} catch (error: unknown) {
  console.error('Error during AI analysis with functions:', error);
  throw new Error(`Failed to analyze data: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

## Testing

The `AIAnalysisService` is thoroughly tested using Jest. The tests cover various scenarios, including:

1. Performing analysis with mathematical calculations and table generation
2. Calling and incorporating results from the `calculate_tax_savings` function
3. Error handling for API failures
4. Performance testing for large datasets

Refer to `src/services/__tests__/aiAnalysisService.test.ts` for detailed test cases and usage examples.

## Backward Compatibility

For backward compatibility, the module exports a standalone function:

```typescript
export const analyzeDataWithFunctions = (processedData: ProcessedData, service = aiAnalysisService) => service.analyzeData(processedData);
```

This function allows for direct use of the `analyzeData` method without instantiating the `AIAnalysisService` class. It uses a default instance of `AIAnalysisService` but allows for dependency injection of a custom service instance if needed.

## Best Practices

1. Always provide well-structured `ProcessedData` objects to the `analyzeData` method.
2. Handle the returned promise and potential errors appropriately in the calling code.
3. Regularly update the OpenAI API key and model version as needed.
4. Monitor the performance and accuracy of the analysis results, and fine-tune the system messages and function definitions as necessary.
5. When using the `analyzeDataWithFunctions` for backward compatibility, consider migrating to the class-based approach for better encapsulation and testability.

## Conclusion

The `AIAnalysisService` provides powerful capabilities for analyzing financial data and generating insights. By leveraging OpenAI's GPT model and integrating with other services, it offers a flexible and extensible solution for complex financial analysis tasks.
