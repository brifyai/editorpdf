-- =====================================================
-- AGREGAR user_int_id A TODAS LAS TABLAS QUE FALTAN
-- =====================================================

-- Verificar y agregar user_int_id a batch_jobs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'batch_jobs' 
        AND table_schema = 'public'
        AND column_name = 'user_int_id'
    ) THEN
        EXECUTE 'ALTER TABLE batch_jobs ADD COLUMN user_int_id INTEGER';
        RAISE NOTICE '✅ user_int_id agregado a batch_jobs';
    ELSE
        RAISE NOTICE '✅ user_int_id ya existe en batch_jobs';
    END IF;
END $$;

-- Verificar y agregar user_int_id a batch_job_files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'batch_job_files' 
        AND table_schema = 'public'
        AND column_name = 'user_int_id'
    ) THEN
        EXECUTE 'ALTER TABLE batch_job_files ADD COLUMN user_int_id INTEGER';
        RAISE NOTICE '✅ user_int_id agregado a batch_job_files';
    ELSE
        RAISE NOTICE '✅ user_int_id ya existe en batch_job_files';
    END IF;
END $$;

-- Verificar y agregar user_int_id a user_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND table_schema = 'public'
        AND column_name = 'user_int_id'
    ) THEN
        EXECUTE 'ALTER TABLE user_profiles ADD COLUMN user_int_id INTEGER';
        RAISE NOTICE '✅ user_int_id agregado a user_profiles';
    ELSE
        RAISE NOTICE '✅ user_int_id ya existe en user_profiles';
    END IF;
END $$;

-- Verificar y agregar user_int_id a user_preferences
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND table_schema = 'public'
        AND column_name = 'user_int_id'
    ) THEN
        EXECUTE 'ALTER TABLE user_preferences ADD COLUMN user_int_id INTEGER';
        RAISE NOTICE '✅ user_int_id agregado a user_preferences';
    ELSE
        RAISE NOTICE '✅ user_int_id ya existe en user_preferences';
    END IF;
END $$;

-- Verificar y agregar user_int_id a user_usage_stats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_usage_stats' 
        AND table_schema = 'public'
        AND column_name = 'user_int_id'
    ) THEN
        EXECUTE 'ALTER TABLE user_usage_stats ADD COLUMN user_int_id INTEGER';
        RAISE NOTICE '✅ user_int_id agregado a user_usage_stats';
    ELSE
        RAISE NOTICE '✅ user_int_id ya existe en user_usage_stats';
    END IF;
END $$;

-- Verificación final
SELECT '=== VERIFICACIÓN FINAL DE user_int_id EN TODAS LAS TABLAS ===' as info;

SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = t.table_name 
        AND table_schema = 'public'
        AND column_name = 'user_int_id'
    ) as has_user_int_id
FROM (VALUES 
    ('batch_jobs'),
    ('batch_job_files'),
    ('user_profiles'),
    ('user_preferences'),
    ('user_usage_stats')
) AS t(table_name)
ORDER BY table_name;

-- Forzar refresco completo del schema
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

SELECT '✅ user_int_id AGREGADO A TODAS LAS TABLAS' as status;