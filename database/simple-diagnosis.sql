-- =====================================================
-- DIAGNÓSTICO SIMPLE PASO A PASO
-- =====================================================

-- Paso 1: Verificar si la tabla users existe
SELECT 'PASO 1: Verificando tabla users' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as users_table_exists;

-- Paso 2: Verificar estructura completa de la tabla users
SELECT 'PASO 2: Estructura completa de tabla users' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 3: Verificar datos existentes en users
SELECT 'PASO 3: Datos existentes en users' as info;
SELECT * FROM users LIMIT 3;

-- Paso 4: Intentar agregar user_int_id de forma segura
SELECT 'PASO 4: Agregando user_int_id si no existe' as info;

DO $$
BEGIN
    -- Primero verificar si la tabla existe
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) THEN
        -- Verificar si la columna user_int_id existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
            AND column_name = 'user_int_id'
        ) THEN
            -- Agregar columna user_int_id
            EXECUTE 'ALTER TABLE users ADD COLUMN user_int_id INTEGER';
            RAISE NOTICE '✅ Columna user_int_id agregada';
            
            -- Poblar la columna si hay datos
            EXECUTE 'UPDATE users SET user_int_id = id WHERE id IS NOT NULL AND user_int_id IS NULL';
            RAISE NOTICE '✅ Columna user_int_id poblada';
            
            -- Hacerla NOT NULL si hay datos
            EXECUTE 'ALTER TABLE users ALTER COLUMN user_int_id SET NOT NULL';
            RAISE NOTICE '✅ Columna user_int_id configurada como NOT NULL';
        ELSE
            RAISE NOTICE '✅ Columna user_int_id ya existe';
        END IF;
    ELSE
        RAISE NOTICE '❌ La tabla users no existe';
    END IF;
END $$;

-- Paso 5: Verificar resultado final
SELECT 'PASO 5: Verificación final' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'user_int_id';

-- Paso 6: Verificar datos finales
SELECT 'PASO 6: Datos finales con user_int_id' as info;
SELECT id, email, username, user_int_id 
FROM users 
ORDER BY id;

SELECT '✅ DIAGNÓSTICO SIMPLE COMPLETADO' as status;