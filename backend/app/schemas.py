from typing import List, Dict, Optional
from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# Common / System Schemas
# -----------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "Food Verse AI Backend"
    version: str = "1.0.0"
    api_key_configured: bool
    model: str
    message: str

class ErrorResponse(BaseModel):
    detail: str
    hint: Optional[str] = None

# -----------------------------------------------------------------------------
# Module 1: Nutrition Estimation Schemas
# -----------------------------------------------------------------------------
class Macronutrients(BaseModel):
    protein_g: float = Field(..., description="Estimated protein in grams")
    carbs_g: float = Field(..., description="Estimated carbohydrates in grams")
    fat_g: float = Field(..., description="Estimated total fat in grams")
    fiber_g: float = Field(default=0.0, description="Estimated dietary fiber in grams")
    sugar_g: float = Field(default=0.0, description="Estimated sugars in grams")
    sodium_mg: float = Field(default=0.0, description="Estimated sodium in milligrams")

class NutritionAnalysisResponse(BaseModel):
    food_name: str
    description: str
    confidence_observation: str = Field(..., description="Visual identification confidence note")
    serving_size_estimate: str = Field(..., description="Estimated portion size based on visual context")
    calories: float = Field(..., description="Estimated total calories (kcal)")
    macros: Macronutrients
    dietary_tags: List[str] = Field(default_factory=list, description="e.g. Vegetarian, High-Protein, Dairy-Free")
    health_insights: List[str] = Field(default_factory=list, description="Evidence-based nutritional observations")
    disclaimer: str = Field(
        default="Nutritional estimates only. Values may differ substantially depending on cooking methods, oils, seasonings, and portion size. Not intended for clinical or diagnostic medical use."
    )

# -----------------------------------------------------------------------------
# Module 2: Freshness & Spoilage Schemas
# -----------------------------------------------------------------------------
class FreshnessAnalysisResponse(BaseModel):
    item_name: str
    visual_freshness_rating: str = Field(
        ...,
        description="e.g., 'Visually Fresh & Peak Quality', 'Noticeable Surface Ageing / Bruising', 'Visible Spoilage / Mold Detected', 'Indeterminate'"
    )
    freshness_score_percent: int = Field(
        ..., ge=0, le=100,
        description="Visual quality score between 0 and 100 based on visible signs"
    )
    observed_signs: List[str] = Field(
        default_factory=list,
        description="Specific visible surface cues: texture, color changes, spots, wilting, bruising"
    )
    shelf_life_guidelines: str = Field(
        ...,
        description="Recommended storage condition and typical shelf-life window"
    )
    recommended_action: str = Field(
        ...,
        description="e.g., 'Good to consume', 'Trim affected section and consume promptly', 'Discard immediately'"
    )
    safety_disclaimer: str = Field(
        default="Visual observation only. An image cannot detect invisible foodborne pathogens (e.g., Salmonella, Listeria, E. coli), bacterial toxins, or past temperature abuse. When in doubt, discard food."
    )

# -----------------------------------------------------------------------------
# Module 3: Restaurant Hygiene Schemas
# -----------------------------------------------------------------------------
class HygieneAnalysisResponse(BaseModel):
    scene_type: str = Field(
        ...,
        description="e.g., 'Dining Area', 'Kitchen Counter / Prep Station', 'Buffet / Display Case', 'Cutlery / Tableware'"
    )
    cleanliness_rating: str = Field(
        ...,
        description="e.g., 'Visually Clean & Well-Maintained', 'Moderate Hygiene with Noticeable Clutter', 'Hygiene Red Flags Observed'"
    )
    positive_indicators: List[str] = Field(
        default_factory=list,
        description="Visible sanitary practices, e.g., covered food, clean stainless steel, tidy floor"
    )
    areas_of_concern: List[str] = Field(
        default_factory=list,
        description="Visible risk factors, e.g., uncovered food, dirty surfaces, clutter near dining areas"
    )
    qualitative_observations: str = Field(
        ...,
        description="Detailed objective description of the visible dining/kitchen environment"
    )
    hygiene_tips: List[str] = Field(
        default_factory=list,
        description="Practical tips for diners or operators"
    )
    safety_disclaimer: str = Field(
        default="Visual observation only from user-provided photograph. This is NOT an official regulatory health inspection and cannot establish compliance with municipal food safety codes or internal sanitation standards."
    )

# -----------------------------------------------------------------------------
# Module 4: Smart Cooking Assistant & Recipes Schemas
# -----------------------------------------------------------------------------
class RecipeItem(BaseModel):
    title: str
    prep_time: str
    cook_time: str
    difficulty: str = Field(..., description="Easy, Medium, Advanced")
    calories_estimate: str
    ingredients_used: List[str]
    additional_ingredients_needed: List[str] = Field(
        default_factory=list,
        description="Common pantry staples assumed (oil, salt, pepper, etc.)"
    )
    step_by_step_instructions: List[str]
    chef_tip: str

class RecipeRecommendationResponse(BaseModel):
    detected_ingredients: List[str]
    recipes: List[RecipeItem]
    disclaimer: str = Field(
        default="Recipe suggestions are generated based on identified ingredients. Always ensure food is cooked to safe internal temperatures."
    )

class RecipeTextRequest(BaseModel):
    ingredients_text: str = Field(..., min_length=2, description="Comma-separated or listed ingredients")
    dietary_preference: Optional[str] = Field(default="Any", description="e.g., Vegetarian, Vegan, High-Protein, Keto")
    cuisine: Optional[str] = Field(default="Any", description="e.g., Italian, Indian, Mexican, Asian, Mediterranean")
    max_time_minutes: Optional[int] = Field(default=45, ge=5, le=180)

# -----------------------------------------------------------------------------
# Module 5: Personalized Meal Planner Schemas
# -----------------------------------------------------------------------------
class MealItem(BaseModel):
    meal_type: str = Field(..., description="Breakfast, Lunch, Dinner, Snack")
    name: str
    description: str
    estimated_calories: int
    macros: Dict[str, str] = Field(..., description="e.g., {'protein': '30g', 'carbs': '45g', 'fat': '12g'}")
    recipe_summary: str

class DailyPlan(BaseModel):
    day_number: int
    day_theme: str
    meals: List[MealItem]
    total_calories: int

class MealPlannerRequest(BaseModel):
    goal: str = Field(..., description="e.g., Weight Loss, Muscle Building, Maintenance, Heart-Healthy, Keto")
    target_calories: int = Field(..., ge=1000, le=5000, description="Target daily calorie intake")
    dietary_preference: str = Field(default="Balanced", description="e.g., Omnivore, Vegetarian, Vegan, Pescatarian, Gluten-Free")
    allergies_or_restrictions: Optional[str] = Field(default="None", description="e.g., Peanuts, Shellfish, Lactose, None")
    plan_duration_days: int = Field(default=3, ge=1, le=7, description="Number of days to plan (1 to 7)")

class MealPlannerResponse(BaseModel):
    goal_summary: str
    daily_calorie_target: int
    target_macro_split: Dict[str, str] = Field(default_factory=dict)
    days: List[DailyPlan] = Field(default_factory=list)
    grocery_list: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Categorized grocery list (e.g. Produce, Protein, Grains & Pantry, Dairy/Substitutes)"
    )
    prep_tips: List[str] = Field(default_factory=list)
    disclaimer: str = Field(
        default="Meal plan is an educational guide. Caloric and macronutrient needs vary based on individual metabolism, physical activity, and medical history. Consult a registered dietitian or physician for clinical dietary guidance."
    )
