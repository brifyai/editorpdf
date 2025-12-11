import axios from 'axios';

// Configuración para usar Netlify Functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Cliente API personalizado que usa Netlify Functions
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock de cliente Supabase para compatibilidad
export const supabase = {
  auth: {
    async signUp({ email, password }) {
      try {
        const response = await apiClient.post('/auth/signup', { email, password });
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data || error.message };
      }
    },
    
    async signInWithPassword({ email, password }) {
      try {
        const response = await apiClient.post('/auth/signin', { email, password });
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data || error.message };
      }
    },
    
    async signOut() {
      try {
        await apiClient.post('/auth/signout');
        return { error: null };
      } catch (error) {
        return { error: error.response?.data || error.message };
      }
    },
    
    async getUser() {
      try {
        const response = await apiClient.get('/auth/me');
        return { user: response.data.user, error: null };
      } catch (error) {
        return { user: null, error: error.response?.data || error.message };
      }
    },
    
    async getSession() {
      try {
        const response = await apiClient.get('/auth/me');
        return { data: { session: response.data.session }, error: null };
      } catch (error) {
        return { data: { session: null }, error: error.response?.data || error.message };
      }
    }
  },
  
  from: (table) => ({
    select: () => ({
      eq: () => ({
        single: async () => {
          // Mock response para compatibilidad
          return { data: null, error: null };
        },
        limit: async () => {
          // Mock response para compatibilidad
          return { data: [], error: null, count: 0 };
        }
      }),
      limit: async () => {
        // Mock response para compatibilidad
        return { data: [], error: null, count: 0 };
      }
    }),
    
    insert: async () => {
      // Mock response para compatibilidad
      return { data: null, error: null };
    },
    
    update: () => ({
      eq: async () => {
        // Mock response para compatibilidad
        return { data: null, error: null };
      }
    }),
    
    delete: () => ({
      eq: async () => {
        // Mock response para compatibilidad
        return { data: null, error: null };
      }
    })
  })
};

// =====================================================
// SERVICIOS DE BASE DE DATOS PARA EDITOR PDF
// =====================================================

// =====================================================
// SERVICIOS DE DOCUMENTOS
// =====================================================

export const documentService = {
  // Obtener todos los documentos del usuario
  async getUserDocuments(userId, limit = 50, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('documents')
        .select(`
          *,
          document_analyses (
            id,
            analysis_type,
            status,
            confidence_score,
            created_at,
            completed_at
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return { data: [], count: 0, error };
    }
  },

  // Obtener historial de análisis del usuario
  async getAnalysisHistory(userId, limit = 20, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('document_analyses')
        .select(`
          *,
          documents (
            id,
            original_filename,
            file_type,
            file_size_bytes,
            uploaded_at
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      return { data: [], count: 0, error };
    }
  },

  // Obtener estadísticas de documentos del usuario
  async getDocumentStats(userId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('file_type, processing_status, file_size_bytes, uploaded_at')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        byType: {},
        byStatus: {},
        totalSize: 0,
        recent: data.filter(doc => {
          const uploadDate = new Date(doc.uploaded_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return uploadDate > weekAgo;
        }).length
      };

      data.forEach(doc => {
        // Contar por tipo
        stats.byType[doc.file_type] = (stats.byType[doc.file_type] || 0) + 1;
        // Contar por estado
        stats.byStatus[doc.processing_status] = (stats.byStatus[doc.processing_status] || 0) + 1;
        // Sumar tamaño
        stats.totalSize += doc.file_size_bytes;
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching document stats:', error);
      return { data: null, error };
    }
  }
};

// =====================================================
// SERVICIOS DE ANÁLISIS
// =====================================================

export const analysisService = {
  // Obtener análisis específicos con resultados
  async getAnalysisWithResults(analysisId) {
    try {
      const { data, error } = await supabase
        .from('document_analyses')
        .select(`
          *,
          documents (
            id,
            original_filename,
            file_type,
            file_size_bytes
          ),
          analysis_results_basic,
          analysis_results_advanced,
          analysis_results_ai
        `)
        .eq('id', analysisId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching analysis with results:', error);
      return { data: null, error };
    }
  },

  // Crear nuevo análisis
  async createAnalysis(analysisData) {
    try {
      const { data, error } = await supabase
        .from('document_analyses')
        .insert(analysisData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating analysis:', error);
      return { data: null, error };
    }
  },

  // Actualizar estado de análisis
  async updateAnalysisStatus(analysisId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        ...additionalData
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('document_analyses')
        .update(updateData)
        .eq('id', analysisId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating analysis status:', error);
      return { data: null, error };
    }
  }
};

// =====================================================
// SERVICIOS DE OCR
// =====================================================

export const ocrService = {
  // Obtener procesos OCR del usuario
  async getUserOcrProcesses(userId, limit = 20, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('ocr_processes')
        .select(`
          *,
          documents (
            id,
            original_filename,
            file_type
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error('Error fetching OCR processes:', error);
      return { data: [], count: 0, error };
    }
  },

  // Crear nuevo proceso OCR
  async createOcrProcess(ocrData) {
    try {
      const { data, error } = await supabase
        .from('ocr_processes')
        .insert(ocrData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating OCR process:', error);
      return { data: null, error };
    }
  }
};

// =====================================================
// SERVICIOS DE MÉTRICAS Y ESTADÍSTICAS
// =====================================================

export const metricsService = {
  // Obtener estadísticas de uso del usuario
  async getUserUsageStats(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('usage_statistics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      // Calcular totales
      const totals = data.reduce((acc, day) => ({
        documents: acc.documents + day.documents_processed,
        ocr: acc.ocr + day.ocr_processes,
        ai: acc.ai + day.ai_analyses,
        cost: acc.cost + parseFloat(day.total_cost_usd || 0),
        storage: acc.storage + parseFloat(day.storage_used_mb || 0)
      }), { documents: 0, ocr: 0, ai: 0, cost: 0, storage: 0 });

      return { data: { daily: data, totals }, error: null };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return { data: null, error };
    }
  },

  // Obtener métricas de modelos de IA
  async getAiModelMetrics(userId, limit = 100) {
    try {
      const { data, error } = await supabase
        .from('ai_model_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching AI metrics:', error);
      return { data: [], error };
    }
  },

  // Obtener resumen de estadísticas generales
  async getSystemOverview(userId) {
    try {
      // Obtener estadísticas de documentos
      const docStats = await documentService.getDocumentStats(userId);
      
      // Obtener estadísticas de uso
      const usageStats = await this.getUserUsageStats(userId, 30);
      
      // Obtener métricas de IA
      const aiMetrics = await this.getAiModelMetrics(userId, 50);

      const overview = {
        documents: docStats.data || {},
        usage: usageStats.data?.totals || {},
        ai: {
          totalRequests: aiMetrics.data?.length || 0,
          successRate: aiMetrics.data?.filter(m => m.success).length / (aiMetrics.data?.length || 1) * 100,
          avgResponseTime: aiMetrics.data?.reduce((acc, m) => acc + (m.response_time_ms || 0), 0) / (aiMetrics.data?.length || 1),
          totalCost: aiMetrics.data?.reduce((acc, m) => acc + parseFloat(m.cost_usd || 0), 0) || 0
        }
      };

      return { data: overview, error: null };
    } catch (error) {
      console.error('Error fetching system overview:', error);
      return { data: null, error };
    }
  }
};

// =====================================================
// SERVICIOS DE CONFIGURACIÓN
// =====================================================

export const configService = {
  // Obtener configuraciones del sistema
  async getSystemSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_public', true);

      if (error) throw error;
      
      const settings = {};
      data.forEach(setting => {
        try {
          settings[setting.key] = JSON.parse(setting.value);
        } catch {
          settings[setting.key] = setting.value;
        }
      });

      return { data: settings, error: null };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return { data: {}, error };
    }
  },

  // Obtener plantillas de configuración de IA
  async getAiConfigTemplates() {
    try {
      const { data, error } = await supabase
        .from('ai_config_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching AI config templates:', error);
      return { data: [], error };
    }
  }
};

// =====================================================
// SERVICIOS DE BATCH PROCESSING
// =====================================================

export const batchService = {
  // Obtener trabajos por lotes del usuario
  async getUserBatchJobs(userId, limit = 20, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('batch_jobs')
        .select(`
          *,
          batch_job_files (
            id,
            filename,
            status,
            processing_time_ms
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, count, error: null };
    } catch (error) {
      console.error('Error fetching batch jobs:', error);
      return { data: [], count: 0, error };
    }
  },

  // Crear nuevo trabajo por lotes
  async createBatchJob(jobData) {
    try {
      const { data, error } = await supabase
        .from('batch_jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating batch job:', error);
      return { data: null, error };
    }
  }
};

// =====================================================
// SERVICIOS DE PERFIL DE USUARIO
// =====================================================

export const profileService = {
  // Obtener perfil del usuario
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  },

  // Actualizar perfil del usuario
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  }
};
