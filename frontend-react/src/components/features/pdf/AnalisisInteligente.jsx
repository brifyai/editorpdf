import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import './AnalisisInteligente.css';

const AnalisisInteligente = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisType, setAnalysisType] = useState('comprehensive'); // comprehensive, summary, keywords, structure
  const [language, setLanguage] = useState('es');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [includeSentiment, setIncludeSentiment] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const fileInputRef = useRef(null);

  const analysisOptions = [
    {
      id: 'comprehensive',
      name: 'Análisis Completo',
      description: 'Análisis exhaustivo del contenido, estructura y metadatos',
      icon: '📊'
    },
    {
      id: 'summary',
      name: 'Resumen Inteligente',
      description: 'Genera un resumen automático del contenido',
      icon: '📝'
    },
    {
      id: 'keywords',
      name: 'Extracción de Palabras Clave',
      description: 'Identifica las palabras y conceptos más importantes',
      icon: '🔑'
    },
    {
      id: 'structure',
      name: 'Análisis Estructural',
      description: 'Analiza la estructura y organización del documento',
      icon: '🏗️'
    }
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
    setAnalysisResults(null);
  }, []);

  const analyzePDF = async () => {
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
      
      // Simular análisis inteligente
      const mockResults = {
        documentInfo: {
          title: file.name.replace('.pdf', ''),
          author: 'Autor Desconocido',
          creationDate: new Date().toISOString(),
          pages: pages.length,
          fileSize: file.size
        },
        content: {
          wordCount: Math.floor(Math.random() * 5000) + 1000,
          paragraphCount: Math.floor(Math.random() * 50) + 10,
          averageWordsPerParagraph: Math.floor(Math.random() * 100) + 50,
          readingTime: Math.floor(Math.random() * 10) + 3
        },
        keywords: [
          { word: 'importante', frequency: 15, relevance: 0.9 },
          { word: 'análisis', frequency: 12, relevance: 0.85 },
          { word: 'documento', frequency: 10, relevance: 0.8 },
          { word: 'contenido', frequency: 8, relevance: 0.75 },
          { word: 'información', frequency: 7, relevance: 0.7 }
        ],
        structure: {
          hasHeaders: true,
          hasFooters: true,
          hasTables: Math.random() > 0.5,
          hasImages: Math.random() > 0.5,
          sections: Math.floor(Math.random() * 10) + 3
        },
        sentiment: includeSentiment ? {
          positive: 0.6,
          neutral: 0.3,
          negative: 0.1,
          overall: 'positivo'
        } : null,
        summary: analysisType === 'summary' || analysisType === 'comprehensive' ? 
          'Este documento presenta un análisis detallado de los conceptos principales abordados en el contenido. Se destacan los aspectos más relevantes y se proporciona una visión general del tema tratado, con especial énfasis en las conclusiones y recomendaciones propuestas.' : null,
        metadata: includeMetadata ? {
          format: 'PDF',
          version: '1.4',
          encryption: 'None',
          optimization: 'Standard'
        } : null,
        statistics: includeStatistics ? {
          characters: Math.floor(Math.random() * 20000) + 5000,
          charactersNoSpaces: Math.floor(Math.random() * 15000) + 4000,
          sentences: Math.floor(Math.random() * 100) + 20,
          averageWordsPerSentence: Math.floor(Math.random() * 20) + 10
        } : null
      };

      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setAnalysisResults(mockResults);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error al analizar PDF:', error);
      alert('Error al procesar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadReport = useCallback(() => {
    if (!analysisResults) return;

    const reportContent = generateReportContent(analysisResults);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `analisis_${files[0]?.name.replace('.pdf', '')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [analysisResults, files]);

  const generateReportContent = (results) => {
    let content = `ANÁLISIS INTELIGENTE DE DOCUMENTO PDF\n`;
    content += `=====================================\n\n`;
    
    content += `INFORMACIÓN DEL DOCUMENTO\n`;
    content += `------------------------\n`;
    content += `Título: ${results.documentInfo.title}\n`;
    content += `Autor: ${results.documentInfo.author}\n`;
    content += `Fecha de creación: ${new Date(results.documentInfo.creationDate).toLocaleDateString()}\n`;
    content += `Número de páginas: ${results.documentInfo.pages}\n`;
    content += `Tamaño del archivo: ${(results.documentInfo.fileSize / 1024).toFixed(2)} KB\n\n`;
    
    if (results.content) {
      content += `ANÁLISIS DE CONTENIDO\n`;
      content += `-------------------\n`;
      content += `Conteo de palabras: ${results.content.wordCount}\n`;
      content += `Conteo de párrafos: ${results.content.paragraphCount}\n`;
      content += `Promedio de palabras por párrafo: ${results.content.averageWordsPerParagraph}\n`;
      content += `Tiempo de lectura estimado: ${results.content.readingTime} minutos\n\n`;
    }
    
    if (results.keywords && results.keywords.length > 0) {
      content += `PALABRAS CLAVE\n`;
      content += `--------------\n`;
      results.keywords.forEach((keyword, index) => {
        content += `${index + 1}. ${keyword.word} (frecuencia: ${keyword.frequency}, relevancia: ${(keyword.relevance * 100).toFixed(1)}%)\n`;
      });
      content += '\n';
    }
    
    if (results.structure) {
      content += `ANÁLISIS ESTRUCTURAL\n`;
      content += `-------------------\n`;
      content += `Tiene encabezados: ${results.structure.hasHeaders ? 'Sí' : 'No'}\n`;
      content += `Tiene pies de página: ${results.structure.hasFooters ? 'Sí' : 'No'}\n`;
      content += `Contiene tablas: ${results.structure.hasTables ? 'Sí' : 'No'}\n`;
      content += `Contiene imágenes: ${results.structure.hasImages ? 'Sí' : 'No'}\n`;
      content += `Número de secciones: ${results.structure.sections}\n\n`;
    }
    
    if (results.sentiment) {
      content += `ANÁLISIS DE SENTIMIENTO\n`;
      content += `---------------------\n`;
      content += `Positivo: ${(results.sentiment.positive * 100).toFixed(1)}%\n`;
      content += `Neutral: ${(results.sentiment.neutral * 100).toFixed(1)}%\n`;
      content += `Negativo: ${(results.sentiment.negative * 100).toFixed(1)}%\n`;
      content += `Sentimiento general: ${results.sentiment.overall}\n\n`;
    }
    
    if (results.summary) {
      content += `RESUMEN\n`;
      content += `-------\n`;
      content += `${results.summary}\n\n`;
    }
    
    if (results.statistics) {
      content += `ESTADÍSTICAS DETALLADAS\n`;
      content += `----------------------\n`;
      content += `Caracteres totales: ${results.statistics.characters}\n`;
      content += `Caracteres (sin espacios): ${results.statistics.charactersNoSpaces}\n`;
      content += `Número de oraciones: ${results.statistics.sentences}\n`;
      content += `Promedio de palabras por oración: ${results.statistics.averageWordsPerSentence}\n\n`;
    }
    
    content += `\nGenerado el: ${new Date().toLocaleString()}\n`;
    content += `Tipo de análisis: ${analysisType}\n`;
    
    return content;
  };

  const resetForm = useCallback(() => {
    setFiles([]);
    setProcessedFile(null);
    setShowResults(false);
    setAnalysisResults(null);
    setAnalysisType('comprehensive');
    setLanguage('es');
    setIncludeMetadata(true);
    setIncludeStatistics(true);
    setIncludeSentiment(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [analysisType]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="analysis-inteligente-container">
      <div className="analysis-inteligente-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11H3v10h6V11z"/>
              <path d="M15 3H9v18h6V3z"/>
              <path d="M21 7h-6v14h6V7z"/>
              <path d="M3 3v18"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Análisis Inteligente</h1>
            <p>Analiza y extrae información valiosa de tus documentos PDF con IA</p>
          </div>
        </div>
      </div>

      <div className="analysis-inteligente-content">
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

        {/* Configuración de análisis */}
        {files.length > 0 && (
          <div className="configuration-section">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"/>
              </svg>
              Configuración de Análisis
            </h3>
            
            <div className="analysis-options">
              {analysisOptions.map((option) => (
                <div
                  key={option.id}
                  className={`analysis-option ${analysisType === option.id ? 'selected' : ''}`}
                  onClick={() => setAnalysisType(option.id)}
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
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="fr">Francés</option>
                  <option value="de">Alemán</option>
                  <option value="pt">Portugués</option>
                  <option value="it">Italiano</option>
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
                    checked={includeStatistics}
                    onChange={(e) => setIncludeStatistics(e.target.checked)}
                  />
                  Incluir estadísticas detalladas
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeSentiment}
                    onChange={(e) => setIncludeSentiment(e.target.checked)}
                  />
                  Análisis de sentimiento
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
              <p>Analizando documento con IA...</p>
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
        {showResults && analysisResults && (
          <div className="results-section">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              Resultados del Análisis
            </h3>
            
            <div className="analysis-results">
              {/* Información del documento */}
              <div className="result-section">
                <h4>Información del Documento</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Título:</span>
                    <span className="info-value">{analysisResults.documentInfo.title}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Autor:</span>
                    <span className="info-value">{analysisResults.documentInfo.author}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Páginas:</span>
                    <span className="info-value">{analysisResults.documentInfo.pages}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tamaño:</span>
                    <span className="info-value">{formatFileSize(analysisResults.documentInfo.fileSize)}</span>
                  </div>
                </div>
              </div>

              {/* Análisis de contenido */}
              {analysisResults.content && (
                <div className="result-section">
                  <h4>Análisis de Contenido</h4>
                  <div className="content-stats">
                    <div className="stat-card">
                      <div className="stat-number">{analysisResults.content.wordCount}</div>
                      <div className="stat-label">Palabras</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{analysisResults.content.paragraphCount}</div>
                      <div className="stat-label">Párrafos</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{analysisResults.content.readingTime}</div>
                      <div className="stat-label">Min. de lectura</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{analysisResults.content.averageWordsPerParagraph}</div>
                      <div className="stat-label">Prom. palabras/párrafo</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Palabras clave */}
              {analysisResults.keywords && analysisResults.keywords.length > 0 && (
                <div className="result-section">
                  <h4>Palabras Clave</h4>
                  <div className="keywords-list">
                    {analysisResults.keywords.map((keyword, index) => (
                      <div key={index} className="keyword-item">
                        <span className="keyword-text">{keyword.word}</span>
                        <div className="keyword-stats">
                          <span className="keyword-frequency">Frec: {keyword.frequency}</span>
                          <span className="keyword-relevance">{(keyword.relevance * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Análisis estructural */}
              {analysisResults.structure && (
                <div className="result-section">
                  <h4>Análisis Estructural</h4>
                  <div className="structure-info">
                    <div className="structure-item">
                      <span className="structure-label">Encabezados:</span>
                      <span className={`structure-value ${analysisResults.structure.hasHeaders ? 'yes' : 'no'}`}>
                        {analysisResults.structure.hasHeaders ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="structure-item">
                      <span className="structure-label">Tablas:</span>
                      <span className={`structure-value ${analysisResults.structure.hasTables ? 'yes' : 'no'}`}>
                        {analysisResults.structure.hasTables ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="structure-item">
                      <span className="structure-label">Imágenes:</span>
                      <span className={`structure-value ${analysisResults.structure.hasImages ? 'yes' : 'no'}`}>
                        {analysisResults.structure.hasImages ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="structure-item">
                      <span className="structure-label">Secciones:</span>
                      <span className="structure-value">{analysisResults.structure.sections}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Análisis de sentimiento */}
              {analysisResults.sentiment && (
                <div className="result-section">
                  <h4>Análisis de Sentimiento</h4>
                  <div className="sentiment-analysis">
                    <div className="sentiment-overview">
                      <div className="sentiment-label">Sentimiento General:</div>
                      <div className={`sentiment-value ${analysisResults.sentiment.overall}`}>
                        {analysisResults.sentiment.overall.charAt(0).toUpperCase() + analysisResults.sentiment.overall.slice(1)}
                      </div>
                    </div>
                    <div className="sentiment-bars">
                      <div className="sentiment-bar">
                        <span className="sentiment-type">Positivo</span>
                        <div className="sentiment-progress">
                          <div 
                            className="sentiment-fill positive" 
                            style={{ width: `${analysisResults.sentiment.positive * 100}%` }}
                          ></div>
                        </div>
                        <span className="sentiment-percentage">{(analysisResults.sentiment.positive * 100).toFixed(1)}%</span>
                      </div>
                      <div className="sentiment-bar">
                        <span className="sentiment-type">Neutral</span>
                        <div className="sentiment-progress">
                          <div 
                            className="sentiment-fill neutral" 
                            style={{ width: `${analysisResults.sentiment.neutral * 100}%` }}
                          ></div>
                        </div>
                        <span className="sentiment-percentage">{(analysisResults.sentiment.neutral * 100).toFixed(1)}%</span>
                      </div>
                      <div className="sentiment-bar">
                        <span className="sentiment-type">Negativo</span>
                        <div className="sentiment-progress">
                          <div 
                            className="sentiment-fill negative" 
                            style={{ width: `${analysisResults.sentiment.negative * 100}%` }}
                          ></div>
                        </div>
                        <span className="sentiment-percentage">{(analysisResults.sentiment.negative * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen */}
              {analysisResults.summary && (
                <div className="result-section">
                  <h4>Resumen</h4>
                  <div className="summary-content">
                    <p>{analysisResults.summary}</p>
                  </div>
                </div>
              )}

              {/* Estadísticas detalladas */}
              {analysisResults.statistics && (
                <div className="result-section">
                  <h4>Estadísticas Detalladas</h4>
                  <div className="detailed-stats">
                    <div className="stat-item">
                      <span className="stat-label">Caracteres totales:</span>
                      <span className="stat-value">{analysisResults.statistics.characters.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Caracteres (sin espacios):</span>
                      <span className="stat-value">{analysisResults.statistics.charactersNoSpaces.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Oraciones:</span>
                      <span className="stat-value">{analysisResults.statistics.sentences}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Promedio palabras/oración:</span>
                      <span className="stat-value">{analysisResults.statistics.averageWordsPerSentence}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="results-actions">
                <button onClick={downloadReport} className="download-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar Informe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección de acciones */}
        {files.length > 0 && !isProcessing && (
          <div className="actions-section">
            <button onClick={analyzePDF} className="process-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H3v10h6V11z"/>
                <path d="M15 3H9v18h6V3z"/>
                <path d="M21 7h-6v14h6V7z"/>
              </svg>
              Analizar Documento
            </button>
            
            {showResults && (
              <button onClick={resetForm} className="reset-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1,4 1,10 7,10"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Analizar Nuevo Documento
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisInteligente;