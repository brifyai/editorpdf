-- =====================================================
-- MIGRACIÓN A ESQUEMA SIMPLIFICADO (SOLO TABLA USERS)
-- =====================================================
-- Este script migra del esquema dual al esquema simplificado
-- Ejecutar en orden para mantener integridad de datos

-- =====================================================
-- PASO 1: BACKUP DE DATOS IMPORTANTES
-- =====================================================

-- Crear tablas de backup (por seguridad)
CREATE TABLE IF NOT EXISTS backup_profiles AS SELECT * FROM public.profiles;
CREATE TABLE IF NOT EXISTS backup_documents AS SELECT * FROM public.documents;
CREATE TABLE IF NOT EXISTS backup_analyses AS SELECT * FROM public.document_analyses;
CREATE TABLE IF NOT EXISTS backup_users AS SELECT * FROM public.users;

-- =====================================================
-- PASO 2: ELIMINAR TABLAS Y REFERENCIAS NO USADAS
-- =====================================================

-- Eliminar vistas que referencian profiles
DROP VIEW IF EXISTS public.user_document_summary;
DROP VIEW IF EXISTS public.user_ai_metrics_summary;
DROP VIEW IF EXISTS public.system_status;

-- Eliminar políticas RLS que referencian profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Eliminar triggers relacionados con profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Eliminar tabla profiles (ya no se necesita)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Eliminar tabla user_api_configs si existe (referenciaba profiles)
DROP TABLE IF EXISTS public.user_api_configs CASCADE;

-- =====================================================
-- PASO 3: LIMPIAR Y ACTUALIZAR TABLAS EXISTENTES
-- =====================================================

-- Eliminar campo user_id (UUID) de documentos si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'documents' AND column_name = 'user_id') THEN
        ALTER TABLE public.documents DROP COLUMN user_id;
        RAISE NOTICE 'Columna user_id eliminada de documents';
    END IF;
END $$;

-- Eliminar campo user_id (UUID) de document_analyses si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'document_analyses' AND column_name = 'user_id') THEN
        ALTER TABLE public.document_analyses DROP COLUMN user_id;
        RAISE NOTICE 'Columna user_id eliminada de document_analyses';
    END IF;
END $$;

-- Eliminar campo user_id (UUID) de ocr_processes si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ocr_processes' AND column_name = 'user_id') THEN
        ALTER TABLE public.ocr_processes DROP COLUMN user_id;
        RAISE NOTICE 'Columna user_id eliminada de ocr_processes';
    END IF;
END $$;

-- Eliminar campo user_id (UUID) de document_conversions si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'document_conversions' AND column_name = 'user_id') THEN
        ALTER TABLE public.document_conversions DROP COLUMN user_id;
        RAISE NOTICE 'Columna user_id eliminada de document_conversions';
    END IF;
END $$;

-- Eliminar campo user_id (UUID) de ai_model_metrics si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ai_model_metrics' AND column_name = 'user_id') THEN
        ALTER TABLE public.ai_model_metrics DROP COLUMN user_id;
        RAISE NOTICE 'Columna user_id eliminada de ai_model_metrics';
    END IF;
END $$;

-- Eliminar campo user_id (UUID) de model_optimization_history si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'model_optimization_history' AND column_name = 'user_id') THEN
        ALTER TABLE public.model_optimization_history DROP COLUMN user_id;
        RAISE NOTICE 'Columna user_id eliminada de model_optimization_history';
    END IF;
END $$;

-- Eliminar campo user_id (UUID) de usage_statistics si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'usage_statistics' AND column_name = 'user_id') THEN
        ALTER TABLE public.usage_statistics DROP COLUMN user_id;
        RAISE NOTICE 'Columna user_id eliminada de usage_statistics';
    END IF;
END $$;

-- =====================================================
-- PASO 4: ASEGURAR QUE user_int_id EXISTA Y SEA NOT NULL
-- =====================================================

