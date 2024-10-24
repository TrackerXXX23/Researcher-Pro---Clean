#!/usr/bin/env python3
import sys
import subprocess
import importlib
import os
from pathlib import Path

def check_python_version():
    """Check Python version."""
    print("Checking Python version...")
    version = sys.version_info
    if version.major != 3 or version.minor < 8:
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    print("✅ Python version OK")

def check_venv():
    """Check if running in virtualenv."""
    print("Checking virtual environment...")
    if not hasattr(sys, 'real_prefix') and not sys.base_prefix != sys.prefix:
        print("❌ Not running in a virtual environment")
        sys.exit(1)
    print("✅ Virtual environment OK")

def check_dependencies():
    """Check if all required packages are installed."""
    print("Checking dependencies...")
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'alembic',
        'python-jose',
        'passlib',
        'python-multipart',
        'psycopg2-binary',
        'redis',
        'websockets',
        'python-dotenv',
        'celery',
        'prometheus-client',
        'aiohttp',
        'pytest',
        'pytest-asyncio',
        'pytest-cov',
        'locust',
        'aioredis',
        'openai'
    ]
    
    missing = []
    for package in required_packages:
        try:
            importlib.import_module(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        sys.exit(1)
    print("✅ Dependencies OK")

def check_env_file():
    """Check if .env file exists and has required variables."""
    print("Checking .env file...")
    required_vars = {
        'DATABASE_URL': 'PostgreSQL connection string',
        'SECRET_KEY': 'JWT secret key',
        'REDIS_URL': 'Redis connection string',
        'PERPLEXITY_API_KEY': 'Perplexity API key',
        'OPENAI_API_KEY': 'OpenAI API key'
    }
    
    if not Path('.env').exists():
        print("❌ .env file not found")
        print("Please copy .env.example to .env and fill in the required values:")
        for var, description in required_vars.items():
            print(f"  - {var}: {description}")
        sys.exit(1)
    
    # Check required variables
    from dotenv import load_dotenv
    load_dotenv()
    
    missing_vars = []
    empty_vars = []
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value:
            missing_vars.append(f"{var} ({description})")
        elif value.startswith(('your-', 'placeholder')):
            empty_vars.append(f"{var} ({description})")
    
    if missing_vars:
        print(f"❌ Missing environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        sys.exit(1)
    
    if empty_vars:
        print(f"❌ Environment variables with placeholder values:")
        for var in empty_vars:
            print(f"  - {var}")
        sys.exit(1)
    
    print("✅ Environment variables OK")

def check_database():
    """Check database connection."""
    print("Checking database connection...")
    try:
        import psycopg2
        from dotenv import load_dotenv
        load_dotenv()
        
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        conn.close()
        print("✅ Database connection OK")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)

def check_redis():
    """Check Redis connection."""
    print("Checking Redis connection...")
    try:
        import redis
        from dotenv import load_dotenv
        load_dotenv()
        
        r = redis.from_url(os.getenv('REDIS_URL'))
        r.ping()
        print("✅ Redis connection OK")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        sys.exit(1)

def check_api_keys():
    """Verify API keys are valid."""
    print("Checking API keys...")
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check OpenAI API key
    try:
        import openai
        openai.api_key = os.getenv('OPENAI_API_KEY')
        openai.Model.list()
        print("✅ OpenAI API key valid")
    except Exception as e:
        print(f"❌ OpenAI API key invalid: {e}")
        sys.exit(1)
    
    # Check Perplexity API key exists (can't verify without making an actual API call)
    if not os.getenv('PERPLEXITY_API_KEY'):
        print("❌ Perplexity API key missing")
        sys.exit(1)
    print("✅ Perplexity API key present")

def main():
    """Run all checks."""
    print("🔍 Verifying environment setup...")
    
    checks = [
        check_python_version,
        check_venv,
        check_dependencies,
        check_env_file,
        check_database,
        check_redis,
        check_api_keys
    ]
    
    for check in checks:
        try:
            check()
        except Exception as e:
            print(f"❌ {check.__name__} failed: {e}")
            sys.exit(1)
    
    print("\n✨ Environment setup verified successfully!")

if __name__ == "__main__":
    main()
