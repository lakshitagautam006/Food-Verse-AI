import React, { useState } from 'react';
import { api } from '../api';
import { XIcon, CheckCircleIcon, AlertTriangleIcon, SparklesIcon } from './Icons';

export default function KeySetupModal({ isOpen, onClose, onStatusUpdated, currentHealth }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const health = await api.checkHealth();
      setTestResult(health);
      if (onStatusUpdated) onStatusUpdated(health);
    } catch (err) {
      setTestResult({
        status: 'offline',
        api_key_configured: false,
        message: err.message || 'Failed to connect to backend.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-row items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-forest" />
            <h3 className="modal-title">Cloud AI Configuration Guide</h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            Food Verse AI utilizes Groq Cloud AI (<code>{currentHealth?.model || 'qwen/qwen3.8-27b'}</code>) 
            for ultra-fast multimodal food recognition, freshness inspection, and nutrition analysis.
          </p>

          <div className="setup-steps">
            <div className="step-item">
              <span className="step-num">1</span>
              <div>
                <strong>Get a free Groq API key:</strong>
                <p>
                  Visit <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="link-external">Groq Console</a> and click <em>"Create API Key"</em>.
                </p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-num">2</span>
              <div>
                <strong>Add key to backend environment:</strong>
                <p>Open <code>food-verse-ai/backend/.env</code> in your editor and paste:</p>
                <pre className="code-snippet">GROQ_API_KEY=gsk_...</pre>
              </div>
            </div>

            <div className="step-item">
              <span className="step-num">3</span>
              <div>
                <strong>Verify and start analyzing:</strong>
                <p>Save the file and click <em>"Test Connection"</em> below to verify.</p>
              </div>
            </div>
          </div>

          {testResult && (
            <div className={`status-feedback ${testResult.api_key_configured ? 'status-feedback-success' : 'status-feedback-warning'}`}>
              {testResult.api_key_configured ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-emerald" />
                  <div>
                    <strong>Connection Verified!</strong>
                    <p>Groq Cloud AI is active and ready for live multimodal inference.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangleIcon className="w-5 h-5 text-amber" />
                  <div>
                    <strong>API Key Missing in backend/.env</strong>
                    <p>{testResult.message}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
