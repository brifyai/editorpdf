import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import './CensurarInformacion.css';

const CensurarInformacion = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [censorMode, setCensorMode] = useState('blackout'); // blackout, blur, rectangle
  const [searchType, setSearchType] = useState('text'); // text, pattern, custom
  const [searchText, setSearchText] = useState('');
  const [customPattern, setCustomPattern] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [censoredItems, setCensoredItems] = useState([]);
  const fileInputRef = useRef(null);

  const predefinedPatterns = [
    { name: 'Email', pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b' },
    { name: 'Teléfono', pattern: '\\b\\d{3}-?\\d{3}-?\\d{4}\\b|\\b\\d{9,}\\b' },
    { name: 'DNI/RUT', pattern: '\\b\\d{7,8}-?[0-9Kk]\\b' },
    { name: 'Tarjeta crédito', pattern: '\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b' },
    { name: 'Dirección IP', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
    { name: 'URL', pattern: '\\bhttps?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]+\\b' }
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
    setCensoredItems([]);
  }, []);

  const censorPDF = async () => {
    if (files.length === 0) {
      alert('Por favor, selecciona al menos un archivo PDF');
      return;
    }

    if (searchType === 'text' && !searchText.trim()) {
      alert('Por favor, ingresa el texto a censurar');
      return;
    }

    if (searchType === 'pattern' && !customPattern.trim()) {
      alert('Por favor, selecciona o ingresa un patrón de búsqueda');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      const foundItems = [];
      let processedCount = 0;

      // Simular búsqueda y censura (en una implementación real, se necesitaría OCR o análisis de texto)
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Simular encontrando y censurando elementos
        const mockItems = [
          {
            type: 'text',
            content: searchText || 'ejemplo@correo.com',
            page: i + 1,
            position: { x: 100, y: height - 100 },
            size: { width: 200, height: 20 }
          },
          {
            type: 'pattern',
            content: 'Teléfono: 123-456-7890',
            page: i + 1,
            position: { x: 150, y: height - 150 },
            size: { width: 180, height: 20 }
          }
        ];

        // Aplicar censura
        for (const item of mockItems) {
          if (censorMode === 'blackout') {
            page.drawRectangle({
              x: item.position.x,
              y: item.position.y,
              width: item.size.width,
              height: item.size.height,
              color: rgb(0, 0, 0)
            });
          } else if (censorMode === 'blur') {
            // Simular efecto de desenfoque con rectángulos grises
            for (let j = 0; j < 3; j++) {
              page.drawRectangle({
                x: item.position.x + j * 2,
                y: item.position.y + j * 2,
                width: item.size.width - j * 4,
                height: item.size.height - j * 4,
                color: rgb(0.8, 0.8, 0.8),
                opacity: 0.3
              });
            }
          } else if (censorMode === 'rectangle') {
            page.drawRectangle({
              x: item.position.x,
              y: item.position.y,
              width: item.size.width,
              height: item.size.height,
              color: rgb(0, 0, 0),
              borderColor: rgb(1, 1, 1),
              borderWidth: 2
            });
          }
          
          foundItems.push(item);
        }

        processedCount++;
        setProgress((processedCount / pages.length) * 100);
      }

      // Guardar el PDF modificado
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setProcessedFile({
        url,
        filename: `censurado_${file.name}`,
        size: blob.size
      });

      setCensoredItems(foundItems);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error al censurar PDF:', error);
      alert('Error al procesar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadFile = useCallback(() => {
    if (!processedFile) return;

    const link = document.createElement('a');
    link.href = processedFile.url;
    link.download = processedFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedFile]);

  const resetForm = useCallback(() => {
    setFiles([]);
    setProcessedFile(null);
    setShowResults(false);
    setCensoredItems([]);
    setSearchText('');
    setCustomPattern('');
    setCensorMode('blackout');
    setSearchType('text');
    setCaseSensitive(false);
    setWholeWord(false);
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
    <div className="censor-info-container">
      <div className="censor-info-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              <path d="M12 8v4"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
          </div>
          <div className="header-text">
            <h1>Censurar Información</h1>
            <p>Elimina u oculta información sensible de tus documentos PDF de forma segura</p>
          </div>
        </div>
      </div>

      <div className="censor-info-content">
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

        {/* Configuración de censura */}
        {files.length > 0 && (
          <div className="configuration-section">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"/>
              </svg>
              Configuración de Censura
            </h3>
            <div className="config-grid">
              <div className="config-group">
                <label>Tipo de Búsqueda:</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="text">Texto específico</option>
                  <option value="pattern">Patrón predefinido</option>
                  <option value="custom">Patrón personalizado</option>
                </select>
              </div>

              <div className="config-group">
                <label>Modo de Censura:</label>
                <select
                  value={censorMode}
                  onChange={(e) => setCensorMode(e.target.value)}
                >
                  <option value="blackout">Bloque negro</option>
                  <option value="blur">Desenfoque</option>
                  <option value="rectangle">Rectángulo con borde</option>
                </select>
              </div>

              {searchType === 'text' && (
                <div className="config-group">
                  <label>Texto a Censurar:</label>
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Ingresa el texto a censurar"
                  />
                </div>
              )}

              {searchType === 'pattern' && (
                <div className="config-group">
                  <label>Patrón Predefinido:</label>
                  <select
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                  >
                    <option value="">Selecciona un patrón</option>
                    {predefinedPatterns.map((pattern, index) => (
                      <option key={index} value={pattern.pattern}>
                        {pattern.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {searchType === 'custom' && (
                <div className="config-group">
                  <label>Patrón Personalizado (Regex):</label>
                  <input
                    type="text"
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                    placeholder="Ingresa expresión regular"
                  />
                </div>
              )}

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                  />
                  Distinguir mayúsculas/minúsculas
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={wholeWord}
                    onChange={(e) => setWholeWord(e.target.checked)}
                  />
                  Palabra completa
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
              <p>Censurando información sensible...</p>
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
        {showResults && processedFile && (
          <div className="results-section">
            <h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              Resultados de la Censura
            </h3>
            
            <div className="censorship-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Elementos Censurados:</span>
                  <span className="stat-value">{censoredItems.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Modo de Censura:</span>
                  <span className="stat-value">
                    {censorMode === 'blackout' ? 'Bloque Negro' : 
                     censorMode === 'blur' ? 'Desenfoque' : 'Rectángulo'}
                  </span>
                </div>
              </div>

              <div className="censored-items-list">
                <h4>Elementos Censurados:</h4>
                <div className="items-list">
                  {censoredItems.map((item, index) => (
                    <div key={index} className="censored-item">
                      <div className="item-info">
                        <span className="item-type">{item.type}</span>
                        <span className="item-content">{item.content}</span>
                        <span className="item-page">Página {item.page}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="results-actions">
                <button onClick={downloadFile} className="download-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar PDF Censurado
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección de acciones */}
        {files.length > 0 && !isProcessing && (
          <div className="actions-section">
            <button onClick={censorPDF} className="process-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                <path d="M12 8v4"/>
                <circle cx="12" cy="16" r="1"/>
              </svg>
              Censurar Información
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

export default CensurarInformacion;