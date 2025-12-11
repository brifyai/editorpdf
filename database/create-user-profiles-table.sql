-- Crear tabla para perfiles de usuario extendidos
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
    
    -- Índices y restricciones
    CONSTRAINT user_profiles_unique_user UNIQUE (user_int_id)
);

-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_int_id ON user_profiles(user_int_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login_at ON user_profiles(last_login_at DESC);

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
    
    -- Índices
    CONSTRAINT user_preferences_unique_user UNIQUE (user_int_id)
);

-- Crear índices para user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_int_id ON user_preferences(user_int_id);

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
    
    -- Índices y restricciones
    CONSTRAINT user_usage_stats_unique_user_date_period UNIQUE (user_int_id, stat_date, stat_period)
);

-- Crear índices para user_usage_stats
CREATE INDEX IF NOT EXISTS idx_user_usage_stats_user_int_id ON user_usage_stats(user_int_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_stats_date ON user_usage_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_usage_stats_period ON user_usage_stats(stat_period);

-- Crear función para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para updated_at
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_usage_stats_updated_at ON user_usage_stats;
CREATE TRIGGER trigger_user_usage_stats_updated_at
    BEFORE UPDATE ON user_usage_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear función para actualizar estadísticas de usuario automáticamente
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar contador de análisis en el perfil del usuario
    IF TG_TABLE_NAME = 'document_analyses' AND NEW.status = 'completed' THEN
        UPDATE user_profiles 
        SET 
            total_analyses = total_analyses + 1,
            last_analysis_date = NEW.created_at,
            total_processing_time_ms = total_processing_time_ms + COALESCE(NEW.processing_time_ms, 0)
        WHERE user_int_id = NEW.user_int_id;
        
        -- Actualizar documentos procesados si es un nuevo documento
        IF TG_OP = 'INSERT' THEN
            UPDATE user_profiles 
            SET total_documents_processed = total_documents_processed + 1
            WHERE user_int_id = NEW.user_int_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualización automática de estadísticas
DROP TRIGGER IF EXISTS trigger_update_user_stats_analyses ON document_analyses;
CREATE TRIGGER trigger_update_user_stats_analyses
    AFTER INSERT OR UPDATE ON document_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_stats ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can create their own profile" ON user_profiles
    FOR INSERT WITH CHECK (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

-- Políticas de RLS para user_preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

-- Políticas de RLS para user_usage_stats
CREATE POLICY "Users can view their own usage stats" ON user_usage_stats
    FOR SELECT USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can insert their own usage stats" ON user_usage_stats
    FOR INSERT WITH CHECK (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

-- Crear función para inicializar perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION initialize_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar perfil de usuario por defecto
    INSERT INTO user_profiles (
        user_int_id,
        display_name,
        theme,
        language,
        timezone,
        default_analysis_strategy,
        default_ocr_confidence,
        max_file_size_mb,
        max_batch_files,
        subscription_tier,
        api_usage_limit,
        storage_quota_mb
    ) VALUES (
        NEW.id,
        COALESCE(NEW.first_name || ' ' || NEW.last_name, NEW.username),
        'light',
        'es',
        'UTC',
        'balanced',
        75,
        50,
        10,
        'free',
        100,
        100
    );
    
    -- Insertar preferencias por defecto
    INSERT INTO user_preferences (
        user_int_id,
        preferred_ocr_language,
        preferred_ai_provider,
        ai_temperature,
        ai_max_tokens,
        export_format,
        notify_analysis_complete,
        notify_batch_complete,
        data_retention_days
    ) VALUES (
        NEW.id,
        'spa',
        'groq',
        0.2,
        1500,
        'pdf',
        true,
        true,
        365
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para inicializar perfil automáticamente
DROP TRIGGER IF EXISTS trigger_initialize_user_profile ON users;
CREATE TRIGGER trigger_initialize_user_profile
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_profile();

-- Forzar recarga del schema de Supabase
NOTIFY pgrst, 'reload schema';

-- Confirmación
SELECT 'user_profiles and related tables created successfully' as status;