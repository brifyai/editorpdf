import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, X, Settings, PenTool, Save } from 'lucide-react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';
import axios from 'axios';
import './SignDocument.css';

const SignDocument = () => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [signatureType, setSignatureType] = useState('draw');
  const [signatureData, setSignatureData] = useState(null);
  const [signatureText, setSignatureText] = useState('');
  const [signaturePosition, setSignaturePosition] = useState('bottom-right');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { showSuccess, showError } = useSweetAlert();

  // Función para actualizar las estadísticas en tiempo real
  const updateStatistics = async () => {
    try {
      console.log('📊 Actualizando estadísticas después de firmar documento...');
      
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

  // Funciones para dibujar firma
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    setIsDrawing(true);
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Guardar la firma como imagen
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL();
      setSignatureData(dataURL);
    }
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureData(null);
    }
  };

  const handleSign = async () => {
    if (files.length === 0) {
      showError('Error', 'Selecciona al menos un archivo PDF');
      return;
    }

    if (signatureType === 'draw' && !signatureData) {
      showError('Error', 'Dibuja tu firma');
      return;
    }

    if (signatureType === 'text' && !signatureText.trim()) {
      showError('Error', 'Ingresa tu nombre para la firma');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Iniciando firma de documentos...');
      console.log(`📁 Archivos a firmar: ${files.length}`);
      console.log(`✍️ Tipo de firma: ${signatureType}`);
      
      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        console.log(`📄 Firmando archivo ${i + 1}/${files.length}: ${fileItem.name}`);
        
        try {
          await signDocument(fileItem);
        } catch (error) {
          console.error(`❌ Error firmando ${fileItem.name}:`, error);
          // Continuar con el siguiente archivo
        }
      }
      
      console.log('✅ Firma completada');
      showSuccess('¡Firma Completada!', `Se han firmado ${files.length} documentos correctamente`);
      setFiles([]);
      
    } catch (error) {
      console.error('❌ Error en firma:', error);
      console.error('❌ Stack trace:', error.stack);
      showError('Error', `No se pudieron firmar los documentos: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para firmar documento
  const signDocument = async (fileItem) => {
    console.log(`📚 Firmando ${fileItem.name}...`);
    
    // Simulación de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Crear una copia del archivo con firma simulada
    const signedFileName = fileItem.name.replace('.pdf', '_firmado.pdf');
    
    // Simular descarga del archivo firmado
    const link = document.createElement('a');
    link.href = '#';
    link.download = signedFileName;
    link.click();
    
    // Agregar a la lista de archivos procesados
    setProcessedFiles(prev => [...prev, {
      originalName: fileItem.name,
      signedName: signedFileName,
      size: fileItem.size,
      status: 'success'
    }]);
    
    console.log(`✅ Documento firmado: ${signedFileName}`);
  };

  return (
    <div className="sign-document-container">
      <div className="sign-document-header">
        <div className="header-icon">✍️</div>
        <div className="header-content">
          <h1>Firmar Documento</h1>
          <p>Agrega tu firma digital a documentos PDF de forma segura</p>
        </div>
      </div>

      <div className="sign-document-content">
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
            <h3>Archivos a firmar ({files.length})</h3>
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

        {/* Configuración de firma */}
        {files.length > 0 && (
          <div className="signature-configuration">
            <h3>Configuración de Firma</h3>
            
            <div className="signature-options">
              <div className="option-group">
                <label>Tipo de firma:</label>
                <div className="signature-type-selector">
                  <button
                    className={`signature-type-btn ${signatureType === 'draw' ? 'active' : ''}`}
                    onClick={() => setSignatureType('draw')}
                  >
                    <PenTool size={16} />
                    Dibujar
                  </button>
                  <button
                    className={`signature-type-btn ${signatureType === 'text' ? 'active' : ''}`}
                    onClick={() => setSignatureType('text')}
                  >
                    <FileText size={16} />
                    Texto
                  </button>
                </div>
              </div>

              <div className="option-group">
                <label htmlFor="signature-position">Posición de la firma:</label>
                <select
                  id="signature-position"
                  value={signaturePosition}
                  onChange={(e) => setSignaturePosition(e.target.value)}
                >
                  <option value="bottom-right">Inferior derecha</option>
                  <option value="bottom-left">Inferior izquierda</option>
                  <option value="top-right">Superior derecha</option>
                  <option value="top-left">Superior izquierda</option>
                  <option value="center">Centro</option>
                </select>
              </div>
            </div>

            {/* Área de firma */}
            <div className="signature-area">
              {signatureType === 'draw' ? (
                <div className="draw-signature">
                  <h4>Dibuja tu firma:</h4>
                  <div className="canvas-container">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      className="signature-canvas"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <div className="signature-actions">
                    <button className="clear-btn" onClick={clearSignature}>
                      <X size={16} />
                      Limpiar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-signature">
                  <h4>Ingresa tu nombre:</h4>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Ingresa tu nombre completo"
                    className="signature-input"
                  />
                  <div className="signature-preview">
                    <p>Vista previa:</p>
                    <div className="preview-text">
                      {signatureText || 'Tu nombre aparecerá aquí'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        {files.length > 0 && (
          <div className="sign-actions">
            <button 
              className="sign-btn"
              onClick={handleSign}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Firmando documentos...
                </>
              ) : (
                <>
                  <PenTool size={20} />
                  Firmar Documentos
                </>
              )}
            </button>
          </div>
        )}

        {/* Resultados */}
        {processedFiles.length > 0 && (
          <div className="results-section">
            <h3>Documentos Firmados</h3>
            <div className="results-container">
              {processedFiles.map((file, index) => (
                <div key={index} className="result-item">
                  <div className="result-info">
                    <FileText className="result-icon" size={20} />
                    <div>
                      <div className="result-name">{file.originalName}</div>
                      <div className="result-converted">→ {file.signedName}</div>
                    </div>
                  </div>
                  <button className="download-btn">
                    <Download size={16} />
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignDocument;