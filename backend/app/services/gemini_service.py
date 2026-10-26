import json
import re
from typing import Dict, Any, Optional
from fastapi import HTTPException
from groq import Groq, GroqError, RateLimitError, APIError, APIConnectionError
from app.config import get_settings

class GroqService:
    def __init__(self):
        self.settings = get_settings()

    def _get_client(self) -> Groq:
        if not self.settings.is_api_key_set:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Groq API key is not configured. Please add your GROQ_API_KEY to 'backend/.env'. "
                    "You can obtain a free key at https://console.groq.com/keys."
                )
            )
        return Groq(api_key=self.settings.groq_api_key)

    def _call_gemini_api(
        self,
        prompt: str,
        image_base64: Optional[str] = None,
        image_mime: Optional[str] = None,
        system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes a call to Groq Cloud API using official Groq SDK with structured JSON output.
        Uses verified vision model (qwen/qwen3.8-27b) for images and text model (openai/gpt-oss-120b) for text.
        """
        client = self._get_client()

        # Route vision vs text model with fallback
        if image_base64:
            primary_model = self.settings.groq_vision_model
            fallback_models = []
            mime = image_mime or "image/jpeg"
            user_content = [
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{mime};base64,{image_base64}"
                    }
                }
            ]
            max_tokens = 2000
        else:
            primary_model = self.settings.groq_text_model
            fallback_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b"]
            user_content = prompt
            max_tokens = 3500

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": user_content})

        models_to_try = [primary_model] + [m for m in fallback_models if m != primary_model]
        last_error = None
        response = None

        for model in models_to_try:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    max_tokens=max_tokens
                )
                break
            except RateLimitError as exc:
                raise HTTPException(
                    status_code=429,
                    detail="Groq API rate limit exceeded. Please wait a moment and try again."
                )
            except APIConnectionError as exc:
                last_error = f"Network error connecting to Groq API ({model}): {str(exc)}"
                continue
            except (APIError, GroqError) as exc:
                last_error = f"Groq API error ({model}): {str(exc)}"
                continue

        if response is None:
            raise HTTPException(status_code=502, detail=last_error or "Groq API call failed.")

        try:
            if not response.choices or not response.choices[0].message:
                raise HTTPException(status_code=502, detail="Groq returned an empty response.")

            raw_text = (response.choices[0].message.content or "").strip()

            # Clean possible markdown wrapping if returned
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            raw_text = raw_text.strip()
            return json.loads(raw_text)

        except json.JSONDecodeError as err:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to parse structured JSON from Groq response: {str(err)}"
            )

    # -------------------------------------------------------------------------
    # 1. Food Recognition & Nutrition Estimation
    # -------------------------------------------------------------------------
    async def analyze_nutrition(self, image_b64: str, mime_type: str) -> Dict[str, Any]:
        prompt = (
            "You are an expert AI Food Nutrition Analyst. Analyze this food image. "
            "Identify the food item(s), estimate portion size, calories, and macronutrients. "
            "IMPORTANT: Calorie and macro values MUST be realistic estimates based strictly on the visual items. "
            "Return a JSON object conforming exactly to this structure:\n"
            "{\n"
            '  "food_name": "Identified name of the dish or food item",\n'
            '  "description": "Short appetizing description of what is seen in the image",\n'
            '  "confidence_observation": "Visual confidence level and visible ingredients noted",\n'
            '  "serving_size_estimate": "Estimated portion (e.g. 1 bowl ~350g, 2 medium slices)",\n'
            '  "calories": 450.0,\n'
            '  "macros": {\n'
            '    "protein_g": 25.0,\n'
            '    "carbs_g": 48.0,\n'
            '    "fat_g": 14.0,\n'
            '    "fiber_g": 6.0,\n'
            '    "sugar_g": 5.0,\n'
            '    "sodium_mg": 520.0\n'
            "  },\n"
            '  "dietary_tags": ["High-Protein", "Balanced"],\n'
            '  "health_insights": ["Rich in dietary fiber which aids digestion", "Moderate sodium level"],\n'
            '  "disclaimer": "Nutritional estimates only. Values may differ substantially depending on cooking methods, oils, seasonings, and portion size. Not intended for clinical or diagnostic medical use."\n'
            "}"
        )
        system_instruction = "You are a professional nutrition intelligence engine. Respond with strict JSON only."
        return self._call_gemini_api(prompt, image_b64, mime_type, system_instruction)

    # -------------------------------------------------------------------------
    # 2. Food Freshness & Visible Spoilage Observation
    # -------------------------------------------------------------------------
    async def analyze_freshness(self, image_b64: str, mime_type: str) -> Dict[str, Any]:
        prompt = (
            "You are a Food Quality and Visual Freshness Evaluator. "
            "Inspect the provided food image for visible signs of freshness, aging, wilting, bruising, or spoilage. "
            "DO NOT claim microscopic sterility or safety. Base your observation strictly on visible cues.\n"
            "Return a JSON object matching this schema:\n"
            "{\n"
            '  "item_name": "Name of the food item or produce",\n'
            '  "visual_freshness_rating": "One of: Visually Fresh & Prime | Minor Surface Ageing / Bruising | Signs of Visible Spoilage / Mold | Indeterminate",\n'
            '  "freshness_score_percent": 85,\n'
            '  "observed_signs": [\n'
            '    "Vibrant natural coloration with intact skin",\n'
            '    "No visible mold, fungal growth, or surface moisture pooling"\n'
            "  ],\n"
            '  "shelf_life_guidelines": "Storage recommendations, e.g., Keep refrigerated in crisp drawer at 4°C, use within 3-4 days",\n'
            '  "recommended_action": "Safe to consume after washing thoroughly with clean water",\n'
            '  "safety_disclaimer": "Visual observation only. An image cannot detect invisible foodborne pathogens (e.g., Salmonella, Listeria, E. coli), bacterial toxins, or past temperature abuse. When in doubt, discard food."\n'
            "}"
        )
        system_instruction = "You are a food quality inspection specialist. Always provide objective visual observations and clear safety disclaimers."
        return self._call_gemini_api(prompt, image_b64, mime_type, system_instruction)

    # -------------------------------------------------------------------------
    # 3. Restaurant Hygiene Observations
    # -------------------------------------------------------------------------
    async def analyze_hygiene(self, image_b64: str, mime_type: str) -> Dict[str, Any]:
        prompt = (
            "You are an AI Dining Environment & Food Sanitation Observer. "
            "Analyze this user-provided image of a restaurant dining area, food prep counter, buffet, or kitchen. "
            "Observe visible cleanliness, food covering, surface sanitation, organization, and potential risk factors. "
            "DO NOT claim to provide an official regulatory inspection rating.\n"
            "Return a JSON object matching this schema:\n"
            "{\n"
            '  "scene_type": "e.g., Dining Seating Area / Kitchen Prep Counter / Food Buffet Display / Cutlery & Dishware",\n'
            '  "cleanliness_rating": "One of: Visually Clean & Well-Maintained | Moderate Hygiene with Noticeable Clutter | Visible Hygiene Red Flags Observed",\n'
            '  "positive_indicators": [\n'
            '    "Stainless steel surfaces appear wiped down and free of heavy residue",\n'
            '    "Orderly layout with clear separation of dining and disposal areas"\n'
            "  ],\n"
            '  "areas_of_concern": [\n'
            '    "Uncovered condiment dispensers exposed to ambient airflow"\n'
            "  ],\n"
            '  "qualitative_observations": "Detailed objective description of the visual scene and environment cleanliness",\n'
            '  "hygiene_tips": [\n'
            '    "Check that hot food displays are held at steaming temperatures",\n'
            '    "Ensure food utensils are stored handles-up"\n'
            "  ],\n"
            '  "safety_disclaimer": "Visual observation only from user-provided photograph. This is NOT an official regulatory health inspection and cannot establish compliance with municipal food safety codes or internal sanitation standards."\n'
            "}"
        )
        system_instruction = "You are an objective dining sanitation analyst. Emphasize visible practices and clear ethical disclaimers."
        return self._call_gemini_api(prompt, image_b64, mime_type, system_instruction)

    # -------------------------------------------------------------------------
    # 4. Smart Cooking Assistant & Recipe Recommendations
    # -------------------------------------------------------------------------
    async def generate_recipes(
        self,
        image_b64: Optional[str] = None,
        mime_type: Optional[str] = None,
        ingredients_text: Optional[str] = None,
        dietary_preference: str = "Any",
        cuisine: str = "Any",
        max_time_minutes: int = 45
    ) -> Dict[str, Any]:
        prompt = (
            "You are an inspiring Master Chef and Culinary Intelligence Assistant. "
            f"Dietary preference: {dietary_preference}. Preferred cuisine: {cuisine}. Max cook time: {max_time_minutes} minutes. "
        )
        if image_b64:
            prompt += "Identify the visible ingredients in this pantry/refrigerator image, then generate 2 to 3 creative, practical recipes using these ingredients.\n"
        else:
            prompt += f"Based on these available ingredients: '{ingredients_text}', generate 2 to 3 creative, practical recipes.\n"

        prompt += (
            "Return a JSON object matching this schema:\n"
            "{\n"
            '  "detected_ingredients": ["list", "of", "ingredients", "identified"],\n'
            '  "recipes": [\n'
            "    {\n"
            '      "title": "Recipe Name",\n'
            '      "prep_time": "15 mins",\n'
            '      "cook_time": "20 mins",\n'
            '      "difficulty": "Easy",\n'
            '      "calories_estimate": "380 kcal per serving",\n'
            '      "ingredients_used": ["Item 1", "Item 2"],\n'
            '      "additional_ingredients_needed": ["Olive oil", "Salt", "Black pepper"],\n'
            '      "step_by_step_instructions": [\n'
            '        "1. Prep ingredients...",\n'
            '        "2. Sauté aromatics...",\n'
            '        "3. Simmer and serve hot."\n'
            "      ],\n"
            '      "chef_tip": "A dash of lemon zest brightens the entire dish."\n'
            "    }\n"
            "  ],\n"
            '  "disclaimer": "Recipe suggestions are generated based on identified ingredients. Always ensure food is cooked to safe internal temperatures."\n'
            "}"
        )
        system_instruction = "You are a professional chef. Provide delicious, feasible, clear recipe steps in strict JSON."
        return self._call_gemini_api(prompt, image_b64, mime_type, system_instruction)

    # -------------------------------------------------------------------------
    # 5. Personalized Meal Planner
    # -------------------------------------------------------------------------
    async def generate_meal_plan(
        self,
        goal: str,
        target_calories: int,
        dietary_preference: str,
        allergies: str,
        days: int
    ) -> Dict[str, Any]:
        prompt = (
            "You are a Certified Nutritional Consultant and Meal Planning Specialist. "
            f"Generate a customized {days}-day meal plan for a client with the following profile:\n"
            f"- Primary Goal: {goal}\n"
            f"- Daily Caloric Target: {target_calories} kcal\n"
            f"- Dietary Preference: {dietary_preference}\n"
            f"- Allergies / Restrictions: {allergies}\n"
            f"- Duration: {days} day(s)\n\n"
            "For each day, provide Breakfast, Lunch, Dinner, and 1 Healthy Snack. "
            "Calculate realistic calorie totals and macro distributions. Include a categorized grocery shopping list.\n"
            "Return a JSON object conforming exactly to this structure:\n"
            "{\n"
            f'  "goal_summary": "Tailored plan designed for {goal} at {target_calories} kcal/day with {dietary_preference} focus.",\n'
            f'  "daily_calorie_target": {target_calories},\n'
            '  "target_macro_split": {\n'
            '    "protein": "140g (28%)",\n'
            '    "carbs": "210g (42%)",\n'
            '    "fat": "67g (30%)"\n'
            "  },\n"
            '  "days": [\n'
            "    {\n"
            '      "day_number": 1,\n'
            '      "day_theme": "High-Fiber Energizer",\n'
            '      "total_calories": 2050,\n'
            '      "meals": [\n'
            "        {\n"
            '          "meal_type": "Breakfast",\n'
            '          "name": "Steel Cut Oats with Chia Seeds & Fresh Berries",\n'
            '          "description": "Warm oats simmered in almond milk, topped with blueberries and honey.",\n'
            '          "estimated_calories": 420,\n'
            '          "macros": {"protein": "14g", "carbs": "68g", "fat": "10g"},\n'
            '          "recipe_summary": "Boil 1/2 cup oats in 1 cup milk for 5 mins; stir in chia and fruit."\n'
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ],\n"
            '  "grocery_list": {\n'
            '    "Produce": ["Blueberries", "Spinach", "Avocados"],\n'
            '    "Proteins": ["Eggs", "Chicken breast or Tofu", "Greek Yogurt"],\n'
            '    "Grains & Pantry": ["Rolled Oats", "Chia seeds", "Brown rice", "Olive oil"]\n'
            "  },\n"
            '  "prep_tips": [\n'
            '    "Batch cook grains on Sunday evening for easy weekday assembly.",\n'
            '    "Pre-portion snacks in reusable containers."\n'
            "  ],\n"
            '  "disclaimer": "Meal plan is an educational guide. Caloric and macronutrient needs vary based on individual metabolism, physical activity, and medical history. Consult a registered dietitian or physician for clinical dietary guidance."\n'
            "}"
        )
        system_instruction = "You are a professional nutrition consultant. Provide structured, realistic meal plans in strict JSON."
        data = self._call_gemini_api(prompt, None, None, system_instruction)

        # Defensive fallback if the model omitted optional grocery list or prep tips
        if not isinstance(data.get("grocery_list"), dict) or not data["grocery_list"]:
            data["grocery_list"] = {
                "Produce": ["Fresh greens", "Seasonal fruits", "Vegetables"],
                "Proteins": ["Eggs", "Lean protein / Tofu", "Greek Yogurt"],
                "Grains & Pantry": ["Whole grains / Oats", "Brown rice", "Olive oil"]
            }
        if not isinstance(data.get("prep_tips"), list) or not data["prep_tips"]:
            data["prep_tips"] = [
                "Batch cook complex carbohydrates and proteins in advance for convenient assembly.",
                "Portion snacks into airtight containers for seamless daily tracking."
            ]
        if not isinstance(data.get("target_macro_split"), dict):
            data["target_macro_split"] = {
                "protein": "30%",
                "carbs": "45%",
                "fat": "25%"
            }
        return data

    # Backwards compatibility alias
    _execute_groq_call = _call_gemini_api

# Export singleton and aliases for routers & tests compatibility
groq_service = GroqService()
gemini_service = groq_service
GeminiService = GroqService
