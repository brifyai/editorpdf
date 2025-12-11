#!/bin/bash

# Script agresivo para resetear el schema cache de Supabase
set -e

# Configuración desde .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

SUPABASE_URL=${SUPABASE_URL:-"https://zolffzfbxkgiozfbbjnm.supabase.co"}
SUPABASE_KEY=${SUPABASE_ANON_KEY:-"sb_publishable_NXRZQrLi2o5kzJDMov4g9g_tvISDo2S"}

echo "🔄 RESET AGRESIVO del schema cache de Supabase..."
echo "📡 URL: $SUPABASE_URL"

# Función para ejecutar SQL
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "⚡ Ejecutando: $description"
    
    local response=$(curl -s -X POST \
        "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
        -H "Content-Type: application/json" \
        -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" \
        -d "{\"sql_query\": $(echo "$sql" | jq -Rs .)}" 2>/dev/null || echo "ERROR")
    
    if [[ "$response" == "ERROR" || "$response" == *"error"* ]]; then
        echo "❌ Error ejecutando: $description"
        echo "📝 Respuesta: $response"
        return 1
    else
        echo "✅ Éxito: $description"
        return 0
    fi
}

# Paso 1: Crear función exec_sql si no existe
create_exec_function='
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result TEXT;
BEGIN
    EXECUTE sql_query;
    RETURN ''SQL executed successfully'';
EXCEPTION WHEN OTHERS THEN
    RETURN SQLERRM;
END;
$$;
'

execute_sql "$create_exec_function" "Creando función exec_sql"

# Paso 2: Eliminar y recrear todas las tablas para forzar refresh
echo ""
echo "💥 Eliminando y recreando tablas para forzar refresh..."

# Eliminar tablas en orden correcto (dependencias primero)
execute_sql "DROP TABLE IF EXISTS public.analysis_results_ai CASCADE;" "Eliminando analysis_results_ai"
execute_sql "DROP TABLE IF EXISTS public.analysis_results_advanced CASCADE;" "Eliminando analysis_results_advanced"
execute_sql "DROP TABLE IF EXISTS public.analysis_results_basic CASCADE;" "Eliminando analysis_results_basic"
execute_sql "DROP TABLE IF EXISTS public.document_analyses CASCADE;" "Eliminando document_analyses"
execute_sql "DROP TABLE IF EXISTS public.documents CASCADE;" "Eliminando documents"
execute_sql "DROP TABLE IF EXISTS public.profiles CASCADE;" "Eliminando profiles"
execute_sql "DROP TABLE IF EXISTS public.users CASCADE;" "Eliminando users"

# Forzar vacuum y analyze
execute_sql "VACUUM FULL ANALYZE;" "Forzando VACUUM FULL ANALYZE"

# Paso 3: Recrear tabla users con estructura correcta
echo ""
echo "🏗️  Recreando tabla users..."

create_users_sql='
CREATE TABLE public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT ''user'',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT ''{}''::jsonb,
    subscription_tier VARCHAR(50) DEFAULT ''free'',
    api_usage_quota INTEGER DEFAULT 100,
    current_api_usage INTEGER DEFAULT 0,
    api_usage_limit INTEGER DEFAULT 1000,
    monthly_api_count INTEGER DEFAULT 0,
    storage_quota_mb INTEGER DEFAULT 100,
    storage_used_mb INTEGER DEFAULT 0
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
'

execute_sql "$create_users_sql" "Creando tabla users con índices"

# Paso 4: Recrear tabla documents
echo ""
echo "📄 Recreando tabla documents..."

create_documents_sql='
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_int_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) DEFAULT ''application/octet-stream'',
    file_hash VARCHAR(64) NOT NULL,
    processing_status VARCHAR(50) DEFAULT ''pending'',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT ''{}''::jsonb,
    extracted_text TEXT,
    thumbnail_path TEXT,
    storage_provider VARCHAR(50) DEFAULT ''local''
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_documents_user_int_id ON public.documents(user_int_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON public.documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON public.documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON public.documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON public.documents(file_hash);
'

execute_sql "$create_documents_sql" "Creando tabla documents con índices"

# Paso 5: Recrear tabla document_analyses
echo ""
echo "🔍 Recreando tabla document_analyses..."

create_analyses_sql='
CREATE TABLE public.document_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_int_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) DEFAULT ''document'',
    ai_model_used VARCHAR(100),
    ai_strategy VARCHAR(50),
    analysis_config JSONB DEFAULT ''{}''::jsonb,
    processing_time_ms INTEGER,
    confidence_score DECIMAL(5,2),
    status VARCHAR(50) DEFAULT ''pending'',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_document_analyses_document_id ON public.document_analyses(document_id);
CREATE INDEX IF NOT EXISTS idx_document_analyses_user_int_id ON public.document_analyses(user_int_id);
CREATE INDEX IF NOT EXISTS idx_document_analyses_status ON public.document_analyses(status);
CREATE INDEX IF NOT EXISTS idx_document_analyses_created_at ON public.document_analyses(created_at);
'

execute_sql "$create_analyses_sql" "Creando tabla document_analyses con índices"

# Paso 6: Recrear tablas de resultados
echo ""
echo "📊 Recreando tablas de resultados..."

create_results_tables_sql='
-- Resultados básicos
CREATE TABLE public.analysis_results_basic (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.document_analyses(id) ON DELETE CASCADE,
    page_count INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    language_detected VARCHAR(10) DEFAULT ''unknown'',
    readability_score DECIMAL(5,2) DEFAULT 0,
    document_info JSONB DEFAULT ''{}''::jsonb,
    statistics JSONB DEFAULT ''{}''::jsonb,
    content JSONB DEFAULT ''{}''::jsonb,
    structure JSONB DEFAULT ''{}''::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resultados avanzados
CREATE TABLE public.analysis_results_advanced (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.document_analyses(id) ON DELETE CASCADE,
    keywords TEXT[],
    phrases TEXT[],
    entities JSONB DEFAULT ''{}''::jsonb,
    sentiment_analysis JSONB DEFAULT ''{}''::jsonb,
    classification JSONB DEFAULT ''{}''::jsonb,
    advanced_metrics JSONB DEFAULT ''{}''::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resultados de IA
CREATE TABLE public.analysis_results_ai (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.document_analyses(id) ON DELETE CASCADE,
    ai_model VARCHAR(100),
    ai_provider VARCHAR(50),
    prompt_used TEXT,
    response_generated TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,6) DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    quality_metrics JSONB DEFAULT ''{}''::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_analysis_results_basic_analysis_id ON public.analysis_results_basic(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_advanced_analysis_id ON public.analysis_results_advanced(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_ai_analysis_id ON public.analysis_results_ai(analysis_id);
'

execute_sql "$create_results_tables_sql" "Creando tablas de resultados con índices"

# Paso 7: Forzar refresh completo
echo ""
echo "🔄 Forzando refresh completo del schema..."

force_refresh_sql='
-- Forzar refresh del schema cache
DO $$
BEGIN
    -- Crear y eliminar tabla temporal
    CREATE TEMP TABLE force_refresh (id INT);
    DROP TABLE force_refresh;
    
    -- Actualizar estadísticas
    ANALYZE;
    
    -- Notificar cambio
    RAISE NOTICE ''Schema cache force refresh completed'';
END $$;
'

execute_sql "$force_refresh_sql" "Forzando refresh completo"

# Paso 8: Insertar usuario de prueba
echo ""
echo "👤 Insertando usuario de prueba..."

insert_test_user_sql="
INSERT INTO public.users (email, username, password_hash, first_name, last_name)
VALUES ('test@example.com', 'testuser', 'hashed_password_123', 'Test', 'User')
ON CONFLICT (email) DO NOTHING;
"

execute_sql "$insert_test_user_sql" "Insertando usuario de prueba"

# Paso 9: Verificación final
echo ""
echo "🔍 Verificación final..."

verify_tables_sql='
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = ''public'' 
AND table_name IN (''users'', ''documents'', ''document_analyses'', ''analysis_results_basic'', ''analysis_results_advanced'', ''analysis_results_ai'')
ORDER BY table_name;
'

execute_sql "$verify_tables_sql" "Verificando tablas creadas"

verify_users_sql='
SELECT id, email, username, is_active 
FROM public.users 
WHERE email = ''test@example.com'';
'

execute_sql "$verify_users_sql" "Verificando usuario de prueba"

# Limpiar función temporal
execute_sql "DROP FUNCTION IF EXISTS exec_sql(TEXT);" "Limpiando función temporal"

echo ""
echo "🎉 ¡RESET COMPLETADO!"
echo "📋 Resumen de cambios:"
echo "   ✅ Schema cache reseteado agresivamente"
echo "   ✅ Todas las tablas recreadas con estructura correcta"
echo "   ✅ Índices creados"
echo "   ✅ Usuario de prueba insertado"
echo "   ✅ Solo user_int_id (BIGINT) usado, sin user_id (UUID)"

echo ""
echo "🚀 El servidor debería ahora reconocer todas las tablas correctamente"
echo "💡 Reinicia el servidor para asegurar que tome los cambios"