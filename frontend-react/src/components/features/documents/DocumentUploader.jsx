import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Settings, CloudUpload, FolderOpen, File } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './DocumentUploader.css';

const DocumentUploader = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [category, setCategory] = useState('general'); // general, business, legal, academic, personal
  const [autoTag, setAutoTag] = useState(true);
  const [compress, setCompress] = useState(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError, showConfirm } = useSweetAlert();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const supportedFiles = newFiles.filter(file => {
      return file.type === 'application/pdf' || 
             file.type === 'text/plain' ||
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
             file.type === 'image/jpeg' ||
             file.type === 'image/png';
    });
    
    if (supportedFiles.length !== newFiles.length) {
      showError('Solo se permiten archivos PDF, TXT, DOCX, XLSX, PPTX, JPEG o PNG');
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
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
             file.type === 'image/jpeg' ||
             file.type === 'image/png';
    });
    
    if (supportedFiles.length !== droppedFiles.length) {
      showError('Solo se permiten archivos PDF, TXT, DOCX, XLSX, PPTX, JPEG o PNG');
    }
    
    setFiles(prev => [...prev, ...supportedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (files.length === 0) {
      showError('Por favor, selecciona al menos un archivo');
      return;
    }

    setIsUploading(true);
    const progressMap = {};
    files.forEach((_, index) => {
      progressMap[index] = 0;
    });
    setUploadProgress(progressMap);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('autoTag', autoTag);
        formData.append('compress', compress);

        return axios.post('/api/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({
              ...prev,
              [index]: progress
            }));
          },
          timeout: 300000, // 5 minutes timeout per file (increased for Netlify)
        });
      });

      const responses = await Promise.all(uploadPromises);
      const successfulUploads = responses.filter(response => response.data.success);
      
      if (successfulUploads.length === files.length) {
        setUploadedFiles(successfulUploads.map(response => response.data.file));
        showSuccess('Todos los documentos se subieron correctamente');
        setFiles([]);
      } else {
        const failedCount = files.length - successfulUploads.length;
        showSuccess(`${successfulUploads.length} documentos se subieron correctamente`);
        if (failedCount > 0) {
          showError(`${failedCount} documentos no pudieron subirse`);
        }
        setUploadedFiles(successfulUploads.map(response => response.data.file));
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      if (error.response) {
        showError(`Error del servidor: ${error.response.data.message || error.response.status}`);
      } else if (error.request) {
        showError('No se pudo conectar con el servidor');
      } else {
        showError('Error al procesar la solicitud');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const downloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    showConfirm({
      title: '¿Limpiar todo?',
      text: 'Se eliminarán todos los archivos y los documentos subidos',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setFiles([]);
        setUploadedFiles([]);
        setUploadProgress({});
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

  const getCategoryName = (cat) => {
    const categories = {
      'general': 'General',
      'business': 'Negocios',
      'legal': 'Legal',
      'academic': 'Académico',
      'personal': 'Personal'
    };
    return categories[cat] || cat;
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <FileText size={20} />;
    if (fileType.includes('image')) return <File size={20} />;
    return <FolderOpen size={20} />;
  };

  return (
    <div className="document-uploader-container">
      <div className="document-uploader-header">
        <CloudUpload className="header-icon" size={48} />
        <div className="header-content">
          <h1>Gestor de Documentos</h1>
          <p>Sube, organiza y gestiona tus documentos en la nube</p>
        </div>
      </div>

      <div className="document-uploader-content">
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
          <p>PDF, TXT, DOCX, XLSX, PPTX, JPEG o PNG</p>
          <button className="select-files-btn">Seleccionar archivos</button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="files-list">
            <h3>Archivos para subir ({files.length})</h3>
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
                  <div className="file-progress">
                    {uploadProgress[index] > 0 && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress[index]}%` }}
                        ></div>
                      </div>
                    )}
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

        {/* Upload Configuration */}
        {files.length > 0 && (
          <div className="upload-configuration">
            <h3>Configuración de subida</h3>
            <div className="upload-options">
              <div className="option-group">
                <label>Categoría</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="business">Negocios</option>
                  <option value="legal">Legal</option>
                  <option value="academic">Académico</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={autoTag}
                    onChange={(e) => setAutoTag(e.target.checked)}
                  />
                  Etiquetado automático
                </label>
                <small>Genera etiquetas basadas en el contenido</small>
              </div>
              
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={compress}
                    onChange={(e) => setCompress(e.target.checked)}
                  />
                  Comprimir archivos
                </label>
                <small>Reduce el tamaño de los archivos grandes</small>
              </div>
            </div>
            
            <div className="upload-info">
              <div className="info-item">
                <strong>Categoría</strong>
                <span>{getCategoryName(category)}</span>
              </div>
              <div className="info-item">
                <strong>Etiquetado automático</strong>
                <span>{autoTag ? 'Sí' : 'No'}</span>
              </div>
              <div className="info-item">
                <strong>Compresión</strong>
                <span>{compress ? 'Sí' : 'No'}</span>
              </div>
              <div className="info-item">
                <strong>Archivos para subir</strong>
                <span>{files.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h3>Documentos subidos ({uploadedFiles.length})</h3>
            <div className="files-container">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    {getFileIcon(file.type)}
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                      <span className="file-category">Categoría: {getCategoryName(file.category)}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="download-btn"
                      onClick={() => downloadFile(file.url, file.name)}
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
        <div className="upload-actions">
          {files.length > 0 && (
            <>
              <button 
                className="upload-btn"
                onClick={uploadDocuments}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="spinner"></div>
                    Subiendo documentos...
                  </>
                ) : (
                  <>
                    <CloudUpload size={20} />
                    Subir documentos
                  </>
                )}
              </button>
              
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

export default DocumentUploader;