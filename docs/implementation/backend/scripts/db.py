#!/usr/bin/env python3
"""
Database Management Script

This script provides utilities for managing the PostgreSQL database,
including migrations, backups, and maintenance tasks.
"""

import os
import sys
import click
import logging
import subprocess
from datetime import datetime
from pathlib import Path
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        self.backup_dir = Path('backups')
        self.backup_dir.mkdir(exist_ok=True)

    def get_connection(self, database=None):
        """Get database connection"""
        params = self._parse_db_url()
        if database:
            params['database'] = database
        return psycopg2.connect(**params)

    def _parse_db_url(self):
        """Parse database URL into connection parameters"""
        # Example URL: postgresql://user:password@localhost:5432/dbname
        parts = self.db_url.split('://', 1)[1].split('@')
        user_pass = parts[0].split(':')
        host_port_db = parts[1].split('/')
        host_port = host_port_db[0].split(':')
        
        return {
            'user': user_pass[0],
            'password': user_pass[1],
            'host': host_port[0],
            'port': int(host_port[1]),
            'database': host_port_db[1]
        }

    def create_backup(self, compress=True):
        """Create database backup"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = self.backup_dir / f'backup_{timestamp}.sql'
            
            # Create backup
            params = self._parse_db_url()
            cmd = [
                'pg_dump',
                '-h', params['host'],
                '-p', str(params['port']),
                '-U', params['user'],
                '-d', params['database'],
                '-f', str(backup_file)
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = params['password']
            
            subprocess.run(cmd, env=env, check=True)
            
            # Compress if requested
            if compress:
                subprocess.run(['gzip', str(backup_file)])
                backup_file = Path(f'{backup_file}.gz')
            
            logger.info(f"Backup created: {backup_file}")
            return backup_file
        except Exception as e:
            logger.error(f"Backup failed: {str(e)}")
            raise

    def restore_backup(self, backup_file):
        """Restore database from backup"""
        try:
            # Check if file is compressed
            if backup_file.suffix == '.gz':
                # Decompress to temporary file
                temp_file = backup_file.with_suffix('')
                subprocess.run(['gunzip', '-c', backup_file], stdout=open(temp_file, 'wb'))
                backup_file = temp_file
            
            params = self._parse_db_url()
            cmd = [
                'psql',
                '-h', params['host'],
                '-p', str(params['port']),
                '-U', params['user'],
                '-d', params['database'],
                '-f', str(backup_file)
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = params['password']
            
            subprocess.run(cmd, env=env, check=True)
            
            # Clean up temporary file
            if temp_file:
                temp_file.unlink()
            
            logger.info(f"Backup restored: {backup_file}")
        except Exception as e:
            logger.error(f"Restore failed: {str(e)}")
            raise

    def run_maintenance(self):
        """Run database maintenance tasks"""
        try:
            with self.get_connection() as conn:
                conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                with conn.cursor() as cur:
                    # Analyze tables
                    logger.info("Analyzing tables...")
                    cur.execute("ANALYZE VERBOSE;")
                    
                    # Vacuum analyze
                    logger.info("Running VACUUM ANALYZE...")
                    cur.execute("VACUUM ANALYZE;")
                    
                    # Update statistics
                    logger.info("Updating statistics...")
                    cur.execute("ANALYZE;")
                    
                    # Check for bloat
                    logger.info("Checking for table bloat...")
                    cur.execute("""
                        SELECT schemaname, tablename,
                            pg_size_pretty(pg_total_relation_size('"'||schemaname||'"."'||tablename||'"')) as total_size,
                            pg_size_pretty(pg_relation_size('"'||schemaname||'"."'||tablename||'"')) as table_size,
                            pg_size_pretty(pg_total_relation_size('"'||schemaname||'"."'||tablename||'"') - 
                                         pg_relation_size('"'||schemaname||'"."'||tablename||'"')) as bloat_size
                        FROM pg_tables
                        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
                        ORDER BY pg_total_relation_size('"'||schemaname||'"."'||tablename||'"') DESC;
                    """)
                    
                    # Print bloat report
                    print("\nTable Bloat Report:")
                    print("Schema | Table | Total Size | Table Size | Bloat Size")
                    print("-" * 60)
                    for row in cur.fetchall():
                        print(f"{row[0]} | {row[1]} | {row[2]} | {row[3]} | {row[4]}")
            
            logger.info("Maintenance completed successfully")
        except Exception as e:
            logger.error(f"Maintenance failed: {str(e)}")
            raise

    def check_connection(self):
        """Check database connection"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT version();")
                    version = cur.fetchone()[0]
                    logger.info(f"Database connection successful: {version}")
                    return True
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
            return False

@click.group()
def cli():
    """Database management commands"""
    pass

@cli.command()
@click.option('--compress/--no-compress', default=True, help='Compress backup file')
def backup(compress):
    """Create database backup"""
    db = DatabaseManager()
    db.create_backup(compress)

@cli.command()
@click.argument('backup_file')
def restore(backup_file):
    """Restore database from backup"""
    db = DatabaseManager()
    db.restore_backup(Path(backup_file))

@cli.command()
def maintain():
    """Run database maintenance"""
    db = DatabaseManager()
    db.run_maintenance()

@cli.command()
def check():
    """Check database connection"""
    db = DatabaseManager()
    if db.check_connection():
        sys.exit(0)
    sys.exit(1)

@cli.command()
def info():
    """Show database information"""
    db = DatabaseManager()
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cur:
                # Get version
                cur.execute("SELECT version();")
                version = cur.fetchone()[0]
                print(f"\nDatabase Version: {version}")
                
                # Get size
                cur.execute("""
                    SELECT pg_size_pretty(pg_database_size(current_database()));
                """)
                size = cur.fetchone()[0]
                print(f"Database Size: {size}")
                
                # Get table counts
                cur.execute("""
                    SELECT COUNT(*) FROM information_schema.tables
                    WHERE table_schema NOT IN ('pg_catalog', 'information_schema');
                """)
                table_count = cur.fetchone()[0]
                print(f"Number of Tables: {table_count}")
                
                # Get connection info
                cur.execute("""
                    SELECT count(*) FROM pg_stat_activity
                    WHERE datname = current_database();
                """)
                connections = cur.fetchone()[0]
                print(f"Active Connections: {connections}")
                
                # Show largest tables
                print("\nLargest Tables:")
                cur.execute("""
                    SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size('"'||schemaname||'"."'||tablename||'"'))
                    FROM pg_tables
                    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
                    ORDER BY pg_total_relation_size('"'||schemaname||'"."'||tablename||'"') DESC
                    LIMIT 5;
                """)
                print("Schema | Table | Size")
                print("-" * 40)
                for row in cur.fetchall():
                    print(f"{row[0]} | {row[1]} | {row[2]}")
    except Exception as e:
        logger.error(f"Failed to get database info: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    cli()
