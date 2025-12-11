-- =====================================================
-- DIAGNÓSTICO Y REPARACIÓN DE user_int_id (VERSIÓN CORREGIDA)
-- =====================================================

-- Primero, verificar el estado actual de la tabla users
SELECT '=== DIAGNÓSTICO DE TABLA USERS ===' as info;

-- Verificar estructura de la tabla users
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar si user_int_id existe en la tabla users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'user_int_id';

-- Verificar datos actuales en users
SELECT id, email, username, first_name, last_name, created_at 
FROM users 
LIMIT 5;

-- =====================================================
-- REPARACIÓN: Asegurar que user_int_id exista y sea el ID principal
-- =====================================================

SELECT '=== INICIANDO REPARACIÓN ===' as info;

-- Si user_int_id no existe, agregarlo como alias de id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'user_int_id'
    ) THEN
        -- Agregar columna user_int_id si no existe
        EXECUTE 'ALTER TABLE users ADD COLUMN user_int_id INTEGER';
        
        -- Copiar valores de id a user_int_id
        EXECUTE 'UPDATE users SET user_int_id = id WHERE user_int_id IS NULL';
        
        -- Hacer user_int_id NOT NULL
        EXECUTE 'ALTER TABLE users ALTER COLUMN user_int_id SET NOT NULL';
        
        RAISE NOTICE '✅ Columna user_int_id agregada y poblada correctamente';
    ELSE
        RAISE NOTICE '✅ Columna user_int_id ya existe';
    END IF;
END $$;

-- =====================================================
-- CREAR TABLAS SI NO EXISTEN (con user_int_id correcto)
-- =====================================================

SELECT '=== CREANDO TABLAS SI NO EXISTEN ===' as info;

-- Crear tablas de batch jobs si no existen
CREATE TABLE IF NOT EXISTS batch_jobs (
    id BIGSERIAL PRIMARY KEY,
    user_int_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_name VARCHAR(255),
    job_description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_files INTEGER NOT NULL DEFAULT 0,
    processed_files INTEGER NOT NULL DEFAULT 0,
    successful_files INTEGER NOT NULL DEFAULT 0,
    failed_files INTEGER NOT NULL DEFAULT 0,
    
    -- Configuración del trabajo
    analysis_config JSONB DEFAULT '{}',
    use_ai BOOLEAN DEFAULT false,
    ai_strategy VARCHAR(100) DEFAULT 'balanced',
    ocr_confidence INTEGER DEFAULT 75,
    
    -- Tiempos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Métricas
    total_processing_time_ms INTEGER DEFAULT 0,
    average_processing_time_ms INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10,6) DEFAULT 0,
    
    -- Resultados agregados
    total_pages INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    total_characters INTEGER DEFAULT 0,
    
    -- Metadatos
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Archivos y resultados
    file_list JSONB DEFAULT '[]',
    results_summary JSONB DEFAULT '{}'
);

-- Crear tabla para detalles de archivos en lotes
CREATE TABLE IF NOT EXISTS batch_job_files (
    id BIGSERIAL PRIMARY KEY,
    batch_job_id BIGINT NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
    document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    
    -- Información del archivo
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    file_path VARCHAR(500),
    
    -- Estado del procesamiento
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    processing_time_ms INTEGER DEFAULT 0,
    
    -- Resultados
    analysis_id BIGINT REFERENCES document_analyses(id) ON DELETE SET NULL,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    
    -- Métricas del archivo
    page_count INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    
    -- Resultados del análisis
    analysis_results JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_int_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Información personal extendida
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    timezone VARCHAR(100) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'es',
    
    -- Preferencias de interfaz
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    ui_language VARCHAR(10) DEFAULT 'es',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(10) DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    
    -- Preferencias de análisis
    default_analysis_strategy VARCHAR(50) DEFAULT 'balanced',
    default_ocr_confidence INTEGER DEFAULT 75,
    default_use_ai BOOLEAN DEFAULT false,
    default_ai_model VARCHAR(100),
    auto_save_analyses BOOLEAN DEFAULT true,
    
    -- Configuraciones avanzadas
    max_file_size_mb INTEGER DEFAULT 50,
    max_batch_files INTEGER DEFAULT 10,
    preferred_export_format VARCHAR(20) DEFAULT 'pdf',
    auto_delete_temp_files BOOLEAN DEFAULT true,
    
    -- Métricas y estadísticas
    total_analyses INTEGER DEFAULT 0,
    total_documents_processed INTEGER DEFAULT 0,
    total_processing_time_ms BIGINT DEFAULT 0,
    storage_used_mb DECIMAL(10,2) DEFAULT 0,
    last_analysis_date TIMESTAMP WITH TIME ZONE,
    
    -- Estado y suscripción
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    api_usage_limit INTEGER DEFAULT 100,
    monthly_api_count INTEGER DEFAULT 0,
    storage_quota_mb INTEGER DEFAULT 100,
    
    -- Campos de auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Configuraciones JSON para flexibilidad
    preferences JSONB DEFAULT '{}',
    custom_settings JSONB DEFAULT '{}',
    api_keys_encrypted JSONB DEFAULT '{}',
    
    CONSTRAINT user_profiles_unique_user UNIQUE (user_int_id)
);

