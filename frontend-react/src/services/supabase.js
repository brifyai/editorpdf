import axios from 'axios';

// Configuración para usar Netlify Functions en lugar de Supabase directo
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

// Helper functions for common operations
export const supabaseHelpers = {
  // Auth helpers
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Database helpers
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Document analysis helpers
  async saveAnalysisResult(userId, result) {
    const { data, error } = await supabase
      .from('analysis_results')
      .insert({
        user_id: userId,
        ...result,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },

  async getAnalysisHistory(userId, limit = 50) {
    try {
      console.log('Obteniendo historial para usuario con ID:', userId);
      
      // PRIMERO: Intentar obtener los análisis reales de document_analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('document_analyses')
        .select(`
          *,
          documents!inner(
            id,
            original_filename,
            file_type,
            file_size_bytes,
            processing_status,
            uploaded_at
          )
        `)
        .eq('user_int_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (analysesError) {
        console.error('Error obteniendo análisis:', analysesError);
        
        // Si la tabla no existe, intentar con documents directamente
        if (analysesError.code === 'PGRST116') {
          console.log('Tabla document_analyses no encontrada, intentando con documents...');
          return await this._getHistoryFromDocuments(userId, limit);
        }
        
        return { data: null, error: analysesError };
      }

      console.log('Análisis obtenidos:', analysesData);

      if (!analysesData || analysesData.length === 0) {
        console.log('No se encontraron análisis, intentando con documents...');
        return await this._getHistoryFromDocuments(userId, limit);
      }

      // Transformar los datos de análisis al formato esperado
      const transformedData = analysesData.map(analysis => ({
        id: analysis.id,
        user_id: analysis.user_int_id,
        created_at: analysis.created_at,
        status: analysis.status || 'completed',
        documents: {
          original_filename: analysis.documents?.original_filename || 'Documento sin nombre',
          file_type: analysis.documents?.file_type || 'unknown',
          file_size_bytes: analysis.documents?.file_size_bytes || 0
        },
        analysis_results_basic: {
          page_count: analysis.documents?.page_count || 0
        },
        confidence_score: analysis.confidence_score || 85,
        analysis_type: analysis.analysis_type || 'basic',
        processing_time_ms: analysis.processing_time_ms || 0,
        ai_model_used: analysis.ai_model_used || 'Desconocido'
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error en getAnalysisHistory:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Función auxiliar para obtener historial desde la tabla documents
  async _getHistoryFromDocuments(userId, limit = 50) {
    try {
      console.log('Obteniendo historial desde documents para usuario:', userId);
      
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_int_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (docsError) {
        console.error('Error obteniendo documentos:', docsError);
        return { data: null, error: docsError };
      }

      console.log('Documentos obtenidos:', docsData);

      if (!docsData || docsData.length === 0) {
        return { data: [], error: null };
      }

      // Transformar documentos al formato de análisis
      const transformedData = docsData.map(doc => ({
        id: doc.id,
        user_id: doc.user_int_id,
        created_at: doc.uploaded_at,
        status: doc.processing_status === 'completed' ? 'completed' : 'processing',
        documents: {
          original_filename: doc.original_filename,
          file_type: doc.file_type,
          file_size_bytes: doc.file_size_bytes
        },
        analysis_results_basic: {
          page_count: 0 // No tenemos esta información en documents
        },
        confidence_score: 0, // No tenemos esta información en documents
        analysis_type: 'basic',
        processing_time_ms: 0,
        ai_model_used: 'Desconocido'
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error en _getHistoryFromDocuments:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Batch processing helpers
  async createBatchJob(userId, jobData) {
    const { data, error } = await supabase
      .from('batch_jobs')
      .insert({
        user_id: userId,
        ...jobData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },

  async updateBatchJob(jobId, updates) {
    const { data, error } = await supabase
      .from('batch_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    return { data, error };
  },

  async getBatchJobs(userId) {
    const { data, error } = await supabase
      .from('batch_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Configuration helpers
  async saveUserConfiguration(userId, config) {
    const { data, error } = await supabase
      .from('user_configurations')
      .upsert({
        user_id: userId,
        ...config,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },

  async getUserConfiguration(userId) {
    try {
      const { data, error } = await supabase
        .from('user_configurations')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Si no hay datos, retornar null sin error
      if (error && error.code === 'PGRST116') {
        return { data: null, error: null };
      }

      return { data, error };
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      return { data: null, error };
    }
  },

  async saveUserConfiguration(userId, config) {
    try {
      const { data, error } = await supabase
        .from('user_configurations')
        .upsert({
          user_id: userId,
          ...config,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error guardando configuración:', error);
      return { data: null, error };
    }
  },
  // Estadísticas y métricas reales
  async getUsageStatistics(userId, period = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('usage_statistics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    return { data, error };
  },

  async getAIModelMetrics(userId, limit = 100) {
    const { data, error } = await supabase
      .from('ai_model_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async getDocumentStats(userId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`user_id.eq.${userId},user_int_id.eq.${userId}`)
      .order('uploaded_at', { ascending: false });

    return { data, error };
  },

  async getOCRProcesses(userId, limit = 50) {
    const { data, error } = await supabase
      .from('ocr_processes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  async getDocumentConversions(userId, limit = 50) {
    const { data, error } = await supabase
      .from('document_conversions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },
};
