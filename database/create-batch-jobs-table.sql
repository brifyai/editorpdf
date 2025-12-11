-- Crear tabla para trabajos de procesamiento por lotes
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
    file_list JSONB DEFAULT '[]', -- Lista de archivos procesados
    results_summary JSONB DEFAULT '{}', -- Resumen de resultados
    
    -- Índices para rendimiento
    CONSTRAINT batch_jobs_status_check CHECK (processed_files <= total_files),
    CONSTRAINT batch_jobs_files_check CHECK (successful_files + failed_files = processed_files)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_int_id ON batch_jobs(user_int_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created_at ON batch_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_user_status ON batch_jobs(user_int_id, status);

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
    
    -- Índices
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para batch_job_files
CREATE INDEX IF NOT EXISTS idx_batch_job_files_batch_job_id ON batch_job_files(batch_job_id);
CREATE INDEX IF NOT EXISTS idx_batch_job_files_status ON batch_job_files(status);
CREATE INDEX IF NOT EXISTS idx_batch_job_files_document_id ON batch_job_files(document_id);

-- Crear función para actualizar estadísticas del batch job
CREATE OR REPLACE FUNCTION update_batch_job_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar contador de archivos procesados
    UPDATE batch_jobs 
    SET 
        processed_files = (
            SELECT COUNT(*) 
            FROM batch_job_files 
            WHERE batch_job_id = NEW.batch_job_id 
            AND status IN ('completed', 'failed')
        ),
        successful_files = (
            SELECT COUNT(*) 
            FROM batch_job_files 
            WHERE batch_job_id = NEW.batch_job_id 
            AND status = 'completed' 
            AND success = true
        ),
        failed_files = (
            SELECT COUNT(*) 
            FROM batch_job_files 
            WHERE batch_job_id = NEW.batch_job_id 
            AND (status = 'failed' OR (status = 'completed' AND success = false))
        ),
        total_pages = (
            SELECT COALESCE(SUM(page_count), 0) 
            FROM batch_job_files 
            WHERE batch_job_id = NEW.batch_job_id 
            AND success = true
        ),
        total_words = (
            SELECT COALESCE(SUM(word_count), 0) 
            FROM batch_job_files 
            WHERE batch_job_id = NEW.batch_job_id 
            AND success = true
        ),
        total_characters = (
            SELECT COALESCE(SUM(character_count), 0) 
            FROM batch_job_files 
            WHERE batch_job_id = NEW.batch_job_id 
            AND success = true
        ),
        average_processing_time_ms = (
            SELECT COALESCE(AVG(processing_time_ms), 0) 
            FROM batch_job_files 
            WHERE batch_job_id = NEW.batch_job_id 
            AND success = true
        )
    WHERE id = NEW.batch_job_id;
    
    -- Si todos los archivos están procesados, actualizar estado del job
    IF (SELECT processed_files FROM batch_jobs WHERE id = NEW.batch_job_id) = 
       (SELECT total_files FROM batch_jobs WHERE id = NEW.batch_job_id) THEN
        UPDATE batch_jobs 
        SET 
            status = CASE 
                WHEN failed_files = 0 THEN 'completed'
                WHEN successful_files = 0 THEN 'failed'
                ELSE 'completed'
            END,
            completed_at = NOW()
        WHERE id = NEW.batch_job_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar estadísticas
DROP TRIGGER IF EXISTS trigger_update_batch_job_stats ON batch_job_files;
CREATE TRIGGER trigger_update_batch_job_stats
    AFTER INSERT OR UPDATE ON batch_job_files
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_job_stats();

-- Habilitar RLS (Row Level Security)
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_job_files ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para batch_jobs
CREATE POLICY "Users can view their own batch jobs" ON batch_jobs
    FOR SELECT USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can create their own batch jobs" ON batch_jobs
    FOR INSERT WITH CHECK (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can update their own batch jobs" ON batch_jobs
    FOR UPDATE USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

CREATE POLICY "Users can delete their own batch jobs" ON batch_jobs
    FOR DELETE USING (user_int_id = current_setting('app.current_user_id', true)::INTEGER);

-- Políticas de RLS para batch_job_files
CREATE POLICY "Users can view files from their batch jobs" ON batch_job_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM batch_jobs 
            WHERE batch_jobs.id = batch_job_files.batch_job_id 
            AND batch_jobs.user_int_id = current_setting('app.current_user_id', true)::INTEGER
        )
    );

CREATE POLICY "Users can create files for their batch jobs" ON batch_job_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM batch_jobs 
            WHERE batch_jobs.id = batch_job_files.batch_job_id 
            AND batch_jobs.user_int_id = current_setting('app.current_user_id', true)::INTEGER
        )
    );

CREATE POLICY "Users can update files in their batch jobs" ON batch_job_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM batch_jobs 
            WHERE batch_jobs.id = batch_job_files.batch_job_id 
            AND batch_jobs.user_int_id = current_setting('app.current_user_id', true)::INTEGER
        )
    );

-- Forzar recarga del schema de Supabase
NOTIFY pgrst, 'reload schema';

-- Confirmación
SELECT 'batch_jobs table and related objects created successfully' as status;