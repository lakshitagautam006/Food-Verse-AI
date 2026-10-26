from fastapi import APIRouter, UploadFile, File
from app.schemas import NutritionAnalysisResponse
from app.services.image_utils import validate_and_process_image
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/nutrition", tags=["Nutrition Intelligence"])

@router.post("/analyze", response_model=NutritionAnalysisResponse)
async def analyze_food_nutrition(file: UploadFile = File(...)):
    """
    Analyzes an uploaded food image, identifies ingredients/dishes,
    and returns estimated caloric and macronutrient breakdowns.
    """
    b64_image, mime_type = await validate_and_process_image(file)
    result = await gemini_service.analyze_nutrition(b64_image, mime_type)
    return NutritionAnalysisResponse(**result)
