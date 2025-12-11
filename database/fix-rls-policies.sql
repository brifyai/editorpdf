-- ========================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA AUTENTICACIÓN PERSONALIZADA
-- ========================================

-- Deshabilitar RLS temporalmente para la tabla users (autenticación personalizada)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Para las demás tablas, crear políticas que permitan acceso por user_int_id
-- en lugar de auth.uid()

-- ========================================
-- POLÍTICAS PARA TABLA USER_PROFILES
-- ========================================

-- Eliminar políticas existentes que usan auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Crear nuevas políticas que permitan acceso completo (temporalmente)
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABLA ANALYSIS_RESULTS
-- ========================================

DROP POLICY IF EXISTS "Users can view own analysis results" ON analysis_results;
DROP POLICY IF EXISTS "Users can insert own analysis results" ON analysis_results;
DROP POLICY IF EXISTS "Users can update own analysis results" ON analysis_results;

CREATE POLICY "Allow all operations on analysis_results" ON analysis_results
    FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABLA BATCH_JOBS
-- ========================================

DROP POLICY IF EXISTS "Users can view own batch jobs" ON batch_jobs;
DROP POLICY IF EXISTS "Users can insert own batch jobs" ON batch_jobs;
DROP POLICY IF EXISTS "Users can update own batch jobs" ON batch_jobs;

CREATE POLICY "Allow all operations on batch_jobs" ON batch_jobs
    FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABLA USER_PREFERENCES
-- ========================================

DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

CREATE POLICY "Allow all operations on user_preferences" ON user_preferences
    FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABLA API_USAGE_LOGS
-- ========================================

DROP POLICY IF EXISTS "Users can view own api usage" ON api_usage_logs;
DROP POLICY IF EXISTS "Users can insert own api usage" ON api_usage_logs;

CREATE POLICY "Allow all operations on api_usage_logs" ON api_usage_logs
    FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'user_profiles', 'analysis_results', 'batch_jobs', 'user_preferences', 'api_usage_logs')
ORDER BY tablename, policyname;