import React, { useState } from 'react';
import DisclaimerBanner from './DisclaimerBanner';
import { api } from '../api';
import { CalendarIcon, SparklesIcon, AlertTriangleIcon, CheckCircleIcon } from './Icons';

export default function MealPlannerModule({ onOpenKeyModal, onNotify, onDataAnalyzed }) {
  const [goal, setGoal] = useState('Muscle Building');
  const [targetCalories, setTargetCalories] = useState(2400);
  const [dietary, setDietary] = useState('Balanced');
  const [allergies, setAllergies] = useState('None');
  const [planDays, setPlanDays] = useState(3);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDayTab, setSelectedDayTab] = useState(0);
  const [checkedGrocery, setCheckedGrocery] = useState({});

  const handleToggleGrocery = (itemKey) => {
    setCheckedGrocery((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.generateMealPlan({
        goal,
        target_calories: Number(targetCalories),
        dietary_preference: dietary,
        allergies_or_restrictions: allergies,
        plan_duration_days: Number(planDays),
      });
      setResult(data);
      setSelectedDayTab(0);
      setCheckedGrocery({});
      onNotify?.({
        title: 'Meal Plan Generated Successfully',
        message: `Created ${data.plan_duration_days || planDays}-day plan for ${goal}`,
        type: 'success',
        targetTab: 'meal-planner'
      });
      onDataAnalyzed?.('meal-plan', {
        id: `plan-${Date.now()}`,
        title: `${data.plan_duration_days || planDays}-Day Meal Plan (${goal})`,
        snippet: `Target: ${targetCalories} kcal • ${dietary} preference`,
        category: 'Meal Plan',
        targetTab: 'meal-planner'
      });
    } catch (err) {
      const errMsg = err.message || "Failed to generate meal plan.";
      setError(errMsg);
      onNotify?.({
        title: 'Meal Plan Generation Failed',
        message: errMsg,
        type: 'error',
        targetTab: 'meal-planner'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (pGoal, pCal, pDiet, pDays) => {
    setGoal(pGoal);
    setTargetCalories(pCal);
    setDietary(pDiet);
    setPlanDays(pDays);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="module-title-group">
          <div className="module-icon-badge">
            <CalendarIcon className="w-6 h-6 text-forest" />
          </div>
          <div>
            <div className="module-badge-row">
              <span className="badge-pill badge-mint">Adaptive Nutrition • Weekly Architect</span>
            </div>
            <h2 className="module-title">Personalized Multimodal Meal Planner</h2>
            <p className="module-desc">
              Create goal-focused, calorie-balanced daily or weekly meal architectures complete with grocery checklists and meal prep strategies.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner moduleType="meal-planner" />

      <div className="grid-layout">
        {/* Controls Panel */}
        <div className="panel card">
          <h3 className="panel-title">Your Nutrition Profile</h3>

          {/* Quick Presets */}
          <div className="quick-presets mb-3">
            <span className="preset-label">Quick Archetypes:</span>
            <button
              type="button"
              className="preset-btn"
              onClick={() => handleApplyPreset("Muscle Building", 2600, "High-Protein", 3)}
            >
              Hypertrophy
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => handleApplyPreset("Weight Loss", 1800, "Balanced", 3)}
            >
              Fat Loss
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => handleApplyPreset("Plant-Powered Vitality", 2000, "Vegetarian", 3)}
            >
              Vegetarian
            </button>
          </div>

          <form onSubmit={handleGenerate} className="meal-form">
            <div className="form-group">
              <label className="form-label" htmlFor="goal-select">Primary Goal</label>
              <select
                id="goal-select"
                className="form-select"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="Muscle Building">Muscle Building / Hypertrophy</option>
                <option value="Weight Loss">Weight Loss / Calorie Deficit</option>
                <option value="Maintenance & Energy">Maintenance & Daily Vitality</option>
                <option value="Heart Healthy">Cardiovascular & Heart Health</option>
                <option value="Low Carb Keto">Ketogenic / Low-Carb</option>
              </select>
            </div>

            <div className="form-group">
              <div className="flex-row justify-between items-center mb-1">
                <label className="form-label mb-0" htmlFor="calories-input">Daily Calorie Target</label>
                <span className="badge badge-accent">{targetCalories} kcal</span>
              </div>
              <input
                id="calories-input"
                type="number"
                min="1000"
                max="4500"
                step="50"
                className="form-input"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
              />
              <div className="calorie-preset-pills mt-2">
                {[1600, 2000, 2400, 2800].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`cal-pill ${targetCalories === c ? 'cal-pill-active' : ''}`}
                    onClick={() => setTargetCalories(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="diet-pref">Dietary Preference</label>
                <select
                  id="diet-pref"
                  className="form-select"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                >
                  <option value="Balanced">Balanced / Omnivore</option>
                  <option value="High-Protein">High-Protein Focus</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Pescatarian">Pescatarian</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="plan-days">Duration</label>
                <select
                  id="plan-days"
                  className="form-select"
                  value={planDays}
                  onChange={(e) => setPlanDays(Number(e.target.value))}
                >
                  <option value={1}>1 Day Plan</option>
                  <option value={3}>3 Days Plan</option>
                  <option value={7}>7 Days (Full Week)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="allergies-input">Allergies or Dislikes</label>
              <input
                id="allergies-input"
                type="text"
                className="form-input"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g., Peanuts, lactose, mushrooms, none"
              />
            </div>

            <div className="action-buttons mt-4">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner mr-2"></span>
                    Designing Custom Plan with Groq AI...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2 inline" />
                    Create Meal Plan
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-card mt-4">
              <AlertTriangleIcon className="w-5 h-5 text-amber shrink-0" />
              <div className="error-body">
                <strong>Planning Failed:</strong>
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

        {/* Results Panel */}
        <div className="panel">
          {isLoading && (
            <div className="card loading-state">
              <div className="spinner-large"></div>
              <h4>Synthesizing Nutritional Architecture...</h4>
              <p>Calculating macronutrient ratios, selecting wholesome seasonal recipes, and compiling categorized groceries.</p>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="card empty-state">
              <div className="empty-state-icon">
                <CalendarIcon className="w-6 h-6 text-forest" />
              </div>
              <h4>No Meal Plan Formulated Yet</h4>
              <p>Configure your target calories and goals on the left to generate an automated multi-day meal schedule.</p>
            </div>
          )}

          {!isLoading && result && (
            <div className="meal-plan-results">
              {/* Summary Card */}
              <div className="card mb-4">
                <div className="flex-row justify-between items-center">
                  <span className="badge badge-success">Optimized Plan</span>
                  <span className="badge badge-neutral">{result.daily_calorie_target} kcal/day</span>
                </div>
                <h3 className="result-food-name mt-1">{result.goal_summary}</h3>

                {/* Macro Target Split */}
                <div className="macro-target-row mt-3">
                  {Object.entries(result.target_macro_split || {}).map(([mName, mVal]) => (
                    <div key={mName} className="macro-target-pill">
                      <span className="capitalize font-semibold text-forest">{mName}:</span>
                      <span className="text-secondary ml-1">{mVal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day Selector Tabs */}
              {result.days && result.days.length > 1 && (
                <div className="day-tabs-bar mb-4">
                  {result.days.map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`day-tab-btn ${selectedDayTab === idx ? 'day-tab-active' : ''}`}
                      onClick={() => setSelectedDayTab(idx)}
                    >
                      Day {day.day_number}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Day Meals */}
              {result.days && result.days[selectedDayTab] && (
                <div className="day-schedule mb-4">
                  <div className="flex-row justify-between items-center mb-2 px-1">
                    <h4 className="font-bold text-forest">
                      Day {result.days[selectedDayTab].day_number}: {result.days[selectedDayTab].day_theme}
                    </h4>
                    <span className="text-sm text-secondary">
                      ~{result.days[selectedDayTab].total_calories} kcal
                    </span>
                  </div>

                  <div className="meals-grid">
                    {result.days[selectedDayTab].meals?.map((meal, mIdx) => (
                      <div key={mIdx} className="card meal-item-card">
                        <div className="meal-type-badge">
                          <span className="badge badge-accent">{meal.meal_type}</span>
                          <span className="font-semibold text-forest">{meal.estimated_calories} kcal</span>
                        </div>
                        <h4 className="meal-name mt-2">{meal.name}</h4>
                        <p className="meal-desc text-secondary text-sm mt-1">{meal.description}</p>

                        <div className="meal-macros-chips mt-2">
                          {Object.entries(meal.macros || {}).map(([k, v]) => (
                            <span key={k} className="chip">
                              <strong>{k[0].toUpperCase()}:</strong> {v}
                            </span>
                          ))}
                        </div>

                        <div className="meal-recipe-summary mt-3">
                          <span className="font-semibold text-xs text-forest uppercase tracking-wider">Quick Prep:</span>
                          <p className="text-xs text-secondary mt-0.5">{meal.recipe_summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized Grocery List */}
              {result.grocery_list && Object.keys(result.grocery_list).length > 0 && (
                <div className="card mb-4">
                  <h4 className="section-subheading">Interactive Grocery Checklist</h4>
                  <div className="grocery-categories-grid mt-2">
                    {Object.entries(result.grocery_list).map(([category, items]) => (
                      <div key={category} className="grocery-cat-box">
                        <h5 className="cat-title">{category}</h5>
                        <ul className="grocery-items-list">
                          {items.map((item, iIdx) => {
                            const key = `${category}-${iIdx}`;
                            const isDone = !!checkedGrocery[key];
                            return (
                              <li
                                key={key}
                                className={`grocery-item ${isDone ? 'grocery-item-done' : ''}`}
                                onClick={() => handleToggleGrocery(key)}
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => handleToggleGrocery(key)}
                                  className="grocery-checkbox"
                                />
                                <span>{item}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prep Tips */}
              {result.prep_tips && result.prep_tips.length > 0 && (
                <div className="card mb-4">
                  <h4 className="section-subheading">Batch Cooking & Prep Strategy</h4>
                  <ul className="clean-bullet-list mt-2">
                    {result.prep_tips.map((tip, tIdx) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="result-disclaimer">
                {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
