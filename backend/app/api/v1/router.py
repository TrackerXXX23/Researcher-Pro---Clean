from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Researcher Pro API"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/analyses")
async def list_analyses():
    return {"message": "List of analyses"}

@router.post("/analyses")
async def create_analysis():
    return {"message": "Analysis created"}
