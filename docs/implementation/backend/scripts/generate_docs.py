#!/usr/bin/env python3
"""
API Documentation Generator

This script generates comprehensive API documentation from the FastAPI backend implementation.
It creates both OpenAPI specification and Markdown documentation.
"""

import os
import sys
import json
import yaml
import logging
from typing import Dict, List, Any
from pathlib import Path
from fastapi.openapi.utils import get_openapi
from app.main import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DocGenerator:
    def __init__(self):
        self.app = app
        self.docs_dir = Path("docs/api")
        self.openapi_dir = self.docs_dir / "openapi"
        self.markdown_dir = self.docs_dir / "markdown"

    async def generate_all(self):
        """Generate all documentation"""
        try:
            # Create directories
            self.create_directories()
            
            # Generate OpenAPI spec
            await self.generate_openapi()
            
            # Generate Markdown docs
            await self.generate_markdown()
            
            # Generate endpoint summary
            await self.generate_endpoint_summary()
            
            # Generate model documentation
            await self.generate_model_docs()
            
            logger.info("Documentation generation complete!")
        except Exception as e:
            logger.error(f"Documentation generation failed: {str(e)}")
            sys.exit(1)

    def create_directories(self):
        """Create documentation directories"""
        self.docs_dir.mkdir(exist_ok=True)
        self.openapi_dir.mkdir(exist_ok=True)
        self.markdown_dir.mkdir(exist_ok=True)

    async def generate_openapi(self):
        """Generate OpenAPI specification"""
        logger.info("Generating OpenAPI specification...")
        
        openapi = get_openapi(
            title="Researcher Pro API",
            version="1.0.0",
            description="AI-driven research and analysis platform",
            routes=self.app.routes
        )
        
        # Save as JSON
        json_path = self.openapi_dir / "openapi.json"
        with open(json_path, "w") as f:
            json.dump(openapi, f, indent=2)
        
        # Save as YAML
        yaml_path = self.openapi_dir / "openapi.yaml"
        with open(yaml_path, "w") as f:
            yaml.dump(openapi, f)
        
        logger.info("OpenAPI specification generated")

    async def generate_markdown(self):
        """Generate Markdown documentation"""
        logger.info("Generating Markdown documentation...")
        
        # Get OpenAPI spec
        openapi = get_openapi(
            title="Researcher Pro API",
            version="1.0.0",
            description="AI-driven research and analysis platform",
            routes=self.app.routes
        )
        
        # Generate main README
        await self.generate_main_readme(openapi)
        
        # Generate endpoint documentation
        await self.generate_endpoint_docs(openapi)
        
        logger.info("Markdown documentation generated")

    async def generate_main_readme(self, openapi: Dict[str, Any]):
        """Generate main API README"""
        content = f"""# Researcher Pro API Documentation

## Overview
{openapi.get('info', {}).get('description', '')}

## Base URL
- Development: http://localhost:8000
- Production: https://api.example.com

## Authentication
API requests require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <token>
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Endpoints

### Analysis
- POST /api/v1/analysis/start - Start new analysis
- GET /api/v1/analysis/{{{id}}} - Get analysis status
- GET /api/v1/analysis/{{{id}}}/results - Get analysis results

### Research
- POST /api/v1/research/collect - Collect research data
- GET /api/v1/research/{{{id}}} - Get research data

### Reports
- POST /api/v1/reports/generate - Generate report
- GET /api/v1/reports/{{{id}}} - Get report

## WebSocket
- WS /ws/{{{client_id}}} - Real-time updates

## Models
See [Models Documentation](models.md)

## Error Handling
See [Error Handling](error-handling.md)

## Rate Limits
See [Rate Limits](rate-limits.md)

## Examples
See [Examples](examples.md)
"""
        
        readme_path = self.docs_dir / "README.md"
        with open(readme_path, "w") as f:
            f.write(content)

    async def generate_endpoint_docs(self, openapi: Dict[str, Any]):
        """Generate endpoint documentation"""
        paths = openapi.get("paths", {})
        
        for path, methods in paths.items():
            endpoint_content = f"""# {path}

## Overview
Endpoint documentation for `{path}`

"""
            for method, details in methods.items():
                endpoint_content += f"""## {method.upper()}

### Description
{details.get('description', 'No description available')}

### Parameters
"""
                # Add parameters
                parameters = details.get("parameters", [])
                if parameters:
                    endpoint_content += "| Name | Type | Required | Description |\n"
                    endpoint_content += "|------|------|----------|-------------|\n"
                    for param in parameters:
                        endpoint_content += f"| {param.get('name')} | {param.get('schema', {}).get('type')} | {param.get('required', False)} | {param.get('description', '')} |\n"
                
                # Add request body
                request_body = details.get("requestBody")
                if request_body:
                    endpoint_content += "\n### Request Body\n"
                    endpoint_content += "```json\n"
                    endpoint_content += json.dumps(
                        request_body.get("content", {})
                        .get("application/json", {})
                        .get("schema", {}),
                        indent=2
                    )
                    endpoint_content += "\n```\n"
                
                # Add responses
                responses = details.get("responses", {})
                endpoint_content += "\n### Responses\n"
                for status, response in responses.items():
                    endpoint_content += f"\n#### {status}\n"
                    endpoint_content += f"{response.get('description', '')}\n"
                    
                    content = response.get("content", {}).get("application/json", {})
                    if content:
                        endpoint_content += "```json\n"
                        endpoint_content += json.dumps(
                            content.get("schema", {}),
                            indent=2
                        )
                        endpoint_content += "\n```\n"
            
            # Save endpoint documentation
            endpoint_path = self.markdown_dir / f"{path.replace('/', '_')}.md"
            with open(endpoint_path, "w") as f:
                f.write(endpoint_content)

    async def generate_endpoint_summary(self):
        """Generate endpoint summary"""
        content = """# API Endpoints Summary

## Available Endpoints

"""
        for route in self.app.routes:
            if hasattr(route, "methods"):
                methods = ", ".join(route.methods)
                content += f"### {route.path}\n"
                content += f"- Methods: {methods}\n"
                if route.description:
                    content += f"- Description: {route.description}\n"
                content += "\n"
        
        summary_path = self.docs_dir / "endpoints.md"
        with open(summary_path, "w") as f:
            f.write(content)

    async def generate_model_docs(self):
        """Generate model documentation"""
        content = """# API Models

## Request Models

"""
        # Get all Pydantic models from the app
        for route in self.app.routes:
            if hasattr(route, "body_field") and route.body_field:
                model = route.body_field.type_
                content += f"### {model.__name__}\n"
                content += "| Field | Type | Required | Description |\n"
                content += "|-------|------|----------|-------------|\n"
                
                for field_name, field in model.__fields__.items():
                    content += f"| {field_name} | {field.type_} | {not field.allow_none} | {field.field_info.description or ''} |\n"
                
                content += "\n"
        
        models_path = self.docs_dir / "models.md"
        with open(models_path, "w") as f:
            f.write(content)

async def main():
    """Main function"""
    generator = DocGenerator()
    await generator.generate_all()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
