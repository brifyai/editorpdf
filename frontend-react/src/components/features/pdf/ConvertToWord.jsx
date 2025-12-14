import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Settings, File } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './ConvertToWord.css';

const ConvertToWord = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [ocrEnabled, setOcrEnabled] = useState(false);
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
      setConvertedFiles([]);
    }
  };

  const convertToWord = async () => {
    if (files.length === 0) {
      showError('Por favor, selecciona al menos un archivo PDF');
      return;
    }

    setIsProcessing(true);
    setConvertedFiles([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('preserveFormatting', preserveFormatting);
      formData.append('includeImages', includeImages);
      formData.append('ocrEnabled', ocrEnabled);

      const response = await axios.post('/api/pdf/convert-to-word', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for conversion
      });

      if (response.data.success) {
        setConvertedFiles(response.data.files);
        showSuccess('PDF convertido a Word correctamente');
      } else {
        showError(response.data.message || 'Error al convertir el PDF a Word');
      }
    } catch (error) {
      console.error('Error converting PDF to Word:', error);
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

  const downloadFile = (fileData, fileName) => {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFiles = () => {
    if (convertedFiles.length === 0) {
      showError('No hay archivos para descargar');
      return;
    }

    convertedFiles.forEach(file => {
      downloadFile(file.data, file.fileName);
    });
  };

  const clearAll = () => {
    showConfirm({
      title: '¿Limpiar todo?',
      text: 'Se eliminarán todos los archivos y los documentos convertidos',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setFiles([]);
        setConvertedFiles([]);
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

  return (
    <div className="convert-to-word-container">
      <div className="convert-to-word-header">
        <File className="header-icon" size={48} />
        <div className="header-content">
          <h1>Convertir PDF a Word</h1>
          <p>Convierte documentos PDF a archivos Word editables</p>
        </div>
      </div>

      <div className="convert-to-word-content">
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

        {/* Conversion Configuration */}
        {files.length > 0 && (
          <div className="conversion-configuration">
            <h3>Configuración de conversión</h3>
            <div className="conversion-options">
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={preserveFormatting}
                    onChange={(e) => setPreserveFormatting(e.target.checked)}
                  />
                  Preservar formato original
                </label>
                <small>Mantiene estilos, fuentes y diseño del PDF</small>
              </div>
              
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                  />
                  Incluir imágenes
                </label>
                <small>Extrae e incluye todas las imágenes del PDF</small>
              </div>
              
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={ocrEnabled}
                    onChange={(e) => setOcrEnabled(e.target.checked)}
                  />
                  Habilitar OCR
                </label>
                <small>Reconocimiento óptico de caracteres para PDFs escaneados</small>
              </div>
            </div>
            
            <div className="conversion-info">
              <div className="info-item">
                <strong>Formato de salida</strong>
                <span>Microsoft Word (.docx)</span>
              </div>
              <div className="info-item">
                <strong>Preservar formato</strong>
                <span>{preserveFormatting ? 'Sí' : 'No'}</span>
              </div>
              <div className="info-item">
                <strong>Incluir imágenes</strong>
                <span>{includeImages ? 'Sí' : 'No'}</span>
              </div>
              <div className="info-item">
                <strong>OCR habilitado</strong>
                <span>{ocrEnabled ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Converted Files Preview */}
        {convertedFiles.length > 0 && (
          <div className="converted-files-preview">
            <h3>Documentos convertidos ({convertedFiles.length})</h3>
            <div className="files-container">
              {convertedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <File className="file-icon" size={20} />
                    <div className="file-details">
                      <span className="file-name">{file.fileName}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="download-btn"
                      onClick={() => downloadFile(file.data, file.fileName)}
                      title="Descargar archivo"
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
        <div className="convert-actions">
          {files.length > 0 && (
            <>
              <button 
                className="convert-btn"
                onClick={convertToWord}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Convirtiendo a Word...
                  </>
                ) : (
                  <>
                    <File size={20} />
                    Convertir a Word
                  </>
                )}
              </button>
              
              {convertedFiles.length > 0 && (
                <button 
                  className="download-all-btn"
                  onClick={downloadAllFiles}
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

export default ConvertToWord;