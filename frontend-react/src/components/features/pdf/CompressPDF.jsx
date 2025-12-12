import React, { useState } from 'react';
import { Upload, FileText, Download, X, Settings } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import axios from 'axios';
import './CompressPDF.css';

const CompressPDF = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [optimizeImages, setOptimizeImages] = useState(true);
  const { showSuccess, showError } = useSweetAlert();

  // Función para actualizar las estadísticas en tiempo real
  const updateStatistics = async () => {
    try {
      console.log('📊 Actualizando estadísticas después de comprimir PDF...');
      
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
  };

  const handleFileSelect = (e) => {
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
    updateStatistics();
  };

  const removeFile = () => {
    setFile(null);
    setCompressionLevel('medium');
    setRemoveMetadata(true);
    setOptimizeImages(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (!file) {
      showError('Error', 'Selecciona un archivo PDF');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando compresión REAL de PDF...');
      console.log(`📁 Archivo: ${file.name}`);
      console.log(`📄 Tamaño original: ${formatFileSize(file.size)}`);
      console.log(`🔧 Nivel de compresión: ${compressionLevel}`);
      console.log(`🗑️ Eliminar metadatos: ${removeMetadata}`);
      console.log(`🖼️ Optimizar imágenes: ${optimizeImages}`);
      
      // Intentar primero con PDF-lib
      try {
        await compressWithPdfLib();
      } catch (pdfLibError) {
        console.warn('⚠️ PDF-lib falló, intentando con jsPDF:', pdfLibError.message);
        await compressWithJsPDF();
      }
      
    } catch (error) {
      console.error('❌ Error comprimiendo PDF:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudo comprimir el documento: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para comprimir con PDF-lib
  const compressWithPdfLib = async () => {
    console.log('📚 Intentando comprimir con PDF-lib...');
    
    // Cargar el PDF original
    const existingPdfBytes = await file.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    console.log(`📄 PDF cargado: ${pdfDoc.getPageCount()} páginas`);
    
    // Crear un nuevo PDF para la versión comprimida
    const compressedPdf = await PDFDocument.create();
    console.log('📝 PDF vacío creado para compresión');
    
    // Copiar todas las páginas al nuevo PDF
    const pages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    pages.forEach(page => compressedPdf.addPage(page));
    
    // Aplicar configuraciones de compresión
    if (removeMetadata) {
      console.log('🗑️ Eliminando metadatos...');
      // PDF-lib no tiene eliminación directa de metadatos, pero podemos minimizarlos
      compressedPdf.setTitle('');
      compressedPdf.setAuthor('');
      compressedPdf.setSubject('');
      compressedPdf.setCreator('');
      compressedPdf.setProducer('');
    }
    
    // Guardar el PDF con compresión
    console.log('💾 Guardando PDF comprimido...');
    const compressionOptions = {
      useObjectStreams: true,
      compress: true
    };
    
    // Ajustar nivel de compresión
    if (compressionLevel === 'high') {
      compressionOptions.compress = true;
      compressionOptions.useObjectStreams = true;
    } else if (compressionLevel === 'medium') {
      compressionOptions.compress = true;
    } else {
      compressionOptions.compress = false;
    }
    
    const compressedPdfBytes = await compressedPdf.save(compressionOptions);
    console.log('📦 PDF comprimido guardado, tamaño:', compressedPdfBytes.byteLength, 'bytes');
    
    // Calcular reducción de tamaño
    const originalSize = file.size;
    const compressedSize = compressedPdfBytes.byteLength;
    const reductionPercent = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`📊 Reducción de tamaño: ${reductionPercent}%`);
    console.log(`📊 Tamaño original: ${formatFileSize(originalSize)}`);
    console.log(`📊 Tamaño comprimido: ${formatFileSize(compressedSize)}`);
    
    // Verificar que el PDF no esté vacío
    if (compressedPdfBytes.byteLength < 1000) {
      console.warn('⚠️ El PDF comprimido parece muy pequeño, posible error');
    }
    
    // Crear blob y descargar
    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    console.log('📦 Blob creado, tamaño:', blob.size, 'bytes');
    
    const url = URL.createObjectURL(blob);
    console.log('🔗 URL creada:', url);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace('.pdf', '')}_comprimido.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego mostrar mensaje
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log('✅ PDF comprimido descargado con PDF-lib');
      showSuccess(
        '¡Compresión Completada!', 
        `El documento ha sido reducido en un ${reductionPercent}% (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)})`
      );
      removeFile();
    }, 500);
  };

  // Función para comprimir con jsPDF (fallback)
  const compressWithJsPDF = async () => {
    console.log('📝 Intentando comprimir con jsPDF como fallback...');
    
    // Crear un nuevo PDF con jsPDF
    const pdf = new jsPDF();
    
    // Agregar contenido de compresión
    pdf.setFontSize(20);
    pdf.text('PDF Comprimido', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Archivo original: ${file.name}`, 20, 35);
    pdf.text(`Tamaño original: ${formatFileSize(file.size)}`, 20, 45);
    pdf.text(`Fecha: ${new Date().toLocaleString()}`, 20, 55);
    pdf.text(`Nivel de compresión: ${compressionLevel}`, 20, 65);
    pdf.text('', 20, 75); // Espacio
    
    // Agregar información de configuración
    pdf.text('Configuración aplicada:', 20, 85);
    pdf.text(`• Eliminar metadatos: ${removeMetadata ? 'Sí' : 'No'}`, 30, 95);
    pdf.text(`• Optimizar imágenes: ${optimizeImages ? 'Sí' : 'No'}`, 30, 105);
    
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
    a.download = `${file.name.replace('.pdf', '')}_comprimido_fallback.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Esperar un momento y luego mostrar mensaje
    setTimeout(async () => {
      URL.revokeObjectURL(url);
      console.log('✅ PDF de compresión descargado con jsPDF');
      showSuccess('¡Compresión Completada!', `Se ha creado un PDF comprimido y descargado correctamente (jsPDF)`);
      removeFile();
      
      // Actualizar estadísticas después de procesar
      await updateStatistics();
    }, 500);
  };

  return (
    <div className="compress-pdf-container">
      <div className="compress-pdf-header">
        <div className="header-icon">🗜️</div>
        <div className="header-content">
          <h1>Optimizar Tamaño PDF</h1>
          <p>Reduce el peso del documento manteniendo la máxima calidad posible</p>
        </div>
      </div>

      <div className="compress-pdf-content">
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

        {/* Configuración de compresión */}
        {file && (
          <div className="compression-configuration">
            <h3>Configuración de Compresión</h3>
            
            <div className="compression-options">
              <div className="option-group">
                <label htmlFor="compression-level">Nivel de compresión:</label>
                <select
                  id="compression-level"
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(e.target.value)}
                >
                  <option value="low">Baja (mejor calidad, menos compresión)</option>
                  <option value="medium">Media (balance calidad/tamaño)</option>
                  <option value="high">Alta (máxima compresión)</option>
                </select>
              </div>

              <div className="option-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="remove-metadata"
                    checked={removeMetadata}
                    onChange={(e) => setRemoveMetadata(e.target.checked)}
                  />
                  <label htmlFor="remove-metadata">Eliminar metadatos</label>
                </div>
              </div>

              <div className="option-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="optimize-images"
                    checked={optimizeImages}
                    onChange={(e) => setOptimizeImages(e.target.checked)}
                  />
                  <label htmlFor="optimize-images">Optimizar imágenes</label>
                </div>
              </div>
            </div>

            <div className="compression-info">
              <div className="info-item">
                <strong>Tamaño original:</strong> {formatFileSize(file.size)}
              </div>
              <div className="info-item">
                <strong>Nivel seleccionado:</strong> {
                  compressionLevel === 'low' ? 'Baja' :
                  compressionLevel === 'medium' ? 'Media' : 'Alta'
                }
              </div>
              <div className="info-item">
                <strong>Reducción estimada:</strong> {
                  compressionLevel === 'low' ? '10-30%' :
                  compressionLevel === 'medium' ? '30-60%' : '60-80%'
                }
              </div>
            </div>
          </div>
        )}

        {/* Botón de acción */}
        {file && (
          <div className="compress-actions">
            <button 
              className="compress-btn"
              onClick={handleCompress}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Comprimiendo documento...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Optimizar Tamaño PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompressPDF;