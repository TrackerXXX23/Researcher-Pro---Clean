#!/usr/bin/env python3
"""
Configuration Management Script

This script helps manage environment variables and configuration settings
for different environments (development, staging, production).
"""

import os
import sys
import click
import logging
import json
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ConfigManager:
    def __init__(self):
        self.config_dir = Path('config')
        self.config_dir.mkdir(exist_ok=True)
        self.env_file = Path('.env')
        self.env_example = Path('.env.example')

    def load_config(self, environment: str) -> Dict[str, Any]:
        """Load configuration for specific environment"""
        config_file = self.config_dir / f'{environment}.json'
        if not config_file.exists():
            raise FileNotFoundError(
                f"Configuration file not found: {config_file}"
            )
        
        with open(config_file) as f:
            return json.load(f)

    def save_config(
        self,
        environment: str,
        config: Dict[str, Any]
    ):
        """Save configuration for specific environment"""
        config_file = self.config_dir / f'{environment}.json'
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        logger.info(f"Configuration saved: {config_file}")

    def update_env_file(
        self,
        environment: str,
        config: Dict[str, Any]
    ):
        """Update .env file with configuration"""
        # Load existing .env file if it exists
        current_env = {}
        if self.env_file.exists():
            load_dotenv()
            current_env = {
                key: value
                for key, value in os.environ.items()
                if not key.startswith('_')
            }
        
        # Update with new config
        current_env.update(config)
        
        # Write to .env file
        with open(self.env_file, 'w') as f:
            for key, value in sorted(current_env.items()):
                f.write(f"{key}={value}\n")
        
        logger.info(f"Environment file updated: {self.env_file}")

    def validate_config(
        self,
        config: Dict[str, Any]
    ) -> bool:
        """Validate configuration against example"""
        if not self.env_example.exists():
            logger.warning("No .env.example file found for validation")
            return True
        
        # Load required variables from .env.example
        with open(self.env_example) as f:
            required_vars = set()
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key = line.split('=')[0].strip()
                    required_vars.add(key)
        
        # Check if all required variables are present
        missing_vars = required_vars - set(config.keys())
        if missing_vars:
            logger.error(
                f"Missing required variables: {', '.join(missing_vars)}"
            )
            return False
        
        return True

    def encrypt_secrets(
        self,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Encrypt sensitive configuration values"""
        # Implementation would depend on chosen encryption method
        # This is a placeholder that returns unmodified config
        return config

    def decrypt_secrets(
        self,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Decrypt sensitive configuration values"""
        # Implementation would depend on chosen encryption method
        # This is a placeholder that returns unmodified config
        return config

    def diff_configs(
        self,
        env1: str,
        env2: str
    ) -> Dict[str, Any]:
        """Compare configurations between environments"""
        config1 = self.load_config(env1)
        config2 = self.load_config(env2)
        
        # Find differences
        diff = {
            'added': {
                k: config2[k]
                for k in set(config2) - set(config1)
            },
            'removed': {
                k: config1[k]
                for k in set(config1) - set(config2)
            },
            'modified': {
                k: {'from': config1[k], 'to': config2[k]}
                for k in set(config1) & set(config2)
                if config1[k] != config2[k]
            }
        }
        
        return diff

@click.group()
def cli():
    """Configuration management tool"""
    pass

@cli.command()
@click.argument('environment')
def init(environment):
    """Initialize configuration for environment"""
    manager = ConfigManager()
    
    # Create example config
    example_config = {
        'APP_NAME': 'researcher-pro',
        'DEBUG': environment != 'production',
        'DATABASE_URL': 'postgresql://user:pass@localhost:5432/dbname',
        'REDIS_URL': 'redis://localhost:6379',
        'SECRET_KEY': 'generate-secure-key-here',
        'API_VERSION': '1.0.0'
    }
    
    try:
        manager.save_config(environment, example_config)
        print(f"\nInitialized {environment} configuration")
        print("\nNext steps:")
        print("1. Edit config/{environment}.json with your settings")
        print("2. Run './scripts/config.py apply {environment}'")
    except Exception as e:
        logger.error(f"Initialization failed: {str(e)}")
        sys.exit(1)

@cli.command()
@click.argument('environment')
def apply(environment):
    """Apply configuration from environment"""
    manager = ConfigManager()
    
    try:
        # Load config
        config = manager.load_config(environment)
        
        # Validate config
        if not manager.validate_config(config):
            sys.exit(1)
        
        # Update .env file
        manager.update_env_file(environment, config)
        
        print(f"\nApplied {environment} configuration")
    except Exception as e:
        logger.error(f"Configuration apply failed: {str(e)}")
        sys.exit(1)

@cli.command()
@click.argument('environment')
def show(environment):
    """Show configuration for environment"""
    manager = ConfigManager()
    
    try:
        config = manager.load_config(environment)
        print(f"\n{environment} Configuration:")
        print(json.dumps(config, indent=2))
    except Exception as e:
        logger.error(f"Failed to show configuration: {str(e)}")
        sys.exit(1)

@cli.command()
@click.argument('source')
@click.argument('target')
def diff(source, target):
    """Show differences between environments"""
    manager = ConfigManager()
    
    try:
        diff = manager.diff_configs(source, target)
        
        print(f"\nDifferences between {source} and {target}:")
        
        if diff['added']:
            print("\nAdded in target:")
            print(json.dumps(diff['added'], indent=2))
        
        if diff['removed']:
            print("\nRemoved in target:")
            print(json.dumps(diff['removed'], indent=2))
        
        if diff['modified']:
            print("\nModified in target:")
            print(json.dumps(diff['modified'], indent=2))
        
        if not any(diff.values()):
            print("\nNo differences found")
    except Exception as e:
        logger.error(f"Diff failed: {str(e)}")
        sys.exit(1)

@cli.command()
@click.argument('environment')
@click.argument('key')
@click.argument('value')
def set(environment, key, value):
    """Set configuration value"""
    manager = ConfigManager()
    
    try:
        config = manager.load_config(environment)
        config[key] = value
        manager.save_config(environment, config)
        print(f"\nSet {key}={value} in {environment}")
    except Exception as e:
        logger.error(f"Failed to set value: {str(e)}")
        sys.exit(1)

@cli.command()
@click.argument('environment')
@click.argument('key')
def get(environment, key):
    """Get configuration value"""
    manager = ConfigManager()
    
    try:
        config = manager.load_config(environment)
        value = config.get(key)
        if value is None:
            print(f"\nKey {key} not found in {environment}")
        else:
            print(f"\n{key}={value}")
    except Exception as e:
        logger.error(f"Failed to get value: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    cli()
