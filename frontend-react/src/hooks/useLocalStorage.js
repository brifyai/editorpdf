import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar localStorage con sincronización automática
 * @param {string} key - Clave del localStorage
 * @param {*} initialValue - Valor inicial si no existe en localStorage
 * @returns {[*, function]} - [valor, función para actualizar]
 */
export const useLocalStorage = (key, initialValue) => {
  // Obtener valor inicial del localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = (value) => {
    try {
      // Permitir que value sea una función para tener la misma API que useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;