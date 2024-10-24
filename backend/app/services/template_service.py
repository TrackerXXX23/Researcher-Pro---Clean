from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models.template import Template
from datetime import datetime

class TemplateService:
    def __init__(self, db: Session):
        self.db = db

    async def create_template(
        self,
        name: str,
        category: str,
        parameters: Dict[str, Any],
        prompts: List[str]
    ) -> Template:
        """Create a new analysis template"""
        template = Template(
            name=name,
            category=category,
            parameters=parameters,
            prompts=prompts
        )
        
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        
        return template

    async def get_template(
        self,
        template_id: str,
        customize: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Get and optionally customize a template"""
        template = self.db.query(Template).filter(Template.id == template_id).first()
        if not template:
            raise ValueError(f"Template {template_id} not found")

        # Create a copy of the template data
        template_data = {
            "id": template.id,
            "name": template.name,
            "category": template.category,
            "parameters": template.parameters.copy(),
            "prompts": template.prompts.copy()
        }

        # Apply customizations if provided
        if customize:
            template_data = await self._customize_template(template_data, customize)

        return template_data

    async def _customize_template(
        self,
        template: Dict[str, Any],
        customize: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Apply customizations to a template"""
        # Deep copy to avoid modifying the original
        customized = template.copy()
        
        # Update parameters if provided
        if "parameters" in customize:
            customized["parameters"].update(customize["parameters"])
        
        # Update or append prompts if provided
        if "prompts" in customize:
            if customize.get("append_prompts", False):
                customized["prompts"].extend(customize["prompts"])
            else:
                customized["prompts"] = customize["prompts"]
        
        return customized

    async def list_templates(
        self,
        category: Optional[str] = None,
        active_only: bool = True
    ) -> List[Template]:
        """List available templates with optional filtering"""
        query = self.db.query(Template)
        
        if category:
            query = query.filter(Template.category == category)
        
        if active_only:
            query = query.filter(Template.is_active == True)
        
        return query.all()

    async def update_template(
        self,
        template_id: str,
        updates: Dict[str, Any]
    ) -> Template:
        """Update an existing template"""
        template = self.db.query(Template).filter(Template.id == template_id).first()
        if not template:
            raise ValueError(f"Template {template_id} not found")

        # Update fields
        for key, value in updates.items():
            if hasattr(template, key):
                setattr(template, key, value)

        template.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(template)
        
        return template
