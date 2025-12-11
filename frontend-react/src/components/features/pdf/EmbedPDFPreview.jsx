import React, { useState, useRef, useCallback } from 'react';
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react';
import { Scroller, ScrollPluginPackage, ScrollStrategy } from '@embedpdf/plugin-scroll/react';
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/react';
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react';
import { TilingLayer, TilingPluginPackage } from '@embedpdf/plugin-tiling/react';
import { ZoomMode, ZoomPluginPackage } from '@embedpdf/plugin-zoom/react';

// Componente simplificado para generar vistas previas con EmbedPDF
const EmbedPDFPreview = ({ 
  file, 
  pageNumber, 
  onPreviewGenerated, 
  width = 200, 
  height = 280 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const embedRef = useRef(null);
  const canvasRef = useRef(null);

  // Registrar plugins de EmbedPDF de forma simplificada
  const pluginRegistration = React.useMemo(() => {
    return createPluginRegistration(
      ViewportPluginPackage,
      ScrollPluginPackage,
      LoaderPluginPackage,
      RenderPluginPackage,
      TilingPluginPackage,
      ZoomPluginPackage
    );
  }, []);

  // Función para capturar vista previa usando canvas
  const capturePreview = useCallback(() => {
    if (!embedRef.current) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Esperar a que el PDF se cargue completamente
      setTimeout(() => {
        const embedElement = embedRef.current;
        
        if (embedElement) {
          // Intentar capturar el contenido del visor
          const viewerElement = embedElement.querySelector('[data-testid="viewer"]') || 
                               embedElement.querySelector('.viewer') || 
                               embedElement.querySelector('canvas') ||
                               embedElement;
          
          if (viewerElement) {
            // Usar html2canvas si está disponible, sino usar método nativo
            if (window.html2canvas) {
              window.html2canvas(viewerElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true
              }).then(canvas => {
                const previewUrl = canvas.toDataURL('image/png');
                onPreviewGenerated(pageNumber, previewUrl);
                setIsGenerating(false);
              }).catch(err => {
                console.error('Error con html2canvas:', err);
                generateCanvasPreview();
              });
            } else {
              generateCanvasPreview();
            }
          } else {
            generateCanvasPreview();
          }
        }
      }, 3000); // Esperar 3 segundos para que cargue
      
    } catch (err) {
      console.error('Error al generar vista previa:', err);
      generateCanvasPreview();
    }
  }, [pageNumber, onPreviewGenerated]);

  // Generar vista previa con canvas nativo como fallback
  const generateCanvasPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    // Dibujar fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Dibujar borde
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Dibujar contenido simulado de página
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(10, 10, width - 20, height - 20);
    
    // Dibujar número de página
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Página ${pageNumber}`, width / 2, height - 20);
    
    // Dibujar título
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Vista previa PDF', width / 2, 30);
    
    // Generar URL de la vista previa
    const previewUrl = canvas.toDataURL('image/png');
    onPreviewGenerated(pageNumber, previewUrl);
    setIsGenerating(false);
  }, [pageNumber, width, height, onPreviewGenerated]);

  // Manejar carga del PDF
  const handleDocumentLoad = useCallback(() => {
    console.log(`Documento cargado para página ${pageNumber}`);
    // Esperar un poco más antes de capturar
    setTimeout(capturePreview, 2000);
  }, [pageNumber, capturePreview]);

  // Manejar errores
  const handleError = useCallback((err) => {
    console.error('Error cargando PDF con EmbedPDF:', err);
    setError('Error al cargar PDF');
    generateCanvasPreview();
  }, [generateCanvasPreview]);

  // Crear URL del archivo
  const fileUrl = React.useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // Limpiar URL al desmontar
  React.useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // Iniciar generación cuando el componente se monte
  React.useEffect(() => {
    if (fileUrl && !isGenerating) {
      setIsGenerating(true);
      // Dar tiempo a que EmbedPDF se inicialice
      setTimeout(capturePreview, 1000);
    }
  }, [fileUrl, capturePreview, isGenerating]);

  return (
    <div className="embed-pdf-preview-container">
      {/* Visor EmbedPDF oculto para generar vista previa */}
      <div 
        ref={embedRef}
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '600px',
          height: '800px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        <EmbedPDF
          file={fileUrl}
          engineRegistration={usePdfiumEngine()}
          pluginRegistration={pluginRegistration}
          onDocumentLoad={handleDocumentLoad}
          onError={handleError}
          initialPage={pageNumber - 1}
        >
          <Viewport>
            <Scroller scrollStrategy={ScrollStrategy.AUTO}>
              <ZoomMode defaultMode="actual-size">
                <RenderLayer
                  renderPage={({ document, width: pageWidth, height: pageHeight, pageIndex, scale }) => (
                    <div key={document?.id} style={{ width: pageWidth, height: pageHeight }}>
                      <RenderLayer
                        pageIndex={pageIndex}
                        style={{ pointerEvents: 'none' }}
                      />
                      <TilingLayer
                        pageIndex={pageIndex}
                        scale={scale}
                        style={{ pointerEvents: 'none' }}
                      />
                    </div>
                  )}
                />
              </ZoomMode>
            </Scroller>
          </Viewport>
        </EmbedPDF>
      </div>

      {/* Canvas para fallback */}
      <canvas 
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Indicador de estado */}
      <div className="preview-status" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 10
      }}>
        {isGenerating && (
          <div>
            <div className="spinner"></div>
            <p>Generando vista previa...</p>
          </div>
        )}
        {error && (
          <div style={{ color: '#dc3545' }}>
            <p>{error}</p>
            <button 
              onClick={generateCanvasPreview}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                marginTop: '5px'
              }}
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .embed-pdf-preview-container {
          position: relative;
          width: ${width}px;
          height: ${height}px;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmbedPDFPreview;