import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import DisclaimerBanner from './DisclaimerBanner';
import { api } from '../api';
import { UtensilsIcon, SparklesIcon, AlertTriangleIcon, CheckCircleIcon, InfoIcon } from './Icons';

export default function CookingModule({ onOpenKeyModal, onNotify, onDataAnalyzed }) {
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'image'
  const [ingredientsText, setIngredientsText] = useState('Eggs, baby spinach, cherry tomatoes, olive oil, garlic');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dietary, setDietary] = useState('Any');
  const [cuisine, setCuisine] = useState('Any');
  const [maxTime, setMaxTime] = useState(30);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let data;
      if (inputMode === 'image') {
        if (!selectedFile) {
          setError("Please select or upload an ingredients photo first.");
          setIsLoading(false);
          return;
        }
        data = await api.generateRecipesFromImage(selectedFile, dietary, cuisine, maxTime);
      } else {
        if (!ingredientsText.trim()) {
          setError("Please enter at least one ingredient.");
          setIsLoading(false);
          return;
        }
        data = await api.generateRecipesFromText(ingredientsText, dietary, cuisine, maxTime);
      }
      setResult(data);
      const count = data.recipes?.length || 0;
      const firstRecipe = data.recipes?.[0]?.recipe_name || 'Custom Recipe';
      onNotify?.({
        title: 'Recipe Generated Successfully',
        message: `Created ${count} recipe${count === 1 ? '' : 's'} (${firstRecipe})`,
        type: 'success',
        targetTab: 'cooking'
      });
      data.recipes?.forEach((r, idx) => {
        onDataAnalyzed?.('recipe', {
          id: `recipe-${Date.now()}-${idx}`,
          title: r.recipe_name,
          snippet: `${r.cooking_time_minutes ? r.cooking_time_minutes + ' mins • ' : ''}${r.description || ''}`,
          category: 'Generated Recipe',
          targetTab: 'cooking'
        });
      });
    } catch (err) {
      const errMsg = err.message || "Failed to generate recipes.";
      setError(errMsg);
      onNotify?.({
        title: 'Recipe Generation Failed',
        message: errMsg,
        type: 'error',
        targetTab: 'cooking'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="module-title-group">
          <div className="module-icon-badge">
            <UtensilsIcon className="w-6 h-6 text-forest" />
          </div>
          <div>
            <div className="module-badge-row">
              <span className="badge-pill badge-amber">Pantry-to-Plate • Chef AI</span>
            </div>
            <h2 className="module-title">Smart Cooking Assistant & Recipe Recommendations</h2>
            <p className="module-desc">
              Transform on-hand ingredients or pantry photos into delicious, zero-waste recipes tailored to your dietary goals.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner moduleType="recipes" />

      <div className="grid-layout">
        {/* Controls & Input Panel */}
        <div className="panel card">
          {/* Mode Switcher */}
          <div className="tab-pill-group mb-4">
            <button
              type="button"
              className={`tab-pill ${inputMode === 'text' ? 'tab-pill-active' : ''}`}
              onClick={() => setInputMode('text')}
            >
              Enter Ingredients Text
            </button>
            <button
              type="button"
              className={`tab-pill ${inputMode === 'image' ? 'tab-pill-active' : ''}`}
              onClick={() => setInputMode('image')}
            >
              Upload Fridge / Pantry Photo
            </button>
          </div>

          {inputMode === 'text' ? (
            <div className="form-group">
              <label className="form-label" htmlFor="ingredients-input">
                Available Ingredients in Your Kitchen
              </label>
              <textarea
                id="ingredients-input"
                className="form-textarea"
                rows="3"
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="e.g., Tofu, broccoli, soy sauce, garlic, brown rice"
              />
              <div className="quick-presets">
                <span className="preset-label">Quick Ideas:</span>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => setIngredientsText("Chicken breast, bell peppers, onions, fajita seasoning, tortillas")}
                >
                  Chicken Fajitas
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => setIngredientsText("Chickpeas, tahini, lemon, garlic, cucumber, pita bread")}
                >
                  Hummus Mezze
                </button>
              </div>
            </div>
          ) : (
            <div>
              <ImageUploader
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                onImageSelected={handleImageSelected}
                onClear={handleClearImage}
                isLoading={isLoading}
                label="Upload Pantry or Fridge Photo"
                helpText="Snap ingredients on your counter or in the fridge"
              />
            </div>
          )}

          {/* Preferences Row */}
          <div className="form-row mt-4">
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="dietary-select">Dietary Goal</label>
              <select
                id="dietary-select"
                className="form-select"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
              >
                <option value="Any">Any / Balanced</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="High-Protein">High-Protein</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Keto">Keto / Low-Carb</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label" htmlFor="cuisine-select">Cuisine Style</label>
              <select
                id="cuisine-select"
                className="form-select"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              >
                <option value="Any">Any Style</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Italian">Italian</option>
                <option value="Indian">Indian</option>
                <option value="Asian Stir-Fry">Asian Stir-Fry</option>
                <option value="Mexican">Mexican</option>
              </select>
            </div>
          </div>

          <div className="form-group mt-3">
            <div className="flex-row justify-between items-center mb-1">
              <label className="form-label mb-0" htmlFor="max-time-range">Max Cook Time</label>
              <span className="badge badge-neutral">{maxTime} minutes</span>
            </div>
            <input
              id="max-time-range"
              type="range"
              min="10"
              max="90"
              step="5"
              className="range-slider"
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
            />
          </div>

          <div className="action-buttons mt-4">
            <button
              type="button"
              className="btn btn-primary w-full"
              disabled={isLoading || (inputMode === 'image' && !selectedFile) || (inputMode === 'text' && !ingredientsText.trim())}
              onClick={handleGenerate}
            >
              {isLoading ? (
                <>
                  <span className="spinner mr-2"></span>
                  Crafting Recipes with Groq AI...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2 inline" />
                  Generate Recipe
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-card mt-4">
              <AlertTriangleIcon className="w-5 h-5 text-amber shrink-0" />
              <div className="error-body">
                <strong>Recipe Generation Failed:</strong>
                <p>{error}</p>
                {(error.includes("GROQ_API_KEY") || error.includes("GEMINI_API_KEY") || error.includes("API key")) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary mt-2"
                    onClick={onOpenKeyModal}
                  >
                    Configure Groq API Key
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recipe Display Panel */}
        <div className="panel">
          {isLoading && (
            <div className="card loading-state">
              <div className="spinner-large"></div>
              <h4>Designing Culinary Recipes...</h4>
              <p>Analyzing flavor profiles, balancing cooking times, and writing clear step-by-step instructions.</p>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="card empty-state">
              <div className="empty-state-icon">
                <UtensilsIcon className="w-6 h-6 text-forest" />
              </div>
              <h4>No Recipes Created Yet</h4>
              <p>Specify ingredients or upload a photo of your fridge to receive personalized, delicious recipes.</p>
            </div>
          )}

          {!isLoading && result && (
            <div className="recipes-stream">
              {/* Detected Ingredients Bar */}
              {result.detected_ingredients && result.detected_ingredients.length > 0 && (
                <div className="card mb-4">
                  <span className="font-semibold text-forest text-sm">Key Ingredients Identified:</span>
                  <div className="tags-container mt-1">
                    {result.detected_ingredients.map((ing, idx) => (
                      <span key={idx} className="tag-pill">{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.recipes?.map((recipe, idx) => (
                <div key={idx} className="card recipe-card mb-4">
                  <div className="recipe-card-header">
                    <div>
                      <div className="flex-row items-center gap-2">
                        <span className="badge badge-success">Recipe #{idx + 1}</span>
                        <span className="badge badge-neutral">{recipe.difficulty}</span>
                      </div>
                      <h3 className="recipe-title mt-1">{recipe.title}</h3>
                    </div>
                    <div className="recipe-time-stats">
                      <div className="time-stat">
                        <span className="time-val">{recipe.prep_time}</span>
                        <span className="time-lbl">Prep</span>
                      </div>
                      <div className="time-stat">
                        <span className="time-val">{recipe.cook_time}</span>
                        <span className="time-lbl">Cook</span>
                      </div>
                    </div>
                  </div>

                  <div className="calorie-strip mt-2">
                    <span className="badge badge-accent">{recipe.calories_estimate}</span>
                  </div>

                  {/* Ingredients Checklist */}
                  <div className="recipe-ingredients-split mt-3">
                    <div className="sub-ingredients">
                      <span className="sub-ing-title">From Your Kitchen:</span>
                      <ul className="ing-list">
                        {recipe.ingredients_used?.map((item, i) => (
                          <li key={i}>✓ {item}</li>
                        ))}
                      </ul>
                    </div>
                    {recipe.additional_ingredients_needed?.length > 0 && (
                      <div className="sub-ingredients">
                        <span className="sub-ing-title">Pantry Staples Needed:</span>
                        <ul className="ing-list text-muted">
                          {recipe.additional_ingredients_needed.map((item, i) => (
                            <li key={i}>+ {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Step by Step Instructions */}
                  <div className="instructions-section mt-4">
                    <h4 className="section-subheading">Step-by-Step Cooking Steps</h4>
                    <ol className="steps-list">
                      {recipe.step_by_step_instructions?.map((step, sIdx) => (
                        <li key={sIdx} className="step-item">
                          <span className="step-circle">{sIdx + 1}</span>
                          <span className="step-text">{step.replace(/^\d+[\.\)]\s*/, '')}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Chef Tip */}
                  {recipe.chef_tip && (
                    <div className="chef-tip-box mt-3">
                      <span className="chef-tip-label">Chef's Secret:</span>
                      <p className="chef-tip-text">{recipe.chef_tip}</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="result-disclaimer mt-2">
                {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
