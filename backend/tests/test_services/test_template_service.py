import pytest
from app.services.template_service import TemplateService
from app.models.template import Template

def test_create_template(db_session):
    """Test template creation."""
    async def test():
        # Setup
        template_service = TemplateService(db_session)
        
        # Execute
        template = await template_service.create_template(
            name="Test Template",
            category="research",
            parameters={"max_tokens": 1000},
            prompts=["Test prompt 1", "Test prompt 2"]
        )
        
        # Verify
        assert template.name == "Test Template"
        assert template.category == "research"
        assert template.parameters == {"max_tokens": 1000}
        assert template.prompts == ["Test prompt 1", "Test prompt 2"]
        assert template.is_active is True
    
    run_async(test())

def test_get_template(db_session, test_template):
    """Test retrieving a template."""
    async def test():
        # Setup
        template_service = TemplateService(db_session)
        
        # Execute
        template_data = await template_service.get_template(test_template.id)
        
        # Verify
        assert template_data["id"] == test_template.id
        assert template_data["name"] == test_template.name
        assert template_data["category"] == test_template.category
        assert template_data["parameters"] == test_template.parameters
        assert template_data["prompts"] == test_template.prompts
    
    run_async(test())

def test_customize_template(db_session, test_template):
    """Test template customization."""
    async def test():
        # Setup
        template_service = TemplateService(db_session)
        customize = {
            "parameters": {"max_tokens": 2000},
            "prompts": ["Custom prompt"],
            "append_prompts": True
        }
        
        # Execute
        template_data = await template_service.get_template(
            test_template.id,
            customize=customize
        )
        
        # Verify
        assert template_data["parameters"]["max_tokens"] == 2000
        assert len(template_data["prompts"]) == len(test_template.prompts) + 1
        assert template_data["prompts"][-1] == "Custom prompt"
    
    run_async(test())

def test_list_templates(db_session, test_template):
    """Test listing templates."""
    async def test():
        # Setup
        template_service = TemplateService(db_session)
        
        # Add another template
        await template_service.create_template(
            name="Another Template",
            category="analysis",
            parameters={},
            prompts=[]
        )
        
        # Test listing all templates
        templates = await template_service.list_templates()
        assert len(templates) == 2
        
        # Test filtering by category
        research_templates = await template_service.list_templates(
            category="research"
        )
        assert len(research_templates) == 1
        assert research_templates[0].id == test_template.id
    
    run_async(test())

def test_update_template(db_session, test_template):
    """Test template updates."""
    async def test():
        # Setup
        template_service = TemplateService(db_session)
        updates = {
            "name": "Updated Template",
            "parameters": {"max_tokens": 2000}
        }
        
        # Execute
        updated = await template_service.update_template(
            test_template.id,
            updates
        )
        
        # Verify
        assert updated.name == "Updated Template"
        assert updated.parameters["max_tokens"] == 2000
        assert updated.category == test_template.category  # Unchanged
    
    run_async(test())
