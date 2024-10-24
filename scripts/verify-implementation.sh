#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Global variables
TOTAL_CHUNKS=0
COMPLETED_CHUNKS=0
FAILED_CHUNKS=0

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to print progress
print_progress() {
    echo -e "${YELLOW}Progress: $COMPLETED_CHUNKS/$TOTAL_CHUNKS chunks completed ($FAILED_CHUNKS failed)${NC}"
}

# Function to run tests with cleanup and proper error handling
run_test_chunk() {
    local test_path=$1
    local chunk_name=$2
    
    ((TOTAL_CHUNKS++))
    
    print_header "Running $chunk_name tests"
    echo "Test path: $test_path"
    
    # Clear Jest cache before each chunk
    npx jest --clearCache
    
    # Run the tests and capture output
    if NODE_ENV=test npx jest "$test_path" --runInBand --detectOpenHandles --forceExit 2>&1; then
        echo -e "${GREEN}Success: $chunk_name tests passed${NC}"
        ((COMPLETED_CHUNKS++))
        return 0
    else
        local exit_code=$?
        echo -e "${RED}Failed: $chunk_name tests (Exit code: $exit_code)${NC}"
        ((FAILED_CHUNKS++))
        return 1
    fi
}

# Function to clean up resources
cleanup() {
    print_header "Cleaning up resources"
    # Kill any hanging test processes
    pkill -f jest || true
    # Clear test caches
    npx jest --clearCache || true
}

# Function to setup test environment
setup_test_env() {
    print_header "Setting up test environment"
    
    # Create .env.test if it doesn't exist
    if [ ! -f ".env.test" ]; then
        cat > .env.test << EOL
# Test Environment Configuration
NODE_ENV=test

# API Keys (using test values)
OPENAI_API_KEY=test-key
PERPLEXITY_API_KEY=test-key

# Database Configuration
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"

# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Test Configuration
SKIP_API_CALLS=true
MOCK_EXTERNAL_SERVICES=true
EOL
    fi
    
    # Create test setup file if it doesn't exist
    if [ ! -f "jest.setup.js" ]; then
        cat > jest.setup.js << EOL
// Jest setup file
process.env.NODE_ENV = 'test';
process.env.SKIP_API_CALLS = 'true';
process.env.MOCK_EXTERNAL_SERVICES = 'true';

// Mock external services
jest.mock('src/services/perplexityService');
jest.mock('src/services/openai');

// Global test timeout
jest.setTimeout(30000);
EOL
    fi
}

# Main verification process
main() {
    # Trap cleanup function
    trap cleanup EXIT
    
    print_header "Starting Verification Process"
    
    # Setup test environment
    setup_test_env
    
    # Ensure all dependencies are installed
    npm install || {
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    }
    
    # Create necessary test directories if they don't exist
    mkdir -p performance-tests
    
    # Array of test chunks
    local test_chunks=(
        "src/services/__tests__/researchService.test.ts:Research Service"
        "src/services/__tests__/aiAnalysisService.test.ts:AI Analysis Service"
        "src/services/__tests__/performanceService.test.ts:Performance Service"
        "src/components/Dashboard/__tests__/AnalysisProcess.test.tsx:Analysis Process"
        "src/components/tests/VerticalProgressFlow.test.tsx:Vertical Progress Flow"
        "src/components/tests/VerticalProgressFlow.integration.test.tsx:Integration Tests"
    )
    
    # Run each test chunk
    for chunk in "${test_chunks[@]}"; do
        IFS=':' read -r test_path chunk_name <<< "$chunk"
        
        # Run the test chunk
        run_test_chunk "$test_path" "$chunk_name"
        
        # Print progress after each chunk
        print_progress
        
        # Delay between chunks
        sleep 2
    done
    
    # Final report
    print_header "Verification Process Complete"
    echo -e "Total chunks: $TOTAL_CHUNKS"
    echo -e "Completed successfully: $((COMPLETED_CHUNKS-FAILED_CHUNKS))"
    echo -e "Failed: $FAILED_CHUNKS"
    
    # Exit with failure if any chunks failed
    if [ $FAILED_CHUNKS -gt 0 ]; then
        echo -e "${RED}Some test chunks failed${NC}"
        exit 1
    else
        echo -e "${GREEN}All test chunks completed successfully${NC}"
        exit 0
    fi
}

# Run the main process
main "$@"
