import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Settings, Image } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './ConvertToImages.css';

const ConvertToImages = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedImages, setConvertedImages] = useState([]);
  const [imageFormat, setImageFormat] = useState('png'); // png, jpg, webp
  const [quality, setQuality] = useState(90); // 1-100
  const [resolution, setResolution] = useState('original'); // original, high, medium, low
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
      setConvertedImages([]);
    }
  };

  const convertToImages = async () => {
    if (files.length === 0) {
      showError('Por favor, selecciona al menos un archivo PDF');
      return;
    }

    setIsProcessing(true);
    setConvertedImages([]);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('format', imageFormat);
      formData.append('quality', quality);
      formData.append('resolution', resolution);

      const response = await axios.post('/api/pdf/convert-to-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for image conversion
      });

      if (response.data.success) {
        setConvertedImages(response.data.images);
        showSuccess('PDF convertido a imágenes correctamente');
      } else {
        showError(response.data.message || 'Error al convertir el PDF a imágenes');
      }
    } catch (error) {
      console.error('Error converting PDF to images:', error);
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

  const downloadImage = (imageData, fileName) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    if (convertedImages.length === 0) {
      showError('No hay imágenes para descargar');
      return;
    }

    convertedImages.forEach(image => {
      downloadImage(image.data, image.fileName);
    });
  };

  const clearAll = () => {
    showConfirm({
      title: '¿Limpiar todo?',
      text: 'Se eliminarán todos los archivos y las imágenes convertidas',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setFiles([]);
        setConvertedImages([]);
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

  const getResolutionName = (res) => {
    const resolutions = {
      'original': 'Resolución original',
      'high': 'Alta (300 DPI)',
      'medium': 'Media (150 DPI)',
      'low': 'Baja (72 DPI)'
    };
    return resolutions[res] || res;
  };

  return (
    <div className="convert-to-images-container">
      <div className="convert-to-images-header">
        <Image className="header-icon" size={48} />
        <div className="header-content">
          <h1>Convertir PDF a Imágenes</h1>
          <p>Convierte cada página de un PDF en imágenes de alta calidad</p>
        </div>
      </div>

      <div className="convert-to-images-content">
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
                <label>Formato de imagen</label>
                <select 
                  value={imageFormat} 
                  onChange={(e) => setImageFormat(e.target.value)}
                >
                  <option value="png">PNG (sin pérdida)</option>
                  <option value="jpg">JPG (con compresión)</option>
                  <option value="webp">WebP (moderno)</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Calidad de imagen</label>
                <div className="quality-slider">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                  />
                  <span className="quality-value">{quality}%</span>
                </div>
                <small>Mayor calidad = mayor tamaño de archivo</small>
              </div>
              
              <div className="option-group">
                <label>Resolución</label>
                <select 
                  value={resolution} 
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option value="original">Resolución original</option>
                  <option value="high">Alta (300 DPI)</option>
                  <option value="medium">Media (150 DPI)</option>
                  <option value="low">Baja (72 DPI)</option>
                </select>
              </div>
            </div>
            
            <div className="conversion-info">
              <div className="info-item">
                <strong>Formato de salida</strong>
                <span>{imageFormat.toUpperCase()}</span>
              </div>
              <div className="info-item">
                <strong>Calidad</strong>
                <span>{quality}%</span>
              </div>
              <div className="info-item">
                <strong>Resolución</strong>
                <span>{getResolutionName(resolution)}</span>
              </div>
              <div className="info-item">
                <strong>Archivos a procesar</strong>
                <span>{files.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Converted Images Preview */}
        {convertedImages.length > 0 && (
          <div className="converted-images-preview">
            <h3>Imágenes convertidas ({convertedImages.length})</h3>
            <div className="images-grid">
              {convertedImages.map((image, index) => (
                <div key={index} className="image-item">
                  <img 
                    src={image.data} 
                    alt={`Página ${image.pageNumber}`}
                    className="image-preview"
                  />
                  <div className="image-info">
                    <span className="page-number">Página {image.pageNumber}</span>
                    <span className="image-size">{formatFileSize(image.size)}</span>
                  </div>
                  <button 
                    className="download-image-btn"
                    onClick={() => downloadImage(image.data, image.fileName)}
                  >
                    <Download size={16} />
                  </button>
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
                onClick={convertToImages}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Convirtiendo a imágenes...
                  </>
                ) : (
                  <>
                    <Image size={20} />
                    Convertir a imágenes
                  </>
                )}
              </button>
              
              {convertedImages.length > 0 && (
                <button 
                  className="download-all-btn"
                  onClick={downloadAllImages}
                >
                  <Download size={20} />
                  Descargar todas
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

export default ConvertToImages;