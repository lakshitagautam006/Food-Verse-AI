from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas import RecipeRecommendationResponse, RecipeTextRequest
from app.services.image_utils import validate_and_process_image
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/recipes", tags=["Smart Cooking Assistant"])

@router.post("/generate-from-image", response_model=RecipeRecommendationResponse)
async def generate_recipes_from_image(
    file: UploadFile = File(...),
    dietary_preference: str = Form(default="Any"),
    cuisine: str = Form(default="Any"),
    max_time_minutes: int = Form(default=45)
):
    """
    Identifies ingredients in an uploaded fridge/pantry photo and generates
    creative recipes matched to dietary and cuisine preferences.
    """
    b64_image, mime_type = await validate_and_process_image(file)
    result = await gemini_service.generate_recipes(
        image_b64=b64_image,
        mime_type=mime_type,
        dietary_preference=dietary_preference,
        cuisine=cuisine,
        max_time_minutes=max_time_minutes
    )
    return RecipeRecommendationResponse(**result)

@router.post("/generate-from-text", response_model=RecipeRecommendationResponse)
async def generate_recipes_from_text(payload: RecipeTextRequest):
    """
    Generates step-by-step recipes based on a list of ingredients entered by the user.
    """
    if not payload.ingredients_text.strip():
        raise HTTPException(status_code=400, detail="Ingredients list cannot be empty.")

    result = await gemini_service.generate_recipes(
        ingredients_text=payload.ingredients_text,
        dietary_preference=payload.dietary_preference or "Any",
        cuisine=payload.cuisine or "Any",
        max_time_minutes=payload.max_time_minutes or 45
    )
    return RecipeRecommendationResponse(**result)
