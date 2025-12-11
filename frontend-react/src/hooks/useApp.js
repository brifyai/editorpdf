import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

/**
 * Hook personalizado para acceder al contexto de la aplicación
 * @returns {Object} - Objeto con métodos y estado de la aplicación
 */
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  
  return context;
};

export default useApp;