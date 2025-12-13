import { useState, useEffect, useRef } from 'react';

/**
 * Hook para implementar pull-to-refresh en móviles
 * @param {Function} onRefresh - Función a ejecutar al hacer pull-to-refresh
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y refs del hook
 */
export const usePullToRefresh = (onRefresh, options = {}) => {
  const {
    threshold = 100, // Distancia mínima para activar refresh (px)
    maxDistance = 150, // Distancia máxima que se puede pull (px)
    resistance = 2.5, // Resistencia al pull (mayor = más difícil)
  } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    // Solo activar en móviles
    if (window.innerWidth >= 769) return;

    const handleTouchStart = (e) => {
      // Solo iniciar si estamos en la parte superior de la página
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;

      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, (currentY.current - startY.current) / resistance);

      if (distance > 0) {
        e.preventDefault(); // Prevenir scroll normal
        setPullDistance(Math.min(distance, maxDistance));
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;

      isDragging.current = false;
      setIsPulling(false);

      // Si se superó el umbral, ejecutar refresh
      if (pullDistance >= threshold) {
        executeRefresh();
      } else {
        // Si no, resetear posición
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, threshold, maxDistance, resistance]);

  const executeRefresh = async () => {
    setIsRefreshing(true);
    setPullDistance(0);

    try {
      await onRefresh();
    } catch (error) {
      console.error('Error en pull-to-refresh:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Pequeña pausa para mostrar éxito
    }
  };

  const getPullIndicatorStyle = () => {
    const opacity = Math.min(pullDistance / threshold, 1);
    const scale = Math.min(pullDistance / threshold, 1);
    
    return {
      opacity,
      transform: `translateY(${Math.min(pullDistance - 60, 0)}px) scale(${scale})`,
      transition: isPulling ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
    };
  };

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    getPullIndicatorStyle,
  };
};
