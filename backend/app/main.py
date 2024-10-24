from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.api.v1.analysis import router as analysis_router
from typing import Dict, List
from starlette.websockets import WebSocketState
from app.core.websocket import manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(
    title="Researcher Pro",
    description="API for Researcher Pro platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include router with prefix
app.include_router(analysis_router, prefix="/api/v1")

# WebSocket endpoint
@app.websocket("/ws/{analysis_id}")
async def websocket_endpoint(websocket: WebSocket, analysis_id: str):
    logger.info(f"WebSocket connection attempt for analysis {analysis_id}")
    
    if not analysis_id:
        logger.error("Analysis ID is required")
        await websocket.close(code=1000)
        return

    try:
        await manager.connect(websocket, analysis_id)
        
        # Send initial connection message
        await websocket.send_json({
            "type": "connection_status",
            "data": {
                "status": "connected",
                "analysisId": analysis_id
            }
        })

        try:
            while True:
                data = await websocket.receive_text()
                # Echo the message back for testing
                await websocket.send_text(f"Message received for analysis {analysis_id}: {data}")
        except WebSocketDisconnect:
            manager.disconnect(websocket, analysis_id)
        except Exception as e:
            logger.error(f"Error handling websocket message: {str(e)}")
            manager.disconnect(websocket, analysis_id)

    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close(code=1011)
        manager.disconnect(websocket, analysis_id)

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "Welcome to Researcher Pro"}

@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy"}

# Log startup
@app.on_event("startup")
async def startup_event():
    logger.info("Starting Researcher Pro")
    logger.info("Available routes:")
    for route in app.routes:
        if hasattr(route, "methods"):
            logger.info(f"{route.methods} {route.path}")
        elif hasattr(route, "path"):
            logger.info(f"WebSocket {route.path}")

# Log shutdown
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Researcher Pro")
