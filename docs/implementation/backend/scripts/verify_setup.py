#!/usr/bin/env python3
"""
Verify FastAPI Backend Setup

This script verifies the backend implementation setup and configuration,
checking for required dependencies, services, and configurations.
"""

import os
import sys
import subprocess
import asyncio
import logging
from typing import List, Dict, Any
import aiohttp
import redis
import psycopg2
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SetupVerifier:
    def __init__(self):
        self.errors = []
        self.warnings = []
        # Load environment variables from the backend/.env file
        env_path = os.path.join(os.path.dirname(__file__), "../../../backend/.env")
        load_dotenv(env_path)

    async def verify_all(self):
        """Run all verification checks"""
        try:
            # Check Python version
            await self.check_python_version()
            
            # Check dependencies
            await self.check_dependencies()
            
            # Check environment variables
            await self.check_environment()
            
            # Check services
            await self.check_services()
            
            # Check database
            await self.check_database()
            
            # Check Redis
            await self.check_redis()
            
            # Report results
            self.report_results()
        except Exception as e:
            logger.error(f"Verification failed: {str(e)}")
            sys.exit(1)

    async def check_python_version(self):
        """Check Python version"""
        logger.info("Checking Python version...")
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 9):
            self.errors.append(
                "Python 3.9+ is required"
            )
        else:
            logger.info(f"Python version {version.major}.{version.minor} OK")

    async def check_dependencies(self):
        """Check required dependencies"""
        logger.info("Checking dependencies...")
        required_packages = {
            'fastapi': 'fastapi',
            'uvicorn': 'uvicorn',
            'sqlalchemy': 'sqlalchemy',
            'alembic': 'alembic',
            'redis': 'redis',
            'psycopg2': ['psycopg2', 'psycopg2-binary'],
            'pydantic': 'pydantic',
            'jose': 'python-jose',
            'passlib': 'passlib',
            'multipart': 'python-multipart',
            'aiohttp': 'aiohttp',
            'prometheus_client': 'prometheus-client'
        }
        
        for import_name, package_name in required_packages.items():
            try:
                if isinstance(package_name, list):
                    # Try multiple package names
                    imported = False
                    for pkg in package_name:
                        try:
                            if pkg == 'psycopg2-binary':
                                import psycopg2
                                imported = True
                                break
                            else:
                                __import__(pkg.replace('-', '_'))
                                imported = True
                                break
                        except ImportError:
                            continue
                    if not imported:
                        raise ImportError(f"None of {package_name} could be imported")
                else:
                    __import__(import_name)
                logger.info(f"Package {package_name if isinstance(package_name, str) else package_name[0]} OK")
            except ImportError:
                self.errors.append(
                    f"Required package {package_name if isinstance(package_name, str) else ' or '.join(package_name)} not installed"
                )

    async def check_environment(self):
        """Check environment variables"""
        logger.info("Checking environment variables...")
        env_vars = {
            'DATABASE_URL': os.getenv('DATABASE_URL'),
            'REDIS_URL': os.getenv('REDIS_URL', 'redis://localhost:6379'),
            'SECRET_KEY': os.getenv('SECRET_KEY'),
            'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY'),
            'PERPLEXITY_API_KEY': os.getenv('PERPLEXITY_API_KEY')
        }
        
        for var_name, value in env_vars.items():
            if value:
                logger.info(f"Environment variable {var_name} OK")
            else:
                self.errors.append(
                    f"Required environment variable {var_name} not set"
                )

    async def check_services(self):
        """Check required services"""
        logger.info("Checking services...")
        services = [
            ('PostgreSQL', 5432),
            ('Redis', 6379)
        ]
        
        for service, port in services:
            try:
                # Check if port is open
                proc = await asyncio.create_subprocess_shell(
                    f"nc -z localhost {port}",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                await proc.communicate()
                
                if proc.returncode == 0:
                    logger.info(f"Service {service} OK")
                else:
                    self.errors.append(
                        f"Service {service} not running on port {port}"
                    )
            except Exception as e:
                self.errors.append(
                    f"Error checking {service}: {str(e)}"
                )

    async def check_database(self):
        """Check database connection and migrations"""
        logger.info("Checking database...")
        try:
            db_url = os.getenv('DATABASE_URL')
            if not db_url:
                self.errors.append("DATABASE_URL not set")
                return

            # Remove schema parameter if present
            if "?schema=" in db_url:
                db_url = db_url.split("?schema=")[0]

            # Try to connect with current user
            try:
                conn = psycopg2.connect(db_url)
            except psycopg2.OperationalError:
                # If that fails, try with your username
                db_url = f"postgresql://chetpaslawski@localhost:5432/researcher_pro"
                conn = psycopg2.connect(db_url)

            cur = conn.cursor()
            
            # Check if alembic_version table exists
            cur.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'alembic_version'
                );
            """)
            has_migrations = cur.fetchone()[0]
            
            if not has_migrations:
                self.warnings.append(
                    "Database migrations not applied"
                )
            else:
                logger.info("Database migrations OK")
            
            conn.close()
            logger.info("Database connection OK")
        except Exception as e:
            self.errors.append(f"Database error: {str(e)}")

    async def check_redis(self):
        """Check Redis connection"""
        logger.info("Checking Redis...")
        try:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            r = redis.from_url(redis_url)
            r.ping()
            logger.info("Redis connection OK")
        except Exception as e:
            self.errors.append(f"Redis error: {str(e)}")

    def report_results(self):
        """Report verification results"""
        print("\n=== Verification Results ===\n")
        
        if not self.errors and not self.warnings:
            print("✅ All checks passed successfully!")
            sys.exit(0)
        
        if self.errors:
            print("\n❌ Errors:")
            for error in self.errors:
                print(f"  - {error}")
        
        if self.warnings:
            print("\n⚠️  Warnings:")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        if self.errors:
            sys.exit(1)
        else:
            sys.exit(0)

async def main():
    """Main function"""
    verifier = SetupVerifier()
    await verifier.verify_all()

if __name__ == "__main__":
    asyncio.run(main())
