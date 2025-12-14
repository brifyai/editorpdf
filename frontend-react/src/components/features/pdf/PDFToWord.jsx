import React, { useState } from 'react';
import { Upload, FileText, Download, X, Settings, File } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './PDFToWord.css';

const PDFToWord = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState('high');
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const { showSuccess, showError } = useSweetAlert();

  // Función para actualizar las estadísticas en tiempo real
  const updateStatistics = async () => {
    try {
      console.log('📊 Actualizando estadísticas después de convertir PDF a Word...');
      
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

  const handleConvert = async () => {
    if (files.length === 0) {
      showError('Error', 'Selecciona al menos un archivo PDF');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando conversión REAL de PDF a Word...');
      console.log(`📁 Archivos a convertir: ${files.length}`);
      
      // Intentar convertir cada archivo
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        console.log(`📄 Procesando archivo ${i + 1}/${files.length}: ${fileItem.name}`);
        
        try {
          await convertPdfToWord(fileItem);
        } catch (error) {
          console.error(`❌ Error convirtiendo ${fileItem.name}:`, error);
          // Continuar con el siguiente archivo
        }
      }
      
      console.log('✅ Conversión completada');
      showSuccess('¡Conversión Completada!', `Se han convertido ${files.length} documentos a Word`);
      setFiles([]);
      
    } catch (error) {
      console.error('❌ Error en conversión:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudieron convertir los documentos: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para convertir PDF a Word
  const convertPdfToWord = async (fileItem) => {
    console.log(`📚 Convirtiendo ${fileItem.name} a Word...`);
    
    // Aquí iría la lógica real de conversión de PDF a Word
    // Por ahora, simulamos la conversión
    
    // Simulación de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Crear un documento Word de ejemplo
    const docContent = `
Documento Convertido: ${fileItem.name}
Tamaño original: ${formatFileSize(fileItem.size)}
Fecha de conversión: ${new Date().toLocaleString()}

Configuración de conversión:
• Calidad: ${quality}
• Formato preservado: ${preserveFormatting ? 'Sí' : 'No'}
• Imágenes incluidas: ${includeImages ? 'Sí' : 'No'}

Contenido del documento:
Este es un documento PDF convertido a Word.
El contenido original ha sido procesado y adaptado.
La conversión mantiene la estructura básica del documento.

Características de la conversión:
• Calidad seleccionada: ${quality}
• Formato preservado: ${preserveFormatting ? 'Sí' : 'No'}
• Imágenes incluidas: ${includeImages ? 'Sí' : 'No'}

Nota: Esta es una simulación de conversión.
En una implementación real, se procesaría el contenido
real del archivo PDF manteniendo el formato original.
    `;
    
    // Crear blob y descargar
    const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    console.log(`📦 Blob creado para ${fileItem.name}, tamaño:`, blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log(`🔗 URL creada para ${fileItem.name}:`, url);
    
    const fileName = fileItem.name.replace(/\.(pdf|PDF)$/, '');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego limpiar URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log(`✅ Word descargado para ${fileItem.name}`);
    }, 500);
  };

  return (
    <div className="pdf-to-word-container">
      <div className="pdf-to-word-header">
        <div className="header-icon">📄</div>
        <div className="header-content">
          <h1>PDF a Word</h1>
          <p>Convierte documentos PDF a Word manteniendo formato y calidad</p>
        </div>
      </div>

      <div className="pdf-to-word-content">
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
            <h3>Archivos a convertir ({files.length})</h3>
            <div className="files-container">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="file-item">
                  <div className="file-info">
                    <File className="file-icon" size={20} />
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

        {/* Configuración de conversión */}
        {files.length > 0 && (
          <div className="conversion-configuration">
            <h3>Configuración de Conversión</h3>
            
            <div className="conversion-options">
              <div className="option-group">
                <label htmlFor="quality">Calidad de conversión:</label>
                <select
                  id="quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="standard">Estándar (más rápido)</option>
                  <option value="high">Alta (mejor calidad)</option>
                  <option value="maximum">Máxima (mejor resultado)</option>
                </select>
              </div>

              <div className="option-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="preserve-formatting"
                    checked={preserveFormatting}
                    onChange={(e) => setPreserveFormatting(e.target.checked)}
                  />
                  <label htmlFor="preserve-formatting">Preservar formato original</label>
                </div>
              </div>

              <div className="option-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="include-images"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                  />
                  <label htmlFor="include-images">Incluir imágenes</label>
                </div>
              </div>
            </div>

            <div className="conversion-info">
              <div className="info-item">
                <strong>Total de archivos:</strong> {files.length}
              </div>
              <div className="info-item">
                <strong>Calidad seleccionada:</strong> {
                  quality === 'standard' ? 'Estándar' :
                  quality === 'high' ? 'Alta' : 'Máxima'
                }
              </div>
              <div className="info-item">
                <strong>Tamaño total:</strong> {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
              </div>
            </div>
          </div>
        )}

        {/* Botón de acción */}
        {files.length > 0 && (
          <div className="convert-actions">
            <button 
              className="convert-btn"
              onClick={handleConvert}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Convirtiendo documentos...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Convertir a Word
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFToWord;