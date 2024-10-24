const fs = require('fs');
const path = require('path');

const coverageFile = path.join(__dirname, '../coverage/coverage-summary.json');
const minCoverage = process.env.MIN_COVERAGE || 80;

try {
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  const total = coverage.total;

  console.log('Coverage Summary:');
  console.log(`Statements: ${total.statements.pct}%`);
  console.log(`Branches: ${total.branches.pct}%`);
  console.log(`Functions: ${total.functions.pct}%`);
  console.log(`Lines: ${total.lines.pct}%`);

  if (
    total.statements.pct < minCoverage ||
    total.branches.pct < minCoverage ||
    total.functions.pct < minCoverage ||
    total.lines.pct < minCoverage
  ) {
    console.error(`Coverage is below the minimum threshold of ${minCoverage}%`);
    process.exit(1);
  }

  console.log('Coverage check passed!');
  process.exit(0);
} catch (error) {
  console.error('Error reading coverage file:', error);
  process.exit(1);
}
