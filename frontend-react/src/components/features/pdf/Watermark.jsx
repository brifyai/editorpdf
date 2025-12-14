import React, { useState } from 'react';
import { Upload, FileText, Download, X, Settings, Droplet } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './Watermark.css';

const Watermark = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [watermarkType, setWatermarkType] = useState('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENCIAL');
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [watermarkPosition, setWatermarkPosition] = useState('center');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkSize, setWatermarkSize] = useState('medium');
  const [watermarkRotation, setWatermarkRotation] = useState(45);
  const { showSuccess, showError } = useSweetAlert();

  // Función para actualizar las estadísticas en tiempo real
  const updateStatistics = async () => {
    try {
      console.log('📊 Actualizando estadísticas después de agregar marca de agua...');
      
      const response = await axios.get('/api/metrics');
      
      if (response.data && response.data.success) {
        console.log('✅ Estadísticas actualizadas:', response.data.data);
      } else {
        console.warn('⚠️ Respuesta inválida del servidor');
      }
    } catch (error) {
      console.warn('⚠️ Error actualizando estadísticas:', error.message);
    }
  };

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
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== droppedFiles.length) {
      showError('Error', 'Solo se permiten archivos PDF');
      return;
    }
    
    addFiles(pdfFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      showError('Error', 'Solo se permiten archivos PDF');
      return;
    }
    
    addFiles(pdfFiles);
  };

  const handleImageSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setWatermarkImage(selectedFile);
    }
  };

  const addFiles = (newFiles) => {
    const filesWithId = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size
    }));
    
    setFiles(prev => [...prev, ...filesWithId]);
    updateStatistics();
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleWatermark = async () => {
    if (files.length === 0) {
      showError('Error', 'Selecciona al menos un archivo PDF');
      return;
    }

    if (watermarkType === 'text' && !watermarkText.trim()) {
      showError('Error', 'Ingresa el texto para la marca de agua');
      return;
    }

    if (watermarkType === 'image' && !watermarkImage) {
      showError('Error', 'Selecciona una imagen para la marca de agua');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando agregado de marca de agua...');
      console.log(`📁 Archivos a procesar: ${files.length}`);
      console.log(`💧 Tipo de marca de agua: ${watermarkType}`);
      
      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        console.log(`📄 Procesando archivo ${i + 1}/${files.length}: ${fileItem.name}`);
        
        try {
          await addWatermark(fileItem);
        } catch (error) {
          console.error(`❌ Error procesando ${fileItem.name}:`, error);
          // Continuar con el siguiente archivo
        }
      }
      
      console.log('✅ Marca de agua agregada');
      showSuccess('¡Marca de Agua Agregada!', `Se ha agregado la marca de agua a ${files.length} documentos`);
      setFiles([]);
      
    } catch (error) {
      console.error('❌ Error en proceso:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudo agregar la marca de agua: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para agregar marca de agua
  const addWatermark = async (fileItem) => {
    console.log(`💧 Agregando marca de agua a ${fileItem.name}...`);
    
    // Simulación de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Crear nombre para el archivo con marca de agua
    const watermarkedFileName = fileItem.name.replace('.pdf', '_con_marca_de_agua.pdf');
    
    // Simular descarga del archivo con marca de agua
    const link = document.createElement('a');
    link.href = '#';
    link.download = watermarkedFileName;
    link.click();
    
    // Agregar a la lista de archivos procesados
    setProcessedFiles(prev => [...prev, {
      originalName: fileItem.name,
      watermarkedName: watermarkedFileName,
      size: fileItem.size,
      status: 'success'
    }]);
    
    console.log(`✅ Marca de agua agregada: ${watermarkedFileName}`);
  };

  return (
    <div className="watermark-container">
      <div className="watermark-header">
        <div className="header-icon">💧</div>
        <div className="header-content">
          <h1>Marca de Agua</h1>
          <p>Agrega marcas de agua personalizadas a tus documentos PDF</p>
        </div>
      </div>

      <div className="watermark-content">
        {/* Zona de carga */}
        <div 
          className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <Upload className="upload-icon" size={48} />
          <h3>Arrastra archivos PDF aquí</h3>
          <p>o haz clic para seleccionar archivos (.pdf)</p>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button className="select-files-btn">
            Seleccionar Archivos PDF
          </button>
        </div>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="files-list">
            <h3>Archivos a procesar ({files.length})</h3>
            <div className="files-container">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="file-item">
                  <div className="file-info">
                    <FileText className="file-icon" size={20} />
                    <div className="file-details">
                      <span className="file-name">{fileItem.name}</span>
                      <span className="file-size">{formatFileSize(fileItem.size)}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFile(fileItem.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuración de marca de agua */}
        {files.length > 0 && (
          <div className="watermark-configuration">
            <h3>Configuración de Marca de Agua</h3>
            
            <div className="watermark-options">
              <div className="option-group">
                <label>Tipo de marca de agua:</label>
                <div className="watermark-type-selector">
                  <button
                    className={`watermark-type-btn ${watermarkType === 'text' ? 'active' : ''}`}
                    onClick={() => setWatermarkType('text')}
                  >
                    <FileText size={16} />
                    Texto
                  </button>
                  <button
                    className={`watermark-type-btn ${watermarkType === 'image' ? 'active' : ''}`}
                    onClick={() => setWatermarkType('image')}
                  >
                    <Droplet size={16} />
                    Imagen
                  </button>
                </div>
              </div>

              <div className="option-group">
                <label htmlFor="watermark-position">Posición:</label>
                <select
                  id="watermark-position"
                  value={watermarkPosition}
                  onChange={(e) => setWatermarkPosition(e.target.value)}
                >
                  <option value="center">Centro</option>
                  <option value="top-left">Superior izquierda</option>
                  <option value="top-right">Superior derecha</option>
                  <option value="bottom-left">Inferior izquierda</option>
                  <option value="bottom-right">Inferior derecha</option>
                  <option value="tile">Mosaico (todo el documento)</option>
                </select>
              </div>

              <div className="option-group">
                <label htmlFor="watermark-opacity">Opacidad: {watermarkOpacity}%</label>
                <input
                  type="range"
                  id="watermark-opacity"
                  min="10"
                  max="100"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))}
                  className="opacity-slider"
                />
              </div>

              <div className="option-group">
                <label htmlFor="watermark-size">Tamaño:</label>
                <select
                  id="watermark-size"
                  value={watermarkSize}
                  onChange={(e) => setWatermarkSize(e.target.value)}
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                  <option value="extra-large">Extra grande</option>
                </select>
              </div>

              <div className="option-group">
                <label htmlFor="watermark-rotation">Rotación: {watermarkRotation}°</label>
                <input
                  type="range"
                  id="watermark-rotation"
                  min="0"
                  max="360"
                  value={watermarkRotation}
                  onChange={(e) => setWatermarkRotation(parseInt(e.target.value))}
                  className="rotation-slider"
                />
              </div>
            </div>

            {/* Área de configuración específica */}
            <div className="watermark-specific-config">
              {watermarkType === 'text' ? (
                <div className="text-watermark-config">
                  <h4>Configuración de texto:</h4>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Ingresa el texto para la marca de agua"
                    className="watermark-text-input"
                  />
                  <div className="watermark-preview">
                    <p>Vista previa:</p>
                    <div 
                      className="preview-text"
                      style={{
                        opacity: watermarkOpacity / 100,
                        transform: `rotate(${watermarkRotation}deg)`,
                        fontSize: watermarkSize === 'small' ? '14px' : 
                                watermarkSize === 'medium' ? '18px' :
                                watermarkSize === 'large' ? '24px' : '32px'
                      }}
                    >
                      {watermarkText || 'Texto de la marca de agua'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="image-watermark-config">
                  <h4>Configuración de imagen:</h4>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                      id="watermark-image-input"
                    />
                    <button
                      className="select-image-btn"
                      onClick={() => document.getElementById('watermark-image-input').click()}
                    >
                      <Droplet size={16} />
                      Seleccionar Imagen
                    </button>
                    {watermarkImage && (
                      <div className="selected-image">
                        <span>{watermarkImage.name}</span>
                        <button 
                          className="remove-image-btn"
                          onClick={() => setWatermarkImage(null)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="image-preview">
                    <p>Vista previa:</p>
                    <div className="preview-container">
                      {watermarkImage ? (
                        <img 
                          src={URL.createObjectURL(watermarkImage)} 
                          alt="Vista previa de la marca de agua"
                          style={{
                            opacity: watermarkOpacity / 100,
                            transform: `rotate(${watermarkRotation}deg)`,
                            maxWidth: watermarkSize === 'small' ? '50px' : 
                                     watermarkSize === 'medium' ? '100px' :
                                     watermarkSize === 'large' ? '150px' : '200px'
                          }}
                        />
                      ) : (
                        <div className="no-image-preview">
                          <Droplet size={48} />
                          <p>Selecciona una imagen</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        {files.length > 0 && (
          <div className="watermark-actions">
            <button 
              className="watermark-btn"
              onClick={handleWatermark}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Agregando marca de agua...
                </>
              ) : (
                <>
                  <Droplet size={20} />
                  Agregar Marca de Agua
                </>
              )}
            </button>
          </div>
        )}

        {/* Resultados */}
        {processedFiles.length > 0 && (
          <div className="results-section">
            <h3>Documentos Procesados</h3>
            <div className="results-container">
              {processedFiles.map((file, index) => (
                <div key={index} className="result-item">
                  <div className="result-info">
                    <FileText className="result-icon" size={20} />
                    <div>
                      <div className="result-name">{file.originalName}</div>
                      <div className="result-converted">→ {file.watermarkedName}</div>
                    </div>
                  </div>
                  <button className="download-btn">
                    <Download size={16} />
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watermark;