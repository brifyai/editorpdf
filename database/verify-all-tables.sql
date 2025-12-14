-- =====================================================
-- VERIFICACIÓN COMPLETA DE TABLAS Y CAMPOS EN SUPABASE
-- =====================================================

-- 1. Verificar todas las tablas existentes en la base de datos
SELECT '=== TODAS LAS TABLAS EXISTENTES ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verificar tablas principales y sus columnas
SELECT '=== VERIFICACIÓN DE TABLAS PRINCIPALES ===' as info;

-- Tabla users
SELECT '--- TABLA USERS ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla profiles
SELECT '--- TABLA PROFILES ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla documents
SELECT '--- TABLA DOCUMENTS ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'documents' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla document_analyses
SELECT '--- TABLA DOCUMENT_ANALYSES ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'document_analyses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla batch_jobs
SELECT '--- TABLA BATCH_JOBS ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'batch_jobs' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla batch_job_files
SELECT '--- TABLA BATCH_JOB_FILES ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'batch_job_files' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla user_profiles
SELECT '--- TABLA USER_PROFILES ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla user_preferences
SELECT '--- TABLA USER_PREFERENCES ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla user_configurations
SELECT '--- TABLA USER_CONFIGURATIONS ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_configurations' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla ocr_processes
SELECT '--- TABLA OCR_PROCESSES ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ocr_processes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla ai_model_metrics
SELECT '--- TABLA AI_MODEL_METRICS ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ai_model_metrics' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tabla usage_statistics
SELECT '--- TABLA USAGE_STATISTICS ---' as table_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usage_statistics' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar relaciones y claves foráneas
SELECT '=== RELACIONES Y CLAVES FORÁNEAS ===' as info;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 4. Verificar si existen columnas críticas para el funcionamiento
SELECT '=== VERIFICACIÓN DE COLUMNAS CRÍTICAS ===' as info;

-- Verificar user_int_id en tablas principales
SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = t.table_name 
        AND table_schema = 'public'
        AND column_name = 'user_int_id'
    ) as has_user_int_id
FROM (VALUES 
    ('users'),
    ('profiles'),
    ('documents'),
    ('document_analyses'),
    ('batch_jobs'),
    ('batch_job_files'),
    ('user_profiles'),
    ('user_preferences'),
    ('user_configurations'),
    ('ocr_processes'),
    ('ai_model_metrics'),
    ('usage_statistics')
) AS t(table_name);

-- Verificar user_id (UUID) en tablas principales
SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = t.table_name 
        AND table_schema = 'public'
        AND column_name = 'user_id'
    ) as has_user_id
FROM (VALUES 
    ('users'),
    ('profiles'),
    ('documents'),
    ('document_analyses'),
    ('batch_jobs'),
    ('batch_job_files'),
    ('user_profiles'),
    ('user_preferences'),
    ('user_configurations'),
    ('ocr_processes'),
    ('ai_model_metrics'),
    ('usage_statistics')
) AS t(table_name);

-- 5. Verificar RLS (Row Level Security) está habilitado
SELECT '=== VERIFICACIÓN DE RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. Verificar datos existentes en tablas principales
SELECT '=== DATOS EXISTENTES ===' as info;

SELECT 'Users count:' as table_name, COUNT(*) as count FROM users;
SELECT 'Profiles count:' as table_name, COUNT(*) as count FROM profiles;
SELECT 'Documents count:' as table_name, COUNT(*) as count FROM documents;
SELECT 'Document analyses count:' as table_name, COUNT(*) as count FROM document_analyses;
SELECT 'Batch jobs count:' as table_name, COUNT(*) as count FROM batch_jobs;
SELECT 'Batch job files count:' as table_name, COUNT(*) as count FROM batch_job_files;
SELECT 'User profiles count:' as table_name, COUNT(*) as count FROM user_profiles;
SELECT 'User preferences count:' as table_name, COUNT(*) as count FROM user_preferences;
SELECT 'User configurations count:' as table_name, COUNT(*) as count FROM user_configurations;
SELECT 'OCR processes count:' as table_name, COUNT(*) as count FROM ocr_processes;
SELECT 'AI model metrics count:' as table_name, COUNT(*) as count FROM ai_model_metrics;
SELECT 'Usage statistics count:' as table_name, COUNT(*) as count FROM usage_statistics;

-- 8. Mensaje final
SELECT '✅ VERIFICACIÓN COMPLETADA' as status;