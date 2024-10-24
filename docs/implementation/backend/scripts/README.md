# Development Scripts

This directory contains helper scripts for the FastAPI backend implementation.

## Setup Verification Script

### Usage
```bash
# Make script executable
chmod +x scripts/verify_setup.py

# Run verification
./scripts/verify_setup.py
```

The script checks:
- Python version
- Required dependencies
- Environment variables
- Required services
- Database connection and migrations
- Redis connection
- API keys

## Development Helper Script

### Usage
```bash
# Make script executable
chmod +x scripts/dev.py

# Run development server
./scripts/dev.py run --reload

# Format code
./scripts/dev.py format

# Run linting
./scripts/dev.py lint

# Run tests
./scripts/dev.py test --coverage

# Run migrations
./scripts/dev.py migrate

# Create new migration
./scripts/dev.py makemigrations "add_new_table"

# Verify setup
./scripts/dev.py verify

# Clean artifacts
./scripts/dev.py clean

# Generate docs
./scripts/dev.py docs

# View logs
./scripts/dev.py logs app

# Start shell
./scripts/dev.py shell

# List routes
./scripts/dev.py routes

# Run all checks
./scripts/dev.py check
```

## Documentation Generator Script

### Usage
```bash
# Make script executable
chmod +x scripts/generate_docs.py

# Generate documentation
./scripts/generate_docs.py
```

The script generates:
- OpenAPI specification (JSON and YAML)
- Markdown documentation
- Endpoint documentation
- Model documentation
- API summary

Generated documentation is saved in:
```
docs/api/
├── openapi/
│   ├── openapi.json
│   └── openapi.yaml
├── markdown/
│   ├── endpoints/
│   └── models/
├── README.md
├── endpoints.md
└── models.md
```

## Performance Benchmark Script

### Usage
```bash
# Make script executable
chmod +x scripts/benchmark.py

# Run benchmark
./scripts/benchmark.py benchmark --requests 1000 --concurrency 10

# Run load test
./scripts/benchmark.py loadtest --duration 60 --users 10
```

The script provides:
- Performance benchmarking
- Load testing
- Response time analysis
- Resource usage monitoring
- HTML report generation

Generated reports include:
- Request/second metrics
- Response time statistics
- CPU and memory usage
- Interactive charts
- Detailed results table

## Database Management Script

### Usage
```bash
# Make script executable
chmod +x scripts/db.py

# Create database backup
./scripts/db.py backup --compress

# Restore from backup
./scripts/db.py restore backups/backup_20240101_120000.sql.gz

# Run maintenance
./scripts/db.py maintain

# Check connection
./scripts/db.py check

# Show database info
./scripts/db.py info
```

The script provides:
- Database backup and restore
- Maintenance tasks
- Connection checking
- Database information
- Table statistics

### Backup Features
- Compressed backups
- Timestamped files
- Error handling
- Progress logging

### Maintenance Tasks
- Table analysis
- Vacuum operations
- Statistics updates
- Bloat checking

### Information Display
- Version info
- Database size
- Table counts
- Active connections
- Largest tables

## Monitoring Script

### Usage
```bash
# Make script executable
chmod +x scripts/monitor.py

# Run continuous monitoring
./scripts/monitor.py monitor --interval 60

# Run one-time health check
./scripts/monitor.py check
```

The script provides:
- Endpoint health monitoring
- System resource tracking
- Database health checks
- Metrics collection
- Alert notifications

### Monitoring Features
- Response time tracking
- Error rate monitoring
- Resource usage tracking
- Database connection monitoring
- Metric persistence

### Alert Channels
- Email notifications
- Slack notifications
- Prometheus metrics
- Local logs

### Health Checks
- API endpoints
- System resources
- Database health
- Service status

## Configuration Management Script

### Usage
```bash
# Make script executable
chmod +x scripts/config.py

# Initialize configuration
./scripts/config.py init development

# Apply configuration
./scripts/config.py apply development

# Show configuration
./scripts/config.py show development

# Compare configurations
./scripts/config.py diff development production

# Set configuration value
./scripts/config.py set development API_KEY value

# Get configuration value
./scripts/config.py get development API_KEY
```

The script provides:
- Environment-specific configuration
- Configuration validation
- Secret management
- Environment comparison

### Configuration Features
- Multiple environments
- Validation against example
- Secret encryption
- Version control friendly

### Environment Management
- Development setup
- Staging configuration
- Production settings
- Local overrides

### Security Features
- Secret encryption
- Sensitive value handling
- Environment isolation
- Access control

## Virtual Environment Management Script

### Usage
```bash
# Make script executable
chmod +x scripts/venv.py

# Create virtual environment
./scripts/venv.py create

# Install dependencies
./scripts/venv.py install --dev

# Export requirements
./scripts/venv.py export

# Check dependency status
./scripts/venv.py check

# Clean up environment
./scripts/venv.py clean
```

The script provides:
- Virtual environment creation
- Dependency management
- Package updates
- Environment cleanup

### Package Management
- Poetry support
- Pip fallback
- Dev dependencies
- Version control

### Dependency Features
- Package installation
- Version updates
- Status checking
- Requirement exports

### Environment Management
- Creation
- Activation
- Cleanup
- Isolation

## Git Hooks Management Script

### Usage
```bash
# Make script executable
chmod +x scripts/hooks.py

# Set up Git hooks
./scripts/hooks.py setup

# Run code quality checks
./scripts/hooks.py check --fix

# Verify commit message
./scripts/hooks.py verify-message "feat(api): add new endpoint"

# Check staged files
./scripts/hooks.py check-staged
```

The script provides:
- Git hooks installation
- Code quality checks
- Commit message validation
- Staged file verification

### Git Hooks
- Pre-commit hook
- Pre-push hook
- Commit-msg hook
- Custom hooks

### Code Quality Checks
- Code formatting
- Linting
- Type checking
- Security scanning
- Test running

### Commit Message Format
- Conventional commits
- Type validation
- Scope validation
- Description validation

## Script Details

### verify_setup.py
- Verifies development environment setup
- Checks dependencies and services
- Validates configuration

### dev.py
- Development helper commands
- Common development tasks
- Testing and linting

### generate_docs.py
- Generates API documentation
- Creates OpenAPI specification
- Builds Markdown documentation
- Documents models and endpoints

### benchmark.py
- Performance benchmarking
- Load testing
- Resource monitoring
- Report generation

### db.py
- Database management
- Backup and restore
- Maintenance tasks
- Health checks

### monitor.py
- System monitoring
- Health checks
- Metrics collection
- Alert notifications

### config.py
- Configuration management
- Environment variables
- Secret handling
- Environment switching

### venv.py
- Virtual environment management
- Dependency installation
- Package updates
- Environment cleanup

### hooks.py
- Git hooks management
- Code quality checks
- Commit message validation
- Staged file verification

## Installation

1. Make scripts executable:
```bash
chmod +x scripts/*.py
```

2. Add to PATH (optional):
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$PATH:/path/to/researcher-pro/scripts"
```

## Contributing

When adding new scripts:
1. Make them executable
2. Add documentation
3. Follow Python best practices
4. Include error handling
5. Add to this README

## Best Practices

1. **Script Organization**
   - Keep scripts focused
   - Use clear naming
   - Add proper documentation
   - Include error handling

2. **Python Standards**
   - Follow PEP 8
   - Use type hints
   - Add docstrings
   - Handle exceptions

3. **Maintenance**
   - Keep scripts updated
   - Test regularly
   - Document changes
   - Version control

4. **Usage**
   - Make scripts executable
   - Add to version control
   - Document dependencies
   - Include examples
