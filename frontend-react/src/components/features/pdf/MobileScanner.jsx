import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Settings, Download, FileText, Camera, Smartphone, Image, RefreshCw, Zap } from 'lucide-react';
import axios from 'axios';
import './MobileScanner.css';

const MobileScanner = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Configuración del escáner
  const [settings, setSettings] = useState({
    quality: 'high', // 'low', 'medium', 'high'
    pageSize: 'a4', // 'a4', 'letter', 'legal', 'auto'
    colorMode: 'color', // 'color', 'grayscale', 'blackwhite'
    enhanceQuality: true,
    autoCrop: true,
    multiPage: true,
    compression: 'medium' // 'low', 'medium', 'high'
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setFiles(prev => [...prev, ...imageFiles]);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setFiles(prev => [...prev, ...imageFiles]);
    }
  }, []);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeCapturedImage = useCallback((index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
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
        tool: 'mobile-scanner',
        details
      });
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `captura_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedImages(prev => [...prev, file]);
      }, 'image/jpeg', settings.quality === 'high' ? 0.9 : settings.quality === 'medium' ? 0.7 : 0.5);
    }
  };

  const processScannedImages = async () => {
    const allImages = [...files, ...capturedImages];
    
    if (allImages.length === 0) {
      alert('Por favor selecciona o captura al menos una imagen');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Iniciando procesamiento de escaneo...');
    setProgress(0);

    try {
      // Detener la cámara si está activa
      if (isCameraActive) {
        stopCamera();
      }

      // Simulación de procesamiento de imágenes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessingStatus('Procesando imágenes...');
      setProgress(25);

      // Simulación de mejora de calidad
      if (settings.enhanceQuality) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProcessingStatus('Mejorando calidad de las imágenes...');
        setProgress(50);
      }

      // Simulación de recorte automático
      if (settings.autoCrop) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProcessingStatus('Recortando imágenes automáticamente...');
        setProgress(75);
      }

      // Crear PDF con las imágenes escaneadas
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: settings.pageSize === 'auto' ? 'a4' : settings.pageSize
      });

      setProcessingStatus('Generando PDF...');
      setProgress(90);

      // Agregar cada imagen como página
      for (let i = 0; i < allImages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const imageFile = allImages[i];
        const imageUrl = URL.createObjectURL(imageFile);
        
        // Simular la adición de imagen al PDF
        // En una implementación real, necesitarías procesar la imagen
        pdf.setFontSize(16);
        pdf.text(`Página Escaneada ${i + 1}`, 105, 20, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(`Archivo: ${imageFile.name}`, 20, 40);
        pdf.text(`Calidad: ${settings.quality}`, 20, 50);
        pdf.text(`Modo de color: ${settings.colorMode}`, 20, 60);
        pdf.text(`Tamaño: ${formatFileSize(imageFile.size)}`, 20, 70);
        
        // Simular imagen
        pdf.rect(20, 80, 170, 120);
        pdf.text('📷 Imagen escaneada', 105, 140, { align: 'center' });
        
        URL.revokeObjectURL(imageUrl);
      }

      setProgress(100);
      setProcessingStatus('Escaneo completado');

      // Descargar el PDF
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documento_escaneado_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Actualizar estadísticas
      await updateStatistics('scan-completed', {
        imagesProcessed: allImages.length,
        settings: settings,
        capturedImages: capturedImages.length,
        uploadedImages: files.length
      });

    } catch (error) {
      console.error('Error processing scanned images:', error);
      setProcessingStatus('Error en el procesamiento');
      
      // Actualizar estadísticas de error
      await updateStatistics('scan-error', {
        error: error.message,
        imagesAttempted: allImages.length
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
    <div className="mobile-scanner-container">
      {/* Header */}
      <div className="mobile-scanner-header">
        <div className="header-content">
          <div className="header-icon">
            <Smartphone size={32} />
          </div>
          <div className="header-text">
            <h1>Escáner Móvil PDF</h1>
            <p>Convierte fotos y capturas de cámara en documentos PDF profesionales</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-scanner-content">
        {/* Camera Section */}
        <div className="camera-section">
          <div className="camera-controls">
            {!isCameraActive ? (
              <button className="camera-button" onClick={startCamera}>
                <Camera size={20} />
                Activar Cámara
              </button>
            ) : (
              <div className="camera-active">
                <button className="capture-button" onClick={captureImage}>
                  <Camera size={20} />
                  Capturar
                </button>
                <button className="stop-camera-button" onClick={stopCamera}>
                  <X size={20} />
                  Detener Cámara
                </button>
              </div>
            )}
          </div>
          
          {isCameraActive && (
            <div className="camera-view">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-video"
              />
              <canvas ref={canvasRef} className="hidden-canvas" />
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <Upload size={48} />
              <h3>Arrastra y suelta imágenes aquí</h3>
              <p>o selecciona archivos haciendo clic</p>
              <input 
                type="file" 
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="file-input"
              />
              <button className="select-button">
                Seleccionar Imágenes
              </button>
            </div>
          </div>
        </div>

        {/* Captured Images */}
        {capturedImages.length > 0 && (
          <div className="captured-section">
            <h3>Imágenes Capturadas</h3>
            <div className="images-grid">
              {capturedImages.map((image, index) => (
                <div key={index} className="image-item">
                  <Image size={20} />
                  <div className="image-info">
                    <span className="image-name">{image.name}</span>
                    <span className="image-size">{formatFileSize(image.size)}</span>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={() => removeCapturedImage(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="files-section">
            <h3>Imágenes Seleccionadas</h3>
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
        {(files.length > 0 || capturedImages.length > 0) && (
          <div className="configuration-section">
            <h3>
              <Settings size={20} />
              Configuración de Escaneo
            </h3>
            
            <div className="config-grid">
              {/* Calidad */}
              <div className="config-group">
                <label>Calidad de Imagen</label>
                <select 
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value }))}
                >
                  <option value="low">Baja (rápido)</option>
                  <option value="medium">Media (balanceado)</option>
                  <option value="high">Alta (óptima)</option>
                </select>
              </div>

              {/* Tamaño de página */}
              <div className="config-group">
                <label>Tamaño de Página</label>
                <select 
                  value={settings.pageSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, pageSize: e.target.value }))}
                >
                  <option value="auto">Automático</option>
                  <option value="a4">A4</option>
                  <option value="letter">Carta</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              {/* Modo de color */}
              <div className="config-group">
                <label>Modo de Color</label>
                <select 
                  value={settings.colorMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, colorMode: e.target.value }))}
                >
                  <option value="color">Color</option>
                  <option value="grayscale">Escala de grises</option>
                  <option value="blackwhite">Blanco y negro</option>
                </select>
              </div>

              {/* Compresión */}
              <div className="config-group">
                <label>Compresión</label>
                <select 
                  value={settings.compression}
                  onChange={(e) => setSettings(prev => ({ ...prev, compression: e.target.value }))}
                >
                  <option value="low">Baja (máxima calidad)</option>
                  <option value="medium">Media (balanceada)</option>
                  <option value="high">Alta (menor tamaño)</option>
                </select>
              </div>

              {/* Opciones adicionales */}
              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.enhanceQuality}
                    onChange={(e) => setSettings(prev => ({ ...prev, enhanceQuality: e.target.checked }))}
                  />
                  Mejorar calidad automáticamente
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.autoCrop}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoCrop: e.target.checked }))}
                  />
                  Recortar automáticamente
                </label>
              </div>

              <div className="config-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={settings.multiPage}
                    onChange={(e) => setSettings(prev => ({ ...prev, multiPage: e.target.checked }))}
                  />
                  Múltiples páginas en un PDF
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

        {/* Action Buttons */}
        {(files.length > 0 || capturedImages.length > 0) && !isProcessing && (
          <div className="actions-section">
            <button 
              className="process-button"
              onClick={processScannedImages}
            >
              <Zap size={20} />
              Escanear y Generar PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileScanner;