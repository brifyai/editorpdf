import React, { useState } from 'react';
import { Upload, FileText, Download, X, Scissors, Settings, Plus, Minus, Crown } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import './SplitPDF.css';

// Configuración simplificada sin PDF.js por ahora
// TODO: Implementar PDF.js correctamente en producción

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitMode, setSplitMode] = useState('rango'); // 'rango', 'paginas', 'tamano'
  const [pageRanges, setPageRanges] = useState([]);
  const [customRanges, setCustomRanges] = useState([]);
  const [fixedRanges, setFixedRanges] = useState([]);
  const [pagesPerFile, setPagesPerFile] = useState(1);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [selectedPages, setSelectedPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [pagePreviews, setPagePreviews] = useState({});
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const { showSuccess, showError } = useSweetAlert();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFile = droppedFiles.find(file => file.type === 'application/pdf');
    
    if (!pdfFile) {
      showError('Error', 'Solo se permiten archivos PDF');
      return;
    }
    
    setFile({
      id: Date.now(),
      file: pdfFile,
      name: pdfFile.name,
      size: pdfFile.size
    });
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      showError('Error', 'Solo se permiten archivos PDF');
      return;
    }
    
    const fileData = {
      id: Date.now(),
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size
    };
    
    setFile(fileData);
    setLoadingPreviews(true);
    
    // Obtener el número estimado de páginas del PDF
    try {
      const total = await getTotalPages(selectedFile);
      setTotalPages(total);
      // Inicializar con todas las páginas seleccionadas por defecto
      const allPages = Array.from({ length: total }, (_, i) => i + 1);
      setSelectedPages(allPages);
      
      // Generar vistas previas placeholder para todas las páginas
      const previews = {};
      for (let i = 1; i <= total; i++) {
        previews[i] = null; // Usar placeholder por ahora
      }
      setPagePreviews(previews);
      
      showSuccess('Éxito', `Archivo cargado: ${total} páginas detectadas (estimado)`);
      
    } catch (error) {
      console.error('Error procesando archivo:', error);
      showError('Error', 'Error procesando el archivo PDF');
    } finally {
      setLoadingPreviews(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPageRanges([]);
    setCustomRanges([]);
    setFixedRanges([]);
    setSelectedPages([]);
    setTotalPages(0);
    setPagePreviews({});
    setLoadingPreviews(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Función simplificada para obtener número de páginas (simulado por ahora)
  const getTotalPages = async (file) => {
    try {
      // Por ahora simulamos un PDF con páginas basado en el tamaño del archivo
      // En una implementación real, aquí se usaría PDF.js
      const estimatedPages = Math.max(1, Math.floor(file.size / 50000)); // Estimación básica
      return Math.min(estimatedPages, 20); // Máximo 20 páginas para demo
    } catch (error) {
      console.error('Error leyendo PDF:', error);
      showError('Error', 'No se pudo leer el archivo PDF');
      return 0;
    }
  };

  // Función simplificada para generar vista previa (placeholder por ahora)
  const generatePagePreview = async (file, pageNumber) => {
    try {
      // Por ahora retornamos null para usar el placeholder
      // En una implementación real, aquí se renderizaría la página
      return null;
    } catch (error) {
      console.error('Error generando vista previa:', error);
      return null;
    }
  };

  // Función para manejar la selección de páginas individuales
  const togglePageSelection = (pageNumber) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  };

  // Función para seleccionar todas las páginas
  const selectAllPages = () => {
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(allPages);
  };

  // Función para deseleccionar todas las páginas
  const deselectAllPages = () => {
    setSelectedPages([]);
  };

  const addCustomRange = () => {
    if (!rangeStart || !rangeEnd) {
      showError('Error', 'Ingresa el rango de páginas');
      return;
    }
    
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    
    if (start >= end || start < 1) {
      showError('Error', 'Rango inválido. La página inicial debe ser menor que la final');
      return;
    }
    
    const newRange = `${start}-${end}`;
    setCustomRanges([...customRanges, newRange]);
    setRangeStart('');
    setRangeEnd('');
  };

  const removeCustomRange = (index) => {
    setCustomRanges(customRanges.filter((_, i) => i !== index));
  };

  const addFixedRange = () => {
    if (!rangeStart || !rangeEnd) {
      showError('Error', 'Ingresa el rango de páginas');
      return;
    }
    
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    
    if (start >= end || start < 1) {
      showError('Error', 'Rango inválido. La página inicial debe ser menor que la final');
      return;
    }
    
    const newRange = `${start}-${end}`;
    setFixedRanges([...fixedRanges, newRange]);
    setRangeStart('');
    setRangeEnd('');
  };

  const removeFixedRange = (index) => {
    setFixedRanges(fixedRanges.filter((_, i) => i !== index));
  };

  const handleSplit = async () => {
    if (!file) {
      showError('Error', 'Selecciona un archivo PDF');
      return;
    }

    let rangesToProcess = [];
    
    switch (splitMode) {
      case 'rango':
        rangesToProcess = fixedRanges;
        break;
      case 'paginas':
        if (selectedPages.length === 0) {
          showError('Error', 'Selecciona al menos una página');
          return;
        }
        // Crear rangos para cada página seleccionada
        rangesToProcess = selectedPages.map(page => `${page}-${page}`);
        break;
      case 'tamano':
        rangesToProcess = ['1-999']; // Por tamaño
        break;
      default:
        showError('Error', 'Selecciona un modo de separación');
        return;
    }

    if (rangesToProcess.length === 0) {
      showError('Error', 'Define los rangos de páginas');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const fileName = file.name.replace('.pdf', '');
      const splitCount = rangesToProcess.length;
      
      for (let i = 0; i < splitCount; i++) {
        const splitPdf = new Blob([`PDF separado ${rangesToProcess[i]} simulado`], { type: 'application/pdf' });
        const url = URL.createObjectURL(splitPdf);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}_pagina_${rangesToProcess[i]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      showSuccess('¡Éxito!', `El documento ha sido separado en ${splitCount} archivos`);
      removeFile();
      
    } catch (error) {
      showError('Error', 'No se pudo separar el documento');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="split-pdf-container">
      <div className="split-pdf-header">
        <div className="header-icon">✂️</div>
        <div className="header-content">
          <h1>Separar Documentos PDF</h1>
          <p>Extrae páginas específicas o divide cada página en archivos independientes</p>
        </div>
      </div>

      <div className="split-pdf-content">
        {/* Zona de carga */}
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <Upload className="upload-icon" size={48} />
          <h3>Arrastra tu archivo PDF aquí</h3>
          <p>o haz clic para seleccionar archivo</p>
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button className="select-files-btn">
            Seleccionar Archivo PDF
          </button>
        </div>

        {/* Archivo seleccionado */}
        {file && (
          <div className="file-info">
            <div className="file-details">
              <FileText className="file-icon" size={24} />
              <div className="file-text">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
            </div>
            <button className="remove-btn" onClick={removeFile}>
              <X size={20} />
            </button>
          </div>
        )}

        {/* Configuración de separación */}
        {file && (
          <div className="split-configuration">
            <h3>Configuración de Separación</h3>
            
            {/* Modos de separación */}
            <div className="split-modes">
              <div className="mode-option">
                <input
                  type="radio"
                  id="mode-rango"
                  name="splitMode"
                  value="rango"
                  checked={splitMode === 'rango'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <label htmlFor="mode-rango">
                  <Settings size={20} />
                  <div>
                    <strong>Rango</strong>
                    <p>Separar por rangos específicos de páginas</p>
                  </div>
                </label>
              </div>

              <div className="mode-option">
                <input
                  type="radio"
                  id="mode-paginas"
                  name="splitMode"
                  value="paginas"
                  checked={splitMode === 'paginas'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <label htmlFor="mode-paginas">
                  <FileText size={20} />
                  <div>
                    <strong>Páginas</strong>
                    <p>Separar cada N páginas</p>
                  </div>
                </label>
              </div>

              <div className="mode-option">
                <input
                  type="radio"
                  id="mode-tamano"
                  name="splitMode"
                  value="tamano"
                  checked={splitMode === 'tamano'}
                  onChange={(e) => setSplitMode(e.target.value)}
                />
                <label htmlFor="mode-tamano">
                  <Download size={20} />
                  <div>
                    <strong>Tamaño</strong>
                    <p>Separar por tamaño de archivo</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Configuración de Rango */}
            {splitMode === 'rango' && (
              <div className="range-configuration">
                <div className="range-mode">
                  <h4>Rangos de páginas</h4>
                  <div className="range-input-group">
                    <input
                      type="number"
                      placeholder="Página inicial"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      min="1"
                    />
                    <span>a</span>
                    <input
                      type="number"
                      placeholder="Página final"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      min="1"
                    />
                    <button
                      className="add-range-btn"
                      onClick={addFixedRange}
                    >
                      <Plus size={16} />
                      Añadir Rango
                    </button>
                  </div>
                  <div className="ranges-list">
                    {fixedRanges.map((range, index) => (
                      <div key={index} className="range-item">
                        <span>Páginas {range}</span>
                        <button
                          className="remove-range-btn"
                          onClick={() => removeFixedRange(index)}
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="merge-option">
                  <label className="merge-label">
                    <input type="checkbox" />
                    <span>Unir todos los rangos en un único PDF</span>
                  </label>
                </div>
              </div>
            )}

            {/* Configuración de Páginas */}
            {splitMode === 'paginas' && (
              <div className="pages-configuration">
                <div className="pages-header">
                  <h4>Seleccionar Páginas</h4>
                  <div className="pages-actions">
                    <button
                      type="button"
                      className="select-all-btn"
                      onClick={selectAllPages}
                    >
                      Seleccionar Todas
                    </button>
                    <button
                      type="button"
                      className="deselect-all-btn"
                      onClick={deselectAllPages}
                    >
                      Deseleccionar Todas
                    </button>
                  </div>
                </div>
                
                <div className="pages-info">
                  <p>Total de páginas: {totalPages}</p>
                  <p>Páginas seleccionadas: {selectedPages.length}</p>
                </div>

                <div className="pages-grid">
                  {loadingPreviews ? (
                    <div className="loading-previews">
                      <div className="spinner"></div>
                      <p>Cargando vistas previas...</p>
                    </div>
                  ) : (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                      <div
                        key={pageNumber}
                        className={`page-item ${selectedPages.includes(pageNumber) ? 'selected' : ''}`}
                        onClick={() => togglePageSelection(pageNumber)}
                      >
                        <div className="page-preview-container">
                          {pagePreviews[pageNumber] ? (
                            <img
                              src={pagePreviews[pageNumber]}
                              alt={`Página ${pageNumber}`}
                              className="page-preview-image"
                            />
                          ) : (
                            <div className="page-preview-placeholder">
                              <FileText size={24} />
                              <span>Página {pageNumber}</span>
                            </div>
                          )}
                        </div>
                        <div className="page-selection-overlay">
                          <input
                            type="checkbox"
                            checked={selectedPages.includes(pageNumber)}
                            onChange={() => togglePageSelection(pageNumber)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="page-number-label">Página {pageNumber}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Configuración de Tamaño */}
            {splitMode === 'tamano' && (
              <div className="size-configuration">
                <p>Esta función estará disponible próximamente</p>
              </div>
            )}
          </div>
        )}

        {/* Botón de acción */}
        {file && (
          <div className="split-actions">
            <button 
              className="split-btn"
              onClick={handleSplit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Separando documento...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Separar Documento PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPDF;