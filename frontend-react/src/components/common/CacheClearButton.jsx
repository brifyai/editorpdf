import React, { useState } from 'react';
import { clearAllCache } from '../../utils/cacheManager';

/**
 * Componente para limpiar la caché de la aplicación
 * 
 * Este componente muestra un botón que, al hacer clic, limpia toda la caché
 * de la aplicación y recarga la página para asegurar que los cambios se apliquen.
 */
const CacheClearButton = ({ 
  buttonText = 'Limpiar Caché', 
  buttonClassName = 'cache-clear-btn',
  showConfirmation = true,
  confirmationMessage = '¿Estás seguro de que quieres limpiar toda la caché? Esto recargará la página.',
  onSuccess = null,
  onError = null
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClearCache = async () => {
    // Mostrar confirmación si está habilitada
    if (showConfirmation) {
      const confirmed = window.confirm(confirmationMessage);
      if (!confirmed) return;
    }

    try {
      setIsLoading(true);
      await clearAllCache();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al limpiar la caché:', error);
      
      if (onError) {
        onError(error);
      } else {
        alert('Error al limpiar la caché. Por favor, intenta recargar la página manualmente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={buttonClassName}
      onClick={handleClearCache}
      disabled={isLoading}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.2s ease',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {isLoading ? (
        <>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          Limpiando...
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
          {buttonText}
        </>
      )}
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default CacheClearButton;