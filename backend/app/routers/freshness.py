from fastapi import APIRouter, UploadFile, File
from app.schemas import FreshnessAnalysisResponse
from app.services.image_utils import validate_and_process_image
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/freshness", tags=["Freshness & Spoilage Observation"])

@router.post("/analyze", response_model=FreshnessAnalysisResponse)
async def analyze_food_freshness(file: UploadFile = File(...)):
    """
    Evaluates food item or produce for visible indicators of freshness,
    wilting, bruising, or surface spoilage.
    """
    b64_image, mime_type = await validate_and_process_image(file)
    result = await gemini_service.analyze_freshness(b64_image, mime_type)
    return FreshnessAnalysisResponse(**result)
