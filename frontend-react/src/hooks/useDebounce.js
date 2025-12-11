import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce - retrasa la ejecución de una función
 * @param {*} value - Valor a debounce
 * @param {number} delay - Retraso en milisegundos
 * @returns {*} - Valor debounced
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Actualizar el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancelar el timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;