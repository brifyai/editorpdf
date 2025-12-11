import { useCallback } from 'react';
import Swal from 'sweetalert2';

// Hook personalizado para SweetAlert2
export const useSweetAlert = () => {
  // Alerta de éxito
  const showSuccess = useCallback((title, text) => {
    return Swal.fire({
      icon: 'success',
      title: title || '¡Éxito!',
      text: text || '',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }, []);

  // Alerta de error
  const showError = useCallback((title, text) => {
    return Swal.fire({
      icon: 'error',
      title: title || 'Error',
      text: text || '',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#ef4444'
    });
  }, []);

  // Alerta de advertencia
  const showWarning = useCallback((title, text) => {
    return Swal.fire({
      icon: 'warning',
      title: title || 'Advertencia',
      text: text || '',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b'
    });
  }, []);

  // Alerta de información
  const showInfo = useCallback((title, text) => {
    return Swal.fire({
      icon: 'info',
      title: title || 'Información',
      text: text || '',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3b82f6'
    });
  }, []);

  // Confirmación
  const showConfirm = useCallback((title, text, confirmText = 'Sí', cancelText = 'Cancelar') => {
    return Swal.fire({
      title: title || '¿Estás seguro?',
      text: text || '',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    });
  }, []);

  // Alerta de carga
  const showLoading = useCallback((title = 'Procesando...', text = 'Por favor espera') => {
    return Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }, []);

  // Cerrar todas las alertas
  const closeAll = useCallback(() => {
    Swal.close();
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showLoading,
    closeAll
  };
};

export default useSweetAlert;