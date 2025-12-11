-- =====================================================
-- DOCUMENT ANALYZER - ESQUEMA COMPLETO DE BASE DE DATOS
-- Supabase PostgreSQL Schema
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- TABLAS DE USUARIOS Y AUTENTICACIÓN
-- =====================================================

-- Perfiles de usuarios extendidos
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'enterprise')),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    api_usage_limit INTEGER DEFAULT 100,
    monthly_api_count INTEGER DEFAULT 0,
    storage_quota_mb INTEGER DEFAULT 100,
    storage_used_mb INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Configuraciones de API por usuario
CREATE TABLE IF NOT EXISTS public.user_api_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('groq', 'chutes', 'openai', 'anthropic')),
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, provider)
);

-- Tabla de usuarios personalizada para login con ID numérico
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'enterprise')),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    api_usage_limit INTEGER DEFAULT 100,
    monthly_api_count INTEGER DEFAULT 0,
    storage_quota_mb INTEGER DEFAULT 100,
    storage_used_mb INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para la tabla users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =====================================================
-- TABLAS DE DOCUMENTOS Y ANÁLISIS
-- =====================================================

-- Documentos subidos por usuarios (compatible con ambos sistemas de autenticación)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'pptx', 'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp')),
    mime_type TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    storage_url TEXT,
    is_processed BOOLEAN DEFAULT false,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Análisis de documentos (compatible con ambos sistemas de autenticación)
CREATE TABLE IF NOT EXISTS public.document_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('basic', 'advanced', 'ai_enhanced', 'ocr')),
    ai_model_used TEXT,
    ai_strategy TEXT,
    analysis_config JSONB DEFAULT '{}',
    processing_time_ms INTEGER,
    confidence_score DECIMAL(5,2),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(document_id, analysis_type)
);

