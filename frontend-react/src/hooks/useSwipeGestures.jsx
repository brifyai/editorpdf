import { useState, useEffect, useRef } from 'react';

/**
 * Hook para detectar gestos táctiles (swipe) en móviles
 * @param {Object} options - Configuración de gestos
 * @returns {Object} Estado y handlers de gestos
 */
export const useSwipeGestures = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50, // Mínima distancia para considerar un swipe (px)
    velocity = 0.3, // Velocidad mínima para considerar un swipe
  } = options;

  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    // Solo activar en móviles
    if (window.innerWidth >= 769) return;

    const handleTouchStart = (e) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      currentX.current = startX.current;
      currentY.current = startY.current;
      startTime.current = Date.now();
      setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
      if (!isSwiping) return;
      
      currentX.current = e.touches[0].clientX;
      currentY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;

      const deltaX = currentX.current - startX.current;
      const deltaY = currentY.current - startY.current;
      const deltaTime = Date.now() - startTime.current;
      
      // Calcular velocidad (px/ms)
      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Determinar dirección del swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Swipe horizontal
        if (Math.abs(deltaX) > threshold && velocityX > velocity) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // Swipe vertical
        if (Math.abs(deltaY) > threshold && velocityY > velocity) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      setIsSwiping(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocity, isSwiping]);

  return {
    isSwiping,
  };
};

/**
 * Hook específico para swipe del menú lateral
 * @param {Function} onOpen - Callback al hacer swipe right
 * @param {Function} onClose - Callback al hacer swipe left
 * @returns {Object} Estado del swipe
 */
export const useSidebarSwipe = (onOpen, onClose) => {
  return useSwipeGestures({
    onSwipeRight: () => {
      // Solo abrir si estamos cerca del borde izquierdo
      if (window.innerWidth < 769 && window.scrollX < 50) {
        onOpen();
      }
    },
    onSwipeLeft: () => {
      // Solo cerrar si el menú está abierto
      if (window.innerWidth < 769) {
        onClose();
      }
    },
    threshold: 50,
    velocity: 0.3,
  });
};