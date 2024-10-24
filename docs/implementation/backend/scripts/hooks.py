#!/usr/bin/env python3
"""
Git Hooks and Code Quality Management Script

This script helps manage Git hooks and code quality checks
for the FastAPI backend implementation.
"""

import os
import sys
import click
import logging
import subprocess
from pathlib import Path
from typing import List, Dict, Any
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class HookManager:
    def __init__(self):
        self.hooks_dir = Path('.git/hooks')
        self.scripts_dir = Path('scripts')
        self.config_file = Path('hooks-config.json')

    def setup_hooks(self):
        """Set up Git hooks"""
        try:
            # Create hooks directory if it doesn't exist
            self.hooks_dir.mkdir(exist_ok=True)
            
            # Install pre-commit hook
            self._install_hook('pre-commit', self._get_pre_commit_script())
            
            # Install pre-push hook
            self._install_hook('pre-push', self._get_pre_push_script())
            
            # Install commit-msg hook
            self._install_hook('commit-msg', self._get_commit_msg_script())
            
            logger.info("Git hooks installed successfully")
        except Exception as e:
            logger.error(f"Failed to set up hooks: {str(e)}")
            raise

    def _install_hook(self, hook_name: str, content: str):
        """Install specific Git hook"""
        hook_path = self.hooks_dir / hook_name
        
        # Write hook script
        with open(hook_path, 'w') as f:
            f.write(content)
        
        # Make executable
        hook_path.chmod(0o755)
        
        logger.info(f"Installed {hook_name} hook")

    def _get_pre_commit_script(self) -> str:
        """Get pre-commit hook script"""
        return """#!/bin/sh
# Pre-commit hook for code quality checks

# Run code formatting
echo "Running code formatting..."
black . || exit 1
isort . || exit 1

# Run linting
echo "Running linting..."
flake8 . || exit 1

# Run type checking
echo "Running type checking..."
mypy . || exit 1

# Run security checks
echo "Running security checks..."
bandit -r app/ || exit 1

# Run tests
echo "Running tests..."
pytest || exit 1

exit 0
"""

    def _get_pre_push_script(self) -> str:
        """Get pre-push hook script"""
        return """#!/bin/sh
# Pre-push hook for comprehensive checks

# Run all tests
echo "Running all tests..."
pytest || exit 1

# Check test coverage
echo "Checking test coverage..."
pytest --cov=app --cov-fail-under=80 || exit 1

# Run performance tests
echo "Running performance tests..."
python scripts/benchmark.py check || exit 1

exit 0
"""

    def _get_commit_msg_script(self) -> str:
        """Get commit-msg hook script"""
        return """#!/bin/sh
# Commit message hook for enforcing commit message format

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# Check commit message format
echo "Checking commit message format..."

# Regex for conventional commits
conventional_pattern='^(feat|fix|docs|style|refactor|test|chore)(\([a-z-]+\))?: .+'

if ! echo "$commit_msg" | grep -qE "$conventional_pattern"; then
    echo "Error: Commit message does not follow conventional commits format."
    echo "Format: <type>(<scope>): <description>"
    echo "Types: feat, fix, docs, style, refactor, test, chore"
    echo "Example: feat(api): add new endpoint for user profile"
    exit 1
fi

exit 0
"""

    def run_checks(self, fix: bool = False):
        """Run code quality checks"""
        try:
            # Format code
            if fix:
                logger.info("Formatting code...")
                subprocess.run(['black', '.'], check=True)
                subprocess.run(['isort', '.'], check=True)
            
            # Run linting
            logger.info("Running linting...")
            subprocess.run(['flake8', '.'], check=True)
            
            # Run type checking
            logger.info("Running type checking...")
            subprocess.run(['mypy', '.'], check=True)
            
            # Run security checks
            logger.info("Running security checks...")
            subprocess.run(['bandit', '-r', 'app/'], check=True)
            
            # Run tests
            logger.info("Running tests...")
            subprocess.run(['pytest'], check=True)
            
            logger.info("All checks passed!")
        except subprocess.CalledProcessError as e:
            logger.error(f"Checks failed: {str(e)}")
            raise

    def check_commit_message(self, message: str) -> bool:
        """Check if commit message follows convention"""
        import re
        
        # Conventional commits pattern
        pattern = r'^(feat|fix|docs|style|refactor|test|chore)(\([a-z-]+\))?: .+'
        
        return bool(re.match(pattern, message))

    def get_staged_files(self) -> List[str]:
        """Get list of staged files"""
        result = subprocess.run(
            ['git', 'diff', '--cached', '--name-only'],
            capture_output=True,
            text=True
        )
        return result.stdout.splitlines()

    def check_staged_files(self):
        """Run checks on staged files"""
        try:
            files = self.get_staged_files()
            
            # Filter Python files
            python_files = [f for f in files if f.endswith('.py')]
            
            if not python_files:
                logger.info("No Python files staged")
                return
            
            # Run checks on staged files
            logger.info("Checking staged files...")
            
            # Format code
            subprocess.run(['black'] + python_files, check=True)
            subprocess.run(['isort'] + python_files, check=True)
            
            # Run linting
            subprocess.run(['flake8'] + python_files, check=True)
            
            # Run type checking
            subprocess.run(['mypy'] + python_files, check=True)
            
            logger.info("All staged files passed checks!")
        except subprocess.CalledProcessError as e:
            logger.error(f"Staged file checks failed: {str(e)}")
            raise

@click.group()
def cli():
    """Git hooks and code quality management tool"""
    pass

@cli.command()
def setup():
    """Set up Git hooks"""
    manager = HookManager()
    manager.setup_hooks()

@cli.command()
@click.option('--fix', is_flag=True, help='Fix code formatting issues')
def check(fix):
    """Run code quality checks"""
    manager = HookManager()
    manager.run_checks(fix)

@cli.command()
@click.argument('message')
def verify_message(message):
    """Verify commit message format"""
    manager = HookManager()
    if manager.check_commit_message(message):
        print("Commit message format is valid")
        sys.exit(0)
    else:
        print("Error: Invalid commit message format")
        print("Format: <type>(<scope>): <description>")
        print("Types: feat, fix, docs, style, refactor, test, chore")
        print("Example: feat(api): add new endpoint for user profile")
        sys.exit(1)

@cli.command()
def check_staged():
    """Check staged files"""
    manager = HookManager()
    manager.check_staged_files()

if __name__ == '__main__':
    cli()
