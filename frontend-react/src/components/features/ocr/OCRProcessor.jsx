import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Settings, Scan } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './OCRProcessor.css';

const OCRProcessor = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState([]);
  const [language, setLanguage] = useState('auto'); // auto, es, en, fr, de, pt
  const [outputFormat, setOutputFormat] = useState('txt'); // txt, pdf, docx
  const [preserveLayout, setPreserveLayout] = useState(true);
  const fileInputRef = useRef(null);
  const { showSuccess, showError, showConfirm } = useSweetAlert();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const supportedFiles = newFiles.filter(file => {
      return file.type === 'application/pdf' || 
             file.type === 'image/jpeg' || 
             file.type === 'image/png' ||
             file.type === 'image/tiff';
    });
    
    if (supportedFiles.length !== newFiles.length) {
      showError('Solo se permiten archivos PDF, JPEG, PNG o TIFF');
    }
    
    setFiles(prev => [...prev, ...supportedFiles]);
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
    const supportedFiles = droppedFiles.filter(file => {
      return file.type === 'application/pdf' || 
             file.type === 'image/jpeg' || 
             file.type === 'image/png' ||
             file.type === 'image/tiff';
    });
    
    if (supportedFiles.length !== droppedFiles.length) {
      showError('Solo se permiten archivos PDF, JPEG, PNG o TIFF');
    }
    
    setFiles(prev => [...prev, ...supportedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setOcrResults([]);
    }
  };

  const processOCR = async () => {
    if (files.length === 0) {
      showError('Por favor, selecciona al menos un archivo');
      return;
    }

    setIsProcessing(true);
    setOcrResults([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('language', language);
      formData.append('outputFormat', outputFormat);
      formData.append('preserveLayout', preserveLayout);

      const response = await axios.post('/api/ocr/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 3 minutes timeout for OCR processing
      });

      if (response.data.success) {
        setOcrResults(response.data.results);
        showSuccess('Procesamiento OCR completado correctamente');
      } else {
        showError(response.data.message || 'Error en el procesamiento OCR');
      }
    } catch (error) {
      console.error('Error processing OCR:', error);
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

  const downloadResult = (resultData, fileName) => {
    const link = document.createElement('a');
    link.href = resultData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllResults = () => {
    if (ocrResults.length === 0) {
      showError('No hay resultados para descargar');
      return;
    }

    ocrResults.forEach(result => {
      downloadResult(result.data, result.fileName);
    });
  };

  const clearAll = () => {
    showConfirm({
      title: '¿Limpiar todo?',
      text: 'Se eliminarán todos los archivos y los resultados OCR',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setFiles([]);
        setOcrResults([]);
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

  const getFormatName = (format) => {
    const formats = {
      'txt': 'Texto plano (.txt)',
      'pdf': 'Documento PDF (.pdf)',
      'docx': 'Documento Word (.docx)'
    };
    return formats[format] || format;
  };

  return (
    <div className="ocr-processor-container">
      <div className="ocr-processor-header">
        <Scan className="header-icon" size={48} />
        <div className="header-content">
          <h1>Procesamiento OCR</h1>
          <p>Extrae texto de documentos escaneados e imágenes con tecnología avanzada</p>
        </div>
      </div>

      <div className="ocr-processor-content">
        {/* Upload Zone */}
        <div 
          className="upload-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <Upload className="upload-icon" size={48} />
          <h3>Arrastra y suelta archivos aquí</h3>
          <p>PDF, JPEG, PNG o TIFF</p>
          <button className="select-files-btn">Seleccionar archivos</button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.tiff"
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

        {/* OCR Configuration */}
        {files.length > 0 && (
          <div className="ocr-configuration">
            <h3>Configuración OCR</h3>
            <div className="ocr-options">
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
                <label>Formato de salida</label>
                <select 
                  value={outputFormat} 
                  onChange={(e) => setOutputFormat(e.target.value)}
                >
                  <option value="txt">Texto plano (.txt)</option>
                  <option value="pdf">Documento PDF (.pdf)</option>
                  <option value="docx">Documento Word (.docx)</option>
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
            
            <div className="ocr-info">
              <div className="info-item">
                <strong>Idioma detectado</strong>
                <span>{getLanguageName(language)}</span>
              </div>
              <div className="info-item">
                <strong>Formato de salida</strong>
                <span>{getFormatName(outputFormat)}</span>
              </div>
              <div className="info-item">
                <strong>Preservar formato</strong>
                <span>{preserveLayout ? 'Sí' : 'No'}</span>
              </div>
              <div className="info-item">
                <strong>Archivos a procesar</strong>
                <span>{files.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* OCR Results Preview */}
        {ocrResults.length > 0 && (
          <div className="ocr-results-preview">
            <h3>Resultados OCR ({ocrResults.length})</h3>
            <div className="results-container">
              {ocrResults.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-info">
                    <FileText className="result-icon" size={20} />
                    <div className="result-details">
                      <span className="result-name">{result.fileName}</span>
                      <span className="result-confidence">Precisión: {result.confidence}%</span>
                    </div>
                  </div>
                  <div className="result-actions">
                    <button 
                      className="download-result-btn"
                      onClick={() => downloadResult(result.data, result.fileName)}
                      title="Descargar resultado"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="ocr-actions">
          {files.length > 0 && (
            <>
              <button 
                className="process-btn"
                onClick={processOCR}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Procesando OCR...
                  </>
                ) : (
                  <>
                    <Scan size={20} />
                    Procesar OCR
                  </>
                )}
              </button>
              
              {ocrResults.length > 0 && (
                <button 
                  className="download-all-btn"
                  onClick={downloadAllResults}
                >
                  <Download size={20} />
                  Descargar todos
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

export default OCRProcessor;