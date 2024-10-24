#!/usr/bin/env python3
"""
Monitoring and Alerting Script

This script provides monitoring and alerting functionality for the FastAPI backend,
tracking system health, performance metrics, and sending alerts when issues arise.
"""

import os
import sys
import time
import json
import click
import logging
import psutil
import aiohttp
import asyncio
import smtplib
import requests
from datetime import datetime, timedelta
from pathlib import Path
from email.message import EmailMessage
from typing import Dict, List, Any
from prometheus_client import CollectorRegistry, Gauge, Counter, push_to_gateway
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class Monitor:
    def __init__(self):
        self.registry = CollectorRegistry()
        self.metrics_dir = Path('metrics')
        self.metrics_dir.mkdir(exist_ok=True)
        
        # Initialize metrics
        self.response_time = Gauge(
            'api_response_time_seconds',
            'API endpoint response time in seconds',
            ['endpoint'],
            registry=self.registry
        )
        
        self.error_count = Counter(
            'api_errors_total',
            'Total number of API errors',
            ['endpoint', 'error_type'],
            registry=self.registry
        )
        
        self.cpu_usage = Gauge(
            'system_cpu_usage_percent',
            'System CPU usage percentage',
            registry=self.registry
        )
        
        self.memory_usage = Gauge(
            'system_memory_usage_bytes',
            'System memory usage in bytes',
            registry=self.registry
        )
        
        self.db_connections = Gauge(
            'db_active_connections',
            'Number of active database connections',
            registry=self.registry
        )

    async def check_endpoint(
        self,
        url: str,
        method: str = 'GET',
        payload: Dict = None
    ) -> Dict[str, Any]:
        """Check endpoint health"""
        try:
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method,
                    url,
                    json=payload
                ) as response:
                    duration = time.time() - start_time
                    self.response_time.labels(url).set(duration)
                    
                    if response.status >= 400:
                        self.error_count.labels(
                            url,
                            f"HTTP_{response.status}"
                        ).inc()
                    
                    return {
                        'url': url,
                        'status': response.status,
                        'duration': duration,
                        'timestamp': datetime.now().isoformat()
                    }
        except Exception as e:
            self.error_count.labels(url, type(e).__name__).inc()
            logger.error(f"Endpoint check failed: {str(e)}")
            return {
                'url': url,
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    async def check_system_resources(self) -> Dict[str, Any]:
        """Check system resources"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent()
            self.cpu_usage.set(cpu_percent)
            
            # Memory usage
            memory = psutil.virtual_memory()
            self.memory_usage.set(memory.used)
            
            # Disk usage
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': disk.percent,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Resource check failed: {str(e)}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    async def check_database(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            import psycopg2
            conn = psycopg2.connect(os.getenv('DATABASE_URL'))
            cur = conn.cursor()
            
            # Check active connections
            cur.execute("""
                SELECT count(*) FROM pg_stat_activity
                WHERE datname = current_database();
            """)
            connections = cur.fetchone()[0]
            self.db_connections.set(connections)
            
            # Check database size
            cur.execute("""
                SELECT pg_size_pretty(pg_database_size(current_database()));
            """)
            size = cur.fetchone()[0]
            
            conn.close()
            
            return {
                'connections': connections,
                'size': size,
                'status': 'healthy',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Database check failed: {str(e)}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    async def send_alert(
        self,
        subject: str,
        message: str,
        level: str = 'warning'
    ):
        """Send alert via email and Slack"""
        try:
            # Send email alert
            if os.getenv('SMTP_HOST'):
                email = EmailMessage()
                email.set_content(message)
                email['Subject'] = f"[{level.upper()}] {subject}"
                email['From'] = os.getenv('SMTP_FROM')
                email['To'] = os.getenv('ALERT_EMAIL')
                
                with smtplib.SMTP(
                    os.getenv('SMTP_HOST'),
                    int(os.getenv('SMTP_PORT', 587))
                ) as server:
                    server.starttls()
                    server.login(
                        os.getenv('SMTP_USER'),
                        os.getenv('SMTP_PASSWORD')
                    )
                    server.send_message(email)
            
            # Send Slack alert
            if os.getenv('SLACK_WEBHOOK_URL'):
                requests.post(
                    os.getenv('SLACK_WEBHOOK_URL'),
                    json={
                        'text': f"*[{level.upper()}] {subject}*\n{message}"
                    }
                )
        except Exception as e:
            logger.error(f"Alert sending failed: {str(e)}")

    async def save_metrics(self, metrics: Dict[str, Any]):
        """Save metrics to file"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            metrics_file = self.metrics_dir / f'metrics_{timestamp}.json'
            
            with open(metrics_file, 'w') as f:
                json.dump(metrics, f, indent=2)
            
            # Clean up old metrics files
            for file in self.metrics_dir.glob('metrics_*.json'):
                if (datetime.now() - datetime.fromtimestamp(file.stat().st_mtime)) > timedelta(days=7):
                    file.unlink()
        except Exception as e:
            logger.error(f"Metrics saving failed: {str(e)}")

    async def push_metrics(self):
        """Push metrics to Prometheus gateway"""
        try:
            if os.getenv('PROMETHEUS_GATEWAY'):
                push_to_gateway(
                    os.getenv('PROMETHEUS_GATEWAY'),
                    'researcher_pro',
                    self.registry
                )
        except Exception as e:
            logger.error(f"Metrics push failed: {str(e)}")

@click.group()
def cli():
    """Monitoring and alerting tool"""
    pass

@cli.command()
@click.option('--interval', default=60, help='Check interval in seconds')
def monitor(interval):
    """Run continuous monitoring"""
    async def run_monitoring():
        monitor = Monitor()
        
        while True:
            try:
                # Check endpoints
                endpoints = [
                    ('http://localhost:8000/api/v1/health', 'GET'),
                    ('http://localhost:8000/api/v1/metrics', 'GET')
                ]
                
                endpoint_results = await asyncio.gather(*[
                    monitor.check_endpoint(url, method)
                    for url, method in endpoints
                ])
                
                # Check system resources
                resources = await monitor.check_system_resources()
                
                # Check database
                db_health = await monitor.check_database()
                
                # Combine metrics
                metrics = {
                    'endpoints': endpoint_results,
                    'resources': resources,
                    'database': db_health,
                    'timestamp': datetime.now().isoformat()
                }
                
                # Save and push metrics
                await monitor.save_metrics(metrics)
                await monitor.push_metrics()
                
                # Check for issues
                for result in endpoint_results:
                    if result.get('status', 500) >= 400:
                        await monitor.send_alert(
                            f"Endpoint {result['url']} failed",
                            f"Status: {result['status']}\nError: {result.get('error', 'Unknown')}",
                            'error'
                        )
                
                if resources['cpu_percent'] > 80:
                    await monitor.send_alert(
                        "High CPU Usage",
                        f"CPU usage at {resources['cpu_percent']}%",
                        'warning'
                    )
                
                if resources['memory_percent'] > 80:
                    await monitor.send_alert(
                        "High Memory Usage",
                        f"Memory usage at {resources['memory_percent']}%",
                        'warning'
                    )
                
                if db_health['status'] == 'error':
                    await monitor.send_alert(
                        "Database Health Check Failed",
                        f"Error: {db_health['error']}",
                        'error'
                    )
                
                await asyncio.sleep(interval)
            except Exception as e:
                logger.error(f"Monitoring cycle failed: {str(e)}")
                await asyncio.sleep(interval)
    
    asyncio.run(run_monitoring())

@cli.command()
def check():
    """Run one-time health check"""
    async def run_check():
        monitor = Monitor()
        
        # Run checks
        resources = await monitor.check_system_resources()
        db_health = await monitor.check_database()
        
        # Print results
        print("\n=== Health Check Results ===\n")
        print("System Resources:")
        print(f"CPU Usage: {resources['cpu_percent']}%")
        print(f"Memory Usage: {resources['memory_percent']}%")
        print(f"Disk Usage: {resources['disk_percent']}%")
        
        print("\nDatabase Health:")
        if db_health['status'] == 'healthy':
            print(f"Status: Healthy")
            print(f"Active Connections: {db_health['connections']}")
            print(f"Database Size: {db_health['size']}")
        else:
            print(f"Status: Error - {db_health['error']}")
    
    asyncio.run(run_check())

if __name__ == '__main__':
    cli()
