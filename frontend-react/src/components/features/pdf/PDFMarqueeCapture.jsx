import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSweetAlert } from '../../../hooks/useSweetAlert';

// Sistema de captura de área PDF basado en EmbedPDF Marquee Capture
const PDFMarqueeCapture = ({ 
  pdfContainer,
  onAreaCaptured,
  onCaptureStart,
  onCaptureEnd,
  enabled = true,
  minSize = 10,
  strokeColor = 'rgba(33, 150, 243, 0.8)',
  fillColor = 'rgba(33, 150, 243, 0.15)',
  strokeWidth = 2,
  showHandles = true
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureRect, setCaptureRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState(null);
  
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const { showSuccess, showError } = useSweetAlert();

  // Calcular rectángulo de captura
  const calculateRect = useCallback((start, current) => {
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const width = Math.abs(current.x - start.x);
    const height = Math.abs(current.y - start.y);
    
    return { x, y, width, height };
  }, []);

  // Verificar si el punto está dentro del rectángulo
  const isPointInRect = useCallback((point, rect) => {
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
  }, []);

  // Obtener handle de redimensionamiento
  const getResizeHandle = useCallback((point, rect) => {
    if (!showHandles) return null;
    
    const handleSize = 8;
    const handles = {
      'nw': { x: rect.x, y: rect.y },
      'ne': { x: rect.x + rect.width, y: rect.y },
      'sw': { x: rect.x, y: rect.y + rect.height },
      'se': { x: rect.x + rect.width, y: rect.y + rect.height },
      'n': { x: rect.x + rect.width / 2, y: rect.y },
      's': { x: rect.x + rect.width / 2, y: rect.y + rect.height },
      'w': { x: rect.x, y: rect.y + rect.height / 2 },
      'e': { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
    };

    for (const [handle, pos] of Object.entries(handles)) {
      if (Math.abs(point.x - pos.x) <= handleSize && Math.abs(point.y - pos.y) <= handleSize) {
        return handle;
      }
    }
    
    return isPointInRect(point, rect) ? 'move' : null;
  }, [showHandles, isPointInRect]);

  // Iniciar captura
  const handleMouseDown = useCallback((e) => {
    if (!enabled) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Verificar si estamos redimensionando una captura existente
    if (captureRect) {
      const handle = getResizeHandle(point, captureRect);
      if (handle) {
        setActiveHandle(handle);
        setIsDragging(true);
        setStartPoint(point);
        setCurrentPoint(point);
        onCaptureStart?.();
        return;
      }
    }

    // Iniciar nueva captura
    setIsCapturing(true);
    setIsDragging(true);
    setStartPoint(point);
    setCurrentPoint(point);
    setCaptureRect(null);
    onCaptureStart?.();
  }, [enabled, captureRect, getResizeHandle, onCaptureStart]);

  // Actualizar captura durante el arrastre
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, rect.height))
    };

    setCurrentPoint(point);

    if (isCapturing) {
      // Nueva captura
      const newRect = calculateRect(startPoint, point);
      setCaptureRect(newRect);
    } else if (captureRect && activeHandle) {
      // Redimensionar captura existente
      const resizedRect = resizeRect(captureRect, activeHandle, startPoint, point);
      setCaptureRect(resizedRect);
    }
  }, [isDragging, isCapturing, captureRect, activeHandle, startPoint, calculateRect]);

  // Finalizar captura
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    setIsCapturing(false);
    setActiveHandle(null);

    if (captureRect && captureRect.width >= minSize && captureRect.height >= minSize) {
      onAreaCaptured?.(captureRect);
      showSuccess('Captura Exitosa', `Área capturada: ${Math.round(captureRect.width)}×${Math.round(captureRect.height)}px`);
    } else {
      setCaptureRect(null);
      if (captureRect && (captureRect.width < minSize || captureRect.height < minSize)) {
        showError('Captura Cancelada', `El área debe ser mayor de ${minSize}px`);
      }
    }

    onCaptureEnd?.();
  }, [isDragging, captureRect, minSize, onAreaCaptured, onCaptureEnd, showSuccess, showError]);

  // Redimensionar rectángulo
  const resizeRect = useCallback((rect, handle, start, current) => {
    const deltaX = current.x - start.x;
    const deltaY = current.y - start.y;
    
    const newRect = { ...rect };

    switch (handle) {
      case 'nw':
        newRect.x += deltaX;
        newRect.y += deltaY;
        newRect.width -= deltaX;
        newRect.height -= deltaY;
        break;
      case 'ne':
        newRect.y += deltaY;
        newRect.width += deltaX;
        newRect.height -= deltaY;
        break;
      case 'sw':
        newRect.x += deltaX;
        newRect.width -= deltaX;
        newRect.height += deltaY;
        break;
      case 'se':
        newRect.width += deltaX;
        newRect.height += deltaY;
        break;
      case 'n':
        newRect.y += deltaY;
        newRect.height -= deltaY;
        break;
      case 's':
        newRect.height += deltaY;
        break;
      case 'w':
        newRect.x += deltaX;
        newRect.width -= deltaX;
        break;
      case 'e':
        newRect.width += deltaX;
        break;
      case 'move':
        newRect.x += deltaX;
        newRect.y += deltaY;
        break;
    }

    // Asegurar dimensiones positivas
    if (newRect.width < 0) {
      newRect.x += newRect.width;
      newRect.width = Math.abs(newRect.width);
    }
    if (newRect.height < 0) {
      newRect.y += newRect.height;
      newRect.height = Math.abs(newRect.height);
    }

    return newRect;
  }, []);

  // Cancelar captura con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (isCapturing || isDragging)) {
        setIsCapturing(false);
        setIsDragging(false);
        setActiveHandle(null);
        setCaptureRect(null);
        onCaptureEnd?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCapturing, isDragging, onCaptureEnd]);

  // Actualizar cursor según la posición
  const updateCursor = useCallback((e) => {
    if (!enabled || !showHandles) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (captureRect) {
      const handle = getResizeHandle(point, captureRect);
      const cursors = {
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize',
        'n': 'n-resize',
        's': 's-resize',
        'w': 'w-resize',
        'e': 'e-resize',
        'move': 'move'
      };
      
      containerRef.current.style.cursor = handle ? cursors[handle] : 'crosshair';
    } else {
      containerRef.current.style.cursor = 'crosshair';
    }
  }, [enabled, showHandles, captureRect, getResizeHandle]);

  // Capturar área específica del PDF
  const capturePDFArea = useCallback(async (rect) => {
    if (!pdfContainer) return null;

    try {
      // Usar html2canvas si está disponible
      if (window.html2canvas) {
        const canvas = await window.html2canvas(pdfContainer, {
          backgroundColor: '#ffffff',
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          useCORS: true,
          allowTaint: false,
          logging: false,
          scale: 2 // Mayor calidad
        });

        return canvas.toDataURL('image/png', 0.9);
      }

      // Fallback: usar canvas API directamente
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Intentar capturar del contenedor
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      tempCanvas.width = pdfContainer.offsetWidth;
      tempCanvas.height = pdfContainer.offsetHeight;
      
      // Dibujar el contenido del contenedor (simplificado)
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Extraer el área seleccionada
      ctx.drawImage(
        tempCanvas,
        rect.x, rect.y, rect.width, rect.height,
        0, 0, rect.width, rect.height
      );
      
      return canvas.toDataURL('image/png', 0.9);
      
    } catch (error) {
      console.error('Error capturando área PDF:', error);
      showError('Error', 'No se pudo capturar el área seleccionada');
      return null;
    }
  }, [pdfContainer, showError]);

  // Manejar captura final
  const handleAreaCaptured = useCallback(async (rect) => {
    const imageData = await capturePDFArea(rect);
    if (imageData) {
      onAreaCaptured?.(rect, imageData);
    }
  }, [capturePDFArea, onAreaCaptured]);

  // Limpiar captura
  const clearCapture = useCallback(() => {
    setCaptureRect(null);
    setIsCapturing(false);
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  // Renderizar handles de redimensionamiento
  const renderHandles = () => {
    if (!showHandles || !captureRect) return null;

    const handles = [
      { type: 'nw', x: captureRect.x, y: captureRect.y },
      { type: 'ne', x: captureRect.x + captureRect.width, y: captureRect.y },
      { type: 'sw', x: captureRect.x, y: captureRect.y + captureRect.height },
      { type: 'se', x: captureRect.x + captureRect.width, y: captureRect.y + captureRect.height },
      { type: 'n', x: captureRect.x + captureRect.width / 2, y: captureRect.y },
      { type: 's', x: captureRect.x + captureRect.width / 2, y: captureRect.y + captureRect.height },
      { type: 'w', x: captureRect.x, y: captureRect.y + captureRect.height / 2 },
      { type: 'e', x: captureRect.x + captureRect.width, y: captureRect.y + captureRect.height / 2 }
    ];

    return handles.map(handle => (
      <div
        key={handle.type}
        className={`resize-handle handle-${handle.type}`}
        style={{
          position: 'absolute',
          left: `${handle.x - 4}px`,
          top: `${handle.y - 4}px`,
          width: '8px',
          height: '8px',
          backgroundColor: strokeColor,
          border: '1px solid white',
          borderRadius: '50%',
          cursor: `${handle.type}-resize`,
          zIndex: 1001
        }}
      />
    ));
  };

  return (
    <div 
      ref={containerRef}
      className="pdf-marquee-capture-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: enabled ? 'crosshair' : 'default'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => {
        handleMouseMove(e);
        updateCursor(e);
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Overlay de captura */}
      {enabled && (
        <div 
          ref={overlayRef}
          className="capture-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Rectángulo de captura */}
      {captureRect && (
        <div
          className="capture-rectangle"
          style={{
            position: 'absolute',
            left: `${captureRect.x}px`,
            top: `${captureRect.y}px`,
            width: `${captureRect.width}px`,
            height: `${captureRect.height}px`,
            border: `${strokeWidth}px solid ${strokeColor}`,
            backgroundColor: fillColor,
            pointerEvents: 'none',
            zIndex: 999,
            boxSizing: 'border-box'
          }}
        >
          {/* Handles de redimensionamiento */}
          {renderHandles()}
          
          {/* Información de dimensión */}
          <div
            className="capture-info"
            style={{
              position: 'absolute',
              top: '-25px',
              left: '0',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              whiteSpace: 'nowrap'
            }}
          >
            {Math.round(captureRect.width)} × {Math.round(captureRect.height)}px
          </div>
        </div>
      )}

      {/* Controles flotantes */}
      {captureRect && (
        <div
          className="capture-controls"
          style={{
            position: 'absolute',
            top: `${captureRect.y + captureRect.height + 10}px`,
            left: `${captureRect.x}px`,
            display: 'flex',
            gap: '8px',
            zIndex: 1002
          }}
        >
          <button
            className="capture-btn capture-confirm"
            onClick={() => handleAreaCaptured(captureRect)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            ✅ Capturar
          </button>
          <button
            className="capture-btn capture-cancel"
            onClick={clearCapture}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            ❌ Cancelar
          </button>
        </div>
      )}

      <style jsx>{`
        .pdf-marquee-capture-container {
          user-select: none;
        }
        
        .resize-handle {
          transition: transform 0.1s ease;
        }
        
        .resize-handle:hover {
          transform: scale(1.2);
        }
        
        .capture-btn {
          transition: background-color 0.2s ease;
        }
        
        .capture-btn:hover {
          opacity: 0.8;
        }
        
        .capture-rectangle {
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PDFMarqueeCapture;