-- =====================================================
-- TABLA USERS PARA SISTEMA DE LOGIN PERSONALIZADO
-- =====================================================

-- Crear tabla de usuarios con ID numérico (BIGINT)
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
CREATE INDEX IF NOT EXISTS idx_users_subscription ON public.users(subscription_tier);

-- =====================================================
-- ACTUALIZAR TABLAS EXISTENTES PARA COMPATIBILIDAD DUAL
-- =====================================================

-- Agregar campo user_int_id a documents si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'user_int_id'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Agregar campo user_int_id a document_analyses si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_analyses' AND column_name = 'user_int_id'
    ) THEN
        ALTER TABLE public.document_analyses ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- POLÍTICAS RLS PARA TABLA USERS
-- =====================================================

-- Habilitar RLS para la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla users
CREATE POLICY "Users can register" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own user record" ON public.users
    FOR SELECT USING (id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Users can update own user record" ON public.users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true)::BIGINT);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = current_setting('app.current_user_id', true)::BIGINT 
            AND role = 'admin'
        )
    );

-- =====================================================
-- ACTUALIZAR POLÍTICAS RLS EXISTENTES PARA COMPATIBILIDAD DUAL
-- =====================================================

-- Actualizar políticas para documentos
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (
        auth.uid() = user_id OR 
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (
        auth.uid() = user_id OR 
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

-- Actualizar políticas para análisis
DROP POLICY IF EXISTS "Users can view own analyses" ON public.document_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.document_analyses;

CREATE POLICY "Users can view own analyses" ON public.document_analyses
    FOR SELECT USING (
        auth.uid() = user_id OR 
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

CREATE POLICY "Users can insert own analyses" ON public.document_analyses
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        current_setting('app.current_user_id', true)::BIGINT = user_int_id
    );

-- =====================================================
-- TRIGGER PARA ACTUALIZAR UPDATED_AT EN USERS
-- =====================================================

CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNCIONES AUXILIARES PARA GESTIÓN DE USUARIOS
-- =====================================================

-- Función para verificar si un email ya existe
CREATE OR REPLACE FUNCTION public.user_email_exists(email_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE email = email_input AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un username ya existe
CREATE OR REPLACE FUNCTION public.username_exists(username_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE username = username_input AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener información del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user()
RETURNS TABLE (
    id BIGINT,
    email VARCHAR(255),
    username VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50),
    subscription_tier VARCHAR(50),
    is_active BOOLEAN,
    email_verified BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.role,
        u.subscription_tier,
        u.is_active,
        u.email_verified,
        u.last_login
    FROM public.users u
    WHERE u.id = current_setting('app.current_user_id', true)::BIGINT
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VISTAS ÚTILES PARA GESTIÓN DE USUARIOS
-- =====================================================

-- Vista de resumen de usuarios
CREATE OR REPLACE VIEW public.user_summary AS
SELECT 
    u.id,
    u.email,
    u.username,
    u.first_name,
    u.last_name,
    u.role,
    u.subscription_tier,
    u.is_active,
    u.email_verified,
    u.last_login,
    u.created_at,
    u.updated_at,
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(DISTINCT da.id) as total_analyses,
    COALESCE(SUM(d.file_size_bytes), 0) as total_storage_used
FROM public.users u
LEFT JOIN public.documents d ON u.id = d.user_int_id
LEFT JOIN public.document_analyses da ON u.id = da.user_int_id
GROUP BY u.id, u.email, u.username, u.first_name, u.last_name, u.role, u.subscription_tier, u.is_active, u.email_verified, u.last_login, u.created_at, u.updated_at;

-- =====================================================
-- DATOS DE EJEMPLO (opcional - solo para desarrollo)
-- =====================================================

-- Crear usuario administrador por defecto (solo si no existe)
INSERT INTO public.users (
    email, 
    username, 
    password_hash, 
    first_name, 
    last_name, 
    role,
    email_verified,
    is_active
) VALUES (
    'admin@documentanalyzer.com',
    'admin',
    '$2b$10$example_hash_change_in_production', -- Cambiar en producción
    'Administrador',
    'Sistema',
    'admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMENTARIOS
-- =====================================================

-- Esta tabla permite:
-- 1. Login personalizado con ID numérico (BIGINT)
-- 2. Compatibilidad con el sistema existente de Supabase Auth
-- 3. Políticas RLS que funcionan con ambos sistemas
-- 4. Gestión completa de usuarios y permisos
-- 5. Integración con todas las tablas existentes

-- Para usar el sistema de login personalizado:
-- 1. Establecer el ID del usuario con: SET LOCAL app.current_user_id = '<user_id>';
-- 2. Las políticas RLS verificarán automáticamente los permisos
-- 3. Todas las operaciones usarán el contexto del usuario actual