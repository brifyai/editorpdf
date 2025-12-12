import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import './OCRInteligente.css';

const OCRInteligente = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrType, setOcrType] = useState('text'); // text, table, form, handwritten
  const [language, setLanguage] = useState('es');
  const [outputFormat, setOutputFormat] = useState('text'); // text, json, csv, searchable-pdf
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [extractTables, setExtractTables] = useState(false);
  const [detectHandwriting, setDetectHandwriting] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);
  const fileInputRef = useRef(null);

  const ocrOptions = [
    {
      id: 'text',
      name: 'Reconocimiento de Texto',
      description: 'Extrae todo el texto del documento PDF',
      icon: '📄'
    },
    {
      id: 'table',
      name: 'Extracción de Tablas',
      description: 'Identifica y extrae datos tabulares estructurados',
      icon: '📊'
    },
    {
      id: 'form',
      name: 'Reconocimiento de Formularios',
      description: 'Extrae datos de formularios y campos estructurados',
      icon: '📋'
    },
    {
      id: 'handwritten',
      name: 'Reconocimiento de Manuscrita',
      description: 'Reconoce texto escrito a mano en documentos',
      icon: '✍️'
    }
  ];

  const supportedLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'Inglés' },
    { code: 'fr', name: 'Francés' },
    { code: 'de', name: 'Alemán' },
    { code: 'pt', name: 'Portugués' },
    { code: 'it', name: 'Italiano' },
    { code: 'zh', name: 'Chino' },
    { code: 'ja', name: 'Japonés' },
    { code: 'ar', name: 'Árabe' },
    { code: 'ru', name: 'Ruso' }
  ];

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  }, []);

  const handleFiles = useCallback((newFiles) => {
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      alert('Por favor, selecciona solo archivos PDF');
      return;
    }

    setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setShowResults(false);
    setProcessedFile(null);
    setOcrResults(null);
  }, []);

  const performOCR = async () => {
    if (files.length === 0) {
      alert('Por favor, selecciona al menos un archivo PDF');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // Simular procesamiento OCR con diferentes tipos
      let mockResults = {
        documentInfo: {
          filename: file.name,
          pages: pages.length,
          language: language,
          ocrType: ocrType,
          processingTime: '2.3s'
        },
        extractedContent: null,
        confidence: 0,
        detectedElements: [],
        tables: [],
        forms: [],
        metadata: {
          totalWords: 0,
          totalCharacters: 0,
          processingAccuracy: 0
        }
      };

      // Generar resultados según el tipo de OCR
      switch (ocrType) {
        case 'text':
          mockResults.extractedContent = `Este es el texto extraído del documento PDF mediante reconocimiento óptico de caracteres (OCR). El sistema ha procesado ${pages.length} páginas y ha identificado el contenido textual con una alta precisión. El OCR inteligente utiliza algoritmos avanzados de aprendizaje automático para reconocer caracteres y palabras en el documento, manteniendo la estructura y formato original tanto como sea posible.`;
          mockResults.confidence = 0.95;
          mockResults.detectedElements = [
            { type: 'paragraph', count: 5 },
            { type: 'heading', count: 3 },
            { type: 'list', count: 2 }
          ];
          mockResults.metadata.totalWords = 85;
          mockResults.metadata.totalCharacters = 520;
          break;
          
        case 'table':
          mockResults.extractedContent = 'Se han detectado y extraído 2 tablas del documento.';
          mockResults.confidence = 0.88;
          mockResults.tables = [
            {
              name: 'Tabla 1',
              rows: 5,
              columns: 3,
              data: [
                ['Producto', 'Cantidad', 'Precio'],
                ['Laptop', '2', '$1200'],
                ['Mouse', '5', '$25'],
                ['Teclado', '3', '$45'],
                ['Monitor', '1', '$300']
              ]
            },
            {
              name: 'Tabla 2',
              rows: 4,
              columns: 2,
              data: [
                ['Mes', 'Ventas'],
                ['Enero', '$5000'],
                ['Febrero', '$6500'],
                ['Marzo', '$7200']
              ]
            }
          ];
          mockResults.detectedElements = [
            { type: 'table', count: 2 }
          ];
          break;
          
        case 'form':
          mockResults.extractedContent = 'Se ha procesado un formulario con múltiples campos.';
          mockResults.confidence = 0.92;
          mockResults.forms = [
            {
              formName: 'Formulario de Contacto',
              fields: [
                { name: 'nombre', value: 'Juan Pérez', type: 'text', confidence: 0.98 },
                { name: 'email', value: 'juan.perez@email.com', type: 'email', confidence: 0.95 },
                { name: 'telefono', value: '+1234567890', type: 'phone', confidence: 0.90 },
                { name: 'mensaje', value: 'Este es un mensaje de prueba', type: 'textarea', confidence: 0.88 }
              ]
            }
          ];
          mockResults.detectedElements = [
            { type: 'form', count: 1 },
            { type: 'textfield', count: 4 }
          ];
          break;
          
        case 'handwritten':
          mockResults.extractedContent = 'Se ha reconocido texto manuscrito en el documento. Nota importante: Reunión el viernes a las 3pm. Firma: María González.';
          mockResults.confidence = 0.78;
          mockResults.detectedElements = [
            { type: 'handwritten_text', count: 2 },
            { type: 'signature', count: 1 }
          ];
          mockResults.metadata.totalWords = 18;
          mockResults.metadata.totalCharacters = 95;
          break;
      }

      mockResults.metadata.processingAccuracy = Math.round(mockResults.confidence * 100);

      // Simular progreso
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setOcrResults(mockResults);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error al realizar OCR:', error);
      alert('Error al procesar el OCR. Por favor, intenta nuevamente.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadResults = useCallback(() => {
    if (!ocrResults) return;

    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    switch (outputFormat) {
      case 'text':
        content = generateTextReport(ocrResults);
        filename = `ocr_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
      case 'json':
        content = JSON.stringify(ocrResults, null, 2);
        filename = `ocr_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = generateCSVReport(ocrResults);
        filename = `ocr_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        content = generateTextReport(ocrResults);
        filename = `ocr_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.txt`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [ocrResults, outputFormat, files]);

  const generateTextReport = (results) => {
    let content = `INFORME DE RECONOCIMIENTO ÓPTICO DE CARACTERES (OCR)\n`;
    content += `====================================================\n\n`;
    
    content += `INFORMACIÓN DEL DOCUMENTO\n`;
    content += `------------------------\n`;
    content += `Archivo: ${results.documentInfo.filename}\n`;
    content += `Páginas procesadas: ${results.documentInfo.pages}\n`;
    content += `Idioma: ${results.documentInfo.language}\n`;
    content += `Tipo de OCR: ${results.documentInfo.ocrType}\n`;
    content += `Tiempo de procesamiento: ${results.documentInfo.processingTime}\n`;
    content += `Confianza: ${(results.confidence * 100).toFixed(1)}%\n\n`;
    
    content += `CONTENIDO EXTRAÍDO\n`;
    content += `------------------\n`;
    content += `${results.extractedContent}\n\n`;
    
    if (results.tables && results.tables.length > 0) {
      content += `TABLAS DETECTADAS\n`;
      content += `-----------------\n`;
      results.tables.forEach((table, index) => {
        content += `\n${table.name} (${table.rows}x${table.columns}):\n`;
        table.data.forEach(row => {
          content += row.join(' | ') + '\n';
        });
      });
      content += '\n';
    }
    
    if (results.forms && results.forms.length > 0) {
      content += `FORMULARIOS DETECTADOS\n`;
      content += `--------------------\n`;
      results.forms.forEach((form, index) => {
        content += `\n${form.formName}:\n`;
        form.fields.forEach(field => {
          content += `- ${field.name}: ${field.value} (confianza: ${(field.confidence * 100).toFixed(1)}%)\n`;
        });
      });
      content += '\n';
    }
    
    content += `METADATAS\n`;
    content += `---------\n`;
    content += `Total de palabras: ${results.metadata.totalWords}\n`;
    content += `Total de caracteres: ${results.metadata.totalCharacters}\n`;
    content += `Precisión del procesamiento: ${results.metadata.processingAccuracy}%\n\n`;
    
    content += `ELEMENTOS DETECTADOS\n`;
    content += `-------------------\n`;
    results.detectedElements.forEach(element => {
      content += `- ${element.type}: ${element.count}\n`;
    });
    
    content += `\nGenerado el: ${new Date().toLocaleString()}\n`;
    
    return content;
  };

  const generateCSVReport = (results) => {
    let csv = 'Tipo,Elemento,Valor,Confianza\n';
    
    if (results.tables && results.tables.length > 0) {
      results.tables.forEach(table => {
        table.data.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            csv += `Tabla,${table.name} F${rowIndex + 1}C${colIndex + 1},"${cell}",${(results.confidence * 100).toFixed(1)}%\n`;
          });
        });
      });
    }
    
    if (results.forms && results.forms.length > 0) {
      results.forms.forEach(form => {
        form.fields.forEach(field => {
          csv += `Formulario,"${form.formName}","${field.name}","${field.value}",${(field.confidence * 100).toFixed(1)}%\n`;
        });
      });
    }
    
    return csv;
  };

  const resetForm = useCallback(() => {
    setFiles([]);
    setProcessedFile(null);
    setShowResults(false);
    setOcrResults(null);
    setOcrType('text');
    setLanguage('es');
    setOutputFormat('text');
    setPreserveLayout(true);
    setExtractTables(false);
    setDetectHandwriting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="ocr-inteligente-container">
      <div className="ocr-inteligente-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>OCR Inteligente</h1>
            <p>Reconocimiento óptico de caracteres avanzado con IA para tus documentos PDF</p>
          </div>
        </div>
      </div>

      <div className="ocr-inteligente-content">
        {/* Sección de carga de archivos */}
        <div className="upload-section">
          <div
            className={`upload-area ${files.length > 0 ? 'has-files' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="file-input"
            />
            <div className="upload-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              <h3>Arrastra y suelta archivos PDF aquí</h3>
              <p>o haz clic para seleccionar archivos</p>
              <button className="select-button">Seleccionar Archivos</button>
            </div>
          </div>
        </div>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="files-section">
            <h3>Archivos Seleccionados</h3>
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="remove-button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuración de OCR */}
        {files.length > 0 && (
          <div className="configuration-section">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"/>
              </svg>
              Configuración de OCR
            </h3>
            
            <div className="ocr-options">
              {ocrOptions.map((option) => (
                <div
                  key={option.id}
                  className={`ocr-option ${ocrType === option.id ? 'selected' : ''}`}
                  onClick={() => setOcrType(option.id)}
                >
                  <div className="option-icon">{option.icon}</div>
                  <div className="option-content">
                    <h4>{option.name}</h4>
                    <p>{option.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="config-grid">
              <div className="config-group">
                <label>Idioma del Documento:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="config-group">
                <label>Formato de Salida:</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                >
                  <option value="text">Texto plano (.txt)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="searchable-pdf">PDF searchable (.pdf)</option>
                </select>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preserveLayout}
                    onChange={(e) => setPreserveLayout(e.target.checked)}
                  />
                  Preservar diseño original
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={extractTables}
                    onChange={(e) => setExtractTables(e.target.checked)}
                  />
                  Extraer tablas automáticamente
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={detectHandwriting}
                    onChange={(e) => setDetectHandwriting(e.target.checked)}
                  />
                  Detectar texto manuscrito
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Sección de procesamiento */}
        {isProcessing && (
          <div className="processing-section">
            <div className="processing-content">
              <div className="processing-spinner"></div>
              <p>Realizando reconocimiento óptico de caracteres...</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de resultados */}
        {showResults && ocrResults && (
          <div className="results-section">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              Resultados del OCR
            </h3>
            
            <div className="ocr-results">
              {/* Información del documento */}
              <div className="result-section">
                <h4>Información del Procesamiento</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Archivo:</span>
                    <span className="info-value">{ocrResults.documentInfo.filename}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Páginas:</span>
                    <span className="info-value">{ocrResults.documentInfo.pages}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Idioma:</span>
                    <span className="info-value">{supportedLanguages.find(l => l.code === ocrResults.documentInfo.language)?.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tipo OCR:</span>
                    <span className="info-value">{ocrOptions.find(o => o.id === ocrResults.documentInfo.ocrType)?.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Confianza:</span>
                    <span className="info-value confidence">
                      <span className={`confidence-badge ${(ocrResults.confidence * 100) >= 90 ? 'high' : (ocrResults.confidence * 100) >= 70 ? 'medium' : 'low'}`}>
                        {(ocrResults.confidence * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tiempo:</span>
                    <span className="info-value">{ocrResults.documentInfo.processingTime}</span>
                  </div>
                </div>
              </div>

              {/* Contenido extraído */}
              <div className="result-section">
                <h4>Contenido Extraído</h4>
                <div className="extracted-content">
                  <div className="content-text">
                    {ocrResults.extractedContent}
                  </div>
                </div>
              </div>

              {/* Tablas detectadas */}
              {ocrResults.tables && ocrResults.tables.length > 0 && (
                <div className="result-section">
                  <h4>Tablas Detectadas</h4>
                  <div className="tables-container">
                    {ocrResults.tables.map((table, index) => (
                      <div key={index} className="table-result">
                        <h5>{table.name}</h5>
                        <div className="table-info">
                          <span>{table.rows} filas × {table.columns} columnas</span>
                        </div>
                        <div className="table-data">
                          <table>
                            <tbody>
                              {table.data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, colIndex) => (
                                    <td key={colIndex}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formularios detectados */}
              {ocrResults.forms && ocrResults.forms.length > 0 && (
                <div className="result-section">
                  <h4>Formularios Detectados</h4>
                  <div className="forms-container">
                    {ocrResults.forms.map((form, index) => (
                      <div key={index} className="form-result">
                        <h5>{form.formName}</h5>
                        <div className="form-fields">
                          {form.fields.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="form-field">
                              <div className="field-info">
                                <span className="field-name">{field.name}</span>
                                <span className="field-value">{field.value}</span>
                              </div>
                              <div className="field-confidence">
                                <span className="confidence-label">Confianza:</span>
                                <span className="confidence-value">{(field.confidence * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estadísticas */}
              <div className="result-section">
                <h4>Estadísticas del Procesamiento</h4>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{ocrResults.metadata.totalWords}</div>
                    <div className="stat-label">Palabras</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{ocrResults.metadata.totalCharacters}</div>
                    <div className="stat-label">Caracteres</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{ocrResults.metadata.processingAccuracy}%</div>
                    <div className="stat-label">Precisión</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{ocrResults.detectedElements.reduce((sum, el) => sum + el.count, 0)}</div>
                    <div className="stat-label">Elementos</div>
                  </div>
                </div>
              </div>

              {/* Elementos detectados */}
              <div className="result-section">
                <h4>Elementos Detectados</h4>
                <div className="elements-list">
                  {ocrResults.detectedElements.map((element, index) => (
                    <div key={index} className="element-item">
                      <span className="element-type">{element.type}</span>
                      <span className="element-count">{element.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="results-actions">
                <button onClick={downloadResults} className="download-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar Resultados
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección de acciones */}
        {files.length > 0 && !isProcessing && (
          <div className="actions-section">
            <button onClick={performOCR} className="process-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Realizar OCR
            </button>
            
            {showResults && (
              <button onClick={resetForm} className="reset-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1,4 1,10 7,10"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Procesar Nuevo Documento
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRInteligente;