import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, Upload, X, Settings, Download, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './PDFToExcel.css';

const PDFToExcel = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [settings, setSettings] = useState({
    format: 'xlsx',
    includeFormatting: true,
    mergeCells: true,
    detectTables: true,
    preserveLayout: false
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
    }
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processPDFs = async () => {
    if (files.length === 0) return;
    
    setProcessing(true);
    const results = [];

    for (const file of files) {
      try {
        // Simulación de procesamiento PDF a Excel
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const result = {
          originalName: file.name,
          processedName: file.name.replace('.pdf', `.${settings.format}`),
          size: file.size,
          status: 'success'
        };
        
        results.push(result);
        
        // Actualizar estadísticas
        try {
          await axios.post('http://localhost:8080/api/statistics/update', {
            category: 'conversion',
            tool: 'pdf-to-excel',
            action: 'processed'
          });
        } catch (error) {
          console.error('Error updating statistics:', error);
        }
        
      } catch (error) {
        results.push({
          originalName: file.name,
          processedName: null,
          size: file.size,
          status: 'error',
          error: error.message
        });
      }
    }

    setProcessedFiles(results);
    setProcessing(false);
  };

  const downloadFile = (file) => {
    // Simulación de descarga
    const link = document.createElement('a');
    link.href = '#';
    link.download = file.processedName;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="pdf-to-excel-container">
      <div className="pdf-to-excel-header">
        <div className="pdf-to-excel-header-icon">
          <FileSpreadsheet size={32} color="#667eea" />
        </div>
        <div className="pdf-to-excel-header-content">
          <h1>PDF a Excel</h1>
          <p>Convierte documentos PDF a hojas de cálculo Excel manteniendo el formato y las tablas</p>
        </div>
      </div>

      <div className="pdf-to-excel-content">
        <div className="pdf-to-excel-upload-section">
          <div
            className={`pdf-to-excel-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload size={48} color="#667eea" />
            <h3>Arrastra y suelta archivos PDF aquí</h3>
            <p>o haz clic para seleccionar archivos</p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInput}
              className="pdf-to-excel-file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="pdf-to-excel-file-list">
              <h4>Archivos seleccionados:</h4>
              {files.map((file, index) => (
                <div key={index} className="pdf-to-excel-file-item">
                  <FileText size={20} color="#667eea" />
                  <span>{file.name}</span>
                  <span className="pdf-to-excel-file-size">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="pdf-to-excel-remove-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pdf-to-excel-settings-section">
          <div className="pdf-to-excel-settings-header">
            <Settings size={20} color="#667eea" />
            <h3>Configuración de Conversión</h3>
          </div>
          
          <div className="pdf-to-excel-settings-grid">
            <div className="pdf-to-excel-setting-item">
              <label>Formato de salida:</label>
              <select
                value={settings.format}
                onChange={(e) => setSettings({...settings, format: e.target.value})}
                className="pdf-to-excel-select"
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="xls">Excel 97-2003 (.xls)</option>
                <option value="csv">CSV (.csv)</option>
              </select>
            </div>

            <div className="pdf-to-excel-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.includeFormatting}
                  onChange={(e) => setSettings({...settings, includeFormatting: e.target.checked})}
                />
                Incluir formato de celdas
              </label>
            </div>

            <div className="pdf-to-excel-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.mergeCells}
                  onChange={(e) => setSettings({...settings, mergeCells: e.target.checked})}
                />
                Combinar celdas automáticamente
              </label>
            </div>

            <div className="pdf-to-excel-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.detectTables}
                  onChange={(e) => setSettings({...settings, detectTables: e.target.checked})}
                />
                Detectar tablas automáticamente
              </label>
            </div>

            <div className="pdf-to-excel-setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.preserveLayout}
                  onChange={(e) => setSettings({...settings, preserveLayout: e.target.checked})}
                />
                Preservar diseño original
              </label>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="pdf-to-excel-action-section">
            <button
              onClick={processPDFs}
              disabled={processing}
              className="pdf-to-excel-process-btn"
            >
              {processing ? 'Procesando...' : 'Convertir a Excel'}
            </button>
          </div>
        )}

        {processedFiles.length > 0 && (
          <div className="pdf-to-excel-results-section">
            <h3>Resultados:</h3>
            <div className="pdf-to-excel-results-list">
              {processedFiles.map((file, index) => (
                <div key={index} className="pdf-to-excel-result-item">
                  <div className="pdf-to-excel-result-info">
                    {file.status === 'success' ? (
                      <CheckCircle size={20} color="#10b981" />
                    ) : (
                      <X size={20} color="#ef4444" />
                    )}
                    <div>
                      <div className="pdf-to-excel-result-name">{file.originalName}</div>
                      {file.status === 'success' ? (
                        <div className="pdf-to-excel-result-converted">→ {file.processedName}</div>
                      ) : (
                        <div className="pdf-to-excel-result-error">Error: {file.error}</div>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="pdf-to-excel-download-btn"
                    >
                      <Download size={16} />
                      Descargar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFToExcel;