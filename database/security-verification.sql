-- Script de verificación de seguridad
-- Ejecutar después de configurar RLS

-- Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_profiles', 'analysis_results', 'batch_jobs', 'user_preferences', 'api_usage_logs')
ORDER BY tablename;

-- Verificar políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar usuarios y sus roles
SELECT 
    u.id,
    u.email,
    up.role,
    up.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
ORDER BY u.created_at;

-- Verificar logs de seguridad recientes
SELECT 
    created_at,
    user_id,
    action,
    table_name,
    ip_address
FROM api_usage_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 50;
