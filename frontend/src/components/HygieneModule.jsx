import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import DisclaimerBanner from './DisclaimerBanner';
import { api } from '../api';
import { ShieldCheckIcon, SparklesIcon, AlertTriangleIcon, CheckCircleIcon } from './Icons';

export default function HygieneModule({ onOpenKeyModal, onNotify, onDataAnalyzed }) {
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
      const data = await api.analyzeHygiene(selectedFile);
      setResult(data);
      onNotify?.({
        title: 'Hygiene Audit Completed',
        message: `${data.establishment_type || 'Dining area'}: Cleanliness Score ${data.cleanliness_score || 0}/100`,
        type: 'success',
        targetTab: 'hygiene'
      });
      onDataAnalyzed?.('hygiene', {
        id: `hygiene-${Date.now()}`,
        title: `${data.establishment_type || 'Restaurant'} Hygiene Audit`,
        snippet: `Cleanliness Score: ${data.cleanliness_score || 0}/100 • ${data.cleanliness_rating || ''}`,
        category: 'Hygiene Audit',
        targetTab: 'hygiene'
      });
    } catch (err) {
      const errMsg = err.message || "Failed to analyze dining hygiene.";
      setError(errMsg);
      onNotify?.({
        title: 'Hygiene Audit Failed',
        message: errMsg,
        type: 'error',
        targetTab: 'hygiene'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCleanlinessClass = (rating = '') => {
    const r = rating.toLowerCase();
    if (r.includes('clean') || r.includes('well-maintained')) return 'badge-success';
    if (r.includes('moderate') || r.includes('clutter')) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="module-title-group">
          <div className="module-icon-badge">
            <ShieldCheckIcon className="w-6 h-6 text-forest" />
          </div>
          <div>
            <div className="module-badge-row">
              <span className="badge-pill badge-forest">Sanitation Audit • Safety</span>
            </div>
            <h2 className="module-title">Restaurant & Dining Hygiene Observation</h2>
            <p className="module-desc">
              Inspect dining rooms, food displays, and service stations for visible sanitation, cleanliness, and food covering practices.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner moduleType="hygiene" />

      <div className="grid-layout">
        {/* Input Panel */}
        <div className="panel card">
          <h3 className="panel-title">Environment Photograph</h3>
          
          <ImageUploader
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onImageSelected={handleImageSelected}
            onClear={handleClear}
            isLoading={isLoading}
            label="Upload Dining or Food Prep Photo"
            helpText="Inspect dining areas, buffets, food prep surfaces, or cutlery"
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
                  Observing Sanitation Practices with Groq...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2 inline" />
                  Analyze Hygiene
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-card mt-4">
              <AlertTriangleIcon className="w-5 h-5 text-amber shrink-0" />
              <div className="error-body">
                <strong>Observation Failed:</strong>
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
              <h4>Evaluating Visible Sanitation Environment...</h4>
              <p>Scanning food contact surfaces, uncovered items, clutter levels, and organization.</p>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="card empty-state">
              <div className="empty-state-icon">
                <ShieldCheckIcon className="w-6 h-6 text-forest" />
              </div>
              <h4>No Environment Observed Yet</h4>
              <p>Upload a photograph of a dining hall, buffet line, or prep counter to assess visible sanitary conditions.</p>
            </div>
          )}

          {!isLoading && result && (
            <div className="card result-card">
              <div className="result-header">
                <div>
                  <span className="badge badge-neutral">{result.scene_type}</span>
                  <h3 className="result-food-name mt-1">Sanitation & Hygiene Assessment</h3>
                </div>
                <div>
                  <span className={`badge ${getCleanlinessClass(result.cleanliness_rating)} py-1 px-3 text-sm`}>
                    {result.cleanliness_rating}
                  </span>
                </div>
              </div>

              {/* Qualitative Summary */}
              <div className="environment-narrative mt-3">
                <h4 className="section-subheading">Qualitative Observations</h4>
                <p className="text-secondary">{result.qualitative_observations}</p>
              </div>

              {/* Positive Indicators & Areas of Concern Grid */}
              <div className="hygiene-comparison-grid mt-4">
                <div className="positive-box">
                  <h4 className="box-title text-emerald">
                    <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                    Observed Positive Practices
                  </h4>
                  <ul className="checklist">
                    {result.positive_indicators?.length ? (
                      result.positive_indicators.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))
                    ) : (
                      <li className="text-muted">No distinct positive indicators noted.</li>
                    )}
                  </ul>
                </div>

                <div className="concern-box">
                  <h4 className="box-title text-rose">
                    <AlertTriangleIcon className="w-4 h-4 inline mr-1" />
                    Potential Areas of Concern
                  </h4>
                  <ul className="checklist">
                    {result.areas_of_concern?.length ? (
                      result.areas_of_concern.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))
                    ) : (
                      <li className="text-muted">No obvious visual hazards observed.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Practical Tips */}
              {result.hygiene_tips && result.hygiene_tips.length > 0 && (
                <div className="tips-box mt-4">
                  <h4 className="section-subheading">Practical Consumer Dining Tips</h4>
                  <ul className="clean-bullet-list">
                    {result.hygiene_tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Non-Regulatory Disclaimer */}
              <div className="result-disclaimer mt-4">
                <strong>Legal & Regulatory Notice:</strong> {result.safety_disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
