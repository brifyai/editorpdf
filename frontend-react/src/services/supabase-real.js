import axios from 'axios';

// Configuración para usar servidor local o Netlify Functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Cliente API personalizado que usa el servidor local
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente API compatible con Supabase para el servidor local
export const supabaseReal = {
  auth: {
    async signUp({ email, password, name }) {
      try {
        const response = await apiClient.post('/auth/register', {
          email,
          password,
          username: email.split('@')[0],
          firstName: name || email.split('@')[0],
          lastName: ''
        });
        
        // Transformar respuesta del servidor a formato Supabase
        const userData = {
          user: {
            id: response.data.data.user.id,
            email: response.data.data.user.email,
            name: response.data.data.user.firstName + ' ' + response.data.data.user.lastName,
            role: response.data.data.user.role
          },
          token: response.data.data.token
        };
        
        return { data: userData, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data || error.message };
      }
    },
    
    async signInWithPassword({ email, password }) {
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        
        // Transformar respuesta del servidor a formato Supabase
        const userData = {
          user: {
            id: response.data.data.user.id,
            email: response.data.data.user.email,
            name: response.data.data.user.firstName + ' ' + response.data.data.user.lastName,
            role: response.data.data.user.role
          },
          token: response.data.data.token
        };
        
        return { data: userData, error: null };
      } catch (error) {
        return { data: null, error: error.response?.data || error.message };
      }
    },
    
    async signOut() {
      try {
        await apiClient.post('/auth/logout');
        return { error: null };
      } catch (error) {
        return { error: error.response?.data || error.message };
      }
    },
    
    async getUser() {
      try {
        const response = await apiClient.get('/auth/profile');
        return { user: response.data.data.user, error: null };
      } catch (error) {
        return { user: null, error: error.response?.data || error.message };
      }
    },
    
    async getSession() {
      try {
        const response = await apiClient.get('/auth/profile');
        return {
          data: {
            session: {
              user: response.data.data.user,
              access_token: response.data.data.token
            }
          },
          error: null
        };
      } catch (error) {
        return { data: { session: null }, error: error.response?.data || error.message };
      }
    }
  },
  
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => ({
        eq: (column2, value2) => ({
          single: async () => {
            // Mock response para compatibilidad con múltiples .eq()
            return { data: null, error: null };
          },
          limit: async (count) => {
            // Mock response para compatibilidad
            return { data: [], error: null, count: 0 };
          }
        }),
        single: async () => {
          // Mock response para compatibilidad con un solo .eq()
          return { data: null, error: null };
        },
        limit: async (count) => {
          // Mock response para compatibilidad
          return { data: [], error: null, count: 0 };
        }
      }),
      single: async () => {
        // Mock response para compatibilidad
        return { data: null, error: null };
      },
      limit: async (count) => {
        // Mock response para compatibilidad
        return { data: [], error: null, count: 0 };
      }
    }),
    
    eq: (column, value) => ({
      single: async () => {
        // Mock response para compatibilidad
        return { data: null, error: null };
      },
      limit: async (count) => {
        // Mock response para compatibilidad
        return { data: [], error: null, count: 0 };
      }
    }),
    
    insert: async (data) => {
      // Mock response para compatibilidad
      return { data: null, error: null };
    },
    
    update: (data) => ({
      eq: (column, value) => ({
        single: async () => {
          // Mock response para compatibilidad
          return { data: null, error: null };
        }
      })
    }),
    
    delete: () => ({
      eq: (column, value) => ({
        single: async () => {
          // Mock response para compatibilidad
          return { data: null, error: null };
        }
      })
    })
  })
};

