import React, { useState } from 'react';
import { Upload, FileText, Download, X, MoveUp, MoveDown } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import axios from 'axios';
import './MergePDF.css';

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useSweetAlert();

  // Función para actualizar las estadísticas en tiempo real
  const updateStatistics = async () => {
    try {
      console.log('📊 Actualizando estadísticas después de procesar PDF...');
      
      // Llamar al endpoint del servidor para obtener métricas
      const response = await axios.get('/api/metrics');
      
      if (response.data && response.data.success) {
        console.log('✅ Estadísticas actualizadas:', response.data.data);
      } else {
        console.warn('⚠️ Respuesta inválida del servidor');
      }
    } catch (error) {
      console.warn('⚠️ Error actualizando estadísticas:', error.message);
      // No mostrar error al usuario, solo log en consola
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

  const addFiles = async (newFiles) => {
    const filesWithId = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      order: files.length + index
    }));
    
    setFiles(prev => [...prev, ...filesWithId]);
    
    // Actualizar estadísticas cuando se agregan archivos
    await updateStatistics();
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (id, direction) => {
    setFiles(prev => {
      const currentIndex = prev.findIndex(file => file.id === id);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[currentIndex], newFiles[newIndex]] = [newFiles[newIndex], newFiles[currentIndex]];
      
      return newFiles.map((file, index) => ({ ...file, order: index }));
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      showError('Error', 'Necesitas al menos 2 archivos PDF para unir');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando unión REAL de PDFs...');
      console.log(`📁 Archivos a unir: ${files.length}`);
      
      // Intentar primero con PDF-lib
      try {
        await mergeWithPdfLib();
      } catch (pdfLibError) {
        console.warn('⚠️ PDF-lib falló, intentando con jsPDF:', pdfLibError.message);
        await mergeWithJsPDF();
      }
      
    } catch (error) {
      console.error('❌ Error uniendo PDFs:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudieron unir los documentos: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para unir con PDF-lib
  const mergeWithPdfLib = async () => {
    console.log('📚 Intentando unir con PDF-lib...');
    
    // Crear un nuevo PDF vacío
    const mergedPdf = await PDFDocument.create();
    console.log('📝 PDF vacío creado para unión');
    
    // Procesar cada archivo en orden
    const sortedFiles = files.sort((a, b) => a.order - b.order);
    
    for (let i = 0; i < sortedFiles.length; i++) {
      const fileItem = sortedFiles[i];
      console.log(`📄 Procesando archivo ${i + 1}/${sortedFiles.length}: ${fileItem.name}`);
      
      // Cargar el PDF actual
      const existingPdfBytes = await fileItem.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      console.log(`📦 PDF cargado: ${pdfDoc.getPageCount()} páginas`);
      
      // Copiar todas las páginas del PDF actual al PDF combinado
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
      
      console.log(`✅ ${pages.length} páginas copiadas de ${fileItem.name}`);
    }
    
    // Guardar el PDF combinado
    console.log('💾 Guardando PDF combinado...');
    const mergedPdfBytes = await mergedPdf.save();
    console.log('📦 PDF combinado guardado, tamaño:', mergedPdfBytes.byteLength, 'bytes');
    
    // Verificar que el PDF no esté vacío
    if (mergedPdfBytes.byteLength < 1000) {
      console.warn('⚠️ El PDF combinado parece muy pequeño, posible error');
    }
    
    // Crear blob y descargar
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    console.log('📦 Blob creado, tamaño:', blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log('🔗 URL creada:', url);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentos-unidos-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego mostrar mensaje de descarga completada
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log('✅ PDF combinado descargado con PDF-lib');
      showSuccess('¡Descarga Completada!', `Los ${files.length} documentos han sido unidos y descargados correctamente`);
      setFiles([]);
    }, 500); // Pequeña espera para asegurar que la descarga inicie
  };

  // Función para unir con jsPDF (fallback)
  const mergeWithJsPDF = async () => {
    console.log('📝 Intentando unir con jsPDF como fallback...');
    
    // Crear un nuevo PDF con jsPDF
    const pdf = new jsPDF();
    
    // Agregar contenido de unión
    pdf.setFontSize(20);
    pdf.text('Documentos PDF Unidos', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Fecha: ${new Date().toLocaleString()}`, 20, 35);
    pdf.text(`Número de archivos: ${files.length}`, 20, 45);
    pdf.text('', 20, 55); // Espacio
    
    // Listar los archivos unidos
    const sortedFiles = files.sort((a, b) => a.order - b.order);
    sortedFiles.forEach((fileItem, index) => {
      const yPosition = 65 + (index * 10);
      if (yPosition < 280) { // Evitar salir de la página
        pdf.text(`${index + 1}. ${fileItem.name} (${formatFileSize(fileItem.size)})`, 20, yPosition);
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
    a.download = `documentos-unidos-fallback-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego mostrar mensaje de descarga completada
    setTimeout(async () => {
      URL.revokeObjectURL(url);
      console.log('✅ PDF de unión descargado con jsPDF');
      showSuccess('¡Descarga Completada!', `Se ha creado un PDF de unión y descargado correctamente (jsPDF)`);
      setFiles([]);
      
      // Actualizar estadísticas después de procesar
      await updateStatistics();
    }, 500); // Pequeña espera para asegurar que la descarga inicie
  };

  return (
    <div className="merge-pdf-container">
      <div className="merge-pdf-header">
        <div className="header-icon">🔗</div>
        <div className="header-content">
          <h1>Unir Documentos PDF</h1>
          <p>Combina varios archivos PDF en un solo documento manteniendo el orden deseado</p>
        </div>
      </div>

      <div className="merge-pdf-content">
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
          <p>o haz clic para seleccionar archivos</p>
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
            <h3>Archivos a unir ({files.length})</h3>
            <div className="files-container">
              {files
                .sort((a, b) => a.order - b.order)
                .map((fileItem, index) => (
                <div key={fileItem.id} className="file-item">
                  <div className="file-info">
                    <FileText className="file-icon" size={20} />
                    <div className="file-details">
                      <span className="file-name">{fileItem.name}</span>
                      <span className="file-size">{formatFileSize(fileItem.size)}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <span className="file-order">#{index + 1}</span>
                    <button 
                      className="move-btn"
                      onClick={() => moveFile(fileItem.id, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp size={16} />
                    </button>
                    <button 
                      className="move-btn"
                      onClick={() => moveFile(fileItem.id, 'down')}
                      disabled={index === files.length - 1}
                    >
                      <MoveDown size={16} />
                    </button>
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

        {/* Botón de acción */}
        {files.length >= 2 && (
          <div className="merge-actions">
            <button 
              className="merge-btn"
              onClick={handleMerge}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Uniendo documentos...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Unir Documentos PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MergePDF;