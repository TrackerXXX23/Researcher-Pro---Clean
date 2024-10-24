import os
import json
from typing import Dict, Any, List
import logging
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Initialize Perplexity client with their base URL
        self.perplexity_client = OpenAI(
            api_key=settings.PERPLEXITY_API_KEY,
            base_url="https://api.perplexity.ai"
        )
        
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def get_initial_research(self, topic: str, parameters: Dict[str, Any]) -> str:
        """Get initial research data using Perplexity API"""
        prompt = self._create_research_prompt(topic, parameters)
        
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a professional market research analyst. Provide detailed, well-structured analysis with up-to-date information."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            logger.info("Sending request to Perplexity API")
            
            response = self.perplexity_client.chat.completions.create(
                model="llama-3.1-sonar-huge-128k-online",  # 405B parameter model with online search
                messages=messages,
                temperature=0.2,  # Lower temperature for more focused research
                top_p=0.9
            )
            
            logger.info("Received response from Perplexity API")
            return response.choices[0].message.content
                    
        except Exception as e:
            logger.error(f"Error calling Perplexity API: {str(e)}")
            raise Exception(f"Research phase failed: {str(e)}")

    async def analyze_data(self, research_data: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze research data using OpenAI API"""
        prompt = self._create_analysis_prompt(research_data, parameters)
        
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert AI industry analyst. Analyze the provided research data and generate structured insights."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            logger.info("Sending request to OpenAI API")
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                temperature=0.7,
                response_format={ "type": "json_object" }
            )
            
            logger.info("Received response from OpenAI API")
            return json.loads(response.choices[0].message.content)
                    
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {str(e)}")
            raise Exception(f"Analysis phase failed: {str(e)}")

    def _create_research_prompt(self, topic: str, parameters: Dict[str, Any]) -> str:
        focus_areas = parameters.get('focus_areas', [])
        focus_areas_str = ', '.join(focus_areas) if focus_areas else 'general overview'
        
        return f"""Conduct a comprehensive research analysis on {topic}.
Focus on: {focus_areas_str}

Please provide detailed information including:
1. Market Overview
   - Current state
   - Key statistics
   - Major trends

2. Key Players and Competition
   - Market leaders
   - Emerging players
   - Competitive dynamics

3. Technology Landscape
   - Current technologies
   - Emerging technologies
   - Technical challenges

4. Market Opportunities
   - Growth areas
   - Unmet needs
   - Potential innovations

5. Challenges and Risks
   - Market barriers
   - Regulatory concerns
   - Technical limitations

6. Future Outlook
   - Growth projections
   - Expected developments
   - Potential disruptions

Use real-time data and recent sources to provide up-to-date information. Include specific examples and data points where available."""

    def _create_analysis_prompt(self, research_data: str, parameters: Dict[str, Any]) -> str:
        return f"""Analyze the following research data and provide strategic insights:

{research_data}

Based on this research, provide a structured analysis in JSON format with the following sections:
{{
    "market_overview": {{
        "summary": "Brief overview of current market state",
        "key_metrics": ["List of important market metrics"],
        "growth_rate": "Current or projected growth rate"
    }},
    "key_insights": [
        "List of major insights derived from the research"
    ],
    "competitive_analysis": {{
        "market_leaders": ["List of leading companies"],
        "emerging_players": ["List of promising startups/new entrants"],
        "competitive_dynamics": "Analysis of competitive landscape"
    }},
    "trends": [
        {{
            "name": "Trend name",
            "description": "Detailed description",
            "impact": "Potential impact on industry"
        }}
    ],
    "opportunities": [
        {{
            "area": "Opportunity area",
            "description": "Detailed description",
            "potential_impact": "Estimated impact"
        }}
    ],
    "risks": [
        {{
            "type": "Risk type",
            "description": "Detailed description",
            "mitigation": "Possible mitigation strategies"
        }}
    ],
    "recommendations": [
        {{
            "action": "Recommended action",
            "rationale": "Why this is recommended",
            "priority": "High/Medium/Low"
        }}
    ]
}}

Ensure all responses are detailed, actionable, and backed by the research data."""

ai_service = AIService()
