# Phase 1: Core Services Implementation

## Overview
Implement the foundational services required for the AI-driven research and analysis platform.

## Components

### 1. AI Analysis Service
```python
# app/services/ai_service.py
class AIService:
    async def analyze(
        self,
        data: AnalysisData,
        template: AnalysisTemplate
    ) -> AnalysisResult:
        """
        Perform AI analysis using OpenAI GPT
        """
        try:
            # 1. Prepare data
            processed_data = await self._preprocess_data(data)
            
            # 2. Generate prompts
            prompts = await self._generate_prompts(template)
            
            # 3. Execute analysis
            results = await self._execute_analysis(processed_data, prompts)
            
            # 4. Post-process results
            final_results = await self._postprocess_results(results)
            
            return final_results
        except Exception as e:
            await self._handle_error(e)
```

### 2. Research Service
```python
# app/services/research_service.py
class ResearchService:
    async def collect_data(
        self,
        parameters: ResearchParameters
    ) -> ResearchData:
        """
        Collect research data using Perplexity API
        """
        try:
            # 1. Validate parameters
            validated_params = await self._validate_parameters(parameters)
            
            # 2. Collect data
            raw_data = await self._collect_from_perplexity(validated_params)
            
            # 3. Process data
            processed_data = await self._process_data(raw_data)
            
            # 4. Store results
            await self._store_results(processed_data)
            
            return processed_data
        except Exception as e:
            await self._handle_error(e)
```

### 3. Template Service
```python
# app/services/template_service.py
class TemplateService:
    async def get_template(
        self,
        template_id: str,
        customize: dict = None
    ) -> AnalysisTemplate:
        """
        Get and customize analysis template
        """
        try:
            # 1. Fetch base template
            base_template = await self._fetch_template(template_id)
            
            # 2. Apply customizations
            if customize:
                template = await self._customize_template(
                    base_template,
                    customize
                )
            else:
                template = base_template
            
            # 3. Validate template
            await self._validate_template(template)
            
            return template
        except Exception as e:
            await self._handle_error(e)
```

### 4. Report Service
```python
# app/services/report_service.py
class ReportService:
    async def generate_report(
        self,
        analysis_result: AnalysisResult,
        template_id: str
    ) -> Report:
        """
        Generate analysis report
        """
        try:
            # 1. Get report template
            template = await self._get_template(template_id)
            
            # 2. Process results
            processed_results = await self._process_results(
                analysis_result,
                template
            )
            
            # 3. Generate report
            report = await self._generate_report(processed_results, template)
            
            # 4. Store report
            await self._store_report(report)
            
            return report
        except Exception as e:
            await self._handle_error(e)
```

## Database Models

### 1. Analysis Model
```python
# app/models/analysis.py
class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(String, primary_key=True)
    template_id = Column(String, ForeignKey("templates.id"))
    status = Column(String, nullable=False)
    parameters = Column(JSON)
    results = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
```

### 2. Template Model
```python
# app/models/template.py
class Template(Base):
    __tablename__ = "templates"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    parameters = Column(JSON)
    prompts = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## Service Dependencies

### 1. OpenAI Integration
```python
# app/integrations/openai.py
class OpenAIClient:
    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def analyze(
        self,
        prompt: str,
        parameters: dict
    ) -> dict:
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                **parameters
            )
            return response
        except Exception as e:
            await self._handle_error(e)
```

### 2. Perplexity Integration
```python
# app/integrations/perplexity.py
class PerplexityClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.perplexity.ai"
    
    async def search(
        self,
        query: str,
        parameters: dict
    ) -> dict:
        try:
            async with aiohttp.ClientSession() as session:
                response = await session.post(
                    f"{self.base_url}/search",
                    json={"query": query, **parameters},
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                return await response.json()
        except Exception as e:
            await self._handle_error(e)
```

## Error Handling

```python
# app/core/errors.py
class ErrorHandler:
    async def handle_error(
        self,
        error: Exception,
        context: dict = None
    ):
        """
        Handle service errors
        """
        try:
            # 1. Log error
            await self._log_error(error, context)
            
            # 2. Notify if critical
            if self._is_critical(error):
                await self._notify_team(error, context)
            
            # 3. Handle specific error types
            if isinstance(error, APIError):
                return await self._handle_api_error(error)
            elif isinstance(error, ValidationError):
                return await self._handle_validation_error(error)
            else:
                return await self._handle_generic_error(error)
        except Exception as e:
            # Fallback error handling
            logger.critical(f"Error handler failed: {str(e)}")
            raise SystemError("Critical error handling failure")
```

## Success Criteria

1. All core services implemented and tested
2. Database models created and migrations applied
3. External API integrations working correctly
4. Error handling implemented and tested
5. Services properly logging operations
6. Basic monitoring in place

## Next Steps

1. Implement API endpoints
2. Add WebSocket support
3. Implement background tasks
4. Set up caching layer
5. Add comprehensive testing
