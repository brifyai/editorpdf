-- ========================================
-- Row Level Security (RLS) Policies
-- Configuración de seguridad a nivel de fila
-- ========================================

-- Habilitar RLS en todas las tablas de usuarios
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA TABLA USERS
-- ========================================

-- Política: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Política: Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Política: Los usuarios pueden insertar su propio perfil (registro)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- POLÍTICAS PARA TABLA USER_PROFILES
-- ========================================

-- Política: Los usuarios solo pueden ver su propio perfil extendido
CREATE POLICY "Users can view own profile data" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar su propio perfil extendido
CREATE POLICY "Users can update own profile data" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar su propio perfil extendido
CREATE POLICY "Users can insert own profile data" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar su propio perfil extendido
CREATE POLICY "Users can delete own profile data" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS PARA TABLA ANALYSIS_RESULTS
-- ========================================

-- Política: Los usuarios solo pueden ver sus propios análisis
CREATE POLICY "Users can view own analysis results" ON analysis_results
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden crear análisis para sí mismos
CREATE POLICY "Users can insert own analysis results" ON analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios análisis
CREATE POLICY "Users can update own analysis results" ON analysis_results
    FOR UPDATE USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios análisis
CREATE POLICY "Users can delete own analysis results" ON analysis_results
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS PARA TABLA BATCH_JOBS
-- ========================================

-- Política: Los usuarios solo pueden ver sus propios trabajos en lote
CREATE POLICY "Users can view own batch jobs" ON batch_jobs
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden crear trabajos en lote para sí mismos
CREATE POLICY "Users can insert own batch jobs" ON batch_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios trabajos en lote
CREATE POLICY "Users can update own batch jobs" ON batch_jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios trabajos en lote
CREATE POLICY "Users can delete own batch jobs" ON batch_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS PARA TABLA USER_PREFERENCES
-- ========================================

-- Política: Los usuarios solo pueden ver sus propias preferencias
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias preferencias
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias preferencias
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propias preferencias
CREATE POLICY "Users can delete own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS PARA TABLA API_USAGE_LOGS
-- ========================================

-- Política: Los usuarios solo pueden ver sus propios logs de uso
CREATE POLICY "Users can view own usage logs" ON api_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios logs de uso
CREATE POLICY "Users can insert own usage logs" ON api_usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- POLÍTICAS ADICIONALES DE SEGURIDAD
-- ========================================

-- Función para verificar si el usuario es propietario del recurso
CREATE OR REPLACE FUNCTION is_resource_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos de administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar si el usuario tiene rol de admin en user_profiles
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ========================================

-- Estas políticas implementan el principio de "mínimo privilegio"
-- Cada usuario solo puede acceder a sus propios datos
-- No hay acceso cruzado entre usuarios
-- Los administradores pueden tener acceso especial si es necesario

-- Para aplicar estas políticas:
-- 1. Ejecutar este archivo en Supabase SQL Editor
-- 2. Verificar que RLS esté habilitado en el dashboard
-- 3. Probar con usuarios diferentes para confirmar aislamiento