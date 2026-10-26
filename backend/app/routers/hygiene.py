from fastapi import APIRouter, UploadFile, File
from app.schemas import HygieneAnalysisResponse
from app.services.image_utils import validate_and_process_image
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/hygiene", tags=["Restaurant Hygiene Observation"])

@router.post("/analyze", response_model=HygieneAnalysisResponse)
async def analyze_restaurant_hygiene(file: UploadFile = File(...)):
    """
    Evaluates visual dining or food prep environments for cleanliness,
    food storage hygiene, and potential contamination hazards.
    """
    b64_image, mime_type = await validate_and_process_image(file)
    result = await gemini_service.analyze_hygiene(b64_image, mime_type)
    return HygieneAnalysisResponse(**result)
