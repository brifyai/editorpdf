-- =====================================================
-- VERIFICAR COLUMNAS DE TABLAS BATCH
-- =====================================================

-- Verificar estructura de batch_job_files
SELECT '=== ESTRUCTURA DE batch_job_files ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'batch_job_files' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar específicamente si original_filename existe
SELECT '=== VERIFICANDO original_filename ===' as info;
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'batch_job_files' 
    AND table_schema = 'public'
    AND column_name = 'original_filename'
) as original_filename_exists;

-- Si no existe, agregarla manualmente
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'batch_job_files' 
        AND table_schema = 'public'
        AND column_name = 'original_filename'
    ) THEN
        EXECUTE 'ALTER TABLE batch_job_files ADD COLUMN original_filename VARCHAR(255)';
        RAISE NOTICE '✅ Columna original_filename agregada manualmente';
    ELSE
        RAISE NOTICE '✅ Columna original_filename ya existe';
    END IF;
END $$;

-- Verificar otras columnas importantes
SELECT '=== VERIFICANDO OTRAS COLUMNAS IMPORTANTES ===' as info;

SELECT 
    column_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'batch_job_files' 
        AND table_schema = 'public'
        AND column_name = c.column_name
    ) as exists
FROM (VALUES 
    ('file_type'),
    ('file_size_bytes'),
    ('file_path'),
    ('status'),
    ('processing_time_ms'),
    ('page_count'),
    ('word_count'),
    ('character_count'),
    ('confidence_score'),
    ('analysis_results')
) AS c(column_name);

-- Verificación final de batch_job_files
SELECT '=== VERIFICACIÓN FINAL DE batch_job_files ===' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'batch_job_files' 
    AND table_schema = 'public'
    AND column_name IN ('original_filename', 'file_type', 'file_size_bytes', 'status')
ORDER BY column_name;

-- Forzar refresco del schema
NOTIFY pgrst, 'reload schema';

SELECT '✅ VERIFICACIÓN COMPLETADA' as status;