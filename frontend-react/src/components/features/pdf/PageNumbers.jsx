import React, { useState } from 'react';
import { Upload, FileText, Download, X, Settings, Hash } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import axios from 'axios';
import './PageNumbers.css';

const PageNumbers = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [numberPosition, setNumberPosition] = useState('bottom-right');
  const [numberFormat, setNumberFormat] = useState('1,2,3...');
  const [startNumber, setStartNumber] = useState(1);
  const [numberStyle, setNumberStyle] = useState('simple');
  const [customText, setCustomText] = useState('Página {n}');
  const { showSuccess, showError } = useSweetAlert();

  // Función para actualizar las estadísticas en tiempo real
  const updateStatistics = async () => {
    try {
      console.log('📊 Actualizando estadísticas después de agregar numeración...');
      
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

  const handleAddPageNumbers = async () => {
    if (files.length === 0) {
      showError('Error', 'Selecciona al menos un archivo PDF');
      return;
    }

    if (numberFormat === 'custom' && !customText.trim()) {
      showError('Error', 'Ingresa el formato personalizado');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando agregado de numeración...');
      console.log(`📁 Archivos a procesar: ${files.length}`);
      console.log(`📍 Posición: ${numberPosition}`);
      console.log(`🔢 Formato: ${numberFormat}`);
      console.log(`🎯 Estilo: ${numberStyle}`);
      
      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        console.log(`📄 Procesando archivo ${i + 1}/${files.length}: ${fileItem.name}`);
        
        try {
          await addPageNumbersToPDF(fileItem);
        } catch (error) {
          console.error(`❌ Error agregando numeración a ${fileItem.name}:`, error);
          // Continuar con el siguiente archivo
        }
      }
      
      console.log('✅ Numeración agregada');
      showSuccess('¡Numeración Agregada!', `Se ha agregado numeración a ${files.length} documentos`);
      setFiles([]);
      
    } catch (error) {
      console.error('❌ Error en numeración:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudo agregar la numeración: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para agregar numeración a PDF
  const addPageNumbersToPDF = async (fileItem) => {
    console.log(`🔢 Agregando numeración a ${fileItem.name}...`);
    
    // Cargar el PDF original
    const existingPdfBytes = await fileItem.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    console.log(`📄 PDF cargado: ${pdfDoc.getPageCount()} páginas`);
    
    // Crear un nuevo PDF para la versión con numeración
    const numberedPdf = await PDFDocument.create();
    console.log('📝 PDF vacío creado para numeración');
    
    // Copiar todas las páginas al nuevo PDF
    const pages = await numberedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach(page => numberedPdf.addPage(page));
    
    // Agregar numeración a cada página
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageNumber = startNumber + i;
      
      // Determinar el texto de la numeración
      let numberText = '';
      if (numberFormat === '1,2,3...') {
        numberText = pageNumber.toString();
      } else if (numberFormat === 'Page 1') {
        numberText = `Page ${pageNumber}`;
      } else if (numberFormat === 'Página 1') {
        numberText = `Página ${pageNumber}`;
      } else if (numberFormat === 'custom') {
        numberText = customText.replace('{n}', pageNumber.toString());
      }
      
      // Determinar la posición
      let x = 0, y = 0;
      const { width, height } = page.getSize();
      const margin = 30;
      
      switch (numberPosition) {
        case 'top-left':
          x = margin;
          y = height - margin;
          break;
        case 'top-right':
          x = width - margin;
          y = height - margin;
          break;
        case 'bottom-left':
          x = margin;
          y = margin;
          break;
        case 'bottom-right':
          x = width - margin;
          y = margin;
          break;
        case 'top-center':
          x = width / 2;
          y = height - margin;
          break;
        case 'bottom-center':
          x = width / 2;
          y = margin;
          break;
      }
      
      // Dibujar el número de página
      page.drawText(numberText, {
        x: x,
        y: y,
        size: numberStyle === 'simple' ? 10 : numberStyle === 'bold' ? 12 : 14,
        font: await pdfDoc.embedFont('Helvetica'),
        color: { r: 0, g: 0, b: 0 },
        opacity: 1,
      });
    }
    
    // Guardar el PDF con numeración
    console.log('💾 Guardando PDF con numeración...');
    const numberedPdfBytes = await numberedPdf.save();
    console.log('📦 PDF con numeración guardado, tamaño:', numberedPdfBytes.byteLength, 'bytes');
    
    // Crear blob y descargar
    const blob = new Blob([numberedPdfBytes], { type: 'application/pdf' });
    console.log('📦 Blob creado, tamaño:', blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log('🔗 URL creada:', url);
    
    const fileName = fileItem.name.replace('.pdf', '_numerado.pdf');
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego limpiar URL
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log(`✅ PDF con numeración descargado: ${fileName}`);
    }, 500);
  };

  return (
    <div className="page-numbers-container">
      <div className="page-numbers-header">
        <div className="header-icon">🔢</div>
        <div className="header-content">
          <h1>Numeración de Páginas</h1>
          <p>Agrega números de página personalizados a tus documentos PDF</p>
        </div>
      </div>

      <div className="page-numbers-content">
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

        {/* Configuración de numeración */}
        {files.length > 0 && (
          <div className="numbering-configuration">
            <h3>Configuración de Numeración</h3>
            
            <div className="numbering-options">
              <div className="option-group">
                <label htmlFor="number-position">Posición:</label>
                <select
                  id="number-position"
                  value={numberPosition}
                  onChange={(e) => setNumberPosition(e.target.value)}
                >
                  <option value="bottom-right">Inferior derecha</option>
                  <option value="bottom-left">Inferior izquierda</option>
                  <option value="top-right">Superior derecha</option>
                  <option value="top-left">Superior izquierda</option>
                  <option value="bottom-center">Inferior centro</option>
                  <option value="top-center">Superior centro</option>
                </select>
              </div>

              <div className="option-group">
                <label htmlFor="number-format">Formato:</label>
                <select
                  id="number-format"
                  value={numberFormat}
                  onChange={(e) => setNumberFormat(e.target.value)}
                >
                  <option value="1,2,3...">1, 2, 3...</option>
                  <option value="Page 1">Page 1</option>
                  <option value="Página 1">Página 1</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <div className="option-group">
                <label htmlFor="start-number">Número inicial:</label>
                <input
                  type="number"
                  id="start-number"
                  value={startNumber}
                  onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                  min="1"
                  className="start-number-input"
                />
              </div>

              <div className="option-group">
                <label htmlFor="number-style">Estilo:</label>
                <select
                  id="number-style"
                  value={numberStyle}
                  onChange={(e) => setNumberStyle(e.target.value)}
                >
                  <option value="simple">Simple</option>
                  <option value="bold">Negrita</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              {numberFormat === 'custom' && (
                <div className="option-group">
                  <label htmlFor="custom-text">Formato personalizado:</label>
                  <input
                    type="text"
                    id="custom-text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Ej: Página {n}"
                    className="custom-text-input"
                  />
                  <small>Usa {n} para representar el número de página</small>
                </div>
              )}
            </div>

            <div className="numbering-info">
              <div className="info-item">
                <strong>Total de archivos:</strong> {files.length}
              </div>
              <div className="info-item">
                <strong>Posición:</strong> {
                  numberPosition === 'bottom-right' ? 'Inferior derecha' :
                  numberPosition === 'bottom-left' ? 'Inferior izquierda' :
                  numberPosition === 'top-right' ? 'Superior derecha' :
                  numberPosition === 'top-left' ? 'Superior izquierda' :
                  numberPosition === 'bottom-center' ? 'Inferior centro' : 'Superior centro'
                }
              </div>
              <div className="info-item">
                <strong>Formato:</strong> {
                  numberFormat === '1,2,3...' ? '1, 2, 3...' :
                  numberFormat === 'Page 1' ? 'Page 1' :
                  numberFormat === 'Página 1' ? 'Página 1' :
                  customText || 'Personalizado'
                }
              </div>
              <div className="info-item">
                <strong>Número inicial:</strong> {startNumber}
              </div>
            </div>
          </div>
        )}

        {/* Botón de acción */}
        {files.length > 0 && (
          <div className="numbering-actions">
            <button 
              className="numbering-btn"
              onClick={handleAddPageNumbers}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Agregando numeración...
                </>
              ) : (
                <>
                  <Hash size={20} />
                  Agregar Numeración
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageNumbers;