#!/usr/bin/env python3
"""
Development Helper Script

This script provides commands for common development tasks
in the FastAPI backend implementation.
"""

import os
import sys
import click
import subprocess
import asyncio
from typing import List, Optional

@click.group()
def cli():
    """Development helper commands"""
    pass

@cli.command()
@click.option('--reload', is_flag=True, help='Enable auto-reload')
def run(reload):
    """Run development server"""
    cmd = ['uvicorn', 'app.main:app']
    if reload:
        cmd.append('--reload')
    subprocess.run(cmd)

@cli.command()
@click.option('--check', is_flag=True, help='Only check formatting')
def format(check):
    """Format code using black and isort"""
    if check:
        subprocess.run(['black', '--check', '.'])
        subprocess.run(['isort', '--check', '.'])
    else:
        subprocess.run(['black', '.'])
        subprocess.run(['isort', '.'])

@cli.command()
def lint():
    """Run linting checks"""
    subprocess.run(['flake8', '.'])
    subprocess.run(['mypy', '.'])
    subprocess.run(['bandit', '-r', 'app'])

@cli.command()
@click.option('--coverage', is_flag=True, help='Run with coverage')
@click.option('--watch', is_flag=True, help='Run in watch mode')
def test(coverage, watch):
    """Run tests"""
    cmd = ['pytest']
    if coverage:
        cmd.extend(['--cov=app', '--cov-report=html'])
    if watch:
        cmd.append('--watch')
    subprocess.run(cmd)

@cli.command()
def migrate():
    """Run database migrations"""
    subprocess.run(['alembic', 'upgrade', 'head'])

@cli.command()
@click.argument('name')
def makemigrations(name):
    """Create new migration"""
    subprocess.run(['alembic', 'revision', '--autogenerate', '-m', name])

@cli.command()
def verify():
    """Verify development setup"""
    subprocess.run(['python', 'scripts/verify_setup.py'])

@cli.command()
def clean():
    """Clean development artifacts"""
    patterns = [
        '**/__pycache__',
        '**/*.pyc',
        '**/*.pyo',
        '**/*.pyd',
        '.pytest_cache',
        '.coverage',
        'htmlcov',
        'dist',
        'build',
        '*.egg-info'
    ]
    
    for pattern in patterns:
        subprocess.run(['find', '.', '-name', pattern, '-exec', 'rm', '-rf', '{}', '+'])

@cli.command()
def docs():
    """Generate API documentation"""
    subprocess.run(['python', 'scripts/generate_docs.py'])

@cli.command()
@click.argument('service')
def logs(service):
    """View service logs"""
    if service == 'app':
        subprocess.run(['tail', '-f', 'logs/app.log'])
    elif service == 'db':
        subprocess.run(['tail', '-f', 'logs/db.log'])
    else:
        click.echo(f"Unknown service: {service}")

@cli.command()
def shell():
    """Start Python shell with app context"""
    try:
        import IPython
        IPython.embed()
    except ImportError:
        import code
        code.interact()

@cli.command()
def routes():
    """List all API routes"""
    from app.main import app
    
    for route in app.routes:
        click.echo(f"{route.methods} {route.path}")

@cli.command()
def check():
    """Run all checks"""
    commands = [
        ('Format', ['black', '--check', '.']),
        ('Import Sort', ['isort', '--check', '.']),
        ('Lint', ['flake8', '.']),
        ('Type Check', ['mypy', '.']),
        ('Security', ['bandit', '-r', 'app']),
        ('Test', ['pytest']),
    ]
    
    for name, cmd in commands:
        click.echo(f"\nRunning {name} check...")
        result = subprocess.run(cmd)
        if result.returncode != 0:
            click.echo(f"{name} check failed!")
            sys.exit(1)
    
    click.echo("\nAll checks passed!")

if __name__ == '__main__':
    cli()
