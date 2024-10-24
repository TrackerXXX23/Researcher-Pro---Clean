# Jest Test Logging Help

This document provides guidance on improving Jest test logging, common issues, and troubleshooting tips for the Researcher Pro project.

## Improving Jest Test Logging

1. **Verbose Output**: Run Jest with the `--verbose` flag to get more detailed output:
   ```
   npm test -- --verbose
   ```

2. **Custom Reporters**: Consider using custom reporters for more detailed or formatted output. You can add a custom reporter in your Jest configuration:
   ```javascript
   // jest.config.js
   module.exports = {
     // ... other config
     reporters: ['default', '<custom-reporter-path>'],
   };
   ```

3. **Console Logging**: Use `console.log()` statements in your tests for debugging. These will be captured in the Jest output.

4. **Test Environment Logging**: If you need to debug the test environment setup, you can add logging to your `jest.setup.js` file.

## Common Issues and Solutions

1. **Tests not running**: 
   - Ensure test files are named correctly (e.g., `*.test.js`, `*.spec.js`)
   - Check Jest configuration in `package.json` or `jest.config.js`

2. **ESM Import Issues**:
   - Ensure `type: "module"` is set in `package.json`
   - Use `.js` extensions in import statements
   - Configure Jest to handle ESM (see jest.config.js)

3. **TypeScript Compilation Errors**:
   - Verify TypeScript configuration in `tsconfig.json`
   - Ensure `@babel/preset-typescript` is correctly configured

4. **Mocking Issues**:
   - Use `jest.mock()` for ES6 class mocks
   - Ensure mock implementations are correct

## Debugging Tips

1. **Use Node.js Debugger**: 
   Run Jest with the `--runInBand` and `--no-cache` flags, then use the Node.js debugger:
   ```
   node --inspect-brk node_modules/.bin/jest --runInBand --no-cache
   ```

2. **VSCode Debugging**:
   Create a launch configuration in `.vscode/launch.json`:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Jest Current File",
     "program": "${workspaceFolder}/node_modules/.bin/jest",
     "args": ["${fileBasenameNoExtension}", "--config", "jest.config.js"],
     "console": "integratedTerminal",
     "internalConsoleOptions": "neverOpen",
     "disableOptimisticBPs": true,
     "windows": {
       "program": "${workspaceFolder}/node_modules/jest/bin/jest"
     }
   }
   ```

3. **Jest Watch Mode**:
   Use Jest's watch mode for real-time feedback:
   ```
   npm test -- --watch
   ```

## Useful Jest CLI Options

- `--detectOpenHandles`: Detect async operations that weren't cleaned up
- `--runInBand`: Run all tests serially in the current process
- `--coverage`: Collect and report test coverage
- `--updateSnapshot`: Update snapshot tests

Remember to check the Jest documentation for more detailed information on configuration and usage: https://jestjs.io/docs/en/getting-started
