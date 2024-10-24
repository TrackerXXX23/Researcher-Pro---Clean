from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.api.v1.analysis import router as analysis_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Researcher Pro API",
    description="API for Researcher Pro platform",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(analysis_router)

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "Researcher Pro API"}

@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy"}

# Log startup
@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up")
    logger.info("Available routes:")
    for route in app.routes:
        logger.info(f"{route.methods} {route.path}")
