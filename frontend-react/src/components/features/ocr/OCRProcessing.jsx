import React, { useState, useRef, useCallback } from 'react';
import './OCRProcessing.css';

const OCRProcessing = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('spa');
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const languages = [
    { code: 'spa', name: 'Español' },
    { code: 'eng', name: 'English' },
    { code: 'fra', name: 'Français' },
    { code: 'deu', name: 'Deutsch' },
    { code: 'ita', name: 'Italiano' },
    { code: 'por', name: 'Português' }
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  }, []);

  const handleFiles = useCallback((newFiles) => {
    const validFiles = newFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        showError('Formato inválido', `El archivo ${file.name} no es un formato válido. Solo se permiten JPG, PNG, WebP y TIFF.`);
        return false;
      }
      if (file.size > maxFileSize) {
        showError('Archivo muy grande', `El archivo ${file.name} es demasiado grande. El tamaño máximo es 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      simulateProcessing(validFiles);
    }
  }, []);

  const simulateProcessing = useCallback((filesToProcess) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setProcessingProgress(100);
      setIsProcessing(false);
    }, filesToProcess.length * 3000);
  }, []);

  const removeFile = useCallback((indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
    );
  };

  return (
    <div className="ocr-processing-container">
      <div className="ocr-processing-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Procesamiento OCR</h1>
            <p>Extrae texto de imágenes usando reconocimiento óptico de caracteres</p>
          </div>
        </div>
      </div>

      <div className="language-selector">
        <label htmlFor="language-select">Idioma del texto:</label>
        <select 
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="language-select"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      <div className="upload-section">
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.tiff"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            {isProcessing ? (
              <div className="processing-progress">
                <div className="progress-circle">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="25"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 25}`}
                      strokeDashoffset={`${2 * Math.PI * 25 * (1 - processingProgress / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 30 30)"
                      className="progress-circle-animated"
                    />
                  </svg>
                  <span className="progress-text">{Math.round(processingProgress)}%</span>
                </div>
                <p className="progress-message">Procesando OCR...</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div className="upload-text">
                  <h3>Arrastra imágenes aquí para extraer texto</h3>
                  <p className="upload-formats">
                    <span className="formats-label">Formatos soportados:</span>
                    <span className="formats-list">JPG, PNG, WebP, TIFF</span>
                    <span className="formats-size">(máx. 10MB)</span>
                  </p>
                </div>
                <button className="upload-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Seleccionar Imágenes
                </button>
              </>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="files-list">
            <h3>Imágenes seleccionadas ({files.length})</h3>
            <div className="files-grid">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-icon">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button 
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="features-section">
        <h3>Características del OCR</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
              </svg>
            </div>
            <h4>Reconocimiento Preciso</h4>
            <p>Extracción de texto con alta precisión en múltiples idiomas</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h4>Procesamiento Rápido</h4>
            <p>Análisis en tiempo real con tecnología OCR avanzada</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h4>Múltiples Formatos</h4>
            <p>Soporte para JPG, PNG, WebP y TIFF de alta calidad</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h4>Texto Estructurado</h4>
            <p>Conservación de formato y estructura del documento original</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRProcessing;