-- Crear tabla para preferencias detalladas del usuario
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_int_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Preferencias de análisis de documentos
    preferred_ocr_language VARCHAR(10) DEFAULT 'spa',
    ocr_preprocessing BOOLEAN DEFAULT true,
    ocr_auto_rotate BOOLEAN DEFAULT true,
    ocr_enhance_contrast BOOLEAN DEFAULT true,
    ocr_remove_noise BOOLEAN DEFAULT false,
    
    -- Preferencias de IA
    preferred_ai_provider VARCHAR(50) DEFAULT 'groq',
    preferred_ai_model VARCHAR(100),
    ai_temperature DECIMAL(3,2) DEFAULT 0.2,
    ai_max_tokens INTEGER DEFAULT 1500,
    ai_auto_summarize BOOLEAN DEFAULT false,
    ai_extract_keywords BOOLEAN DEFAULT true,
    ai_sentiment_analysis BOOLEAN DEFAULT true,
    
    -- Preferencias de exportación
    export_format VARCHAR(20) DEFAULT 'pdf',
    export_include_images BOOLEAN DEFAULT true,
    export_include_metadata BOOLEAN DEFAULT true,
    export_quality VARCHAR(20) DEFAULT 'high',
    
    -- Preferencias de notificaciones
    notify_analysis_complete BOOLEAN DEFAULT true,
    notify_batch_complete BOOLEAN DEFAULT true,
    notify_storage_limit BOOLEAN DEFAULT true,
    notify_subscription_expiry BOOLEAN DEFAULT true,
    notification_email_frequency VARCHAR(20) DEFAULT 'immediate',
    
    -- Preferencias de privacidad
    share_analytics_data BOOLEAN DEFAULT false,
    enable_usage_tracking BOOLEAN DEFAULT true,
    data_retention_days INTEGER DEFAULT 365,
    
    -- Configuraciones de dashboard
    dashboard_layout JSONB DEFAULT '{}',
    favorite_analyses JSONB DEFAULT '[]',
    recent_files_limit INTEGER DEFAULT 10,
    
    -- Campos de auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT user_preferences_unique_user UNIQUE (user_int_id)
);

-- Crear tabla para estadísticas de uso del usuario
CREATE TABLE IF NOT EXISTS user_usage_stats (
    id BIGSERIAL PRIMARY KEY,
    user_int_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Período de estadísticas
    stat_date DATE NOT NULL,
    stat_period VARCHAR(20) NOT NULL CHECK (stat_period IN ('daily', 'weekly', 'monthly')),
    
    -- Estadísticas de documentos
    documents_analyzed INTEGER DEFAULT 0,
    documents_uploaded INTEGER DEFAULT 0,
    pages_processed INTEGER DEFAULT 0,
    words_extracted INTEGER DEFAULT 0,
    
    -- Estadísticas de análisis
    analyses_completed INTEGER DEFAULT 0,
    batch_jobs_completed INTEGER DEFAULT 0,
    ai_analyses_completed INTEGER DEFAULT 0,
    ocr_operations INTEGER DEFAULT 0,
    
    -- Estadísticas de rendimiento
    total_processing_time_ms BIGINT DEFAULT 0,
    average_processing_time_ms INTEGER DEFAULT 0,
    successful_analyses INTEGER DEFAULT 0,
    failed_analyses INTEGER DEFAULT 0,
    
    -- Estadísticas de almacenamiento
    storage_used_mb DECIMAL(10,2) DEFAULT 0,
    storage_added_mb DECIMAL(10,2) DEFAULT 0,
    storage_deleted_mb DECIMAL(10,2) DEFAULT 0,
    
    -- Estadísticas de API
    api_calls_made INTEGER DEFAULT 0,
    api_tokens_used INTEGER DEFAULT 0,
    api_cost_usd DECIMAL(10,6) DEFAULT 0,
    
    -- Campos de auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT user_usage_stats_unique_user_date_period UNIQUE (user_int_id, stat_date, stat_period)
);

-- =====================================================
-- CREAR ÍNDICES PARA RENDIMIENTO
-- =====================================================

SELECT '=== CREANDO ÍNDICES ===' as info;

-- Índices para batch_jobs
CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_int_id ON batch_jobs(user_int_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_at ON batch_jobs(created_at DESC);

-- Índices para batch_job_files
CREATE INDEX IF NOT EXISTS idx_batch_job_files_batch_job_id ON batch_job_files(batch_job_id);
CREATE INDEX IF NOT EXISTS idx_batch_job_files_status ON batch_job_files(status);

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_int_id ON user_profiles(user_int_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

-- Índices para user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_int_id ON user_preferences(user_int_id);

-- Índices para user_usage_stats
CREATE INDEX IF NOT EXISTS idx_user_usage_stats_user_int_id ON user_usage_stats(user_int_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_stats_date ON user_usage_stats(stat_date DESC);

-- =====================================================
-- HABILITAR RLS Y CREAR POLÍTICAS (VERSIÓN CORREGIDA)
-- =====================================================

SELECT '=== CONFIGURANDO SEGURIDAD (RLS) ===' as info;

-- Habilitar RLS en todas las tablas
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_job_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_stats ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes antes de crear nuevas (evitar errores)
DO $$
BEGIN
    -- Políticas para batch_jobs
    DROP POLICY IF EXISTS "Users can view their own batch jobs" ON batch_jobs;
    DROP POLICY IF EXISTS "Users can create their own batch jobs" ON batch_jobs;
    DROP POLICY IF EXISTS "Users can update their own batch jobs" ON batch_jobs;
    DROP POLICY IF EXISTS "Users can delete their own batch jobs" ON batch_jobs;
    
    -- Políticas para user_profiles
    DROP POLICY IF EXISTS "Users can manage their own profiles" ON user_profiles;
    
    -- Políticas para user_preferences
    DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
    
    -- Políticas para user_usage_stats
    DROP POLICY IF EXISTS "Users can view their own usage stats" ON user_usage_stats;
    DROP POLICY IF EXISTS "Users can insert their own usage stats" ON user_usage_stats;
END $$;

-- Crear políticas para batch_jobs
CREATE POLICY "Users can view their own batch jobs" ON batch_jobs
    FOR SELECT USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can create their own batch jobs" ON batch_jobs
    FOR INSERT WITH CHECK (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can update their own batch jobs" ON batch_jobs
    FOR UPDATE USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can delete their own batch jobs" ON batch_jobs
    FOR DELETE USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

-- Políticas para user_profiles
CREATE POLICY "Users can manage their own profiles" ON user_profiles
    FOR ALL USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

-- Políticas para user_preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

-- Políticas para user_usage_stats
CREATE POLICY "Users can view their own usage stats" ON user_usage_stats
    FOR SELECT USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can insert their own usage stats" ON user_usage_stats
    FOR INSERT WITH CHECK (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Verificar que todas las tablas existan y tengan user_int_id
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('batch_jobs', 'batch_job_files', 'user_profiles', 'user_preferences', 'user_usage_stats')
    AND column_name = 'user_int_id'
ORDER BY table_name;

-- Verificar usuarios existentes y sus user_int_id
SELECT id, email, username, user_int_id 
FROM users 
ORDER BY id;

-- Forzar recarga del schema de Supabase
NOTIFY pgrst, 'reload schema';

SELECT '✅ DIAGNÓSTICO Y REPARACIÓN COMPLETADOS (VERSIÓN CORREGIDA)' as status;