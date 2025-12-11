-- =====================================================
-- CREAR TABLA USERS EN SUPABASE
-- Ejecutar este SQL en: https://supabase.com/dashboard/project/zolffzfbxkgiozfbbjnm
-- =====================================================

-- Tabla de usuarios personalizada para login con ID numérico
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

-- Índices para la tabla users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (RLS)
-- Política para permitir inserción durante registro
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;
CREATE POLICY "Enable insert for authentication" ON public.users
    FOR INSERT WITH CHECK (true);

-- Política para que los usuarios puedan ver sus propios datos
DROP POLICY IF EXISTS "Users can view own user record" ON public.users;
CREATE POLICY "Users can view own user record" ON public.users
    FOR SELECT USING (id = current_setting('app.current_user_id', true)::BIGINT);

-- Política para que los usuarios puedan actualizar sus propios datos
DROP POLICY IF EXISTS "Users can update own user record" ON public.users;
CREATE POLICY "Users can update own user record" ON public.users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::BIGINT);

-- Política adicional para permitir lectura basada en autenticación
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.users;
CREATE POLICY "Enable select for authenticated users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que la tabla fue creada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- =====================================================
-- INSTRUCCIONES POST-CREACIÓN
-- =====================================================
/*
Una vez ejecutado este SQL:

1. La tabla users estará disponible
2. Podrás registrar usuarios mediante el endpoint /api/auth/register
3. Ejemplo para crear el usuario Camilo Alegria:

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "camiloalegriabarra@gmail.com",
    "username": "camiloalegria",
    "password": "Antonito26$",
    "firstName": "Camilo",
    "lastName": "Alegria"
  }'

4. El sistema responderá con el ID del usuario y un token de autenticación
5. Podrás usar este token para acceder a las funcionalidades de la aplicación

Nota: Asegúrate de que el servidor esté corriendo en http://localhost:3000
*/