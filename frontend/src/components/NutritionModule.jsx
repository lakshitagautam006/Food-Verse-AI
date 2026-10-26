import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import DisclaimerBanner from './DisclaimerBanner';
import { api } from '../api';
import { AppleIcon, SparklesIcon, AlertTriangleIcon, CheckCircleIcon, InfoIcon } from './Icons';

export default function NutritionModule({ onOpenKeyModal, onNotify, onDataAnalyzed }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.analyzeNutrition(selectedFile);
      setResult(data);
      onNotify?.({
        title: 'Food Analysis Completed',
        message: `Identified: ${data.food_name || 'Meal'} (~${Math.round(data.calories || 0)} kcal)`,
        type: 'success',
        targetTab: 'nutrition'
      });
      onDataAnalyzed?.('nutrition', {
        id: `nutrition-${Date.now()}`,
        title: data.food_name || 'Analyzed Meal',
        snippet: `${data.calories ? Math.round(data.calories) + ' kcal • ' : ''}${data.description || 'Nutritional breakdown'}`,
        category: 'Nutrition Analysis',
        targetTab: 'nutrition'
      });
    } catch (err) {
      const errMsg = err.message || "Failed to analyze food image.";
      setError(errMsg);
      onNotify?.({
        title: 'Food Analysis Failed',
        message: errMsg,
        type: 'error',
        targetTab: 'nutrition'
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
            <AppleIcon className="w-6 h-6 text-forest" />
          </div>
          <div>
            <div className="module-badge-row">
              <span className="badge-pill badge-mint">Vision AI • Nutrition Scanner</span>
            </div>
            <h2 className="module-title">Food Recognition & Nutrition Estimation</h2>
            <p className="module-desc">
              Identify meals and dishes using cloud vision AI to calculate estimated calories and macronutrient profiles.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner moduleType="nutrition" />

      <div className="grid-layout">
        {/* Input Panel */}
        <div className="panel card">
          <h3 className="panel-title">Meal Photograph</h3>
          
          <ImageUploader
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onImageSelected={handleImageSelected}
            onClear={handleClear}
            isLoading={isLoading}
            label="Upload Food or Meal Photo"
            helpText="JPEG, PNG, or WEBP up to 5 MB"
          />

          <div className="action-buttons">
            <button
              type="button"
              className="btn btn-primary w-full"
              disabled={!selectedFile || isLoading}
              onClick={handleAnalyze}
            >
              {isLoading ? (
                <>
                  <span className="spinner mr-2"></span>
                  Analyzing with Groq Vision...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2 inline" />
                  Analyze Nutrition
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-card mt-4">
              <AlertTriangleIcon className="w-5 h-5 text-amber shrink-0" />
              <div className="error-body">
                <strong>Analysis Failed:</strong>
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
              <h4>Analyzing Food Components...</h4>
              <p>Detecting visual ingredients, calculating portion estimates, and synthesizing macronutrient breakdown.</p>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="card empty-state">
              <div className="empty-state-icon">
                <AppleIcon className="w-6 h-6 text-forest" />
              </div>
              <h4>No Food Analyzed Yet</h4>
              <p>Upload a photo of your meal to inspect its estimated nutritional breakdown.</p>
            </div>
          )}

          {!isLoading && result && (
            <div className="card result-card">
              <div className="result-header">
                <div>
                  <span className="badge badge-success">Identified Dish</span>
                  <h3 className="result-food-name">{result.food_name}</h3>
                  <p className="result-description">{result.description}</p>
                </div>
                <div className="calorie-badge">
                  <span className="calorie-number">{Math.round(result.calories)}</span>
                  <span className="calorie-unit">kcal (est.)</span>
                </div>
              </div>

              <div className="serving-context">
                <InfoIcon className="w-4 h-4 text-forest shrink-0 inline mr-1" />
                <span><strong>Portion Estimate:</strong> {result.serving_size_estimate} • {result.confidence_observation}</span>
              </div>

              {/* Dietary Tags */}
              {result.dietary_tags && result.dietary_tags.length > 0 && (
                <div className="tags-container">
                  {result.dietary_tags.map((tag, idx) => (
                    <span key={idx} className="tag-pill">{tag}</span>
                  ))}
                </div>
              )}

              {/* Macronutrient Grid */}
              <h4 className="section-subheading">Estimated Macronutrient Breakdown</h4>
              <div className="macros-grid">
                <div className="macro-card">
                  <span className="macro-label">Protein</span>
                  <span className="macro-value">{result.macros?.protein_g}g</span>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill fill-protein"
                      style={{ width: `${Math.min(100, (result.macros?.protein_g / 50) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="macro-card">
                  <span className="macro-label">Carbs</span>
                  <span className="macro-value">{result.macros?.carbs_g}g</span>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill fill-carbs"
                      style={{ width: `${Math.min(100, (result.macros?.carbs_g / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="macro-card">
                  <span className="macro-label">Total Fat</span>
                  <span className="macro-value">{result.macros?.fat_g}g</span>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill fill-fat"
                      style={{ width: `${Math.min(100, (result.macros?.fat_g / 40) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="macro-card">
                  <span className="macro-label">Fiber</span>
                  <span className="macro-value">{result.macros?.fiber_g}g</span>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill fill-fiber"
                      style={{ width: `${Math.min(100, (result.macros?.fiber_g / 15) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="micros-row">
                <span><strong>Sugar:</strong> {result.macros?.sugar_g}g</span>
                <span>•</span>
                <span><strong>Sodium:</strong> {result.macros?.sodium_mg}mg</span>
              </div>

              {/* Health Insights */}
              {result.health_insights && result.health_insights.length > 0 && (
                <div className="insights-box">
                  <h4 className="insights-title">Nutritional Insights</h4>
                  <ul className="clean-bullet-list">
                    {result.health_insights.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explicit Disclaimer */}
              <div className="result-disclaimer">
                <strong>Disclaimer:</strong> {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
