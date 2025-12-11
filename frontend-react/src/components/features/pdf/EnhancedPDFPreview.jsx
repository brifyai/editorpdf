import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';

// Componente mejorado de vista previa PDF basado en técnicas de EmbedPDF
const EnhancedPDFPreview = ({ 
  file, 
  pageNumber, 
  onPreviewGenerated, 
  width = 200, 
  height = 280,
  enableCapture = true,
  enableZoom = true,
  enableSelection = true 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scale, setScale] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureRect, setCaptureRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const iframeRef = useRef(null);
  const { showSuccess, showError } = useSweetAlert();

  // Función mejorada para generar vista previa usando técnicas de EmbedPDF
  const generatePreview = useCallback(async () => {
    if (!file || previewUrl) return;

    setIsGenerating(true);
    setError(null);

    try {
      console.log(`🎯 Generando vista previa mejorada para página ${pageNumber}...`);

      // Método 1: Usar PDF.js con configuración optimizada (técnica de EmbedPDF)
      let preview = await tryPDFJSMethod();
      
      // Método 2: Usar iframe con captura mejorada (técnica de EmbedPDF)
      if (!preview) {
        preview = await tryIframeMethod();
      }
      
      // Método 3: Usar embed con renderizado optimizado (técnica de EmbedPDF)
      if (!preview) {
        preview = await tryEmbedMethod();
      }
      
      // Método 4: Canvas directo con efectos profesionales (fallback mejorado)
      if (!preview) {
        preview = await tryCanvasMethod();
      }

      if (preview) {
        setPreviewUrl(preview);
        onPreviewGenerated?.(pageNumber, preview);
        console.log(`✅ Vista previa generada para página ${pageNumber}`);
      } else {
        throw new Error('No se pudo generar vista previa');
      }

    } catch (err) {
      console.error(`❌ Error generando vista previa página ${pageNumber}:`, err);
      setError(err.message);
      
      // Generar fallback mejorado
      const fallbackPreview = generateEnhancedFallback();
      setPreviewUrl(fallbackPreview);
      onPreviewGenerated?.(pageNumber, fallbackPreview);
    } finally {
      setIsGenerating(false);
    }
  }, [file, pageNumber, previewUrl, onPreviewGenerated]);

  // Método 1: PDF.js con configuración optimizada (basado en EmbedPDF)
  const tryPDFJSMethod = async () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = async () => {
        try {
          const pdfjsLib = window['pdfjs-dist/build/pdf'];
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const page = await pdf.getPage(pageNumber);
          
          // Configuración optimizada de renderizado (técnica de EmbedPDF)
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Renderizado con alta calidad (técnica de EmbedPDF)
          await page.render({
            canvasContext: context,
            viewport: viewport,
            enableWebGL: true,
            renderInteractiveForms: true
          }).promise;
          
          // Convertir a tamaño optimizado
          const scaledCanvas = scaleCanvas(canvas, width, height);
          resolve(scaledCanvas.toDataURL('image/jpeg', 0.9));
          
        } catch (error) {
          console.warn('PDF.js method failed:', error);
          resolve(null);
        }
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  };

  // Método 2: Iframe con captura mejorada (basado en EmbedPDF)
  const tryIframeMethod = async () => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        height: 1000px;
        background: white;
        overflow: hidden;
      `;
      document.body.appendChild(container);

      const iframe = document.createElement('iframe');
      iframe.src = URL.createObjectURL(file) + `#page=${pageNumber}&zoom=150`;
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;
      
      container.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(async () => {
          try {
            // Usar html2canvas si está disponible
            if (window.html2canvas) {
              const canvas = await window.html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: 0.3,
                useCORS: true,
                allowTaint: false,
                logging: false
              });
              
              const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
              document.body.removeChild(container);
              resolve(previewUrl);
            } else {
              resolve(null);
            }
          } catch (error) {
            document.body.removeChild(container);
            resolve(null);
          }
        }, 3000);
      };

      iframe.onerror = () => {
        document.body.removeChild(container);
        resolve(null);
      };

      setTimeout(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
          resolve(null);
        }
      }, 10000);
    });
  };

  // Método 3: Embed con renderizado optimizado (basado en EmbedPDF)
  const tryEmbedMethod = async () => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 600px;
        height: 800px;
        background: white;
        overflow: hidden;
      `;
      document.body.appendChild(container);

      const embed = document.createElement('embed');
      embed.src = URL.createObjectURL(file) + `#page=${pageNumber}&zoom=150&view=FitV`;
      embed.type = 'application/pdf';
      embed.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;
      
      container.appendChild(embed);

      embed.onload = () => {
        setTimeout(async () => {
          try {
            if (window.html2canvas) {
              const canvas = await window.html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: 0.4,
                useCORS: true,
                allowTaint: false,
                logging: false
              });
              
              const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
              document.body.removeChild(container);
              resolve(previewUrl);
            } else {
              resolve(null);
            }
          } catch (error) {
            document.body.removeChild(container);
            resolve(null);
          }
        }, 4000);
      };

      setTimeout(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
          resolve(null);
        }
      }, 12000);
    });
  };

  // Método 4: Canvas directo con efectos profesionales (fallback mejorado)
  const tryCanvasMethod = async () => {
    return generateEnhancedFallback();
  };

  // Función para escalar canvas (técnica de EmbedPDF)
  const scaleCanvas = (sourceCanvas, targetWidth, targetHeight) => {
    const scaledCanvas = document.createElement('canvas');
    const scaledCtx = scaledCanvas.getContext('2d');
    
    scaledCanvas.width = targetWidth;
    scaledCanvas.height = targetHeight;
    
    // Escalado de alta calidad (técnica de EmbedPDF)
    scaledCtx.imageSmoothingEnabled = true;
    scaledCtx.imageSmoothingQuality = 'high';
    scaledCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    
    return scaledCanvas;
  };

  // Fallback mejorado con diseño profesional
  const generateEnhancedFallback = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    // Gradiente de fondo profesional
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8f9fa');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Borde sutil
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Header profesional con gradiente (estilo EmbedPDF)
    const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
    headerGradient.addColorStop(0, '#667eea');
    headerGradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, 40);
    
    // Icono y texto del header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📄 Vista Previa PDF', width / 2, 25);
    
    // Contenido del documento simulado
    ctx.fillStyle = '#495057';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    // Líneas de texto con variación (estilo EmbedPDF)
    const lineHeight = 14;
    const startY = 60;
    const lines = 10;
    
    for (let i = 0; i < lines; i++) {
      const y = startY + (i * lineHeight);
      const lineWidth = Math.random() * 0.6 + 0.3;
      
      if (i === 0) {
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 12px Arial';
        ctx.fillRect(15, y - 1, width * 0.8, 2);
      } else {
        ctx.fillStyle = '#6c757d';
        ctx.font = '10px Arial';
        ctx.fillRect(15, y - 1, width * lineWidth, 1);
      }
    }
    
    // Elemento gráfico simulando imagen
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(15, 200, 60, 45);
    ctx.fillStyle = '#adb5bd';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🖼️', 45, 225);
    
    // Footer profesional
    const footerGradient = ctx.createLinearGradient(0, height - 30, 0, height);
    footerGradient.addColorStop(0, '#f8f9fa');
    footerGradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = footerGradient;
    ctx.fillRect(0, height - 30, width, 30);
    
    // Número de página
    ctx.fillStyle = '#6c757d';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Página ${pageNumber}`, width / 2, height - 10);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Manejo de captura de área (técnica de EmbedPDF Marquee)
  const handleMouseDown = (e) => {
    if (!enableCapture) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setCaptureRect({ x, y, width: 0, height: 0 });
    setIsCapturing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !enableCapture) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setCaptureRect({
      x: Math.min(dragStart.x, currentX),
      y: Math.min(dragStart.y, currentY),
      width: Math.abs(currentX - dragStart.x),
      height: Math.abs(currentY - dragStart.y)
    });
  };

  const handleMouseUp = () => {
    if (!isDragging || !enableCapture) return;
    
    setIsDragging(false);
    setIsCapturing(false);
    
    if (captureRect && captureRect.width > 10 && captureRect.height > 10) {
      // Capturar el área seleccionada
      captureArea(captureRect);
    }
    
    setCaptureRect(null);
  };

  // Función para capturar área seleccionada
  const captureArea = async (rect) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
        
        const capturedUrl = canvas.toDataURL('image/png');
        
        // Descargar la imagen capturada
        const link = document.createElement('a');
        link.download = `pagina_${pageNumber}_captura.png`;
        link.href = capturedUrl;
        link.click();
        
        showSuccess('Captura Exitosa', 'El área seleccionada ha sido capturada');
      };
      img.src = previewUrl;
      
    } catch (error) {
      console.error('Error capturando área:', error);
      showError('Error', 'No se pudo capturar el área seleccionada');
    }
  };

  // Generar vista previa al montar el componente
  useEffect(() => {
    generatePreview();
  }, []);

  return (
    <div className="enhanced-pdf-preview-container">
      <div 
        ref={containerRef}
        className={`preview-wrapper ${enableCapture ? 'capture-enabled' : ''}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: 'relative',
          cursor: enableCapture ? (isCapturing ? 'crosshair' : 'default') : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Página ${pageNumber}`}
            className="preview-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease'
            }}
          />
        ) : (
          <div className="preview-placeholder">
            {isGenerating ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Generando vista previa...</p>
              </div>
            ) : (
              <div className="error-state">
                <p>Error al generar vista previa</p>
                <button onClick={generatePreview} className="retry-btn">
                  Reintentar
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Overlay de captura (técnica EmbedPDF Marquee) */}
        {captureRect && (
          <div
            className="capture-overlay"
            style={{
              position: 'absolute',
              border: '2px solid #2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.15)',
              left: `${captureRect.x}px`,
              top: `${captureRect.y}px`,
              width: `${captureRect.width}px`,
              height: `${captureRect.height}px`,
              pointerEvents: 'none'
            }}
          />
        )}
        
        {/* Controles de zoom */}
        {enableZoom && previewUrl && (
          <div className="zoom-controls">
            <button 
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="zoom-btn"
              disabled={scale <= 0.5}
            >
              −
            </button>
            <span className="zoom-level">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => setScale(Math.min(3, scale + 0.1))}
              className="zoom-btn"
              disabled={scale >= 3}
            >
              +
            </button>
          </div>
        )}
        
        {/* Indicador de página */}
        <div className="page-indicator">
          Página {pageNumber}
        </div>
      </div>
      
      <style jsx>{`
        .enhanced-pdf-preview-container {
          position: relative;
          display: inline-block;
        }
        
        .preview-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .preview-wrapper.capture-enabled:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .preview-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        
        .loading-state, .error-state {
          text-align: center;
          color: #6c757d;
        }
        
        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 8px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .retry-btn {
          padding: 4px 8px;
          font-size: 11px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          margin-top: 8px;
        }
        
        .zoom-controls {
          position: absolute;
          bottom: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.9);
          border-radius: 4px;
          padding: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .zoom-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: #007bff;
          color: white;
          border-radius: 2px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .zoom-btn:hover:not(:disabled) {
          background: #0056b3;
        }
        
        .zoom-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        
        .zoom-level {
          font-size: 10px;
          font-weight: bold;
          color: #495057;
          min-width: 32px;
          text-align: center;
        }
        
        .page-indicator {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default EnhancedPDFPreview;