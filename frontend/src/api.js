/**
 * Food Verse AI - Frontend API Client
 * Centralized HTTP service communicating with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Server error (${response.status})`;
    try {
      const data = await response.json();
      if (data && data.detail) {
        errorDetail = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Fallback if response isn't JSON
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Check backend health & Groq API key configuration
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      return await handleResponse(response);
    } catch (err) {
      return {
        status: 'offline',
        api_key_configured: false,
        model: 'unknown',
        message: err.message || 'Backend is currently unreachable.'
      };
    }
  },

  // Module 1: Nutrition Estimation
  async analyzeNutrition(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE}/nutrition/analyze`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Module 2: Freshness Observation
  async analyzeFreshness(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE}/freshness/analyze`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Module 3: Restaurant Hygiene Observation
  async analyzeHygiene(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE}/hygiene/analyze`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Module 4: Recipes from Image
  async generateRecipesFromImage(imageFile, dietaryPreference = 'Any', cuisine = 'Any', maxTime = 45) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('dietary_preference', dietaryPreference);
    formData.append('cuisine', cuisine);
    formData.append('max_time_minutes', maxTime.toString());

    const response = await fetch(`${API_BASE}/recipes/generate-from-image`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Module 4: Recipes from Text
  async generateRecipesFromText(ingredientsText, dietaryPreference = 'Any', cuisine = 'Any', maxTime = 45) {
    const response = await fetch(`${API_BASE}/recipes/generate-from-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients_text: ingredientsText,
        dietary_preference: dietaryPreference,
        cuisine: cuisine,
        max_time_minutes: Number(maxTime),
      }),
    });
    return handleResponse(response);
  },

  // Module 5: Personalized Meal Planner
  async generateMealPlan(payload) {
    const response = await fetch(`${API_BASE}/meal-planner/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },
};
