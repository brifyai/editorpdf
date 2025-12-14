import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, X, Settings, Eye, ZoomIn, ZoomOut, RotateCcw, Maximize, Search } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './DocumentViewer.css';

const DocumentViewer = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewableDocuments, setViewableDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [viewMode, setViewMode] = useState('single'); // single, double, scroll
  const fileInputRef = useRef(null);
  const { showSuccess, showError, showConfirm } = useSweetAlert();

  useEffect(() => {
    if (currentDocument) {
      setZoomLevel(100);
      setRotation(0);
      setSearchTerm('');
      setSearchResults([]);
      setCurrentSearchIndex(0);
    }
  }, [currentDocument]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const supportedFiles = newFiles.filter(file => {
      return file.type === 'application/pdf' || 
             file.type === 'text/plain' ||
             file.type === 'image/jpeg' ||
             file.type === 'image/png';
    });
    
    if (supportedFiles.length !== newFiles.length) {
      showError('Solo se permiten archivos PDF, TXT, JPEG o PNG');
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
             file.type === 'text/plain' ||
             file.type === 'image/jpeg' ||
             file.type === 'image/png';
    });
    
    if (supportedFiles.length !== droppedFiles.length) {
      showError('Solo se permiten archivos PDF, TXT, JPEG o PNG');
    }
    
    setFiles(prev => [...prev, ...supportedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) {
      showError('Por favor, selecciona al menos un archivo');
      return;
    }

    setIsProcessing(true);
    setViewableDocuments([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/api/documents/process-for-viewing', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for processing (increased for Netlify)
      });

      if (response.data.success) {
        setViewableDocuments(response.data.documents);
        showSuccess('Documentos procesados correctamente');
        if (response.data.documents.length > 0) {
          setCurrentDocument(response.data.documents[0]);
        }
      } else {
        showError(response.data.message || 'Error al procesar los documentos');
      }
    } catch (error) {
      console.error('Error processing files:', error);
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

  const handleSearch = () => {
    if (!searchTerm.trim() || !currentDocument) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    // Simulate search functionality
    const mockResults = [
      { page: 1, text: `Resultado de búsqueda para "${searchTerm}" en página 1` },
      { page: 3, text: `Otro resultado de búsqueda para "${searchTerm}" en página 3` },
      { page: 5, text: `Tercer resultado de búsqueda para "${searchTerm}" en página 5` }
    ];
    
    setSearchResults(mockResults);
    setCurrentSearchIndex(0);
  };

  const navigateToSearchResult = (index) => {
    setCurrentSearchIndex(index);
    // In a real implementation, this would scroll to the search result
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  const rotateDocument = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    const viewerElement = document.querySelector('.document-viewer-content');
    if (!document.fullscreenElement) {
      viewerElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const downloadDocument = (documentData, fileName) => {
    const link = document.createElement('a');
    link.href = documentData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    showConfirm({
      title: '¿Limpiar todo?',
      text: 'Se eliminarán todos los archivos y los documentos procesados',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setFiles([]);
        setViewableDocuments([]);
        setCurrentDocument(null);
        setSearchTerm('');
        setSearchResults([]);
        setCurrentSearchIndex(0);
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

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText size={20} />;
    if (fileType.includes('image')) return <Eye size={20} />;
    return <FileText size={20} />;
  };

  return (
    <div className="document-viewer-container">
      <div className="document-viewer-header">
        <Eye className="header-icon" size={48} />
        <div className="header-content">
          <h1>Visor de Documentos</h1>
          <p>Visualiza y navega por tus documentos con herramientas avanzadas</p>
        </div>
      </div>

      <div className="document-viewer-content">
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
          <p>PDF, TXT, JPEG o PNG</p>
          <button className="select-files-btn">Seleccionar archivos</button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="files-list">
            <h3>Archivos para procesar ({files.length})</h3>
            <div className="files-container">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    {getFileIcon(file.type)}
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

        {/* Process Button */}
        {files.length > 0 && (
          <div className="process-section">
            <button 
              className="process-btn"
              onClick={processFiles}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Procesando archivos...
                </>
              ) : (
                <>
                  <Eye size={20} />
                  Procesar para visualización
                </>
              )}
            </button>
          </div>
        )}

        {/* Document Viewer */}
        {currentDocument && (
          <div className="viewer-container">
            <div className="viewer-header">
              <div className="document-info">
                <h3>{currentDocument.name}</h3>
                <span>Página {currentDocument.currentPage} de {currentDocument.totalPages}</span>
              </div>
              <div className="viewer-controls">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Buscar en documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button onClick={handleSearch} title="Buscar">
                    <Search size={16} />
                  </button>
                </div>
                <div className="zoom-controls">
                  <button onClick={zoomOut} title="Reducir zoom">
                    <ZoomOut size={16} />
                  </button>
                  <span>{zoomLevel}%</span>
                  <button onClick={zoomIn} title="Aumentar zoom">
                    <ZoomIn size={16} />
                  </button>
                  <button onClick={resetZoom} title="Restablecer zoom">
                    <RotateCcw size={16} />
                  </button>
                </div>
                <div className="view-controls">
                  <button 
                    className={viewMode === 'single' ? 'active' : ''}
                    onClick={() => setViewMode('single')}
                    title="Vista simple"
                  >
                    1
                  </button>
                  <button 
                    className={viewMode === 'double' ? 'active' : ''}
                    onClick={() => setViewMode('double')}
                    title="Vista doble"
                  >
                    2
                  </button>
                  <button 
                    className={viewMode === 'scroll' ? 'active' : ''}
                    onClick={() => setViewMode('scroll')}
                    title="Vista continua"
                  >
                    ∞
                  </button>
                </div>
                <div className="action-controls">
                  <button onClick={rotateDocument} title="Rotar documento">
                    <RotateCcw size={16} />
                  </button>
                  <button onClick={toggleFullscreen} title="Pantalla completa">
                    <Maximize size={16} />
                  </button>
                  <button 
                    onClick={() => downloadDocument(currentDocument.data, currentDocument.name)}
                    title="Descargar documento"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <h4>Resultados de búsqueda ({searchResults.length})</h4>
                <div className="search-results-list">
                  {searchResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`search-result-item ${index === currentSearchIndex ? 'active' : ''}`}
                      onClick={() => navigateToSearchResult(index)}
                    >
                      <span className="result-page">Página {result.page}</span>
                      <span className="result-text">{result.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Content */}
            <div className="document-content">
              <div 
                className="document-viewer"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                {currentDocument.type === 'pdf' && (
                  <div className="pdf-viewer">
                    <div className="pdf-placeholder">
                      <FileText size={48} />
                      <p>Visor PDF</p>
                      <p>El documento PDF se mostraría aquí</p>
                    </div>
                  </div>
                )}
                {currentDocument.type === 'text' && (
                  <div className="text-viewer">
                    <pre>{currentDocument.content}</pre>
                  </div>
                )}
                {currentDocument.type === 'image' && (
                  <div className="image-viewer">
                    <img 
                      src={currentDocument.data} 
                      alt={currentDocument.name}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Document Navigation */}
            <div className="document-navigation">
              <div className="document-list">
                <h4>Documentos ({viewableDocuments.length})</h4>
                <div className="document-items">
                  {viewableDocuments.map((doc, index) => (
                    <div 
                      key={index}
                      className={`document-item ${currentDocument?.id === doc.id ? 'active' : ''}`}
                      onClick={() => setCurrentDocument(doc)}
                    >
                      {getFileIcon(doc.type)}
                      <span className="document-name">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="viewer-actions">
          {files.length > 0 && (
            <button 
              className="clear-btn"
              onClick={clearAll}
            >
              <X size={20} />
              Limpiar todo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;