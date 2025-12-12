import React, { useState, useCallback } from 'react';
import { Upload, X, Settings, Download, FileText, GitCompare, Eye, BarChart3 } from 'lucide-react';
import axios from 'axios';
import './CompareDocuments.css';

const CompareDocuments = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Configuración de comparación
  const [settings, setSettings] = useState({
    compareMode: 'content', // 'content', 'visual', 'structure'
    sensitivity: 'medium', // 'low', 'medium', 'high'
    showDifferences: true,
    generateReport: true,
    includeImages: true,
    compareMetadata: false
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
        tool: 'compare-documents',
        details
      });
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  };

  const processComparison = async () => {
    if (files.length !== 2) {
      alert('Por favor selecciona exactamente 2 archivos PDF para comparar');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Iniciando comparación de documentos...');
    setProgress(0);

    try {
      setProcessingStatus('Analizando documentos...');
      setProgress(25);

      // Simulación de análisis de contenido
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessingStatus('Comparando estructura y contenido...');
      setProgress(50);

      // Simulación de comparación visual
      if (settings.compareMode === 'visual') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProcessingStatus('Realizando comparación visual...');
        setProgress(75);
      }

      // Generar resultado de comparación
      const result = {
        similarity: Math.floor(Math.random() * 30) + 70, // 70-100%
        differences: [
          {
            type: 'text',
            page: 1,
            description: 'Diferencias en el párrafo 3',
            severity: 'medium'
          },
          {
            type: 'formatting',
            page: 2,
            description: 'Cambios en el espaciado',
            severity: 'low'
          }
        ],
        summary: {
          totalDifferences: Math.floor(Math.random() * 10) + 1,
          textDifferences: Math.floor(Math.random() * 5) + 1,
          formattingDifferences: Math.floor(Math.random() * 3) + 1,
          structuralDifferences: Math.floor(Math.random() * 2)
        },
        files: {
          file1: {
            name: files[0].name,
            pages: Math.floor(Math.random() * 20) + 5,
            size: formatFileSize(files[0].size)
          },
          file2: {
            name: files[1].name,
            pages: Math.floor(Math.random() * 20) + 5,
            size: formatFileSize(files[1].size)
          }
        }
      };

      setComparisonResult(result);
      setProgress(100);
      setProcessingStatus('Comparación completada');
      setShowPreview(true);
      
      // Actualizar estadísticas
      await updateStatistics('comparison-completed', {
        filesProcessed: files.length,
        similarity: result.similarity,
        differences: result.summary.totalDifferences,
        settings: settings
      });

    } catch (error) {
      console.error('Error processing comparison:', error);
      setProcessingStatus('Error en el procesamiento');
      
      // Actualizar estadísticas de error
      await updateStatistics('comparison-error', {
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

  const downloadReport = async () => {
    if (!comparisonResult) return;

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Título del reporte
      pdf.setFontSize(20);
      pdf.text('Reporte de Comparación de Documentos', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Fecha: ${new Date().toLocaleString()}`, 20, 30);
      pdf.text('', 20, 40); // Espacio

      // Información de archivos
      pdf.setFontSize(14);
      pdf.text('Archivos Comparados:', 20, 50);
      pdf.setFontSize(12);
      pdf.text(`Archivo 1: ${comparisonResult.files.file1.name}`, 30, 60);
      pdf.text(`Archivo 2: ${comparisonResult.files.file2.name}`, 30, 70);
      pdf.text('', 20, 80); // Espacio

      // Resultados
      pdf.setFontSize(14);
      pdf.text('Resultados:', 20, 90);
      pdf.setFontSize(12);
      pdf.text(`Similitud: ${comparisonResult.similarity}%`, 30, 100);
      pdf.text(`Diferencias totales: ${comparisonResult.summary.totalDifferences}`, 30, 110);
      pdf.text('', 20, 120); // Espacio

      // Diferencias detalladas
      pdf.setFontSize(14);
      pdf.text('Diferencias Detalladas:', 20, 130);
      pdf.setFontSize(12);
      
      comparisonResult.differences.forEach((diff, index) => {
        const yPosition = 140 + (index * 20);
        if (yPosition < 270) {
          pdf.text(`${index + 1}. ${diff.description}`, 30, yPosition);
          pdf.text(`   Tipo: ${diff.type}, Severidad: ${diff.severity}`, 30, yPosition + 8);
        }
      });

      // Descargar el reporte
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_comparacion_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Actualizar estadísticas
      await updateStatistics('comparison-report-downloaded', {
        similarity: comparisonResult.similarity,
        differences: comparisonResult.summary.totalDifferences
      });

    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error al descargar el reporte');
    }
  };

  return (
    <div className="compare-documents-container">
      {/* Header */}
      <div className="compare-documents-header">
        <div className="header-content">
          <div className="header-icon">
            <GitCompare size={32} />
          </div>
          <div className="header-text">
            <h1>Comparar Documentos PDF</h1>
            <p>Compara dos documentos PDF para identificar diferencias y similitudes</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="compare-documents-content">
        {/* Upload Area */}
        <div className="upload-section">
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <Upload size={48} />
              <h3>Arrastra y suelta 2 archivos PDF aquí</h3>
              <p>o selecciona archivos haciendo clic</p>
              <input 
                type="file" 
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="file-input"
              />
              <button className="select-button">
                Seleccionar Archivos PDF
              </button>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="files-section">
            <h3>Archivos Seleccionados ({files.length}/2)</h3>
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
            {files.length !== 2 && (
              <p className="files-warning">
                {files.length < 2 
                  ? `Necesitas ${2 - files.length} archivo(s) más para comparar` 
                  : 'Solo puedes comparar exactamente 2 archivos. Elimina 1 archivo.'
                }
              </p>
            )}
          </div>
        )}

        {/* Configuration */}
        {files.length === 2 && (
          <div className="configuration-section">
            <h3>
              <Settings size={20} />
              Configuración de Comparación
            </h3>
            
            <div className="config-grid">
              {/* Modo de comparación */}
              <div className="config-group">
                <label>Modo de Comparación</label>
                <select 
                  value={settings.compareMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, compareMode: e.target.value }))}
                >
                  <option value="content">Contenido del texto</option>
                  <option value="visual">Diferencias visuales</option>
                  <option value="structure">Estructura del documento</option>
                </select>
              </div>

              {/* Sensibilidad */}
              <div className="config-group">
                <label>Sensibilidad</label>
                <select 
                  value={settings.sensitivity}
                  onChange={(e) => setSettings(prev => ({ ...prev, sensitivity: e.target.value }))}
                >
                  <option value="low">Baja (solo diferencias grandes)</option>
                  <option value="medium">Media (diferencias notables)</option>
                  <option value="high">Alta (todas las diferencias)</option>
                </select>
              </div>

              {/* Opciones adicionales */}
              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.showDifferences}
                    onChange={(e) => setSettings(prev => ({ ...prev, showDifferences: e.target.checked }))}
                  />
                  Mostrar diferencias detalladas
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.generateReport}
                    onChange={(e) => setSettings(prev => ({ ...prev, generateReport: e.target.checked }))}
                  />
                  Generar reporte de comparación
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.includeImages}
                    onChange={(e) => setSettings(prev => ({ ...prev, includeImages: e.target.checked }))}
                  />
                  Incluir imágenes en la comparación
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.compareMetadata}
                    onChange={(e) => setSettings(prev => ({ ...prev, compareMetadata: e.target.checked }))}
                  />
                  Comparar metadatos del documento
                </label>
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

        {/* Comparison Results */}
        {showPreview && comparisonResult && (
          <div className="results-section">
            <h3>
              <BarChart3 size={20} />
              Resultados de la Comparación
            </h3>
            
            <div className="results-summary">
              <div className="similarity-score">
                <div className="score-label">Similitud</div>
                <div className="score-value">{comparisonResult.similarity}%</div>
                <div className="score-bar">
                  <div 
                    className="score-fill"
                    style={{ width: `${comparisonResult.similarity}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="differences-summary">
                <div className="summary-item">
                  <span className="summary-label">Diferencias totales:</span>
                  <span className="summary-value">{comparisonResult.summary.totalDifferences}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Diferencias de texto:</span>
                  <span className="summary-value">{comparisonResult.summary.textDifferences}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Diferencias de formato:</span>
                  <span className="summary-value">{comparisonResult.summary.formattingDifferences}</span>
                </div>
              </div>
            </div>

            <div className="differences-list">
              <h4>Diferencias Detectadas:</h4>
              {comparisonResult.differences.map((diff, index) => (
                <div key={index} className="difference-item">
                  <div className="difference-type">{diff.type}</div>
                  <div className="difference-description">{diff.description}</div>
                  <div className="difference-severity severity-{diff.severity}">
                    {diff.severity === 'high' ? 'Alta' : diff.severity === 'medium' ? 'Media' : 'Baja'}
                  </div>
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button className="download-button" onClick={downloadReport}>
                <Download size={20} />
                Descargar Reporte PDF
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {files.length === 2 && !isProcessing && (
          <div className="actions-section">
            <button 
              className="process-button"
              onClick={processComparison}
            >
              <Eye size={20} />
              Comparar Documentos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareDocuments;