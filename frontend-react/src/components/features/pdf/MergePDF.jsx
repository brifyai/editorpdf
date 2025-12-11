import React, { useState } from 'react';
import { Upload, FileText, Download, X, MoveUp, MoveDown } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import './MergePDF.css';

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSuccess, showError } = useSweetAlert();

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
      order: files.length + index
    }));
    
    setFiles(prev => [...prev, ...filesWithId]);
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
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Crear un PDF combinado simulado
      const mergedPdf = new Blob(['PDF combinado simulado'], { type: 'application/pdf' });
      const url = URL.createObjectURL(mergedPdf);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentos-unidos-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('¡Éxito!', 'Los documentos han sido unidos correctamente');
      setFiles([]);
      
    } catch (error) {
      showError('Error', 'No se pudieron unir los documentos');
    } finally {
      setIsProcessing(false);
    }
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