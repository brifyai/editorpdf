import axios from 'axios';
import {
  normalizeError,
  showErrorToUser,
  withRetry,
  isRetryableError
} from '../utils/errorHandler';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalizar el error usando nuestro manejador de errores
    const normalizedError = normalizeError(error);
    
    // Mostrar error al usuario (sin mostrar el toast automáticamente)
    showErrorToUser(normalizedError, { showToast: false });
    
    // Rechazar la promesa con el error normalizado
    return Promise.reject(normalizedError);
  }
);

// Función wrapper para reintentos automáticos
const withRetryWrapper = async (apiCall, options = {}) => {
  return withRetry(apiCall, {
    maxRetries: options.maxRetries || 2,
    delay: options.delay || 1000,
    backoff: options.backoff || 2,
    onRetry: (error, attempt) => {
      console.warn(`Reintentando solicitud (intento ${attempt}):`, error.message);
    }
  });
};

// Servicios de configuración de IA
export const aiConfigurationService = {
  // Guardar configuración de IA
  saveConfiguration: async (userId, config) => {
    const apiCall = async () => {
      const response = await api.post('/save-ai-config', {
        user_id: userId,
        ...config
      });
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 3 });
    } catch (error) {
      console.error('Error saving AI configuration:', error);
      throw error;
    }
  },

  // Obtener configuración de IA
  getConfiguration: async (userId) => {
    const apiCall = async () => {
      const response = await api.get(`/get-ai-config/${userId}`);
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 2 });
    } catch (error) {
      console.error('Error getting AI configuration:', error);
      throw error;
    }
  },

  // Probar conexión con APIs de IA
  testConnection: async () => {
    const apiCall = async () => {
      const response = await api.get('/ai-status');
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 2 });
    } catch (error) {
      console.error('Error testing AI connection:', error);
      throw error;
    }
  }
};

// Servicios de trabajos batch
export const batchJobsService = {
  // Obtener todos los trabajos batch del usuario
  getBatchJobs: async (filters = {}) => {
    const apiCall = async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/batch-jobs?${params.toString()}`);
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 2 });
    } catch (error) {
      console.error('Error getting batch jobs:', error);
      throw error;
    }
  },

  // Obtener un trabajo batch específico
  getBatchJob: async (jobId) => {
    const apiCall = async () => {
      const response = await api.get(`/batch-jobs/${jobId}`);
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 2 });
    } catch (error) {
      console.error('Error getting batch job:', error);
      throw error;
    }
  },

  // Crear un nuevo trabajo batch
  createBatchJob: async (jobData) => {
    const apiCall = async () => {
      const formData = new FormData();
      
      // Agregar datos del trabajo
      Object.entries(jobData).forEach(([key, value]) => {
        if (key !== 'files') {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        }
      });

      // Agregar archivos
      if (jobData.files && jobData.files.length > 0) {
        jobData.files.forEach(file => {
          formData.append('files', file);
        });
      }

      const response = await api.post('/batch-jobs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 3 });
    } catch (error) {
      console.error('Error creating batch job:', error);
      throw error;
    }
  },

  // Actualizar un trabajo batch
  updateBatchJob: async (jobId, updateData) => {
    const apiCall = async () => {
      const response = await api.put(`/batch-jobs/${jobId}`, updateData);
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 2 });
    } catch (error) {
      console.error('Error updating batch job:', error);
      throw error;
    }
  },

  // Pausar o reanudar un trabajo batch
  toggleBatchJob: async (jobId) => {
    const apiCall = async () => {
      const response = await api.patch(`/batch-jobs/${jobId}/toggle`);
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 2 });
    } catch (error) {
      console.error('Error toggling batch job:', error);
      throw error;
    }
  },

  // Cancelar un trabajo batch
  cancelBatchJob: async (jobId) => {
    const apiCall = async () => {
      const response = await api.delete(`/batch-jobs/${jobId}`);
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 2 });
    } catch (error) {
      console.error('Error cancelling batch job:', error);
      throw error;
    }
  },

  // Obtener estadísticas de trabajos batch
  getBatchJobsStats: async () => {
    const apiCall = async () => {
      const response = await api.get('/batch-jobs/stats/summary');
      return response.data;
    };
    
    try {
      return await withRetryWrapper(apiCall, { maxRetries: 2 });
    } catch (error) {
      console.error('Error getting batch jobs stats:', error);
      throw error;
    }
  }
};

// Servicios de exportación
export const exportService = {
  // Exportar a PDF
  exportToPDF: async (documentId, options = {}) => {
    try {
      const response = await api.post('/export/pdf', {
        documentId,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  },

  // Exportar a DOCX
  exportToDOCX: async (documentId, options = {}) => {
    try {
      const response = await api.post('/export/docx', {
        documentId,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      throw error;
    }
  },

  // Exportar a TXT
  exportToTXT: async (documentId, options = {}) => {
    try {
      const response = await api.post('/export/txt', {
        documentId,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to TXT:', error);
      throw error;
    }
  },

  // Verificar estado de exportación
  getExportStatus: async (exportId) => {
    try {
      const response = await api.get(`/export/status/${exportId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting export status:', error);
      throw error;
    }
  },

  // Descargar archivo exportado
  downloadExport: async (exportId) => {
    try {
      const response = await api.get(`/export/download/${exportId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  }
};

// Servicios de ayuda y soporte
export const helpService = {
  // Obtener artículos de ayuda
  getHelpArticles: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/help/articles?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting help articles:', error);
      throw error;
    }
  },

  // Obtener un artículo de ayuda específico
  getHelpArticle: async (articleId) => {
    try {
      const response = await api.get(`/help/articles/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting help article:', error);
      throw error;
    }
  },

  // Crear un ticket de soporte
  createSupportTicket: async (ticketData) => {
    try {
      const response = await api.post('/help/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  },

  // Obtener tickets de soporte del usuario
  getSupportTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/help/tickets?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting support tickets:', error);
      throw error;
    }
  },

  // Obtener un ticket de soporte específico
  getSupportTicket: async (ticketId) => {
    try {
      const response = await api.get(`/help/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting support ticket:', error);
      throw error;
    }
  },

  // Agregar mensaje a un ticket
  addTicketMessage: async (ticketId, message) => {
    try {
      const response = await api.post(`/help/tickets/${ticketId}/messages`, {
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error adding ticket message:', error);
      throw error;
    }
  },

  // Cerrar un ticket
  closeTicket: async (ticketId) => {
    try {
      const response = await api.patch(`/help/tickets/${ticketId}/close`);
      return response.data;
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw error;
    }
  },

  // Obtener categorías de ayuda
  getHelpCategories: async () => {
    try {
      const response = await api.get('/help/categories');
      return response.data;
    } catch (error) {
      console.error('Error getting help categories:', error);
      throw error;
    }
  }
};

// Servicios de configuración de usuario
export const userSettingsService = {
  // Obtener configuración del usuario
  getUserSettings: async () => {
    try {
      const response = await api.get('/user/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  },

  // Guardar configuración del usuario
  saveUserSettings: async (settings) => {
    try {
      const response = await api.post('/user/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  },

  // Actualizar configuración del usuario
  updateUserSettings: async (settings) => {
    try {
      const response = await api.put('/user/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }
};

// Servicios de análisis
export const analysisService = {
  // Obtener historial de análisis
  getAnalysisHistory: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/temp/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting analysis history:', error);
      throw error;
    }
  },

  // Obtener métricas
  getMetrics: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/metrics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting metrics:', error);
      throw error;
    }
  }
};

export default api;