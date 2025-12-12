import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import './ExtraccionInteligente.css';

const ExtraccionInteligente = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractionType, setExtractionType] = useState('structured'); // structured, entities, keywords, tables
  const [language, setLanguage] = useState('es');
  const [outputFormat, setOutputFormat] = useState('json'); // json, csv, xml, excel
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [processedFile, setProcessedFile] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [extractionResults, setExtractionResults] = useState(null);
  const fileInputRef = useRef(null);

  const extractionOptions = [
    {
      id: 'structured',
      name: 'Extracción Estructurada',
      description: 'Extrae datos organizados en formato estructurado',
      icon: '🏗️'
    },
    {
      id: 'entities',
      name: 'Reconocimiento de Entidades',
      description: 'Identifica personas, lugares, fechas y otras entidades',
      icon: '🏷️'
    },
    {
      id: 'keywords',
      name: 'Extracción de Palabras Clave',
      description: 'Extrae términos y conceptos importantes del documento',
      icon: '🔑'
    },
    {
      id: 'tables',
      name: 'Extracción de Tablas',
      description: 'Identifica y extrae datos tabulares con precisión',
      icon: '📊'
    }
  ];

  const supportedLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'Inglés' },
    { code: 'fr', name: 'Francés' },
    { code: 'de', name: 'Alemán' },
    { code: 'pt', name: 'Portugués' },
    { code: 'it', name: 'Italiano' }
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
    setExtractionResults(null);
  }, []);

  const performExtraction = async () => {
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
      
      // Simular extracción inteligente con diferentes tipos
      let mockResults = {
        documentInfo: {
          filename: file.name,
          pages: pages.length,
          language: language,
          extractionType: extractionType,
          processingTime: '3.1s'
        },
        extractedData: null,
        confidence: 0,
        entities: [],
        keywords: [],
        tables: [],
        structuredData: {},
        metadata: {
          totalItems: 0,
          processingAccuracy: 0,
          dataQuality: 0
        }
      };

      // Generar resultados según el tipo de extracción
      switch (extractionType) {
        case 'structured':
          mockResults.extractedData = {
            title: 'Documento de Ejemplo',
            sections: [
              {
                heading: 'Introducción',
                content: 'Este es un documento de ejemplo que contiene información estructurada.',
                subsections: []
              },
              {
                heading: 'Desarrollo',
                content: 'En esta sección se desarrollan los conceptos principales del documento.',
                subsections: [
                  {
                    heading: 'Concepto 1',
                    content: 'Descripción del primer concepto importante.'
                  },
                  {
                    heading: 'Concepto 2',
                    content: 'Descripción del segundo concepto relevante.'
                  }
                ]
              }
            ],
            references: [
              { type: 'book', title: 'Libro de Referencia', author: 'Autor Ejemplo', year: 2023 },
              { type: 'article', title: 'Artículo Científico', journal: 'Revista Técnica', year: 2024 }
            ]
          };
          mockResults.confidence = 0.92;
          mockResults.structuredData = {
            documentType: 'technical_report',
            complexity: 'medium',
            readabilityScore: 8.5
          };
          break;
          
        case 'entities':
          mockResults.extractedData = 'Se han identificado múltiples entidades en el documento.';
          mockResults.confidence = 0.88;
          mockResults.entities = [
            { text: 'Juan Pérez', type: 'PERSON', confidence: 0.95, position: 'página 1, línea 5' },
            { text: 'Santiago', type: 'LOCATION', confidence: 0.92, position: 'página 1, línea 8' },
            { text: '15 de enero de 2024', type: 'DATE', confidence: 0.98, position: 'página 1, línea 12' },
            { text: 'Microsoft Corporation', type: 'ORGANIZATION', confidence: 0.90, position: 'página 2, línea 3' },
            { text: '$50,000', type: 'MONEY', confidence: 0.85, position: 'página 2, línea 7' },
            { text: 'contacto@ejemplo.com', type: 'EMAIL', confidence: 0.97, position: 'página 3, línea 2' },
            { text: '+56 9 1234 5678', type: 'PHONE', confidence: 0.88, position: 'página 3, línea 4' }
          ];
          break;
          
        case 'keywords':
          mockResults.extractedData = 'Se han extraído las palabras clave más relevantes del documento.';
          mockResults.confidence = 0.85;
          mockResults.keywords = [
            { word: 'inteligencia artificial', frequency: 12, relevance: 0.95, category: 'technology' },
            { word: 'aprendizaje automático', frequency: 8, relevance: 0.90, category: 'technology' },
            { word: 'análisis de datos', frequency: 7, relevance: 0.85, category: 'methodology' },
            { word: 'redes neuronales', frequency: 5, relevance: 0.80, category: 'technology' },
            { word: 'procesamiento natural', frequency: 4, relevance: 0.75, category: 'methodology' },
            { word: 'algoritmos', frequency: 6, relevance: 0.82, category: 'technology' },
            { word: 'optimización', frequency: 3, relevance: 0.70, category: 'process' },
            { word: 'validación', frequency: 4, relevance: 0.72, category: 'quality' }
          ];
          break;
          
        case 'tables':
          mockResults.extractedData = 'Se han detectado y extraído tablas del documento.';
          mockResults.confidence = 0.90;
          mockResults.tables = [
            {
              title: 'Tabla de Resultados',
              headers: ['Métrica', 'Valor', 'Unidad'],
              rows: [
                ['Precisión', '95.2', '%'],
                ['Recall', '87.8', '%'],
                ['F1-Score', '91.3', '%'],
                ['Tiempo', '2.3', 'seg']
              ],
              confidence: 0.92
            },
            {
              title: 'Comparación de Modelos',
              headers: ['Modelo', 'Accuracy', 'Velocidad'],
              rows: [
                ['Modelo A', '92.1%', 'Rápido'],
                ['Modelo B', '94.5%', 'Medio'],
                ['Modelo C', '96.2%', 'Lento']
              ],
              confidence: 0.88
            }
          ];
          break;
      }

      mockResults.metadata.totalItems = 
        (mockResults.entities?.length || 0) + 
        (mockResults.keywords?.length || 0) + 
        (mockResults.tables?.length || 0) + 
        (mockResults.extractedData?.sections?.length || 0);
      mockResults.metadata.processingAccuracy = Math.round(mockResults.confidence * 100);
      mockResults.metadata.dataQuality = Math.round((mockResults.confidence * 0.9) * 100);

      // Simular progreso
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      setExtractionResults(mockResults);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error al realizar extracción:', error);
      alert('Error al procesar la extracción. Por favor, intenta nuevamente.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadResults = useCallback(() => {
    if (!extractionResults) return;

    let content = '';
    let filename = '';
    let mimeType = 'application/json';

    switch (outputFormat) {
      case 'json':
        content = JSON.stringify(extractionResults, null, 2);
        filename = `extraccion_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = generateCSVReport(extractionResults);
        filename = `extraccion_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'xml':
        content = generateXMLReport(extractionResults);
        filename = `extraccion_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.xml`;
        mimeType = 'application/xml';
        break;
      default:
        content = JSON.stringify(extractionResults, null, 2);
        filename = `extraccion_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.json`;
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
  }, [extractionResults, outputFormat, files]);

  const generateCSVReport = (results) => {
    let csv = 'Tipo,Categoría,Valor,Confianza,Posición\n';
    
    if (results.entities && results.entities.length > 0) {
      results.entities.forEach(entity => {
        csv += `Entidad,${entity.type},"${entity.text}",${(entity.confidence * 100).toFixed(1)}%,"${entity.position}"\n`;
      });
    }
    
    if (results.keywords && results.keywords.length > 0) {
      results.keywords.forEach(keyword => {
        csv += `Palabra Clave,${keyword.category},"${keyword.word}",${(keyword.relevance * 100).toFixed(1)}%,Frecuencia: ${keyword.frequency}\n`;
      });
    }
    
    if (results.tables && results.tables.length > 0) {
      results.tables.forEach((table, index) => {
        csv += `Tabla,${table.title},"${table.headers.join(', ')}",${(table.confidence * 100).toFixed(1)}%,${table.rows.length} filas\n`;
      });
    }
    
    return csv;
  };

  const generateXMLReport = (results) => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<extraction_results>\n';
    xml += `  <document_info>\n`;
    xml += `    <filename>${results.documentInfo.filename}</filename>\n`;
    xml += `    <pages>${results.documentInfo.pages}</pages>\n`;
    xml += `    <language>${results.documentInfo.language}</language>\n`;
    xml += `    <extraction_type>${results.documentInfo.extractionType}</extraction>\n`;
    xml += `    <processing_time>${results.documentInfo.processingTime}</processing_time>\n`;
    xml += `    <confidence>${results.confidence}</confidence>\n`;
    xml += `  </document_info>\n`;
    
    if (results.entities && results.entities.length > 0) {
      xml += `  <entities>\n`;
      results.entities.forEach(entity => {
        xml += `    <entity>\n`;
        xml += `      <text>${entity.text}</text>\n`;
        xml += `      <type>${entity.type}</type>\n`;
        xml += `      <confidence>${entity.confidence}</confidence>\n`;
        xml += `      <position>${entity.position}</position>\n`;
        xml += `    </entity>\n`;
      });
      xml += `  </entities>\n`;
    }
    
    if (results.keywords && results.keywords.length > 0) {
      xml += `  <keywords>\n`;
      results.keywords.forEach(keyword => {
        xml += `    <keyword>\n`;
        xml += `      <word>${keyword.word}</word>\n`;
        xml += `      <frequency>${keyword.frequency}</frequency>\n`;
        xml += `      <relevance>${keyword.relevance}</relevance>\n`;
        xml += `      <category>${keyword.category}</category>\n`;
        xml += `    </keyword>\n`;
      });
      xml += `  </keywords>\n`;
    }
    
    xml += `  <metadata>\n`;
    xml += `    <total_items>${results.metadata.totalItems}</total_items>\n`;
    xml += `    <processing_accuracy>${results.metadata.processingAccuracy}</processing_accuracy>\n`;
    xml += `    <data_quality>${results.metadata.dataQuality}</data_quality>\n`;
    xml += `  </metadata>\n`;
    
    xml += '</extraction_results>';
    return xml;
  };

  const resetForm = useCallback(() => {
    setFiles([]);
    setProcessedFile(null);
    setShowResults(false);
    setExtractionResults(null);
    setExtractionType('structured');
    setLanguage('es');
    setOutputFormat('json');
    setIncludeMetadata(true);
    setIncludeImages(false);
    setPreserveFormatting(true);
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
    <div className="extraccion-inteligente-container">
      <div className="extraccion-inteligente-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Extracción Inteligente</h1>
            <p>Extrae datos y contenido estructurado de tus documentos PDF con tecnología de IA</p>
          </div>
        </div>
      </div>

      <div className="extraccion-inteligente-content">
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

        {/* Configuración de extracción */}
        {files.length > 0 && (
          <div className="configuration-section">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"/>
              </svg>
              Configuración de Extracción
            </h3>
            
            <div className="extraction-options">
              {extractionOptions.map((option) => (
                <div
                  key={option.id}
                  className={`extraction-option ${extractionType === option.id ? 'selected' : ''}`}
                  onClick={() => setExtractionType(option.id)}
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
                  <option value="json">JSON (.json)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="xml">XML (.xml)</option>
                  <option value="excel">Excel (.xlsx)</option>
                </select>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                  />
                  Incluir metadatos
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                  />
                  Extraer imágenes
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preserveFormatting}
                    onChange={(e) => setPreserveFormatting(e.target.checked)}
                  />
                  Preservar formato
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
              <p>Realizando extracción inteligente de datos...</p>
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
        {showResults && extractionResults && (
          <div className="results-section">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              Resultados de la Extracción
            </h3>
            
            <div className="extraction-results">
              {/* Información del documento */}
              <div className="result-section">
                <h4>Información del Procesamiento</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Archivo:</span>
                    <span className="info-value">{extractionResults.documentInfo.filename}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Páginas:</span>
                    <span className="info-value">{extractionResults.documentInfo.pages}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tipo Extracción:</span>
                    <span className="info-value">{extractionOptions.find(o => o.id === extractionResults.documentInfo.extractionType)?.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Confianza:</span>
                    <span className="info-value confidence">
                      <span className={`confidence-badge ${(extractionResults.confidence * 100) >= 90 ? 'high' : (extractionResults.confidence * 100) >= 70 ? 'medium' : 'low'}`}>
                        {(extractionResults.confidence * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tiempo:</span>
                    <span className="info-value">{extractionResults.documentInfo.processingTime}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Items Extraídos:</span>
                    <span className="info-value">{extractionResults.metadata.totalItems}</span>
                  </div>
                </div>
              </div>

              {/* Datos estructurados */}
              {extractionType === 'structured' && extractionResults.extractedData && (
                <div className="result-section">
                  <h4>Datos Estructurados</h4>
                  <div className="structured-data">
                    <div className="data-item">
                      <h5>Título</h5>
                      <p>{extractionResults.extractedData.title}</p>
                    </div>
                    
                    <div className="data-item">
                      <h5>Secciones</h5>
                      {extractionResults.extractedData.sections.map((section, index) => (
                        <div key={index} className="section-item">
                          <h6>{section.heading}</h6>
                          <p>{section.content}</p>
                          {section.subsections && section.subsections.length > 0 && (
                            <div className="subsections">
                              {section.subsections.map((subsection, subIndex) => (
                                <div key={subIndex} className="subsection-item">
                                  <h6>{subsection.heading}</h6>
                                  <p>{subsection.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {extractionResults.extractedData.references && (
                      <div className="data-item">
                        <h5>Referencias</h5>
                        {extractionResults.extractedData.references.map((ref, index) => (
                          <div key={index} className="reference-item">
                            <span className="ref-type">{ref.type}:</span>
                            <span className="ref-title">{ref.title}</span>
                            {ref.author && <span className="ref-author"> - {ref.author}</span>}
                            {ref.year && <span className="ref-year"> ({ref.year})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Entidades */}
              {extractionResults.entities && extractionResults.entities.length > 0 && (
                <div className="result-section">
                  <h4>Entidades Identificadas</h4>
                  <div className="entities-container">
                    {extractionResults.entities.map((entity, index) => (
                      <div key={index} className="entity-item">
                        <div className="entity-content">
                          <span className="entity-text">{entity.text}</span>
                          <span className="entity-type">{entity.type}</span>
                        </div>
                        <div className="entity-meta">
                          <span className="entity-confidence">{(entity.confidence * 100).toFixed(1)}%</span>
                          <span className="entity-position">{entity.position}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Palabras clave */}
              {extractionResults.keywords && extractionResults.keywords.length > 0 && (
                <div className="result-section">
                  <h4>Palabras Clave</h4>
                  <div className="keywords-container">
                    {extractionResults.keywords.map((keyword, index) => (
                      <div key={index} className="keyword-item">
                        <div className="keyword-content">
                          <span className="keyword-text">{keyword.word}</span>
                          <span className="keyword-category">{keyword.category}</span>
                        </div>
                        <div className="keyword-stats">
                          <span className="keyword-frequency">Frec: {keyword.frequency}</span>
                          <span className="keyword-relevance">{(keyword.relevance * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tablas */}
              {extractionResults.tables && extractionResults.tables.length > 0 && (
                <div className="result-section">
                  <h4>Tablas Extraídas</h4>
                  <div className="tables-container">
                    {extractionResults.tables.map((table, index) => (
                      <div key={index} className="table-result">
                        <h5>{table.title}</h5>
                        <div className="table-confidence">
                          Confianza: {(table.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="table-data">
                          <table>
                            <thead>
                              <tr>
                                {table.headers.map((header, headerIndex) => (
                                  <th key={headerIndex}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
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

              {/* Estadísticas */}
              <div className="result-section">
                <h4>Estadísticas de Extracción</h4>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">{extractionResults.metadata.totalItems}</div>
                    <div className="stat-label">Items Extraídos</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{extractionResults.metadata.processingAccuracy}%</div>
                    <div className="stat-label">Precisión</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{extractionResults.metadata.dataQuality}%</div>
                    <div className="stat-label">Calidad de Datos</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{extractionResults.documentInfo.pages}</div>
                    <div className="stat-label">Páginas Procesadas</div>
                  </div>
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
                  Descargar Datos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección de acciones */}
        {files.length > 0 && !isProcessing && (
          <div className="actions-section">
            <button onClick={performExtraction} className="process-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Extraer Datos
            </button>
            
            {showResults && (
              <button onClick={resetForm} className="reset-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1,4 1,10 7,10"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Extraer Nuevo Documento
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtraccionInteligente;