import React, { useRef, useState } from 'react';
import { UploadCloudIcon, XIcon, AlertTriangleIcon } from './Icons';

export default function ImageUploader({
  selectedFile,
  previewUrl,
  onImageSelected,
  onClear,
  isLoading,
  label = "Upload Food Image",
  helpText = "Supports JPEG, PNG, WEBP (Max 5 MB)"
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [clientError, setClientError] = useState(null);

  const processFile = (file) => {
    setClientError(null);
    if (!file) return;

    // Type validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setClientError("Invalid file type. Please upload a JPEG, PNG, or WEBP image.");
      return;
    }

    // Size validation (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setClientError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    onImageSelected(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (isLoading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isLoading) setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="image-uploader-container">
      {clientError && (
        <div className="upload-error-alert">
          <AlertTriangleIcon className="w-5 h-5 text-amber" />
          <span>{clientError}</span>
        </div>
      )}

      {!previewUrl ? (
        <div
          className={`dropzone ${dragOver ? 'dropzone-active' : ''} ${isLoading ? 'dropzone-disabled' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            disabled={isLoading}
          />
          <div className="dropzone-icon">
            <UploadCloudIcon className="w-6 h-6 text-forest" />
          </div>
          <p className="dropzone-title">{label}</p>
          <p className="dropzone-subtitle">Drag and drop here, or click to browse</p>
          <span className="dropzone-hint">{helpText}</span>
        </div>
      ) : (
        <div className="preview-card">
          <div className="preview-image-wrapper">
            <img src={previewUrl} alt="Uploaded food preview" className="preview-image" />
            {!isLoading && (
              <button
                type="button"
                className="btn-remove-image"
                onClick={onClear}
                title="Remove image"
                aria-label="Remove image"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="preview-meta">
            <span className="preview-filename">{selectedFile?.name || 'Selected image'}</span>
            <span className="preview-filesize">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
