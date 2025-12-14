import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Settings, Type } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './ExtractText.css';

const ExtractText = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [format, setFormat] = useState('txt'); // txt, docx
  const [language, setLanguage] = useState('auto'); // auto, es, en, fr, de, pt
  const [preserveLayout, setPreserveLayout] = useState(true);
  const fileInputRef = useRef(null);
  const { showSuccess, showError, showConfirm } = useSweetAlert();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== newFiles.length) {
      showError('Solo se permiten archivos PDF');
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== droppedFiles.length) {
      showError('Solo se permiten archivos PDF');
    }
    
    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setExtractedText('');
    }
  };

  const extractTextFromPDF = async () => {
    if (files.length === 0) {
      showError('Por favor, selecciona al menos un archivo PDF');
      return;
    }

    setIsProcessing(true);
    setExtractedText('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('format', format);
      formData.append('language', language);
      formData.append('preserveLayout', preserveLayout);

      const response = await axios.post('/api/pdf/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (response.data.success) {
        setExtractedText(response.data.text);
        showSuccess('Texto extraído correctamente');
      } else {
        showError(response.data.message || 'Error al extraer el texto');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      if (error.response) {
        showError(`Error del servidor: ${error.response.data.message || error.response.status}`);
      } else if (error.request) {
        showError('No se pudo conectar con el servidor');
      } else {
        showError('Error al procesar la solicitud');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = () => {
    if (!extractedText) {
      showError('No hay texto para descargar');
      return;
    }

    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = files.length > 0 
      ? `${files[0].name.replace('.pdf', '')}_extracted.txt`
      : 'extracted_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    showConfirm({
      title: '¿Limpiar todo?',
      text: 'Se eliminarán todos los archivos y el texto extraído',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setFiles([]);
        setExtractedText('');
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLanguageName = (code) => {
    const languages = {
      'auto': 'Detección automática',
      'es': 'Español',
      'en': 'Inglés',
      'fr': 'Francés',
      'de': 'Alemán',
      'pt': 'Portugués'
    };
    return languages[code] || code;
  };

  return (
    <div className="extract-text-container">
      <div className="extract-text-header">
        <Type className="header-icon" size={48} />
        <div className="header-content">
          <h1>Extraer Texto de PDF</h1>
          <p>Extrae texto de documentos PDF de forma rápida y precisa</p>
        </div>
      </div>

      <div className="extract-text-content">
        {/* Upload Zone */}
        <div 
          className="upload-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <Upload className="upload-icon" size={48} />
          <h3>Arrastra y suelta archivos PDF aquí</h3>
          <p>o haz clic para seleccionar archivos</p>
          <button className="select-files-btn">Seleccionar archivos</button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="files-list">
            <h3>Archivos seleccionados ({files.length})</h3>
            <div className="files-container">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <FileText className="file-icon" size={20} />
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                      title="Eliminar archivo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extraction Configuration */}
        {files.length > 0 && (
          <div className="extraction-configuration">
            <h3>Configuración de extracción</h3>
            <div className="extraction-options">
              <div className="option-group">
                <label>Formato de salida</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="txt">Texto plano (.txt)</option>
                  <option value="docx">Documento Word (.docx)</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Idioma del texto</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="auto">Detección automática</option>
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="fr">Francés</option>
                  <option value="de">Alemán</option>
                  <option value="pt">Portugués</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preserveLayout}
                    onChange={(e) => setPreserveLayout(e.target.checked)}
                  />
                  Preservar formato y diseño
                </label>
                <small>Mantiene la estructura original del documento</small>
              </div>
            </div>
            
            <div className="extraction-info">
              <div className="info-item">
                <strong>Idioma detectado</strong>
                <span>{getLanguageName(language)}</span>
              </div>
              <div className="info-item">
                <strong>Formato de salida</strong>
                <span>{format.toUpperCase()}</span>
              </div>
              <div className="info-item">
                <strong>Archivos a procesar</strong>
                <span>{files.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Text Preview */}
        {extractedText && (
          <div className="extracted-text-preview">
            <h3>Texto extraído</h3>
            <div className="text-preview-container">
              <pre className="text-content">{extractedText}</pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="extract-actions">
          {files.length > 0 && (
            <>
              <button 
                className="extract-btn"
                onClick={extractTextFromPDF}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Extrayendo texto...
                  </>
                ) : (
                  <>
                    <Type size={20} />
                    Extraer texto
                  </>
                )}
              </button>
              
              {extractedText && (
                <button 
                  className="download-btn"
                  onClick={downloadText}
                >
                  <Download size={20} />
                  Descargar texto
                </button>
              )}
              
              <button 
                className="clear-btn"
                onClick={clearAll}
              >
                <X size={20} />
                Limpiar todo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtractText;