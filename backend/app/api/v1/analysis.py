from typing import List, Dict
from datetime import datetime
import logging
import json
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from app.schemas.analysis import Analysis, AnalysisCreate, AnalysisUpdate
from app.services.ai_service import ai_service
import asyncio
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyses")

# File to persist analyses
STORAGE_FILE = "analyses_storage.json"

def datetime_handler(x):
    if isinstance(x, datetime):
        return x.isoformat()
    raise TypeError(f"Object of type {type(x)} is not JSON serializable")

# Load existing analyses from file or initialize empty
try:
    if os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, 'r') as f:
            analyses_data = json.load(f)
            analyses = {
                int(k): Analysis(
                    **{
                        **v,
                        'created_at': datetime.fromisoformat(v['created_at']),
                        'updated_at': datetime.fromisoformat(v['updated_at'])
                    }
                ) for k, v in analyses_data.items()
            }
            current_id = max(analyses.keys()) + 1 if analyses else 1
    else:
        analyses: Dict[int, Analysis] = {}
        current_id = 1
except Exception as e:
    logger.error(f"Error loading analyses: {e}")
    analyses: Dict[int, Analysis] = {}
    current_id = 1

def save_analyses():
    """Save analyses to file"""
    try:
        analyses_data = {k: v.dict() for k, v in analyses.items()}
        with open(STORAGE_FILE, 'w') as f:
            json.dump(analyses_data, f, default=datetime_handler)
    except Exception as e:
        logger.error(f"Error saving analyses: {e}")

async def process_analysis(analysis_id: int):
    """Background task to process the analysis"""
    logger.info(f"Starting analysis process for ID: {analysis_id}")
    analysis = analyses[analysis_id]
    
    try:
        # Update status to research phase
        logger.info("Starting research phase")
        analysis.status = "researching"
        analysis.progress = 0.25
        analyses[analysis_id] = analysis
        save_analyses()

        # Get initial research data
        logger.info("Calling Perplexity API")
        research_data = await ai_service.get_initial_research(
            analysis.research_topic,
            analysis.parameters or {}
        )
        logger.info("Received research data from Perplexity API")

        # Update status to analysis phase
        logger.info("Starting analysis phase")
        analysis.status = "analyzing"
        analysis.progress = 0.50
        analyses[analysis_id] = analysis
        save_analyses()

        # Analyze the research data
        logger.info("Calling OpenAI API")
        analysis_results = await ai_service.analyze_data(
            research_data,
            analysis.parameters or {}
        )
        logger.info("Received analysis results from OpenAI API")

        # Update analysis with results
        analysis.parameters = {
            **(analysis.parameters or {}),
            "research_data": research_data,
            "analysis_results": analysis_results
        }
        analysis.status = "completed"
        analysis.progress = 1.0
        analysis.updated_at = datetime.utcnow()
        analyses[analysis_id] = analysis
        save_analyses()
        logger.info("Analysis completed successfully")

    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        analysis.status = "failed"
        analysis.parameters = {
            **(analysis.parameters or {}),
            "error": str(e)
        }
        analyses[analysis_id] = analysis
        save_analyses()

@router.get("", response_model=List[Analysis])
async def list_analyses(request: Request, skip: int = 0, limit: int = 100):
    """
    Retrieve analyses.
    """
    logger.info(f"Listing analyses. URL: {request.url}")
    return list(analyses.values())[skip : skip + limit]

@router.post("", response_model=Analysis, status_code=201)
async def create_analysis(request: Request, analysis: AnalysisCreate, background_tasks: BackgroundTasks):
    """
    Create new analysis and start processing.
    """
    global current_id
    logger.info(f"Creating new analysis: {analysis.title}. URL: {request.url}")
    logger.info(f"Request body: {analysis.dict()}")
    
    try:
        db_analysis = Analysis(
            id=current_id,
            **analysis.dict(),
            status="pending",
            progress=0.0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            user_id=1  # Dummy user ID
        )
        analyses[current_id] = db_analysis
        save_analyses()
        
        # Start background processing
        logger.info(f"Starting background processing for analysis ID: {current_id}")
        asyncio.create_task(process_analysis(current_id))
        
        current_id += 1
        return db_analysis
    except Exception as e:
        logger.error(f"Error creating analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{analysis_id}", response_model=Analysis)
async def get_analysis(request: Request, analysis_id: int):
    """
    Get a specific analysis by ID.
    """
    logger.info(f"Getting analysis ID: {analysis_id}. URL: {request.url}")
    if analysis_id not in analyses:
        logger.warning(f"Analysis ID {analysis_id} not found")
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analyses[analysis_id]

@router.put("/{analysis_id}", response_model=Analysis)
async def update_analysis(request: Request, analysis_id: int, analysis: AnalysisUpdate):
    """
    Update an analysis.
    """
    logger.info(f"Updating analysis ID: {analysis_id}. URL: {request.url}")
    if analysis_id not in analyses:
        logger.warning(f"Analysis ID {analysis_id} not found")
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    try:
        db_analysis = analyses[analysis_id]
        update_data = analysis.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_analysis, field, value)
        
        db_analysis.updated_at = datetime.utcnow()
        analyses[analysis_id] = db_analysis
        save_analyses()
        return db_analysis
    except Exception as e:
        logger.error(f"Error updating analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{analysis_id}")
async def delete_analysis(request: Request, analysis_id: int):
    """
    Delete an analysis.
    """
    logger.info(f"Deleting analysis ID: {analysis_id}. URL: {request.url}")
    if analysis_id not in analyses:
        logger.warning(f"Analysis ID {analysis_id} not found")
        raise HTTPException(status_code=404, detail="Analysis not found")
    del analyses[analysis_id]
    save_analyses()
    return {"message": "Analysis deleted"}
