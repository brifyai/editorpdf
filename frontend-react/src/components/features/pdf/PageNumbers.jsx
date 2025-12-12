import React, { useState, useCallback } from 'react';
import { Upload, X, Settings, Download, FileText, Hash, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import axios from 'axios';
import './PageNumbers.css';

const PageNumbers = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Configuración de numeración
  const [settings, setSettings] = useState({
    position: 'bottom-right',
    format: 'number',
    startNumber: 1,
    fontSize: 12,
    fontColor: '#000000',
    margin: 20,
    prefix: '',
    suffix: ''
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
    }
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateStatistics = async (action, details = {}) => {
    try {
      await axios.post('/api/statistics', {
        action,
        tool: 'page-numbers',
        details
      });
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  };

  const processPDF = async () => {
    if (files.length === 0) {
      alert('Por favor selecciona al menos un archivo PDF');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Iniciando procesamiento...');
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingStatus(`Procesando ${file.name}...`);
        setProgress((i / files.length) * 100);

        // Leer el archivo PDF
        const arrayBuffer = await file.arrayBuffer();
        const { PDFDocument } = await import('pdf-lib');
        
        let pdfDoc;
        try {
          pdfDoc = await PDFDocument.load(arrayBuffer);
        } catch (error) {
          console.error('Error loading PDF with pdf-lib:', error);
          // Fallback: crear un nuevo PDF con el nombre del archivo
          pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([595, 842]); // A4 size
          // Agregar texto indicando que no se pudo procesar el PDF original
          page.drawText(`Error procesando: ${file.name}`, {
            x: 50,
            y: 400,
            size: 12
          });
        }

        const pages = pdfDoc.getPages();
        
        // Agregar números de página a cada página
        for (let j = 0; j < pages.length; j++) {
          const page = pages[j];
          const { width, height } = page.getSize();
          
          // Calcular posición del número de página
          let x, y;
          const pageNumber = j + settings.startNumber;
          const pageText = `${settings.prefix}${pageNumber}${settings.suffix}`;
          
          switch (settings.position) {
            case 'top-left':
              x = settings.margin;
              y = height - settings.margin;
              break;
            case 'top-center':
              x = width / 2;
              y = height - settings.margin;
              break;
            case 'top-right':
              x = width - settings.margin;
              y = height - settings.margin;
              break;
            case 'bottom-left':
              x = settings.margin;
              y = settings.margin;
              break;
            case 'bottom-center':
              x = width / 2;
              y = settings.margin;
              break;
            case 'bottom-right':
              x = width - settings.margin;
              y = settings.margin;
              break;
            default:
              x = width - settings.margin;
              y = settings.margin;
          }
          
          // Centrar texto si es posición central
          if (settings.position.includes('center')) {
            const textWidth = settings.fontSize * pageText.length * 0.6; // Aproximación
            x -= textWidth / 2;
          }
          
          // Alinear a la derecha si es posición derecha
          if (settings.position.includes('right')) {
            const textWidth = settings.fontSize * pageText.length * 0.6; // Aproximación
            x -= textWidth;
          }
          
          // Dibujar el número de página
          page.drawText(pageText, {
            x: x,
            y: y,
            size: settings.fontSize,
            color: settings.fontColor
          });
        }

        // Guardar el PDF modificado
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file.name.replace('.pdf', '')}_numerado.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setProcessingStatus('Procesamiento completado');
      setProgress(100);
      
      // Actualizar estadísticas
      await updateStatistics('page-numbers-added', {
        filesProcessed: files.length,
        settings: settings
      });

    } catch (error) {
      console.error('Error processing PDF:', error);
      setProcessingStatus('Error en el procesamiento');
      
      // Actualizar estadísticas de error
      await updateStatistics('page-numbers-error', {
        error: error.message,
        filesAttempted: files.length
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProcessingStatus('');
        setProgress(0);
      }, 3000);
    }
  };

  return (
    <div className="page-numbers-container">
      {/* Header */}
      <div className="page-numbers-header">
        <div className="header-content">
          <div className="header-icon">
            <Hash size={32} />
          </div>
          <div className="header-text">
            <h1>Numeración de Páginas</h1>
            <p>Agrega números de página a tus documentos PDF de forma automática</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-numbers-content">
        {/* Upload Area */}
        <div className="upload-section">
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <Upload size={48} />
              <h3>Arrastra y suelta archivos PDF aquí</h3>
              <p>o selecciona archivos haciendo clic</p>
              <input 
                type="file" 
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="file-input"
              />
              <button className="select-button">
                Seleccionar Archivos
              </button>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="files-section">
            <h3>Archivos Seleccionados</h3>
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <FileText size={20} />
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => removeFile(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration */}
        {files.length > 0 && (
          <div className="configuration-section">
            <h3>
              <Settings size={20} />
              Configuración de Numeración
            </h3>
            
            <div className="config-grid">
              {/* Posición */}
              <div className="config-group">
                <label>Posición</label>
                <select 
                  value={settings.position}
                  onChange={(e) => setSettings(prev => ({ ...prev, position: e.target.value }))}
                >
                  <option value="bottom-right">Inferior Derecha</option>
                  <option value="bottom-center">Inferior Centro</option>
                  <option value="bottom-left">Inferior Izquierda</option>
                  <option value="top-right">Superior Derecha</option>
                  <option value="top-center">Superior Centro</option>
                  <option value="top-left">Superior Izquierda</option>
                </select>
              </div>

              {/* Formato */}
              <div className="config-group">
                <label>Formato</label>
                <select 
                  value={settings.format}
                  onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value }))}
                >
                  <option value="number">Número (1, 2, 3...)</option>
                  <option value="page-x">Página X (Página 1, Página 2...)</option>
                  <option value="x-of-y">X de Y (1 de 10, 2 de 10...)</option>
                  <option value="roman">Números Romanos (I, II, III...)</option>
                </select>
              </div>

              {/* Número inicial */}
              <div className="config-group">
                <label>Número Inicial</label>
                <input 
                  type="number"
                  min="1"
                  value={settings.startNumber}
                  onChange={(e) => setSettings(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
                />
              </div>

              {/* Tamaño de fuente */}
              <div className="config-group">
                <label>Tamaño de Fuente</label>
                <input 
                  type="number"
                  min="6"
                  max="72"
                  value={settings.fontSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 12 }))}
                />
              </div>

              {/* Color de fuente */}
              <div className="config-group">
                <label>Color de Fuente</label>
                <input 
                  type="color"
                  value={settings.fontColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontColor: e.target.value }))}
                />
              </div>

              {/* Margen */}
              <div className="config-group">
                <label>Margen (px)</label>
                <input 
                  type="number"
                  min="5"
                  max="100"
                  value={settings.margin}
                  onChange={(e) => setSettings(prev => ({ ...prev, margin: parseInt(e.target.value) || 20 }))}
                />
              </div>

              {/* Prefijo */}
              <div className="config-group">
                <label>Prefijo</label>
                <input 
                  type="text"
                  placeholder="Ej: Página "
                  value={settings.prefix}
                  onChange={(e) => setSettings(prev => ({ ...prev, prefix: e.target.value }))}
                />
              </div>

              {/* Sufijo */}
              <div className="config-group">
                <label>Sufijo</label>
                <input 
                  type="text"
                  placeholder="Ej: / 10"
                  value={settings.suffix}
                  onChange={(e) => setSettings(prev => ({ ...prev, suffix: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="processing-section">
            <div className="processing-content">
              <div className="processing-spinner"></div>
              <p>{processingStatus}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length > 0 && !isProcessing && (
          <div className="actions-section">
            <button 
              className="process-button"
              onClick={processPDF}
            >
              <Download size={20} />
              Agregar Numeración y Descargar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageNumbers;