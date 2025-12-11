-- =====================================================
-- AGREGAR MANUALMENTE user_int_id A LA TABLA USERS
-- =====================================================

-- Paso 1: Verificar estructura actual
SELECT 'PASO 1: Estructura actual de users' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 2: Agregar la columna user_int_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_int_id INTEGER;

-- Paso 3: Poblar la columna con los valores de id
UPDATE users SET user_int_id = id WHERE user_int_id IS NULL;

-- Paso 4: Hacer la columna NOT NULL
ALTER TABLE users ALTER COLUMN user_int_id SET NOT NULL;

-- Paso 5: Verificación final
SELECT 'PASO 5: Verificación final' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'user_int_id';

-- Paso 6: Verificar datos
SELECT 'PASO 6: Datos con user_int_id' as info;
SELECT id, email, username, user_int_id 
FROM users 
ORDER BY id;

SELECT '✅ user_int_id agregado manualmente' as status;