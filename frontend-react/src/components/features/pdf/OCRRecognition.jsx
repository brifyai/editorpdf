import React, { useState, useCallback } from 'react';
import { Upload, X, Settings, Download, FileText, Eye, Brain, Languages, FileSearch } from 'lucide-react';
import axios from 'axios';
import './OCRRecognition.css';

const OCRRecognition = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Configuración de OCR
  const [settings, setSettings] = useState({
    language: 'spa', // 'spa', 'eng', 'fra', 'deu', 'ita', 'por'
    outputFormat: 'pdf', // 'pdf', 'txt', 'docx'
    preserveLayout: true,
    improveQuality: true,
    detectTables: false,
    confidence: 75,
    preprocessImage: true
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type.startsWith('image/')
    );
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateStatistics = async (action, details = {}) => {
    try {
      await axios.post('/api/statistics', {
        action,
        tool: 'ocr-recognition',
        details
      });
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  };

  const processOCR = async () => {
    if (files.length === 0) {
      alert('Por favor selecciona al menos un archivo PDF o imagen');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Iniciando reconocimiento de texto...');
    setProgress(0);
    setExtractedText('');

    try {
      let allExtractedText = '';
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingStatus(`Procesando ${file.name}...`);
        setProgress((i / files.length) * 100);

        // Simulación de procesamiento OCR
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Extraer texto simulado
        const simulatedText = `
=== TEXTO EXTRAÍDO DE: ${file.name} ===
Fecha de procesamiento: ${new Date().toLocaleString()}
Idioma detectado: ${getLanguageName(settings.language)}
Nivel de confianza: ${settings.confidence}%

Este es un texto simulado extraído mediante OCR.
En una implementación real, aquí aparecería el texto real
extraído del documento "${file.name}".

El reconocimiento óptico de caracteres (OCR) convierte
imágenes de texto en texto seleccionable y editable.

Configuración utilizada:
- Preservar diseño: ${settings.preserveLayout ? 'Sí' : 'No'}
- Mejorar calidad: ${settings.improveQuality ? 'Sí' : 'No'}
- Detectar tablas: ${settings.detectTables ? 'Sí' : 'No'}
- Preprocesar imagen: ${settings.preprocessImage ? 'Sí' : 'No'}

${settings.detectTables ? `
[TABLA DETECTADA]
| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Dato 1    | Dato 2    | Dato 3    |
| Dato 4    | Dato 5    | Dato 6    |
` : ''}

=== FIN DEL DOCUMENTO ===

`;
        
        allExtractedText += simulatedText + '\n\n';
      }

      setExtractedText(allExtractedText);
      setProcessingStatus('Reconocimiento completado');
      setProgress(100);
      setShowPreview(true);
      
      // Actualizar estadísticas
      await updateStatistics('ocr-completed', {
        filesProcessed: files.length,
        language: settings.language,
        outputFormat: settings.outputFormat,
        settings: settings
      });

    } catch (error) {
      console.error('Error processing OCR:', error);
      setProcessingStatus('Error en el procesamiento');
      
      // Actualizar estadísticas de error
      await updateStatistics('ocr-error', {
        error: error.message,
        filesAttempted: files.length
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProcessingStatus('');
        setProgress(0);
      }, 3000);
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      'spa': 'Español',
      'eng': 'Inglés',
      'fra': 'Francés',
      'deu': 'Alemán',
      'ita': 'Italiano',
      'por': 'Portugués'
    };
    return languages[code] || code;
  };

  const downloadResult = async () => {
    if (!extractedText) return;

    try {
      let content = extractedText;
      let mimeType = 'text/plain';
      let fileName = `texto_extraido_${Date.now()}`;

      if (settings.outputFormat === 'pdf') {
        // Crear PDF con el texto extraído
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        
        pdf.setFontSize(16);
        pdf.text('Texto Extraído mediante OCR', 20, 20);
        pdf.setFontSize(12);
        pdf.text(`Fecha: ${new Date().toLocaleString()}`, 20, 30);
        pdf.text(`Idioma: ${getLanguageName(settings.language)}`, 20, 40);
        pdf.text('', 20, 50); // Espacio

        // Agregar texto extraído (dividir en líneas si es muy largo)
        const lines = content.split('\n');
        let yPosition = 60;
        
        lines.forEach(line => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          if (line.trim()) {
            pdf.text(line.substring(0, 80), 20, yPosition);
            yPosition += 7;
          }
        });

        content = pdf.output('blob');
        mimeType = 'application/pdf';
        fileName += '.pdf';
      } else if (settings.outputFormat === 'docx') {
        // Simular creación de DOCX
        content = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        fileName += '.docx';
      } else {
        content = new Blob([content], { type: 'text/plain' });
        fileName += '.txt';
      }

      // Descargar archivo
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Actualizar estadísticas
      await updateStatistics('ocr-downloaded', {
        format: settings.outputFormat,
        textSize: extractedText.length
      });

    } catch (error) {
      console.error('Error downloading result:', error);
      alert('Error al descargar el archivo');
    }
  };

  return (
    <div className="ocr-recognition-container">
      {/* Header */}
      <div className="ocr-recognition-header">
        <div className="header-content">
          <div className="header-icon">
            <Eye size={32} />
          </div>
          <div className="header-text">
            <h1>Reconocimiento de Texto OCR</h1>
            <p>Convierte PDFs escaneados e imágenes en documentos con texto seleccionable</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ocr-recognition-content">
        {/* Upload Area */}
        <div className="upload-section">
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <Upload size={48} />
              <h3>Arrastra y suelta archivos PDF o imágenes aquí</h3>
              <p>Formatos soportados: PDF, JPG, PNG, TIFF, BMP</p>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                multiple
                onChange={handleFileSelect}
                className="file-input"
              />
              <button className="select-button">
                Seleccionar Archivos
              </button>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="files-section">
            <h3>Archivos Seleccionados</h3>
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <FileText size={20} />
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => removeFile(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration */}
        {files.length > 0 && (
          <div className="configuration-section">
            <h3>
              <Settings size={20} />
              Configuración de OCR
            </h3>
            
            <div className="config-grid">
              {/* Idioma */}
              <div className="config-group">
                <label>Idioma del Texto</label>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="spa">Español</option>
                  <option value="eng">Inglés</option>
                  <option value="fra">Francés</option>
                  <option value="deu">Alemán</option>
                  <option value="ita">Italiano</option>
                  <option value="por">Portugués</option>
                </select>
              </div>

              {/* Formato de salida */}
              <div className="config-group">
                <label>Formato de Salida</label>
                <select 
                  value={settings.outputFormat}
                  onChange={(e) => setSettings(prev => ({ ...prev, outputFormat: e.target.value }))}
                >
                  <option value="pdf">PDF</option>
                  <option value="txt">Texto (.txt)</option>
                  <option value="docx">Word (.docx)</option>
                </select>
              </div>

              {/* Nivel de confianza */}
              <div className="config-group">
                <label>Nivel de Confianza Mínimo (%)</label>
                <input 
                  type="number"
                  min="1"
                  max="100"
                  value={settings.confidence}
                  onChange={(e) => setSettings(prev => ({ ...prev, confidence: parseInt(e.target.value) || 75 }))}
                />
              </div>

              {/* Opciones adicionales */}
              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.preserveLayout}
                    onChange={(e) => setSettings(prev => ({ ...prev, preserveLayout: e.target.checked }))}
                  />
                  Preservar diseño original
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.improveQuality}
                    onChange={(e) => setSettings(prev => ({ ...prev, improveQuality: e.target.checked }))}
                  />
                  Mejorar calidad de imagen
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.detectTables}
                    onChange={(e) => setSettings(prev => ({ ...prev, detectTables: e.target.checked }))}
                  />
                  Detectar tablas
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.preprocessImage}
                    onChange={(e) => setSettings(prev => ({ ...prev, preprocessImage: e.target.checked }))}
                  />
                  Preprocesar imagen
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="processing-section">
            <div className="processing-content">
              <div className="processing-spinner"></div>
              <p>{processingStatus}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Text Preview */}
        {showPreview && extractedText && (
          <div className="preview-section">
            <h3>
              <FileSearch size={20} />
              Texto Extraído
            </h3>
            <div className="text-preview">
              <pre>{extractedText}</pre>
            </div>
            <div className="preview-actions">
              <button className="download-button" onClick={downloadResult}>
                <Download size={20} />
                Descargar {settings.outputFormat.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && !isProcessing && (
          <div className="actions-section">
            <button 
              className="process-button"
              onClick={processOCR}
            >
              <Brain size={20} />
              Iniciar Reconocimiento OCR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRRecognition;