/**
 * Cliente de Supabase para Document Analyzer
 * Gestiona todas las operaciones de base de datos
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

class SupabaseClient {
    constructor() {
        this.supabase = null;
        this.initialized = false;
        this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
        this.initialize();
    }

    /**
     * Encriptar texto usando AES-256-GCM
     */
    encrypt(text) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
            cipher.setAAD(Buffer.from('api-key-encryption'));
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                encrypted: encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            console.error('Error encriptando texto:', error);
            throw new Error('Error en la encriptación');
        }
    }

    /**
     * Desencriptar texto usando AES-256-GCM
     */
    decrypt(encryptedData) {
        try {
            const { encrypted, iv, authTag } = encryptedData;
            
            const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
            decipher.setAAD(Buffer.from('api-key-encryption'));
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Error desencriptando texto:', error);
            throw new Error('Error en la desencriptación');
        }
    }

    initialize() {
        try {
            // Intentar con variables de entorno del servidor primero
            let supabaseUrl = process.env.SUPABASE_URL;
            let supabaseKey = process.env.SUPABASE_ANON_KEY;
            let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            // Si no existen, intentar con variables de Next.js (compatibilidad)
            if (!supabaseUrl) supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (!supabaseKey) supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.warn('⚠️ Variables de entorno de Supabase no configuradas:');
                console.warn('   - SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL no encontrada');
                console.warn('   - SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY no encontrada');
                console.warn('   - La aplicación funcionará en modo limitado sin base de datos');
                return;
            }

            // Para operaciones de storage, usar service role key si está disponible
            const keyForStorage = serviceRoleKey || supabaseKey;

            this.supabase = createClient(supabaseUrl, keyForStorage, {
                auth: {
                    autoRefreshToken: false, // Desactivar para servidor
                    persistSession: false   // Desactivar para servidor
                }
            });

            this.initialized = true;
            console.log('✅ Cliente de Supabase inicializado correctamente');
            console.log(`   - URL: ${supabaseUrl}`);
            console.log(`   - Usando Service Role Key: ${serviceRoleKey ? 'Sí' : 'No'}`);
        } catch (error) {
            console.error('❌ Error inicializando Supabase:', error);
            console.warn('⚠️ La aplicación continuará funcionando sin base de datos');
        }
    }

    isInitialized() {
        return this.initialized && this.supabase;
    }

    // =====================================================
    // OPERACIONES DE USUARIOS
    // =====================================================

    async createProfile(userData) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .upsert([{
                    id: userData.id,
                    email: userData.email,
                    full_name: userData.full_name || userData.user_metadata?.full_name,
                    avatar_url: userData.avatar_url,
                    company_name: userData.user_metadata?.company_name,
                    role: userData.user_metadata?.role || 'user',
                    subscription_tier: userData.user_metadata?.subscription_tier || 'free'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creando perfil:', error);
            throw error;
        }
    }

    async getProfile(userId) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            throw error;
        }
    }

    async updateProfile(userId, updates) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    }

    // =====================================================
    // OPERACIONES DE DOCUMENTOS
    // =====================================================

    async createDocument(documentData) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('documents')
                .insert([{
                    user_id: documentData.user_id,
                    original_filename: documentData.original_filename,
                    file_path: documentData.file_path,
                    file_size_bytes: documentData.file_size_bytes,
                    file_type: documentData.file_type,
                    mime_type: documentData.mime_type,
                    file_hash: documentData.file_hash,
                    storage_url: documentData.storage_url,
                    metadata: documentData.metadata || {}
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creando documento:', error);
            throw error;
        }
    }

    async getDocuments(userId, options = {}) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            let query = this.supabase
                .from('documents')
                .select('*')
                .eq('user_id', userId);

            // Aplicar filtros
            if (options.fileType) {
                query = query.eq('file_type', options.fileType);
            }
            if (options.status) {
                query = query.eq('processing_status', options.status);
            }
            if (options.limit) {
                query = query.limit(options.limit);
            }
            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
            }

            // Ordenamiento
            const orderBy = options.orderBy || 'uploaded_at';
            const order = options.order || 'desc';
            query = query.order(orderBy, { ascending: order === 'asc' });

            const { data, error } = await query;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo documentos:', error);
            throw error;
        }
    }

    async getDocument(documentId, userId) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo documento:', error);
            throw error;
        }
    }

    async updateDocument(documentId, userId, updates) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('documents')
                .update(updates)
                .eq('id', documentId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error actualizando documento:', error);
            throw error;
        }
    }

    async deleteDocument(documentId, userId) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { error } = await this.supabase
                .from('documents')
                .delete()
                .eq('id', documentId)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando documento:', error);
            throw error;
        }
    }

    // =====================================================
    // OPERACIONES DE ANÁLISIS
    // =====================================================

    async createAnalysis(analysisData) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('document_analyses')
                .insert([{
                    document_id: analysisData.document_id,
                    user_id: analysisData.user_id,
                    analysis_type: analysisData.analysis_type,
                    ai_model_used: analysisData.ai_model_used,
                    ai_strategy: analysisData.ai_strategy,
                    analysis_config: analysisData.analysis_config || {},
                    processing_time_ms: analysisData.processing_time_ms,
                    confidence_score: analysisData.confidence_score,
                    status: analysisData.status || 'completed'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creando análisis:', error);
            throw error;
        }
    }

    async saveAnalysisResults(analysisId, results, type) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            let tableName;
            switch (type) {
                case 'basic':
                    tableName = 'analysis_results_basic';
                    break;
                case 'advanced':
                    tableName = 'analysis_results_advanced';
                    break;
                case 'ai':
                    tableName = 'analysis_results_ai';
                    break;
                default:
                    throw new Error('Tipo de análisis no válido');
            }

            const { data, error } = await this.supabase
                .from(tableName)
                .insert([{
                    analysis_id: analysisId,
                    ...results
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando resultados de análisis:', error);
            throw error;
        }
    }

    async getDocumentAnalyses(documentId, userId) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            // Optimización: consultas separadas para evitar joins complejos
            const { data: analyses, error } = await this.supabase
                .from('document_analyses')
                .select(`
                    id,
                    document_id,
                    user_id,
                    analysis_type,
                    ai_model_used,
                    ai_strategy,
                    analysis_config,
                    processing_time_ms,
                    confidence_score,
                    status,
                    created_at,
                    completed_at
                `)
                .eq('document_id', documentId)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Obtener resultados básicos de manera optimizada
            const analysisIds = analyses.map(a => a.id);
            let basicResults = [];
            let advancedResults = [];
            let aiResults = [];

            if (analysisIds.length > 0) {
                // Consultas separadas para mejor rendimiento
                const [basicData, advancedData, aiData] = await Promise.all([
                    this.supabase
                        .from('analysis_results_basic')
                        .select('*')
                        .in('analysis_id', analysisIds),
                    this.supabase
                        .from('analysis_results_advanced')
                        .select('*')
                        .in('analysis_id', analysisIds),
                    this.supabase
                        .from('analysis_results_ai')
                        .select('*')
                        .in('analysis_id', analysisIds)
                ]);

                basicResults = basicData.data || [];
                advancedResults = advancedData.data || [];
                aiResults = aiData.data || [];
            }

            // Combinar resultados
            const analysesWithResults = analyses.map(analysis => ({
                ...analysis,
                analysis_results_basic: basicResults.filter(r => r.analysis_id === analysis.id),
                analysis_results_advanced: advancedResults.filter(r => r.analysis_id === analysis.id),
                analysis_results_ai: aiResults.filter(r => r.analysis_id === analysis.id)
            }));

            return analysesWithResults;
        } catch (error) {
            console.error('Error obteniendo análisis:', error);
            throw error;
        }
    }

    // =====================================================
    // OPERACIONES DE OCR
    // =====================================================

    async createOCRProcess(ocrData) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('ocr_processes')
                .insert([{
                    document_id: ocrData.document_id,
                    user_id: ocrData.user_id,
                    language: ocrData.language || 'spa+eng',
                    confidence_threshold: ocrData.confidence_threshold || 60,
                    preprocessing_enabled: ocrData.preprocessing_enabled !== false,
                    ocr_engine: ocrData.ocr_engine || 'tesseract',
                    total_pages: ocrData.total_pages || 1
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creando proceso OCR:', error);
            throw error;
        }
    }

    async saveOCRResults(ocrProcessId, results) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('ocr_results')
                .insert([{
                    ocr_process_id: ocrProcessId,
                    page_number: results.page_number || 1,
                    extracted_text: results.extracted_text,
                    confidence_score: results.confidence_score,
                    language_detected: results.language_detected,
                    bbox_coordinates: results.bbox_coordinates || [],
                    structured_data: results.structured_data || {},
                    word_count: results.word_count,
                    line_count: results.line_count,
                    paragraph_count: results.paragraph_count,
                    processing_time_ms: results.processing_time_ms
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando resultados OCR:', error);
            throw error;
        }
    }

    async updateOCRProcess(ocrProcessId, updates) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('ocr_processes')
                .update(updates)
                .eq('id', ocrProcessId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error actualizando proceso OCR:', error);
            throw error;
        }
    }

    // =====================================================
    // OPERACIONES DE MÉTRICAS DE IA
    // =====================================================

    async recordAIMetric(metricData) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('ai_model_metrics')
                .insert([{
                    user_id: metricData.user_id,
                    model_name: metricData.model_name,
                    provider: metricData.provider,
                    document_type: metricData.document_type,
                    ocr_confidence: metricData.ocr_confidence,
                    strategy_used: metricData.strategy_used,
                    parameters: metricData.parameters || {},
                    success: metricData.success,
                    response_time_ms: metricData.response_time_ms,
                    accuracy_score: metricData.accuracy_score,
                    cost_usd: metricData.cost_usd || 0,
                    tokens_used: metricData.tokens_used || 0,
                    error_type: metricData.error_type,
                    error_message: metricData.error_message,
                    session_id: metricData.session_id
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando métrica de IA:', error);
            throw error;
        }
    }

    async getModelMetrics(userId, options = {}) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            let query = this.supabase
                .from('ai_model_metrics')
                .select('*')
                .eq('user_id', userId);

            if (options.modelName) {
                query = query.eq('model_name', options.modelName);
            }
            if (options.dateFrom) {
                query = query.gte('created_at', options.dateFrom);
            }
            if (options.dateTo) {
                query = query.lte('created_at', options.dateTo);
            }
            if (options.limit) {
                query = query.limit(options.limit);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo métricas de IA:', error);
            throw error;
        }
    }

    // =====================================================
    // OPERACIONES DE BATCH PROCESSING
    // =====================================================

    async createBatchJob(batchData) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('batch_jobs')
                .insert([{
                    user_id: batchData.user_id,
                    job_name: batchData.job_name,
                    job_type: batchData.job_type,
                    total_files: batchData.total_files,
                    config: batchData.config || {}
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creando batch job:', error);
            throw error;
        }
    }

    async updateBatchJob(batchJobId, updates) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('batch_jobs')
                .update(updates)
                .eq('id', batchJobId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error actualizando batch job:', error);
            throw error;
        }
    }

    async getBatchJobs(userId, options = {}) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            let query = this.supabase
                .from('batch_jobs')
                .select(`
                    *,
                    batch_job_files (*)
                `)
                .eq('user_id', userId);

            if (options.status) {
                query = query.eq('status', options.status);
            }
            if (options.jobType) {
                query = query.eq('job_type', options.jobType);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo batch jobs:', error);
            throw error;
        }
    }

    // =====================================================
    // OPERACIONES DE CONFIGURACIÓN
    // =====================================================

    async saveAPIConfig(userId, provider, apiKey) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            // Encriptar la API key usando AES-256-GCM
            const encryptedData = this.encrypt(apiKey);

            const { data, error } = await this.supabase
                .from('user_api_configs')
                .upsert([{
                    user_id: userId,
                    provider: provider,
                    api_key_encrypted: JSON.stringify(encryptedData),
                    is_active: true
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error guardando configuración de API:', error);
            throw error;
        }
    }

    async getAPIConfigs(userId) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('user_api_configs')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true);

            if (error) throw error;
            
            // Desencriptar las API keys
            return data.map(config => ({
                ...config,
                api_key: config.api_key_encrypted ? 
                    this.decrypt(JSON.parse(config.api_key_encrypted)) : null
            }));
        } catch (error) {
            console.error('Error obteniendo configuraciones de API:', error);
            throw error;
        }
    }

    // =====================================================
    // OPERACIONES DE ESTADÍSTICAS
    // =====================================================

    async getUserStatistics(userId, dateFrom = null, dateTo = null) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            let query = this.supabase
                .from('user_document_summary')
                .select('*')
                .eq('user_id', userId);

            if (dateFrom || dateTo) {
                const statsQuery = this.supabase
                    .from('usage_statistics')
                    .select('*')
                    .eq('user_id', userId);

                if (dateFrom) {
                    statsQuery.gte('date', dateFrom);
                }
                if (dateTo) {
                    statsQuery.lte('date', dateTo);
                }

                const { data: statsData, error: statsError } = await statsQuery;
                if (statsError) throw statsError;
                return statsData;
            }

            const { data, error } = await query;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    async getSystemStatus() {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase
                .from('system_status')
                .select('*')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo estado del sistema:', error);
            throw error;
        }
    }

    // =====================================================
    // OPERACIONES DE AUDITORÍA
    // =====================================================

    async logAuditEvent(userId, action, resourceType, resourceId, oldValues = {}, newValues = {}) {
        if (!this.isInitialized()) return;

        try {
            await this.supabase
                .from('audit_logs')
                .insert([{
                    user_id: userId,
                    action: action,
                    resource_type: resourceType,
                    resource_id: resourceId,
                    old_values: oldValues,
                    new_values: newValues,
                    ip_address: null, // Se puede obtener del request
                    user_agent: null, // Se puede obtener del request
                    session_id: null
                }]);
        } catch (error) {
            console.error('Error guardando log de auditoría:', error);
        }
    }

    async logError(userId, errorType, errorMessage, errorStack = null, context = {}) {
        if (!this.isInitialized()) return;

        try {
            await this.supabase
                .from('error_logs')
                .insert([{
                    user_id: userId,
                    error_type: errorType,
                    error_message: errorMessage,
                    error_stack: errorStack,
                    context: context,
                    severity: 'error'
                }]);
        } catch (error) {
            console.error('Error guardando log de error:', error);
        }
    }

    // =====================================================
    // OPERACIONES DE STORAGE
    // =====================================================

    async uploadFile(bucket, path, fileBuffer, contentType) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(path, fileBuffer, {
                    contentType: contentType,
                    upsert: true
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error subiendo archivo:', error);
            throw error;
        }
    }

    async getPublicUrl(bucket, path) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data } = await this.supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            return data.publicUrl;
        } catch (error) {
            console.error('Error obteniendo URL pública:', error);
            throw error;
        }
    }

    async deleteFile(bucket, path) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { error } = await this.supabase.storage
                .from(bucket)
                .remove([path]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error eliminando archivo:', error);
            throw error;
        }
    }

    async createBucket(bucketName, options = {}) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase.storage
                .createBucket(bucketName, {
                    public: options.public || false,
                    allowedMimeTypes: options.allowedMimeTypes || [
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'text/plain',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'image/jpeg',
                        'image/png',
                        'image/bmp',
                        'image/tiff',
                        'image/webp'
                    ],
                    fileSizeLimit: options.fileSizeLimit || 52428800 // 50MB
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creando bucket:', error);
            throw error;
        }
    }

    async getBucket(bucketName) {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase.storage
                .getBucket(bucketName);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo bucket:', error);
            throw error;
        }
    }

    async listBuckets() {
        if (!this.isInitialized()) throw new Error('Supabase no inicializado');

        try {
            const { data, error } = await this.supabase.storage
                .listBuckets();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error listando buckets:', error);
            throw error;
        }
    }

    // =====================================================
    // UTILIDADES
    // =====================================================

    async testConnection() {
        if (!this.isInitialized()) return false;

        try {
            const { data, error } = await this.supabase
                .from('system_settings')
                .select('key')
                .limit(1);

            return !error;
        } catch (error) {
            console.error('Error probando conexión:', error);
            return false;
        }
    }

    getClient() {
        return this.supabase;
    }
}

// Exportar singleton
const supabaseClient = new SupabaseClient();

module.exports = {
    SupabaseClient,
    supabaseClient
};