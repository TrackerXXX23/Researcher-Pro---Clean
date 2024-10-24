#!/usr/bin/env python3
"""
Virtual Environment and Dependency Management Script

This script helps manage Python virtual environments and dependencies
for the FastAPI backend implementation.
"""

import os
import sys
import click
import logging
import subprocess
import venv
from pathlib import Path
from typing import List, Dict, Any
import toml
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class VenvManager:
    def __init__(self):
        self.venv_path = Path('.venv')
        self.requirements_file = Path('requirements.txt')
        self.poetry_file = Path('pyproject.toml')
        self.poetry_lock = Path('poetry.lock')

    def create_venv(self):
        """Create virtual environment"""
        try:
            logger.info("Creating virtual environment...")
            venv.create(
                self.venv_path,
                system_site_packages=False,
                with_pip=True,
                prompt='researcher-pro'
            )
            logger.info(f"Virtual environment created at {self.venv_path}")
        except Exception as e:
            logger.error(f"Failed to create virtual environment: {str(e)}")
            raise

    def install_dependencies(
        self,
        dev: bool = False,
        upgrade: bool = False
    ):
        """Install dependencies using poetry or pip"""
        try:
            if self.poetry_file.exists():
                self._install_with_poetry(dev, upgrade)
            else:
                self._install_with_pip(dev, upgrade)
        except Exception as e:
            logger.error(f"Failed to install dependencies: {str(e)}")
            raise

    def _install_with_poetry(
        self,
        dev: bool = False,
        upgrade: bool = False
    ):
        """Install dependencies using poetry"""
        cmd = ['poetry', 'install']
        if not dev:
            cmd.append('--no-dev')
        if upgrade:
            cmd.append('--upgrade')
        
        subprocess.run(cmd, check=True)

    def _install_with_pip(
        self,
        dev: bool = False,
        upgrade: bool = False
    ):
        """Install dependencies using pip"""
        pip_cmd = [
            f"{self.venv_path}/bin/pip",
            "install",
            "-r",
            self.requirements_file
        ]
        if upgrade:
            pip_cmd.append("--upgrade")
        
        subprocess.run(pip_cmd, check=True)
        
        if dev and Path('requirements-dev.txt').exists():
            pip_cmd = [
                f"{self.venv_path}/bin/pip",
                "install",
                "-r",
                "requirements-dev.txt"
            ]
            if upgrade:
                pip_cmd.append("--upgrade")
            
            subprocess.run(pip_cmd, check=True)

    def export_requirements(self):
        """Export dependencies to requirements.txt"""
        try:
            if self.poetry_file.exists():
                self._export_from_poetry()
            else:
                self._export_from_pip()
        except Exception as e:
            logger.error(f"Failed to export requirements: {str(e)}")
            raise

    def _export_from_poetry(self):
        """Export dependencies from poetry"""
        subprocess.run(
            [
                'poetry',
                'export',
                '-f',
                'requirements.txt',
                '--output',
                'requirements.txt'
            ],
            check=True
        )
        
        # Export dev dependencies
        subprocess.run(
            [
                'poetry',
                'export',
                '-f',
                'requirements.txt',
                '--dev',
                '--output',
                'requirements-dev.txt'
            ],
            check=True
        )

    def _export_from_pip(self):
        """Export dependencies from pip"""
        subprocess.run(
            [
                f"{self.venv_path}/bin/pip",
                "freeze",
                ">",
                "requirements.txt"
            ],
            shell=True,
            check=True
        )

    def check_dependencies(self) -> Dict[str, Any]:
        """Check dependency status"""
        try:
            if self.poetry_file.exists():
                return self._check_poetry_deps()
            else:
                return self._check_pip_deps()
        except Exception as e:
            logger.error(f"Failed to check dependencies: {str(e)}")
            raise

    def _check_poetry_deps(self) -> Dict[str, Any]:
        """Check poetry dependencies"""
        with open(self.poetry_file) as f:
            poetry_data = toml.load(f)
        
        deps = poetry_data.get('tool', {}).get('poetry', {}).get('dependencies', {})
        dev_deps = poetry_data.get('tool', {}).get('poetry', {}).get('dev-dependencies', {})
        
        # Check for outdated packages
        outdated = subprocess.run(
            ['poetry', 'show', '--outdated', '--format', 'json'],
            capture_output=True,
            text=True
        )
        outdated_pkgs = json.loads(outdated.stdout) if outdated.stdout else []
        
        return {
            'dependencies': deps,
            'dev_dependencies': dev_deps,
            'outdated': outdated_pkgs
        }

    def _check_pip_deps(self) -> Dict[str, Any]:
        """Check pip dependencies"""
        installed = subprocess.run(
            [f"{self.venv_path}/bin/pip", "list", "--format=json"],
            capture_output=True,
            text=True
        )
        installed_pkgs = json.loads(installed.stdout)
        
        outdated = subprocess.run(
            [f"{self.venv_path}/bin/pip", "list", "--outdated", "--format=json"],
            capture_output=True,
            text=True
        )
        outdated_pkgs = json.loads(outdated.stdout)
        
        return {
            'installed': installed_pkgs,
            'outdated': outdated_pkgs
        }

    def cleanup(self):
        """Clean up virtual environment"""
        try:
            if self.venv_path.exists():
                import shutil
                shutil.rmtree(self.venv_path)
                logger.info("Virtual environment cleaned up")
        except Exception as e:
            logger.error(f"Failed to clean up virtual environment: {str(e)}")
            raise

@click.group()
def cli():
    """Virtual environment and dependency management tool"""
    pass

@cli.command()
def create():
    """Create virtual environment"""
    manager = VenvManager()
    manager.create_venv()

@cli.command()
@click.option('--dev', is_flag=True, help='Install dev dependencies')
@click.option('--upgrade', is_flag=True, help='Upgrade dependencies')
def install(dev, upgrade):
    """Install dependencies"""
    manager = VenvManager()
    manager.install_dependencies(dev, upgrade)

@cli.command()
def export():
    """Export dependencies to requirements.txt"""
    manager = VenvManager()
    manager.export_requirements()

@cli.command()
def check():
    """Check dependency status"""
    manager = VenvManager()
    status = manager.check_dependencies()
    
    print("\nDependency Status:")
    if 'dependencies' in status:
        print("\nMain Dependencies:")
        for pkg, version in status['dependencies'].items():
            print(f"  {pkg}: {version}")
        
        print("\nDev Dependencies:")
        for pkg, version in status['dev_dependencies'].items():
            print(f"  {pkg}: {version}")
    else:
        print("\nInstalled Packages:")
        for pkg in status['installed']:
            print(f"  {pkg['name']}: {pkg['version']}")
    
    if status['outdated']:
        print("\nOutdated Packages:")
        for pkg in status['outdated']:
            if isinstance(pkg, dict):
                print(f"  {pkg['name']}: {pkg['version']} -> {pkg['latest_version']}")

@cli.command()
def clean():
    """Clean up virtual environment"""
    manager = VenvManager()
    manager.cleanup()

if __name__ == '__main__':
    cli()
