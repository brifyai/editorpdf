import React, { useState } from 'react';
import { Upload, FileText, Download, X, Settings, RotateCcw } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import axios from 'axios';
import './RotatePages.css';

const RotatePages = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(90);
  const [rotationDirection, setRotationDirection] = useState('clockwise');
  const [selectedPages, setSelectedPages] = useState('all');
  const [customPages, setCustomPages] = useState('');
  const { showSuccess, showError } = useSweetAlert();

  // Función para actualizar las estadísticas en tiempo real
  const updateStatistics = async () => {
    try {
      console.log('📊 Actualizando estadísticas después de rotar páginas...');
      
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
      size: file.size,
      pageCount: 0 // Se calculará después
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

  const handleRotate = async () => {
    if (files.length === 0) {
      showError('Error', 'Selecciona al menos un archivo PDF');
      return;
    }

    if (selectedPages === 'custom' && !customPages.trim()) {
      showError('Error', 'Ingresa las páginas que deseas rotar');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando rotación de páginas...');
      console.log(`📁 Archivos a procesar: ${files.length}`);
      console.log(`🔄 Ángulo de rotación: ${rotationAngle}°`);
      console.log(`🔄 Dirección: ${rotationDirection}`);
      console.log(`📄 Páginas seleccionadas: ${selectedPages}`);
      
      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        console.log(`📄 Procesando archivo ${i + 1}/${files.length}: ${fileItem.name}`);
        
        try {
          await rotatePagesInPDF(fileItem);
        } catch (error) {
          console.error(`❌ Error rotando ${fileItem.name}:`, error);
          // Continuar con el siguiente archivo
        }
      }
      
      console.log('✅ Rotación completada');
      showSuccess('¡Rotación Completada!', `Se han rotado las páginas de ${files.length} documentos`);
      setFiles([]);
      
    } catch (error) {
      console.error('❌ Error en rotación:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudieron rotar las páginas: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para rotar páginas en PDF
  const rotatePagesInPDF = async (fileItem) => {
    console.log(`🔄 Rotando páginas en ${fileItem.name}...`);
    
    // Cargar el PDF original
    const existingPdfBytes = await fileItem.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    console.log(`📄 PDF cargado: ${pdfDoc.getPageCount()} páginas`);
    
    // Determinar qué páginas rotar
    let pagesToRotate = [];
    if (selectedPages === 'all') {
      pagesToRotate = pdfDoc.getPageIndices();
    } else if (selectedPages === 'odd') {
      pagesToRotate = pdfDoc.getPageIndices().filter(index => (index + 1) % 2 === 1);
    } else if (selectedPages === 'even') {
      pagesToRotate = pdfDoc.getPageIndices().filter(index => (index + 1) % 2 === 0);
    } else if (selectedPages === 'custom') {
      // Parsear páginas personalizadas (ej: "1,3,5-7")
      const pageRanges = customPages.split(',');
      for (const range of pageRanges) {
        const trimmedRange = range.trim();
        if (trimmedRange.includes('-')) {
          const [start, end] = trimmedRange.split('-').map(n => parseInt(n.trim()));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start - 1; i < end && i < pdfDoc.getPageCount(); i++) {
              pagesToRotate.push(i);
            }
          }
        } else {
          const pageNum = parseInt(trimmedRange);
          if (!isNaN(pageNum) && pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
            pagesToRotate.push(pageNum - 1);
          }
        }
      }
      // Eliminar duplicados y ordenar
      pagesToRotate = [...new Set(pagesToRotate)].sort((a, b) => a - b);
    }
    
    console.log(`📄 Páginas a rotar: ${pagesToRotate.length} páginas`);
    
    // Rotar las páginas seleccionadas
    const angle = rotationDirection === 'clockwise' ? rotationAngle : -rotationAngle;
    for (const pageIndex of pagesToRotate) {
      const page = pdfDoc.getPage(pageIndex);
      page.setRotation(page.getRotation() + angle);
    }
    
    // Guardar el PDF rotado
    console.log('💾 Guardando PDF rotado...');
    const rotatedPdfBytes = await pdfDoc.save();
    console.log('📦 PDF rotado guardado, tamaño:', rotatedPdfBytes.byteLength, 'bytes');
    
    // Crear blob y descargar
    const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
    console.log('📦 Blob creado, tamaño:', blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log('🔗 URL creada:', url);
    
    const fileName = fileItem.name.replace('.pdf', '_rotado.pdf');
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego limpiar URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log(`✅ PDF rotado descargado: ${fileName}`);
    }, 500);
  };

  return (
    <div className="rotate-pages-container">
      <div className="rotate-pages-header">
        <div className="header-icon">🔄</div>
        <div className="header-content">
          <h1>Rotar Páginas</h1>
          <p>Gira las páginas de tus documentos PDF al ángulo deseado</p>
        </div>
      </div>

      <div className="rotate-pages-content">
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

        {/* Configuración de rotación */}
        {files.length > 0 && (
          <div className="rotation-configuration">
            <h3>Configuración de Rotación</h3>
            
            <div className="rotation-options">
              <div className="option-group">
                <label htmlFor="rotation-angle">Ángulo de rotación:</label>
                <select
                  id="rotation-angle"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                >
                  <option value="90">90°</option>
                  <option value="180">180°</option>
                  <option value="270">270°</option>
                </select>
              </div>

              <div className="option-group">
                <label>Dirección de rotación:</label>
                <div className="direction-selector">
                  <button
                    className={`direction-btn ${rotationDirection === 'clockwise' ? 'active' : ''}`}
                    onClick={() => setRotationDirection('clockwise')}
                  >
                    <RotateCcw size={16} />
                    Horario
                  </button>
                  <button
                    className={`direction-btn ${rotationDirection === 'counterclockwise' ? 'active' : ''}`}
                    onClick={() => setRotationDirection('counterclockwise')}
                  >
                    <RotateCcw size={16} style={{ transform: 'scaleX(-1)' }} />
                    Antihorario
                  </button>
                </div>
              </div>

              <div className="option-group">
                <label htmlFor="selected-pages">Páginas a rotar:</label>
                <select
                  id="selected-pages"
                  value={selectedPages}
                  onChange={(e) => setSelectedPages(e.target.value)}
                >
                  <option value="all">Todas las páginas</option>
                  <option value="odd">Páginas impares</option>
                  <option value="even">Páginas pares</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              {selectedPages === 'custom' && (
                <div className="option-group">
                  <label htmlFor="custom-pages">Páginas específicas:</label>
                  <input
                    type="text"
                    id="custom-pages"
                    value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    placeholder="Ej: 1,3,5-7"
                    className="custom-pages-input"
                  />
                  <small>Ingresa números de página separados por comas o rangos (ej: 1,3,5-7)</small>
                </div>
              )}
            </div>

            <div className="rotation-info">
              <div className="info-item">
                <strong>Total de archivos:</strong> {files.length}
              </div>
              <div className="info-item">
                <strong>Ángulo:</strong> {rotationAngle}°
              </div>
              <div className="info-item">
                <strong>Dirección:</strong> {rotationDirection === 'clockwise' ? 'Horario' : 'Antihorario'}
              </div>
              <div className="info-item">
                <strong>Páginas:</strong> {
                  selectedPages === 'all' ? 'Todas' :
                  selectedPages === 'odd' ? 'Impares' :
                  selectedPages === 'even' ? 'Pares' :
                  customPages || 'Personalizado'
                }
              </div>
            </div>
          </div>
        )}

        {/* Botón de acción */}
        {files.length > 0 && (
          <div className="rotate-actions">
            <button 
              className="rotate-btn"
              onClick={handleRotate}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Rotando páginas...
                </>
              ) : (
                <>
                  <RotateCcw size={20} />
                  Rotar Páginas
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RotatePages;