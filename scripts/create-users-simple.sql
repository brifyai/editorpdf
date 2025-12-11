-- =====================================================
-- VERSIÓN SIMPLIFICADA - CREAR TABLA USERS EN SUPABASE
-- Ejecutar este SQL en: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm
-- =====================================================

-- 1. Crear tabla users
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'enterprise')),
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    api_usage_limit INTEGER DEFAULT 100,
    monthly_api_count INTEGER DEFAULT 0,
    storage_quota_mb INTEGER DEFAULT 100,
    storage_used_mb INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 3. Habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;
DROP POLICY IF EXISTS "Users can view own user record" ON public.users;
DROP POLICY IF EXISTS "Users can update own user record" ON public.users;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.users;

-- 5. Crear políticas de seguridad
-- Política para permitir inserción durante registro
CREATE POLICY "Enable insert for authentication" ON public.users
    FOR INSERT WITH CHECK (true);

-- Política para que los usuarios puedan ver sus propios datos
CREATE POLICY "Users can view own user record" ON public.users
    FOR SELECT USING (id = current_setting('app.current_user_id', true)::BIGINT);

-- Política para que los usuarios puedan actualizar sus propios datos
CREATE POLICY "Users can update own user record" ON public.users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::BIGINT);

-- 6. Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS handle_users_updated_at ON public.users;
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Verificación
SELECT 'Tabla users creada exitosamente' as status;

-- =====================================================
-- INSTRUCCIONES FINALES
-- =====================================================
/*
Una vez ejecutado este SQL:

1. Reinicia el servidor Node.js
2. El sistema detectará automáticamente la tabla users
3. Los nuevos usuarios se guardarán en Supabase
4. El usuario existente en memoria (Camilo Alegria) seguirá funcionando

Para verificar que todo funciona:
1. Ejecuta: node scripts/auto-create-users.js
2. Debería mostrar que la tabla users existe y es accesible

El usuario Camilo Alegria actual (ID: 1) seguirá funcionando
y podrá ser migrado a la base de datos si es necesario.
*/