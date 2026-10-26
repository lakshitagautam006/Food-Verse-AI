from fastapi import APIRouter
from app.schemas import MealPlannerRequest, MealPlannerResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/meal-planner", tags=["Personalized Meal Planner"])

@router.post("/generate", response_model=MealPlannerResponse)
async def generate_personalized_meal_plan(payload: MealPlannerRequest):
    """
    Generates a personalized daily or multi-day meal plan with target macro splits,
    recipe summaries, and an organized grocery list.
    """
    result = await gemini_service.generate_meal_plan(
        goal=payload.goal,
        target_calories=payload.target_calories,
        dietary_preference=payload.dietary_preference,
        allergies=payload.allergies_or_restrictions or "None",
        days=payload.plan_duration_days
    )
    return MealPlannerResponse(**result)