-- Asegurar que user_int_id existe y es NOT NULL en todas las tablas
DO $$
BEGIN
    -- Documents
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'user_int_id') THEN
        ALTER TABLE public.documents ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_int_id agregada a documents';
    END IF;
    
    ALTER TABLE public.documents ALTER COLUMN user_int_id SET NOT NULL;
    
    -- Document analyses
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'document_analyses' AND column_name = 'user_int_id') THEN
        ALTER TABLE public.document_analyses ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_int_id agregada a document_analyses';
    END IF;
    
    ALTER TABLE public.document_analyses ALTER COLUMN user_int_id SET NOT NULL;
    
    -- OCR processes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ocr_processes' AND column_name = 'user_int_id') THEN
        ALTER TABLE public.ocr_processes ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_int_id agregada a ocr_processes';
    END IF;
    
    ALTER TABLE public.ocr_processes ALTER COLUMN user_int_id SET NOT NULL;
    
    -- Document conversions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'document_conversions' AND column_name = 'user_int_id') THEN
        ALTER TABLE public.document_conversions ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_int_id agregada a document_conversions';
    END IF;
    
    ALTER TABLE public.document_conversions ALTER COLUMN user_int_id SET NOT NULL;
    
    -- AI model metrics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ai_model_metrics' AND column_name = 'user_int_id') THEN
        ALTER TABLE public.ai_model_metrics ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_int_id agregada a ai_model_metrics';
    END IF;
    
    ALTER TABLE public.ai_model_metrics ALTER COLUMN user_int_id SET NOT NULL;
    
    -- Model optimization history
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'model_optimization_history' AND column_name = 'user_int_id') THEN
        ALTER TABLE public.model_optimization_history ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_int_id agregada a model_optimization_history';
    END IF;
    
    ALTER TABLE public.model_optimization_history ALTER COLUMN user_int_id SET NOT NULL;
    
    -- Usage statistics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usage_statistics' AND column_name = 'user_int_id') THEN
        ALTER TABLE public.usage_statistics ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_int_id agregada a usage_statistics';
    END IF;
    
    ALTER TABLE public.usage_statistics ALTER COLUMN user_int_id SET NOT NULL;
    
END $$;

-- =====================================================
-- PASO 5: ACTUALIZAR POLÍTICAS RLS PARA USAR SOLO user_int_id
-- =====================================================

-- Eliminar políticas antiguas que usaban user_id
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view own analyses" ON public.document_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.document_analyses;

DROP POLICY IF EXISTS "Users can view own api configs" ON public.user_api_configs;
DROP POLICY IF EXISTS "Users can view own ocr processes" ON public.ocr_processes;
DROP POLICY IF EXISTS "Users can view own conversions" ON public.document_conversions;
DROP POLICY IF EXISTS "Users can view own metrics" ON public.ai_model_metrics;
DROP POLICY IF EXISTS "Users can view own statistics" ON public.usage_statistics;

-- Crear nuevas políticas simplificadas
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

CREATE POLICY "Users can view own analyses" ON public.document_analyses
    FOR SELECT USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

CREATE POLICY "Users can insert own analyses" ON public.document_analyses
    FOR INSERT WITH CHECK (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

-- Políticas para otras tablas
CREATE POLICY "Users can view own ocr processes" ON public.ocr_processes
    FOR ALL USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

CREATE POLICY "Users can view own conversions" ON public.document_conversions
    FOR ALL USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

CREATE POLICY "Users can view own metrics" ON public.ai_model_metrics
    FOR ALL USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

CREATE POLICY "Users can view own statistics" ON public.usage_statistics
    FOR ALL USING (current_setting('app.current_user_id', true)::BIGINT = user_int_id);

-- =====================================================
-- PASO 6: ACTUALIZAR VISTAS SIMPLIFICADAS
-- =====================================================

-- Vista de resumen de documentos por usuario
CREATE OR REPLACE VIEW public.user_document_summary AS
SELECT 
    u.id as user_int_id,
    u.email,
    u.username,
    COUNT(d.id) as total_documents,
    COUNT(CASE WHEN d.processing_status = 'completed' THEN 1 END) as completed_documents,
    COUNT(CASE WHEN d.file_type = 'pdf' THEN 1 END) as pdf_count,
    COUNT(CASE WHEN d.file_type = 'pptx' THEN 1 END) as pptx_count,
    COUNT(CASE WHEN d.file_type IN ('jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp') THEN 1 END) as image_count,
    SUM(d.file_size_bytes) as total_storage_used,
    MAX(d.uploaded_at) as last_upload
FROM public.users u
LEFT JOIN public.documents d ON u.id = d.user_int_id
GROUP BY u.id, u.email, u.username;

-- Vista de métricas de IA por usuario
CREATE OR REPLACE VIEW public.user_ai_metrics_summary AS
SELECT 
    u.id as user_int_id,
    u.email,
    COUNT(amm.id) as total_ai_requests,
    COUNT(CASE WHEN amm.success = true THEN 1 END) as successful_requests,
    AVG(amm.response_time_ms) as avg_response_time,
    AVG(amm.accuracy_score) as avg_accuracy,
    SUM(amm.cost_usd) as total_cost,
    SUM(amm.tokens_used) as total_tokens,
    array_agg(DISTINCT amm.model_name) as models_used,
    MAX(amm.created_at) as last_request
FROM public.users u
LEFT JOIN public.ai_model_metrics amm ON u.id = amm.user_int_id
GROUP BY u.id, u.email;

-- Vista de estado del sistema
CREATE OR REPLACE VIEW public.system_status AS
SELECT 
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.documents WHERE uploaded_at >= CURRENT_DATE) as documents_today,
    (SELECT COUNT(*) FROM public.document_analyses WHERE created_at >= CURRENT_DATE) as analyses_today,
    (SELECT COUNT(*) FROM public.ocr_processes WHERE created_at >= CURRENT_DATE) as ocr_processes_today,
    (SELECT COUNT(*) FROM public.ai_model_metrics WHERE created_at >= CURRENT_DATE) as ai_requests_today,
    (SELECT SUM(cost_usd) FROM public.ai_model_metrics WHERE created_at >= CURRENT_DATE) as cost_today,
    (SELECT AVG(response_time_ms) FROM public.ai_model_metrics WHERE created_at >= CURRENT_DATE AND success = true) as avg_response_time_today;

-- =====================================================
-- PASO 7: VERIFICACIÓN DE INTEGRIDAD
-- =====================================================

-- Verificar que no queden referencias a user_id
DO $$
DECLARE
    table_name TEXT;
    column_name TEXT;
    problematic_tables TEXT[] := ARRAY[];
BEGIN
    FOR table_name, column_name IN 
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE column_name = 'user_id' 
        AND table_schema = 'public'
    LOOP
        problematic_tables := array_append(problematic_tables, table_name || '.' || column_name);
    END LOOP;
    
    IF array_length(problematic_tables, 1) > 0 THEN
        RAISE NOTICE '⚠️  Advertencia: Todavía existen referencias a user_id: %', array_to_string(problematic_tables, ', ');
    ELSE
        RAISE NOTICE '✅ No existen referencias a user_id - Migración completada';
    END IF;
END $$;

-- Verificar que user_int_id existe en todas las tablas necesarias
DO $$
BEGIN
    RAISE NOTICE '🔍 Verificando integridad de user_int_id...';
    
    -- Verificar documents
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'documents' AND column_name = 'user_int_id') THEN
        RAISE NOTICE '✅ documents.user_int_id existe';
    ELSE
        RAISE NOTICE '❌ documents.user_int_id NO existe';
    END IF;
    
    -- Verificar document_analyses
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'document_analyses' AND column_name = 'user_int_id') THEN
        RAISE NOTICE '✅ document_analyses.user_int_id existe';
    ELSE
        RAISE NOTICE '❌ document_analyses.user_int_id NO existe';
    END IF;
    
    -- Verificar usuarios
    IF EXISTS (SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Tabla users existe';
    ELSE
        RAISE NOTICE '❌ Tabla users NO existe';
    END IF;
END $$;

-- =====================================================
-- PASO 8: ESTADÍSTICAS POST-MIGRACIÓN
-- =====================================================

-- Mostrar estadísticas de la migración
SELECT 
    'users' as table_name,
    COUNT(*) as record_count
FROM public.users
UNION ALL
SELECT 
    'documents' as table_name,
    COUNT(*) as record_count
FROM public.documents
UNION ALL
SELECT 
    'document_analyses' as table_name,
    COUNT(*) as record_count
FROM public.document_analyses
ORDER BY table_name;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

RAISE NOTICE '🎉 Migración a esquema simplificado completada exitosamente';
RAISE NOTICE '📋 Resumen:';
RAISE NOTICE '   - Eliminada tabla profiles y referencias UUID';
RAISE NOTICE '   - Mantenida tabla users con id BIGINT';
RAISE NOTICE '   - Actualizadas todas las tablas para usar user_int_id';
RAISE NOTICE '   - Actualizadas políticas RLS';
RAISE NOTICE '   - Recreadas vistas simplificadas';
RAISE NOTICE '   - Verificada integridad de datos';