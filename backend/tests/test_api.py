import io
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.config import get_settings

client = TestClient(app)

def create_test_image_bytes(format="JPEG", size=(200, 200), color=(255, 0, 0)) -> bytes:
    """Helper to generate valid in-memory image bytes."""
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()

# -----------------------------------------------------------------------------
# 1. Root & Health Endpoint Tests
# -----------------------------------------------------------------------------
def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Food Verse AI API"
    assert data["version"] == "1.0.0"
    assert "health_check" in data

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "api_key_configured" in data
    assert "model" in data

# -----------------------------------------------------------------------------
# 2. Image Validation Tests
# -----------------------------------------------------------------------------
def test_nutrition_missing_file():
    response = client.post("/api/nutrition/analyze")
    assert response.status_code == 422  # FastAPI validation error

def test_nutrition_invalid_file_type():
    fake_txt = io.BytesIO(b"Hello world, this is a text file")
    response = client.post(
        "/api/nutrition/analyze",
        files={"file": ("notes.txt", fake_txt, "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported image type" in response.json()["detail"]

def test_freshness_empty_file():
    empty_buf = io.BytesIO(b"")
    response = client.post(
        "/api/freshness/analyze",
        files={"file": ("empty.jpg", empty_buf, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"]

# -----------------------------------------------------------------------------
# 3. Missing API Key Guard Test
# -----------------------------------------------------------------------------
def test_missing_api_key_returns_503(monkeypatch):
    # Simulate missing API key
    settings = get_settings()
    monkeypatch.setattr(settings, "groq_api_key", "")
    monkeypatch.setattr(settings, "gemini_api_key", "")
    
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/nutrition/analyze",
        files={"file": ("food.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    )
    assert response.status_code == 503
    assert "GROQ_API_KEY" in response.json()["detail"] or "API_KEY" in response.json()["detail"]

# -----------------------------------------------------------------------------
# 4. Pydantic Request Validation Tests
# -----------------------------------------------------------------------------
def test_meal_planner_invalid_calorie_target():
    payload = {
        "goal": "Weight Loss",
        "target_calories": 500,  # Below minimum 1000 kcal constraint
        "dietary_preference": "Vegetarian",
        "allergies_or_restrictions": "None",
        "plan_duration_days": 3
    }
    response = client.post("/api/meal-planner/generate", json=payload)
    assert response.status_code == 422

def test_meal_planner_invalid_days():
    payload = {
        "goal": "Weight Loss",
        "target_calories": 2000,
        "dietary_preference": "Vegetarian",
        "allergies_or_restrictions": "None",
        "plan_duration_days": 10  # Exceeds max 7 days constraint
    }
    response = client.post("/api/meal-planner/generate", json=payload)
    assert response.status_code == 422

# -----------------------------------------------------------------------------
# 5. Mocked Inference Tests (Verifying JSON parsing & Schema serialization)
# -----------------------------------------------------------------------------
@patch("app.services.gemini_service.GeminiService._call_gemini_api")
def test_nutrition_successful_inference(mock_call):
    mock_call.return_value = {
        "food_name": "Mediterranean Quinoa Bowl",
        "description": "A wholesome bowl with roasted chickpeas, cucumber, and feta.",
        "confidence_observation": "Clear visual presentation of grain bowl components",
        "serving_size_estimate": "1 large bowl (~400g)",
        "calories": 480.0,
        "macros": {
            "protein_g": 18.0,
            "carbs_g": 62.0,
            "fat_g": 16.0,
            "fiber_g": 8.0,
            "sugar_g": 4.0,
            "sodium_mg": 460.0
        },
        "dietary_tags": ["Vegetarian", "High-Fiber"],
        "health_insights": ["High in plant protein and healthy fats."],
        "disclaimer": "Nutritional estimates only."
    }

    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/nutrition/analyze",
        files={"file": ("bowl.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["food_name"] == "Mediterranean Quinoa Bowl"
    assert data["calories"] == 480.0
    assert data["macros"]["protein_g"] == 18.0
    assert "Nutritional estimates only" in data["disclaimer"]

@patch("app.services.gemini_service.GeminiService._call_gemini_api")
def test_freshness_successful_inference(mock_call):
    mock_call.return_value = {
        "item_name": "Fresh Gala Apples",
        "visual_freshness_rating": "Visually Fresh & Prime",
        "freshness_score_percent": 92,
        "observed_signs": ["Firm skin", "No visible bruising or softness"],
        "shelf_life_guidelines": "Refrigerate at 4°C for 2-3 weeks",
        "recommended_action": "Safe to consume after washing",
        "safety_disclaimer": "Visual observation only. An image cannot detect microscopic pathogens."
    }

    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/freshness/analyze",
        files={"file": ("apple.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["item_name"] == "Fresh Gala Apples"
    assert data["freshness_score_percent"] == 92
    assert "Visual observation only" in data["safety_disclaimer"]

@patch("app.services.gemini_service.GeminiService._call_gemini_api")
def test_recipes_from_text_inference(mock_call):
    mock_call.return_value = {
        "detected_ingredients": ["eggs", "spinach", "tomatoes"],
        "recipes": [
            {
                "title": "Spinach & Tomato Scramble",
                "prep_time": "5 mins",
                "cook_time": "8 mins",
                "difficulty": "Easy",
                "calories_estimate": "260 kcal",
                "ingredients_used": ["eggs", "spinach", "tomatoes"],
                "additional_ingredients_needed": ["olive oil", "salt", "black pepper"],
                "step_by_step_instructions": [
                    "Whisk eggs in a bowl with a pinch of salt.",
                    "Sauté tomatoes and spinach in a hot skillet with olive oil until wilted.",
                    "Pour eggs over greens and stir gently until softly set."
                ],
                "chef_tip": "Remove pan from heat slightly before eggs finish cooking to prevent drying."
            }
        ],
        "disclaimer": "Recipe suggestions are generated based on identified ingredients."
    }

    response = client.post(
        "/api/recipes/generate-from-text",
        json={
            "ingredients_text": "eggs, spinach, tomatoes",
            "dietary_preference": "Vegetarian",
            "cuisine": "Mediterranean",
            "max_time_minutes": 20
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["recipes"]) == 1
    assert data["recipes"][0]["title"] == "Spinach & Tomato Scramble"

@patch("app.services.gemini_service.GeminiService._call_gemini_api")
def test_meal_planner_inference(mock_call):
    mock_call.return_value = {
        "goal_summary": "Tailored plan for Muscle Building at 2500 kcal/day",
        "daily_calorie_target": 2500,
        "target_macro_split": {
            "protein": "180g (29%)",
            "carbs": "270g (43%)",
            "fat": "78g (28%)"
        },
        "days": [
            {
                "day_number": 1,
                "day_theme": "High-Energy Power Day",
                "total_calories": 2490,
                "meals": [
                    {
                        "meal_type": "Breakfast",
                        "name": "Oatmeal with Peanut Butter and Banana",
                        "description": "Hearty rolled oats cooked with milk, peanut butter, and sliced banana.",
                        "estimated_calories": 580,
                        "macros": {"protein": "22g", "carbs": "82g", "fat": "18g"},
                        "recipe_summary": "Cook oats in milk, top with peanut butter and banana slices."
                    }
                ]
            }
        ],
        "grocery_list": {
            "Produce": ["Bananas", "Spinach"],
            "Protein": ["Eggs", "Chicken breast"],
            "Grains & Pantry": ["Rolled oats", "Peanut butter"]
        },
        "prep_tips": ["Batch cook oatmeal or grains in advance."],
        "disclaimer": "Meal plan is an educational guide."
    }

    response = client.post(
        "/api/meal-planner/generate",
        json={
            "goal": "Muscle Building",
            "target_calories": 2500,
            "dietary_preference": "Balanced",
            "allergies_or_restrictions": "None",
            "plan_duration_days": 1
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["daily_calorie_target"] == 2500
    assert len(data["days"]) == 1
    assert "grocery_list" in data

@patch("app.services.gemini_service.GeminiService._call_gemini_api")
def test_hygiene_successful_inference(mock_call):
    mock_call.return_value = {
        "scene_type": "Dining Seating Area",
        "cleanliness_rating": "Visually Clean & Well-Maintained",
        "positive_indicators": ["Clean tables", "Polished floor"],
        "areas_of_concern": ["Ambient open doors"],
        "qualitative_observations": "The dining environment appears clean, organized, and properly sanitized.",
        "hygiene_tips": ["Ensure silverware is wrapped."],
        "safety_disclaimer": "Visual observation only from user-provided photograph."
    }

    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/hygiene/analyze",
        files={"file": ("dining.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["cleanliness_rating"] == "Visually Clean & Well-Maintained"
    assert "Visual observation only" in data["safety_disclaimer"]

@patch("app.services.gemini_service.GeminiService._call_gemini_api")
def test_recipes_from_image_inference(mock_call):
    mock_call.return_value = {
        "detected_ingredients": ["bell pepper", "onion", "tofu"],
        "recipes": [
            {
                "title": "Tofu & Veggie Sauté",
                "prep_time": "10 mins",
                "cook_time": "15 mins",
                "difficulty": "Easy",
                "calories_estimate": "310 kcal",
                "ingredients_used": ["tofu", "bell pepper", "onion"],
                "additional_ingredients_needed": ["soy sauce", "olive oil"],
                "step_by_step_instructions": ["Cube tofu and pan fry with veggies."],
                "chef_tip": "Press tofu for crispier texture."
            }
        ],
        "disclaimer": "Recipe suggestions are generated based on identified ingredients."
    }

    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/recipes/generate-from-image",
        files={"file": ("pantry.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        data={"dietary_preference": "Vegan", "cuisine": "Asian", "max_time_minutes": "30"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["recipes"]) == 1
    assert data["recipes"][0]["title"] == "Tofu & Veggie Sauté"

