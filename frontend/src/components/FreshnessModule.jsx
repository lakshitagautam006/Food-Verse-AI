import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import DisclaimerBanner from './DisclaimerBanner';
import { api } from '../api';
import { LeafIcon, SparklesIcon, AlertTriangleIcon, CheckCircleIcon, InfoIcon } from './Icons';

export default function FreshnessModule({ onOpenKeyModal, onNotify, onDataAnalyzed }) {
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
      const data = await api.analyzeFreshness(selectedFile);
      setResult(data);
      onNotify?.({
        title: 'Freshness Inspection Completed',
        message: `${data.item_name || 'Produce'}: ${data.freshness_rating || 'Assessed'}`,
        type: 'success',
        targetTab: 'freshness'
      });
      onDataAnalyzed?.('freshness', {
        id: `freshness-${Date.now()}`,
        title: `${data.item_name || 'Produce'} Freshness`,
        snippet: `${data.freshness_rating || 'Observed'} • ${data.estimated_shelf_life || ''}`,
        category: 'Freshness Inspection',
        targetTab: 'freshness'
      });
    } catch (err) {
      const errMsg = err.message || "Failed to analyze food freshness.";
      setError(errMsg);
      onNotify?.({
        title: 'Freshness Inspection Failed',
        message: errMsg,
        type: 'error',
        targetTab: 'freshness'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to determine status badge theme
  const getRatingTheme = (rating = '') => {
    const r = rating.toLowerCase();
    if (r.includes('fresh') || r.includes('prime')) {
      return { badgeClass: 'badge-success', fillClass: 'bg-emerald', text: 'Fresh & Prime' };
    }
    if (r.includes('ageing') || r.includes('bruis') || r.includes('moderate')) {
      return { badgeClass: 'badge-warning', fillClass: 'bg-amber', text: 'Surface Aging' };
    }
    if (r.includes('spoil') || r.includes('mold') || r.includes('discard')) {
      return { badgeClass: 'badge-danger', fillClass: 'bg-rose', text: 'Spoilage Signs' };
    }
    return { badgeClass: 'badge-neutral', fillClass: 'bg-sage', text: rating };
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="module-title-group">
          <div className="module-icon-badge">
            <LeafIcon className="w-6 h-6 text-forest" />
          </div>
          <div>
            <div className="module-badge-row">
              <span className="badge-pill badge-emerald">Produce Inspector • Safety Guard</span>
            </div>
            <h2 className="module-title">Food Freshness & Visible Spoilage Observation</h2>
            <p className="module-desc">
              Inspect perishable items, fruits, vegetables, and leftovers for visible surface aging, moisture changes, and discoloration.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner moduleType="freshness" />

      <div className="grid-layout">
        {/* Input Panel */}
        <div className="panel card">
          <h3 className="panel-title">Perishable Item Photograph</h3>
          
          <ImageUploader
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onImageSelected={handleImageSelected}
            onClear={handleClear}
            isLoading={isLoading}
            label="Upload Produce or Leftover Photo"
            helpText="Inspect apples, berries, bread, leafy greens, or cooked food"
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
                  Observing Visible Quality with Groq...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2 inline" />
                  Check Freshness
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-card mt-4">
              <AlertTriangleIcon className="w-5 h-5 text-amber shrink-0" />
              <div className="error-body">
                <strong>Inspection Failed:</strong>
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
              <h4>Inspecting Surface Integrity...</h4>
              <p>Analyzing color pigments, skin tautness, wilting patterns, and surface moisture levels.</p>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="card empty-state">
              <div className="empty-state-icon">
                <LeafIcon className="w-6 h-6 text-forest" />
              </div>
              <h4>No Produce Inspected Yet</h4>
              <p>Upload a photograph of produce or leftovers to observe surface conditions, storage tips, and shelf-life recommendations.</p>
            </div>
          )}

          {!isLoading && result && (
            <div className="card result-card">
              <div className="result-header">
                <div>
                  <span className="badge badge-neutral">Observed Item</span>
                  <h3 className="result-food-name">{result.item_name}</h3>
                </div>
                <div className="freshness-score-wrapper">
                  <span className="score-number">{result.freshness_score_percent}%</span>
                  <span className="score-label">Visual Vitality</span>
                </div>
              </div>

              {/* Status Rating Pill */}
              <div className="mb-4">
                <span className={`badge ${getRatingTheme(result.visual_freshness_rating).badgeClass} text-base py-1 px-3`}>
                  {result.visual_freshness_rating}
                </span>
              </div>

              {/* Observed Visual Signs */}
              <div className="observation-box">
                <h4 className="section-subheading">Visible Quality Observations</h4>
                <ul className="clean-bullet-list">
                  {result.observed_signs?.map((sign, idx) => (
                    <li key={idx}>{sign}</li>
                  ))}
                </ul>
              </div>

              {/* Shelf Life & Storage */}
              <div className="storage-guide-box">
                <h4 className="section-subheading">Recommended Storage Guidelines</h4>
                <p className="text-secondary">{result.shelf_life_guidelines}</p>
              </div>

              {/* Recommended Action */}
              <div className="action-recommendation-box">
                <h4 className="section-subheading">Recommended Consumer Action</h4>
                <p className="font-semibold text-forest">{result.recommended_action}</p>
              </div>

              {/* Safety Disclaimer */}
              <div className="result-disclaimer">
                <strong>Food Safety Notice:</strong> {result.safety_disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