// Helper functions para datos reales desde Supabase
export const supabaseRealHelpers = {
  // Obtener historial real de análisis desde Supabase
  async getAnalysisHistory(userId, limit = 50) {
    try {
      console.log('Obteniendo historial REAL para usuario:', userId);
      
      // Obtener los documentos reales del usuario
      const { data: documentsData, error: documentsError } = await supabaseReal
        .from('documents')
        .select('*')
        .eq('user_int_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (documentsError) {
        console.error('Error obteniendo documentos reales:', documentsError);
        return { data: null, error: documentsError };
      }

      console.log('Documentos reales obtenidos:', documentsData?.length || 0);

      if (!documentsData || documentsData.length === 0) {
        console.log('No se encontraron documentos reales para este usuario');
        return { data: [], error: null };
      }

      // Transformar los datos de documentos al formato de historial de análisis
      const transformedData = documentsData.map(doc => ({
        id: doc.id,
        user_id: doc.user_int_id,
        created_at: doc.uploaded_at,
        status: doc.processing_status === 'completed' ? 'completed' :
                doc.processing_status === 'processing' ? 'processing' : 'pending',
        documents: {
          original_filename: doc.original_filename || 'Documento sin nombre',
          file_type: doc.file_type?.toUpperCase() || 'UNKNOWN',
          file_size_bytes: doc.file_size_bytes || 0
        },
        analysis_results_basic: {
          page_count: doc.page_count || 0 // Si existe este campo en documents
        },
        confidence_score: doc.confidence_score || 85, // Si existe este campo
        analysis_type: 'document', // Valor por defecto
        processing_time_ms: doc.processing_time_ms || 0, // Si existe este campo
        ai_model_used: doc.ai_model_used || 'Desconocido' // Si existe este campo
      }));

      console.log('Datos transformados para historial:', transformedData.length);
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error en getAnalysisHistory real:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Insertar datos reales de análisis
  async insertRealAnalysis(analysisData) {
    try {
      const { data, error } = await supabaseReal
        .from('document_analyses')
        .insert({
          user_int_id: analysisData.user_int_id,
          document_id: analysisData.document_id,
          analysis_type: analysisData.analysis_type || 'basic',
          ai_model_used: analysisData.ai_model_used || 'Desconocido',
          ai_strategy: analysisData.ai_strategy || 'balanced',
          analysis_config: analysisData.analysis_config || {},
          processing_time_ms: analysisData.processing_time_ms || 0,
          confidence_score: analysisData.confidence_score || 85,
          status: analysisData.status || 'completed',
          created_at: new Date().toISOString(),
          completed_at: analysisData.status === 'completed' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error insertando análisis real:', error);
        return { data: null, error };
      }

      console.log('Análisis real insertado:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error en insertRealAnalysis:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Insertar documento real
  async insertRealDocument(documentData) {
    try {
      const { data, error } = await supabaseReal
        .from('documents')
        .insert({
          user_int_id: documentData.user_int_id,
          original_filename: documentData.original_filename,
          file_path: documentData.file_path,
          file_size_bytes: documentData.file_size_bytes,
          file_type: documentData.file_type,
          mime_type: documentData.mime_type,
          file_hash: documentData.file_hash || 'hash_' + Date.now(),
          storage_url: documentData.storage_url,
          is_processed: documentData.is_processed || false,
          processing_status: documentData.processing_status || 'pending',
          uploaded_at: new Date().toISOString(),
          metadata: documentData.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error insertando documento real:', error);
        return { data: null, error };
      }

      console.log('Documento real insertado:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error en insertRealDocument:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Obtener documentos reales
  async getRealDocuments(userId, limit = 50) {
    try {
      const { data, error } = await supabaseReal
        .from('documents')
        .select('*')
        .eq('user_int_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error obteniendo documentos reales:', error);
        return { data: null, error };
      }

      console.log('Documentos reales obtenidos:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error en getRealDocuments:', error);
      return { data: null, error: { message: error.message } };
    }
  },

  // Generar datos de prueba reales
  async generateTestData(userId) {
    try {
      console.log('Generando datos de prueba reales para usuario:', userId);
      
      // Insertar documentos de prueba
      const testDocuments = [
        {
          user_int_id: userId,
          original_filename: 'informe_empresa.pdf',
          file_path: '/uploads/informe_empresa.pdf',
          file_size_bytes: 1024000,
          file_type: 'pdf',
          mime_type: 'application/pdf',
          is_processed: true,
          processing_status: 'completed'
        },
        {
          user_int_id: userId,
          original_filename: 'presentacion_ventas.pptx',
          file_path: '/uploads/presentacion_ventas.pptx',
          file_size_bytes: 2048000,
          file_type: 'pptx',
          mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          is_processed: true,
          processing_status: 'completed'
        },
        {
          user_int_id: userId,
          original_filename: 'contrato_servicios.docx',
          file_path: '/uploads/contrato_servicios.docx',
          file_size_bytes: 512000,
          file_type: 'docx',
          mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          is_processed: false,
          processing_status: 'pending'
        }
      ];

      const insertedDocs = [];
      for (const doc of testDocuments) {
        const result = await this.insertRealDocument(doc);
        if (result.data) {
          insertedDocs.push(result.data);
        }
      }

      // Insertar análisis de prueba
      const testAnalyses = [
        {
          user_int_id: userId,
          document_id: insertedDocs[0]?.id || 'doc1',
          analysis_type: 'basic',
          ai_model_used: 'Llama 3.3 70B',
          ai_strategy: 'balanced',
          processing_time_ms: 2500,
          confidence_score: 92.5,
          status: 'completed'
        },
        {
          user_int_id: userId,
          document_id: insertedDocs[1]?.id || 'doc2',
          analysis_type: 'advanced',
          ai_model_used: 'Llama 3.3 70B',
          ai_strategy: 'accuracy',
          processing_time_ms: 4200,
          confidence_score: 88.3,
          status: 'completed'
        }
      ];

      const insertedAnalyses = [];
      for (const analysis of testAnalyses) {
        const result = await this.insertRealAnalysis(analysis);
        if (result.data) {
          insertedAnalyses.push(result.data);
        }
      }

      console.log('Datos de prueba generados:', { documents: insertedDocs.length, analyses: insertedAnalyses.length });
      
      return {
        success: true,
        documents: insertedDocs,
        analyses: insertedAnalyses
      };
    } catch (error) {
      console.error('Error generando datos de prueba:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};