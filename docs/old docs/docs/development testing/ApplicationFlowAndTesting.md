# Researcher Pro: Application Flow and Testing Checklist

## Overview

Researcher Pro is an AI-driven application designed to automate the process of collecting, analyzing, and reporting on financial data and industry trends. The application uses advanced AI models to generate insights and recommendations for financial strategies.

## Application Flow

1. **Prompt Generation and Reasoning**
   - Generate prompts using the `advancedPCMClientAIPromptGenerator`
   - Tailor prompts for different categories and parameters

2. **Data Collection and Processing**
   - Collect data from various sources (currently simulated, future integration with Perplexity API planned)
   - Clean, preprocess, and categorize collected data
   - Store processed data in the database using Prisma ORM

3. **AI Analysis**
   - Use `AIAnalysisService` with OpenAI's GPT model to analyze processed data
   - Generate insights, recommendations, and perform calculations
   - Extract and categorize insights (e.g., market trends, opportunities, risks)

4. **Report Generation**
   - Compile AI-generated insights into structured reports using `reportGenerationService`
   - Generate HTML reports using Handlebars templates

5. **User Interface**
   - Display process status and history on the main application page
   - Provide report viewing functionality

6. **Real-time Updates**
   - Use Socket.IO for real-time process status updates

## Key Components and Their Purposes

1. **advancedPCMClientAIPromptGenerator**: Generates tailored prompts for data collection
2. **AIAnalysisService**: Interfaces with OpenAI's GPT model for data analysis
3. **mathService**: Performs specific financial calculations
4. **processService**: Orchestrates the entire data processing and analysis flow
5. **reportGenerationService**: Compiles analyzed data into structured reports
6. **Prisma ORM**: Manages database operations
7. **Socket.IO**: Enables real-time communication
8. **Next.js**: Provides the web application framework

## Testing Checklist

### 1. Prompt Generation and Reasoning
- [ ] Verify prompt templates for different categories
- [ ] Test `generatePrompts` function with various inputs
- [ ] Ensure integration with AIAnalysisService

### 2. Data Collection and Processing
- [ ] Test data cleaning and preprocessing functions
- [ ] Verify correct categorization of processed data
- [ ] Check duplicate removal functionality
- [ ] Test filtering of irrelevant content
- [ ] Verify Prisma ORM setup and database schema
- [ ] Test data storage functions for processed and raw data

### 3. AI Analysis
- [ ] Confirm AIAnalysisService successfully calls OpenAI API
- [ ] Verify generation of insights, recommendations, and calculations
- [ ] Test insight extraction for different categories
- [ ] Check storage of analysis results in the database
- [ ] Test integration with mathService for financial calculations

### 4. Report Generation
- [ ] Review HTML/CSS template for reports
- [ ] Test function that compiles insights into report format
- [ ] Verify date-based report generation
- [ ] Ensure reports are generated for the correct date range
- [ ] Check that generated HTML reports are saved correctly
- [ ] Test conditional rendering for missing or empty data

### 5. User Interface
- [ ] Test main page loading and display of process controls
- [ ] Verify ProcessManager component functionality
- [ ] Check ProcessHistory component for accurate information display
- [ ] Test ReportsList component for correct display of generated reports
- [ ] Verify individual report viewing functionality

### 6. Real-time Updates
- [ ] Test Socket.IO setup on both server and client sides
- [ ] Verify real-time status updates in the UI during process execution
- [ ] Test reconnection scenarios (e.g., temporary network disconnection)

### 7. API Routes
- [ ] Test each API route:
  - [ ] /api/start-process
  - [ ] /api/process-updates
  - [ ] /api/get-report
  - [ ] /api/getAnalysis
  - [ ] /api/saveAnalysis
  - [ ] /api/saveInsights
- [ ] Verify correct handling of various input scenarios and error cases

### 8. End-to-End Flow
- [ ] Start a new process from the UI
- [ ] Monitor real-time updates throughout the process
- [ ] Verify final report generation and availability in the UI

### 9. Performance and Integration Testing
- [ ] Conduct unit tests for all components
- [ ] Perform integration tests for the full process flow
- [ ] Run end-to-end tests using Playwright
- [ ] Conduct performance tests, especially for components like VerticalProgressFlow

### 10. Error Handling and Edge Cases
- [ ] Test error handling in AIAnalysisService for API failures
- [ ] Verify proper handling of unexpected data formats
- [ ] Test system behavior with large datasets
- [ ] Check for proper cleanup of resources and async operations

### 11. TypeScript and Jest Configuration
- [ ] Verify Jest configuration for parsing TypeScript files
- [ ] Check for proper handling of ES module syntax in tests
- [ ] Ensure correct type assertions in test files
- [ ] Review tsconfig.json for compatibility with Jest and the testing environment

## Testing Best Practices

1. Use verbose output and custom reporters for detailed Jest test logging
2. Utilize console logging and the Node.js debugger for troubleshooting
3. Make use of Jest CLI options like --detectOpenHandles and --coverage
4. Regularly update snapshots and review test coverage
5. Implement both unit and integration tests for comprehensive coverage

## Troubleshooting Common Issues

1. For Jest and TypeScript configuration issues, refer to the Jest_TypeScript_Config_Troubleshooting_Log.md
2. For report generation issues, check the ReportGenerationProcess.md for recent changes and troubleshooting steps
3. For TypeScript errors in data processing, consult the typescript_error_in_data_processing.md file

## Continuous Improvement

1. Regularly update this testing checklist as new features are added or existing ones are modified
2. Encourage developers to add tests for new functionality and bug fixes
3. Periodically review and refactor tests to maintain clarity and efficiency
4. Keep documentation up-to-date, especially regarding testing procedures and known issues

Remember to use this checklist in conjunction with automated tests for comprehensive coverage. As you test each item, mark it as complete and add notes or bug reports for any issues encountered.
