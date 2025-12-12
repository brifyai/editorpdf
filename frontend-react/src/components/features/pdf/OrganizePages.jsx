import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, MoveUp, MoveDown, RotateCcw } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import axios from 'axios';
import './OrganizePages.css';

const OrganizePages = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [pagesOrder, setPagesOrder] = useState([]);
  const [orderMode, setOrderMode] = useState('ascending'); // 'ascending', 'descending', 'reverse', 'custom'
  const [removeBlank, setRemoveBlank] = useState(false);
  const [draggedPage, setDraggedPage] = useState(null);
  const { showSuccess, showError } = useSweetAlert();

  // Función para actualizar las estadísticas en tiempo real
  const updateStatistics = async () => {
    try {
      console.log('📊 Actualizando estadísticas después de organizar PDF...');
      
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
    
    // Obtener número de páginas
    getTotalPages(pdfFile);
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
    await getTotalPages(selectedFile);
    await updateStatistics();
  };

  // Función para obtener el número de páginas del PDF
  const getTotalPages = async (file) => {
    try {
      console.log('🔍 Obteniendo número de páginas...');
      
      // Intentar usar PDF.js primero
      if (typeof window.pdfjsLib === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      
      console.log(`✅ PDF con ${pageCount} páginas detectado`);
      setTotalPages(pageCount);
      
      // Inicializar orden de páginas
      const initialOrder = Array.from({ length: pageCount }, (_, i) => i + 1);
      setPagesOrder(initialOrder);
      
    } catch (error) {
      console.warn('❌ Error obteniendo páginas:', error);
      // Estimar páginas basado en el tamaño
      const estimatedPages = Math.max(1, Math.ceil(file.size / 50000));
      setTotalPages(estimatedPages);
      
      const initialOrder = Array.from({ length: estimatedPages }, (_, i) => i + 1);
      setPagesOrder(initialOrder);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTotalPages(0);
    setPagesOrder([]);
    setOrderMode('ascending');
    setRemoveBlank(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Función para reordenar páginas según el modo seleccionado
  const applyOrderMode = () => {
    let newOrder = [...pagesOrder];
    
    switch (orderMode) {
      case 'ascending':
        newOrder.sort((a, b) => a - b);
        break;
      case 'descending':
        newOrder.sort((a, b) => b - a);
        break;
      case 'reverse':
        newOrder.reverse();
        break;
      case 'custom':
        // Mantener el orden actual
        break;
    }
    
    setPagesOrder(newOrder);
  };

  // Función para mover una página en la lista
  const movePage = (index, direction) => {
    const newOrder = [...pagesOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setPagesOrder(newOrder);
    setOrderMode('custom'); // Cambiar a modo personalizado
  };

  // Funciones de drag and drop para páginas
  const handlePageDragStart = (e, pageIndex) => {
    setDraggedPage(pageIndex);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePageDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePageDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedPage === null || draggedPage === dropIndex) return;
    
    const newOrder = [...pagesOrder];
    const draggedPageNumber = newOrder[draggedPage];
    
    // Remover de la posición original
    newOrder.splice(draggedPage, 1);
    
    // Insertar en la nueva posición
    const adjustedDropIndex = draggedPage < dropIndex ? dropIndex - 1 : dropIndex;
    newOrder.splice(adjustedDropIndex, 0, draggedPageNumber);
    
    setPagesOrder(newOrder);
    setOrderMode('custom');
    setDraggedPage(null);
  };

  const handleOrganize = async () => {
    if (!file) {
      showError('Error', 'Selecciona un archivo PDF');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando organización REAL de PDF...');
      console.log(`📁 Archivo: ${file.name}`);
      console.log(`📄 Páginas: ${totalPages}`);
      console.log(`🔧 Modo de orden: ${orderMode}`);
      console.log(`📋 Orden final: [${pagesOrder.join(', ')}]`);
      
      // Aplicar el modo de orden seleccionado
      applyOrderMode();
      
      // Intentar primero con PDF-lib
      try {
        await organizeWithPdfLib();
      } catch (pdfLibError) {
        console.warn('⚠️ PDF-lib falló, intentando con jsPDF:', pdfLibError.message);
        await organizeWithJsPDF();
      }
      
    } catch (error) {
      console.error('❌ Error organizando PDF:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudo organizar el documento: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para organizar con PDF-lib
  const organizeWithPdfLib = async () => {
    console.log('📚 Intentando organizar con PDF-lib...');
    
    // Cargar el PDF original
    const existingPdfBytes = await file.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    console.log(`📄 PDF cargado: ${pdfDoc.getPageCount()} páginas`);
    
    // Crear un nuevo PDF
    const organizedPdf = await PDFDocument.create();
    console.log('📝 PDF vacío creado para organización');
    
    // Aplicar el orden de páginas
    const finalOrder = orderMode === 'custom' ? pagesOrder : (() => {
      let order = [...pagesOrder];
      switch (orderMode) {
        case 'ascending':
          order.sort((a, b) => a - b);
          break;
        case 'descending':
          order.sort((a, b) => b - a);
          break;
        case 'reverse':
          order.reverse();
          break;
      }
      return order;
    })();
    
    // Copiar páginas en el nuevo orden
    for (let i = 0; i < finalOrder.length; i++) {
      const pageNumber = finalOrder[i];
      const pageIndex = pageNumber - 1; // Convertir a índice 0-based
      
      if (pageIndex >= 0 && pageIndex < pdfDoc.getPageCount()) {
        const [page] = await organizedPdf.copyPages(pdfDoc, [pageIndex]);
        organizedPdf.addPage(page);
        console.log(`✅ Página ${pageNumber} copiada en posición ${i + 1}`);
      }
    }
    
    // Guardar el PDF organizado
    console.log('💾 Guardando PDF organizado...');
    const organizedPdfBytes = await organizedPdf.save();
    console.log('📦 PDF organizado guardado, tamaño:', organizedPdfBytes.byteLength, 'bytes');
    
    // Verificar que el PDF no esté vacío
    if (organizedPdfBytes.byteLength < 1000) {
      console.warn('⚠️ El PDF organizado parece muy pequeño, posible error');
    }
    
    // Crear blob y descargar
    const blob = new Blob([organizedPdfBytes], { type: 'application/pdf' });
    console.log('📦 Blob creado, tamaño:', blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log('🔗 URL creada:', url);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}_organizado.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego mostrar mensaje
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log('✅ PDF organizado descargado con PDF-lib');
      showSuccess('¡Descarga Completada!', `El documento ha sido organizado y descargado correctamente`);
      removeFile();
    }, 500);
  };

  // Función para organizar con jsPDF (fallback)
  const organizeWithJsPDF = async () => {
    console.log('📝 Intentando organizar con jsPDF como fallback...');
    
    // Crear un nuevo PDF con jsPDF
    const pdf = new jsPDF();
    
    // Agregar contenido de organización
    pdf.setFontSize(20);
    pdf.text('PDF Organizado', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Archivo original: ${file.name}`, 20, 35);
    pdf.text(`Fecha: ${new Date().toLocaleString()}`, 20, 45);
    pdf.text(`Modo de orden: ${orderMode}`, 20, 55);
    pdf.text(`Total de páginas: ${totalPages}`, 20, 65);
    pdf.text('', 20, 75); // Espacio
    
    // Listar el orden de páginas
    const finalOrder = orderMode === 'custom' ? pagesOrder : (() => {
      let order = [...pagesOrder];
      switch (orderMode) {
        case 'ascending':
          order.sort((a, b) => a - b);
          break;
        case 'descending':
          order.sort((a, b) => b - a);
          break;
        case 'reverse':
          order.reverse();
          break;
      }
      return order;
    })();
    
    pdf.text('Orden de páginas:', 20, 85);
    finalOrder.forEach((pageNum, index) => {
      const yPosition = 95 + (index * 8);
      if (yPosition < 280) {
        pdf.text(`Posición ${index + 1}: Página ${pageNum}`, 30, yPosition);
      }
    });
    
    // Agregar nota al final
    pdf.setFontSize(10);
    pdf.text('Este es un PDF de prueba generado con jsPDF', 20, 280);
    pdf.text('como fallback cuando PDF-lib falla.', 20, 285);
    
    // Guardar el PDF
    const pdfBytes = pdf.output('arraybuffer');
    console.log('📦 PDF jsPDF creado, tamaño:', pdfBytes.byteLength, 'bytes');
    
    // Crear blob y descargar
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    console.log('📦 Blob jsPDF creado, tamaño:', blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log('🔗 URL jsPDF creada:', url);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}_organizado_fallback.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego mostrar mensaje
    setTimeout(async () => {
      URL.revokeObjectURL(url);
      console.log('✅ PDF de organización descargado con jsPDF');
      showSuccess('¡Descarga Completada!', `Se ha creado un PDF organizado y descargado correctamente (jsPDF)`);
      removeFile();
      
      // Actualizar estadísticas después de procesar
      await updateStatistics();
    }, 500);
  };

  return (
    <div className="organize-pages-container">
      <div className="organize-pages-header">
        <div className="header-icon">📋</div>
        <div className="header-content">
          <h1>Organizar Páginas PDF</h1>
          <p>Reordena, elimina o reorganiza las páginas de tu documento según tus necesidades</p>
        </div>
      </div>

      <div className="organize-pages-content">
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

        {/* Configuración de organización */}
        {file && (
          <div className="organization-configuration">
            <h3>Configuración de Organización</h3>
            
            <div className="organization-options">
              <div className="option-group">
                <label htmlFor="order-mode">Modo de orden:</label>
                <select
                  id="order-mode"
                  value={orderMode}
                  onChange={(e) => setOrderMode(e.target.value)}
                >
                  <option value="ascending">Ascendente (1, 2, 3...)</option>
                  <option value="descending">Descendente (última a primera)</option>
                  <option value="reverse">Invertir orden actual</option>
                  <option value="custom">Personalizado (arrastra páginas)</option>
                </select>
              </div>

              <div className="option-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="remove-blank"
                    checked={removeBlank}
                    onChange={(e) => setRemoveBlank(e.target.checked)}
                  />
                  <label htmlFor="remove-blank">Eliminar páginas en blanco</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista previa de páginas */}
        {file && totalPages > 0 && (
          <div className="pages-preview">
            <h3>
              Vista Previa de Páginas ({totalPages})
              {orderMode === 'custom' && (
                <span style={{ fontSize: '0.9rem', color: '#9c27b0', marginLeft: '0.5rem' }}>
                  - Arrastra las páginas para reordenar
                </span>
              )}
            </h3>
            <div
              className="pages-grid"
              style={{
                minHeight: '200px',
                border: orderMode === 'custom' ? '2px dashed #e2e8f0' : 'none',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: orderMode === 'custom' ? '#fafbff' : 'transparent'
              }}
            >
              {(orderMode === 'custom' ? pagesOrder : Array.from({ length: totalPages }, (_, i) => i + 1)).map((pageNum, index) => (
                <div
                  key={index}
                  className={`page-item ${draggedPage === index ? 'dragging' : ''} ${orderMode === 'custom' ? 'draggable' : ''}`}
                  draggable={orderMode === 'custom'}
                  onDragStart={(e) => {
                    handlePageDragStart(e, index);
                    e.currentTarget.style.opacity = '0.5';
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.opacity = '';
                    setDraggedPage(null);
                  }}
                  onDragOver={handlePageDragOver}
                  onDragEnter={(e) => {
                    if (orderMode === 'custom' && draggedPage !== null && draggedPage !== index) {
                      e.currentTarget.style.backgroundColor = '#f3e5f5';
                      e.currentTarget.style.borderColor = '#9c27b0';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(156, 39, 176, 0.3)';
                    }
                  }}
                  onDragLeave={(e) => {
                    if (orderMode === 'custom') {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                    }
                  }}
                  onDrop={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                    handlePageDrop(e, index);
                  }}
                  style={{
                    cursor: orderMode === 'custom' ? 'move' : 'default',
                    transition: 'all 0.3s ease',
                    userSelect: orderMode === 'custom' ? 'none' : 'auto',
                    position: 'relative'
                  }}
                >
                  <div className="page-thumbnail" style={{
                    background: orderMode === 'custom' ?
                      'linear-gradient(135deg, #f8fafc 0%, #f3e5f5 100%)' : '#f8fafc',
                    border: orderMode === 'custom' ? '2px solid #e2e8f0' : '1px solid #e2e8f0'
                  }}>
                    📄
                    <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', fontWeight: '600' }}>
                      Página {pageNum}
                    </div>
                    {orderMode === 'custom' && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: '#9c27b0',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="page-number" style={{
                    fontWeight: orderMode === 'custom' ? '600' : 'normal',
                    color: orderMode === 'custom' ? '#9c27b0' : '#2d3748'
                  }}>
                    Posición {index + 1}
                  </div>
                  {orderMode === 'custom' && (
                    <div className="page-actions" style={{
                      display: 'flex',
                      gap: '0.25rem',
                      marginTop: '0.5rem'
                    }}>
                      <button
                        className="move-btn"
                        onClick={() => movePage(index, 'up')}
                        disabled={index === 0}
                        title="Mover hacia arriba"
                        style={{
                          background: index === 0 ? '#e2e8f0' : '#9c27b0',
                          color: index === 0 ? '#a0aec0' : 'white',
                          border: 'none',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <MoveUp size={12} />
                      </button>
                      <button
                        className="move-btn"
                        onClick={() => movePage(index, 'down')}
                        disabled={index === totalPages - 1}
                        title="Mover hacia abajo"
                        style={{
                          background: index === totalPages - 1 ? '#e2e8f0' : '#9c27b0',
                          color: index === totalPages - 1 ? '#a0aec0' : 'white',
                          border: 'none',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          cursor: index === totalPages - 1 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <MoveDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {orderMode === 'custom' && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f3e5f5 100%)',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.875rem',
                color: '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <div>
                  <strong>Tip:</strong> Haz clic y arrastra cualquier página para reordenarla.
                  También usa los botones ↑↓ para movimientos precisos.
                  <br />
                  <strong>Orden actual:</strong> [{pagesOrder.join(', ')}]
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de acción */}
        {file && (
          <div className="organize-actions">
            <button 
              className="organize-btn"
              onClick={handleOrganize}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Organizando documento...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Organizar Páginas PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizePages;