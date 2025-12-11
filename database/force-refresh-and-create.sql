-- =====================================================
-- FORZAR REFRESCO Y CREAR TABLAS
-- =====================================================

-- Paso 1: Forzar refresco completo del schema
SELECT '=== FORZANDO REFRESCO COMPLETO ===' as info;

-- Limpiar caché de PostgreSQL
DISCARD PLANS;
DISCARD TEMP;

-- Forzar refresco de PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Esperar un momento y volver a forzar
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

-- Paso 2: Verificar que user_int_id realmente existe
SELECT '=== VERIFICANDO user_int_id ===' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name = 'user_int_id';

-- Verificar también con consulta directa
SELECT '=== VERIFICACIÓN DIRECTA ===' as info;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        AND column_name = 'user_int_id'
    ) THEN
        RAISE NOTICE '✅ user_int_id EXISTE en la tabla users';
    ELSE
        RAISE NOTICE '❌ user_int_id NO EXISTE en la tabla users';
    END IF;
END $$;

-- Paso 3: Verificar datos en users con user_int_id
SELECT '=== VERIFICANDO DATOS ===' as info;
SELECT id, email, username, user_int_id 
FROM users 
ORDER BY id 
LIMIT 3;

-- Paso 4: Crear tablas simples sin dependencias complejas
SELECT '=== CREANDO TABLAS SIMPLES ===' as info;

-- Crear batch_jobs sin validaciones complejas primero
CREATE TABLE IF NOT EXISTS batch_jobs (
    id BIGSERIAL PRIMARY KEY,
    user_int_id INTEGER,
    job_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    total_files INTEGER DEFAULT 0,
    processed_files INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear user_profiles simple
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_int_id INTEGER,
    display_name VARCHAR(255),
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear user_preferences simple
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_int_id INTEGER,
    preferred_ocr_language VARCHAR(10) DEFAULT 'spa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 5: Verificación final
SELECT '=== VERIFICACIÓN FINAL ===' as info;

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('batch_jobs', 'user_profiles', 'user_preferences')
    AND table_schema = 'public'
    AND column_name = 'user_int_id'
ORDER BY table_name;

-- Forzar refresco final
NOTIFY pgrst, 'reload schema';

SELECT '✅ PROCESO COMPLETADO' as status;