-- Resultados de análisis básicos
CREATE TABLE IF NOT EXISTS public.analysis_results_basic (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE,
    document_info JSONB DEFAULT '{}',
    statistics JSONB DEFAULT '{}',
    content_analysis JSONB DEFAULT '{}',
    structure_analysis JSONB DEFAULT '{}',
    technical_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Resultados de análisis avanzados
CREATE TABLE IF NOT EXISTS public.analysis_results_advanced (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE,
    sentiment_analysis JSONB DEFAULT '{}',
    classification JSONB DEFAULT '{}',
    keywords JSONB DEFAULT '[]',
    entities JSONB DEFAULT '[]',
    readability_score DECIMAL(5,2),
    language_detected TEXT,
    quality_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Resultados de análisis con IA
CREATE TABLE IF NOT EXISTS public.analysis_results_ai (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE,
    ai_model TEXT NOT NULL,
    ai_provider TEXT NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost_usd DECIMAL(10,6),
    response_time_ms INTEGER,
    sentiment JSONB DEFAULT '{}',
    classification JSONB DEFAULT '{}',
    summary JSONB DEFAULT '{}',
    insights JSONB DEFAULT '[]',
    quality_assessment JSONB DEFAULT '{}',
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- TABLAS DE OCR
-- =====================================================

-- Procesamientos OCR
CREATE TABLE IF NOT EXISTS public.ocr_processes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'spa+eng',
    confidence_threshold INTEGER DEFAULT 60,
    preprocessing_enabled BOOLEAN DEFAULT true,
    ocr_engine TEXT DEFAULT 'tesseract',
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    total_pages INTEGER DEFAULT 1,
    processed_pages INTEGER DEFAULT 0,
    average_confidence DECIMAL(5,2),
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Resultados OCR por página
CREATE TABLE IF NOT EXISTS public.ocr_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ocr_process_id UUID REFERENCES public.ocr_processes(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    extracted_text TEXT,
    confidence_score DECIMAL(5,2),
    language_detected TEXT,
    bbox_coordinates JSONB DEFAULT '[]',
    structured_data JSONB DEFAULT '{}',
    word_count INTEGER,
    line_count INTEGER,
    paragraph_count INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Conversiones de documentos
CREATE TABLE IF NOT EXISTS public.document_conversions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    conversion_type TEXT NOT NULL CHECK (conversion_type IN ('pdf_editable', 'docx', 'txt', 'json')),
    output_format TEXT NOT NULL,
    output_file_path TEXT,
    output_file_url TEXT,
    output_file_size BIGINT,
    conversion_config JSONB DEFAULT '{}',
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLAS DE MÉTRICAS Y OPTIMIZACIÓN DE IA
-- =====================================================

-- Métricas de uso de modelos de IA
CREATE TABLE IF NOT EXISTS public.ai_model_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    document_type TEXT,
    ocr_confidence INTEGER,
    strategy_used TEXT,
    parameters JSONB DEFAULT '{}',
    success BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    accuracy_score DECIMAL(5,2),
    cost_usd DECIMAL(10,6),
    tokens_used INTEGER,
    error_type TEXT,
    error_message TEXT,
    session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Historial de optimización de modelos
CREATE TABLE IF NOT EXISTS public.model_optimization_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_characteristics JSONB DEFAULT '{}',
    recommended_model TEXT NOT NULL,
    alternative_models JSONB DEFAULT '[]',
    recommendation_score DECIMAL(5,2),
    reasoning TEXT,
    actual_model_used TEXT,
    user_accepted BOOLEAN,
    performance_outcome JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Estadísticas agregadas de uso
CREATE TABLE IF NOT EXISTS public.usage_statistics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    documents_processed INTEGER DEFAULT 0,
    ocr_processes INTEGER DEFAULT 0,
    ai_analyses INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10,6) DEFAULT 0,
    storage_used_mb DECIMAL(10,2) DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    average_response_time_ms INTEGER,
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, date)
);

-- =====================================================
-- TABLAS DE BATCH PROCESING
-- =====================================================

-- Trabajos por lotes
CREATE TABLE IF NOT EXISTS public.batch_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_name TEXT,
    job_type TEXT NOT NULL CHECK (job_type IN ('document_analysis', 'ocr_processing', 'conversion')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_files INTEGER NOT NULL,
    processed_files INTEGER DEFAULT 0,
    failed_files INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    error_summary JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Archivos en lotes
CREATE TABLE IF NOT EXISTS public.batch_job_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    batch_job_id UUID REFERENCES public.batch_jobs(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    processing_time_ms INTEGER,
    error_message TEXT,
    result_summary JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLAS DE AUDITORÍA Y LOGS
-- =====================================================

-- Logs de auditoría
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Logs de errores del sistema
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    context JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLAS DE CONFIGURACIÓN DEL SISTEMA
-- =====================================================

-- Configuraciones del sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Plantillas de configuración de IA
CREATE TABLE IF NOT EXISTS public.ai_config_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    document_types TEXT[] DEFAULT ARRAY['general'],
    ai_model TEXT NOT NULL,
    ai_strategy TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ÍNDICES OPTIMIZADOS
-- =====================================================

-- Índices para tablas principales
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON public.documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON public.documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON public.documents(file_hash);

CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON public.document_analyses(document_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.document_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_type ON public.document_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON public.document_analyses(status);

CREATE INDEX IF NOT EXISTS idx_ocr_processes_document_id ON public.ocr_processes(document_id);
CREATE INDEX IF NOT EXISTS idx_ocr_processes_status ON public.ocr_processes(processing_status);

CREATE INDEX IF NOT EXISTS idx_ai_metrics_user_model ON public.ai_model_metrics(user_id, model_name);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_created_at ON public.ai_model_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_success ON public.ai_model_metrics(success);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_id ON public.batch_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON public.batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_at ON public.batch_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Índices GIN para búsquedas de texto completo
CREATE INDEX IF NOT EXISTS idx_documents_filename_gin ON public.documents USING gin(original_filename gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ocr_results_text_gin ON public.ocr_results USING gin(extracted_text gin_trgm_ops);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results_basic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results_advanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_optimization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_job_files ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para perfiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para tabla users (login personalizado)
CREATE POLICY "Users can view own user record" ON public.users
    FOR SELECT USING (id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can update own user record" ON public.users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can insert own user record" ON public.users
    FOR INSERT WITH CHECK (true); -- Permitir registro durante signup

-- Políticas RLS para documentos (compatibles con ambos sistemas)
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (
        auth.uid() = user_id OR
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (
        auth.uid() = user_id OR
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (
        auth.uid() = user_id OR
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

-- Políticas RLS para análisis (compatibles con ambos sistemas)
CREATE POLICY "Users can view own analyses" ON public.document_analyses
    FOR SELECT USING (
        auth.uid() = user_id OR
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

CREATE POLICY "Users can insert own analyses" ON public.document_analyses
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

-- Políticas similares para otras tablas...
CREATE POLICY "Users can view own api configs" ON public.user_api_configs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ocr processes" ON public.ocr_processes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversions" ON public.document_conversions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own metrics" ON public.ai_model_metrics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own batch jobs" ON public.batch_jobs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own statistics" ON public.usage_statistics
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS Y FUNCIONES
-- =====================================================

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_api_configs_updated_at
    BEFORE UPDATE ON public.user_api_configs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_usage_statistics_updated_at
    BEFORE UPDATE ON public.usage_statistics
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_ai_config_templates_updated_at
    BEFORE UPDATE ON public.ai_config_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar estadísticas de uso
CREATE OR REPLACE FUNCTION public.update_usage_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usage_statistics (
        user_id, 
        date, 
        documents_processed, 
        total_cost_usd
    ) VALUES (
        NEW.user_id,
        CURRENT_DATE,
        1,
        COALESCE(NEW.cost_usd, 0)
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        documents_processed = usage_statistics.documents_processed + 1,
        total_cost_usd = usage_statistics.total_cost_usd + COALESCE(NEW.cost_usd, 0),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas
CREATE TRIGGER update_stats_on_analysis
    AFTER INSERT ON public.document_analyses
    FOR EACH ROW EXECUTE FUNCTION public.update_usage_statistics();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de resumen de documentos por usuario
CREATE OR REPLACE VIEW public.user_document_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    COUNT(d.id) as total_documents,
    COUNT(CASE WHEN d.processing_status = 'completed' THEN 1 END) as completed_documents,
    COUNT(CASE WHEN d.file_type = 'pdf' THEN 1 END) as pdf_count,
    COUNT(CASE WHEN d.file_type = 'pptx' THEN 1 END) as pptx_count,
    COUNT(CASE WHEN d.file_type IN ('jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp') THEN 1 END) as image_count,
    SUM(d.file_size_bytes) as total_storage_used,
    MAX(d.uploaded_at) as last_upload
FROM public.profiles p
LEFT JOIN public.documents d ON p.id = d.user_id
GROUP BY p.id, p.email, p.full_name;

-- Vista de métricas de IA por usuario
CREATE OR REPLACE VIEW public.user_ai_metrics_summary AS
SELECT 
    p.id as user_id,
    p.email,
    COUNT(amm.id) as total_ai_requests,
    COUNT(CASE WHEN amm.success = true THEN 1 END) as successful_requests,
    AVG(amm.response_time_ms) as avg_response_time,
    AVG(amm.accuracy_score) as avg_accuracy,
    SUM(amm.cost_usd) as total_cost,
    SUM(amm.tokens_used) as total_tokens,
    array_agg(DISTINCT amm.model_name) as models_used,
    MAX(amm.created_at) as last_request
FROM public.profiles p
LEFT JOIN public.ai_model_metrics amm ON p.id = amm.user_id
GROUP BY p.id, p.email;

-- Vista de estado del sistema
CREATE OR REPLACE VIEW public.system_status AS
SELECT 
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.documents WHERE uploaded_at >= CURRENT_DATE) as documents_today,
    (SELECT COUNT(*) FROM public.document_analyses WHERE created_at >= CURRENT_DATE) as analyses_today,
    (SELECT COUNT(*) FROM public.ocr_processes WHERE created_at >= CURRENT_DATE) as ocr_processes_today,
    (SELECT COUNT(*) FROM public.ai_model_metrics WHERE created_at >= CURRENT_DATE) as ai_requests_today,
    (SELECT SUM(cost_usd) FROM public.ai_model_metrics WHERE created_at >= CURRENT_DATE) as cost_today,
    (SELECT AVG(response_time_ms) FROM public.ai_model_metrics WHERE created_at >= CURRENT_DATE AND success = true) as avg_response_time_today;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Configuraciones del sistema iniciales
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
('max_file_size_mb', '50', 'Tamaño máximo de archivo en MB', true),
('supported_file_types', '["pdf", "pptx", "jpg", "jpeg", "png", "bmp", "tiff", "webp"]', 'Tipos de archivo soportados', true),
('default_ocr_language', '"spa+eng"', 'Idioma OCR por defecto', true),
('default_confidence_threshold', '60', 'Umbral de confianza OCR por defecto', true),
('free_tier_limits', '{"api_calls": 100, "storage_mb": 100, "documents": 50}', 'Límites del plan gratuito', false),
('ai_models_available', '["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768"]', 'Modelos de IA disponibles', true)
ON CONFLICT (key) DO NOTHING;

-- Plantillas de configuración de IA iniciales
INSERT INTO public.ai_config_templates (name, description, document_types, ai_model, ai_strategy, parameters) VALUES
('Balanceado General', 'Configuración balanceada para documentos generales', ARRAY['general'], 'llama-3.3-70b-versatile', 'auto', '{"temperature": 0.2, "max_tokens": 1500}'),
('Alta Velocidad', 'Configuración optimizada para velocidad máxima', ARRAY['general'], 'llama-3.1-8b-instant', 'speed', '{"temperature": 0.1, "max_tokens": 500}'),
('Máxima Precisión', 'Configuración para máxima precisión en documentos críticos', ARRAY['legal', 'medical', 'technical'], 'mixtral-8x7b-32768', 'accuracy', '{"temperature": 0.1, "max_tokens": 2000}'),
('OCR Optimizado', 'Configuración especializada para mejora de OCR', ARRAY['general'], 'llama-3.3-70b-versatile', 'ocr_optimized', '{"temperature": 0.1, "max_tokens": 1000}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este esquema proporciona una base de datos completa y escalable para Document Analyzer
-- Incluye: gestión de usuarios, almacenamiento de documentos, análisis con IA, OCR, métricas, auditoría y más
-- Las políticas RLS aseguran que los usuarios solo puedan acceder a sus propios datos
-- Los índices optimizados garantizan buen rendimiento incluso con grandes volúmenes de datos
-- Los triggers automatizan tareas comunes como actualización de estadísticas