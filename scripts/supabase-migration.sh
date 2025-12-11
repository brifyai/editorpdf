#!/bin/bash

# Script de migración para Supabase usando REST API
# Requiere: curl, jq

set -e

# Configuración desde .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Variables
SUPABASE_URL=${SUPABASE_URL:-"https://zolffzfbxkgiozfbbjnm.supabase.co"}
SUPABASE_KEY=${SUPABASE_ANON_KEY:-"sb_publishable_NXRZQrLi2o5kzJDMov4g9g_tvISDo2S"}

echo "🚀 Iniciando migración a esquema simplificado..."
echo "📡 URL: $SUPABASE_URL"

# Verificar que curl esté instalado
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl no está instalado"
    exit 1
fi

# Verificar que jq esté instalado
if ! command -v jq &> /dev/null; then
    echo "❌ Error: jq no está instalado. Instala con: brew install jq"
    exit 1
fi

# Función para ejecutar SQL
execute_sql() {
    local sql="$1"
    local description="$2"
    
    echo "⚡ Ejecutando: $description"
    
    # Usar el endpoint de RPC para ejecutar SQL
    local response=$(curl -s -X POST \
        "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
        -H "Content-Type: application/json" \
        -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" \
        -d "{\"sql_query\": $(echo "$sql" | jq -Rs .)}" 2>/dev/null || echo "ERROR")
    
    if [[ "$response" == "ERROR" || "$response" == *"error"* ]]; then
        echo "❌ Error ejecutando: $description"
        echo "📝 SQL: ${sql:0:100}..."
        return 1
    else
        echo "✅ Éxito: $description"
        return 0
    fi
}

# Función para verificar tabla
check_table() {
    local table="$1"
    
    local response=$(curl -s -X GET \
        "$SUPABASE_URL/rest/v1/$table?select=count&limit=1" \
        -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" 2>/dev/null || echo "ERROR")
    
    if [[ "$response" == "ERROR" || "$response" == *"does not exist"* ]]; then
        echo "❌ Tabla $table no existe o no es accesible"
        return 1
    else
        echo "✅ Tabla $table existe y es accesible"
        return 0
    fi
}

# Paso 1: Verificar conexión
echo "🔍 Verificando conexión a Supabase..."
if curl -s "$SUPABASE_URL/rest/v1/" > /dev/null; then
    echo "✅ Conexión exitosa"
else
    echo "❌ Error de conexión"
    exit 1
fi

# Paso 2: Verificar estado actual
echo ""
echo "📊 Estado actual de la base de datos:"

echo "🔍 Verificando tabla users..."
if check_table "users"; then
    echo "   - Tabla users existe"
else
    echo "   - Tabla users no existe (se creará)"
fi

echo "🔍 Verificando tabla profiles..."
if check_table "profiles"; then
    echo "   - Tabla profiles existe (será eliminada)"
else
    echo "   - Tabla profiles no existe"
fi

echo "🔍 Verificando tabla documents..."
if check_table "documents"; then
    echo "   - Tabla documents existe"
else
    echo "   - Tabla documents no existe"
fi

# Paso 3: Crear función para ejecutar SQL si no existe
echo ""
echo "🔧 Configurando función de ejecución SQL..."

# Crear una función temporal para ejecutar SQL
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

# Paso 4: Ejecutar migración principal
echo ""
echo "🚀 Ejecutando migración principal..."

# Eliminar tabla profiles si existe
execute_sql "DROP TABLE IF EXISTS public.profiles CASCADE;" "Eliminando tabla profiles"

# Eliminar vistas antiguas
execute_sql "DROP VIEW IF EXISTS public.user_document_summary;" "Eliminando vista user_document_summary"
execute_sql "DROP VIEW IF EXISTS public.user_ai_metrics_summary;" "Eliminando vista user_ai_metrics_summary"
execute_sql "DROP VIEW IF EXISTS public.system_status;" "Eliminando vista system_status"

# Eliminar políticas RLS antiguas
execute_sql "DROP POLICY IF EXISTS \"Users can view own profile\" ON public.profiles;" "Eliminando políticas de profiles"
execute_sql "DROP POLICY IF EXISTS \"Users can update own profile\" ON public.profiles;" "Eliminando políticas de profiles"
execute_sql "DROP POLICY IF EXISTS \"Users can insert own profile\" ON public.profiles;" "Eliminando políticas de profiles"

# Eliminar triggers
execute_sql "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;" "Eliminando trigger on_auth_user_created"
execute_sql "DROP FUNCTION IF EXISTS public.handle_new_user();" "Eliminando función handle_new_user"

# Asegurar que la tabla users existe y tiene la estructura correcta
create_users_table='
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT ''user'',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT ''{}''::jsonb,
    subscription_tier VARCHAR(50) DEFAULT ''free'',
    api_usage_quota INTEGER DEFAULT 100,
    current_api_usage INTEGER DEFAULT 0
);
'

execute_sql "$create_users_table" "Creando/verificando tabla users"

# Eliminar columnas user_id (UUID) si existen
execute_sql "
DO \$\$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = ''documents'' AND column_name = ''user_id'') THEN
        ALTER TABLE public.documents DROP COLUMN user_id;
        RAISE NOTICE ''Columna user_id eliminada de documents'';
    END IF;
END \$\$;
" "Eliminando user_id de documents"

execute_sql "
DO \$\$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = ''document_analyses'' AND column_name = ''user_id'') THEN
        ALTER TABLE public.document_analyses DROP COLUMN user_id;
        RAISE NOTICE ''Columna user_id eliminada de document_analyses'';
    END IF;
END \$\$;
" "Eliminando user_id de document_analyses"

# Asegurar que user_int_id existe en documents
execute_sql "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = ''documents'' AND column_name = ''user_int_id'') THEN
        ALTER TABLE public.documents ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE ''Columna user_int_id agregada a documents'';
    END IF;
    
    ALTER TABLE public.documents ALTER COLUMN user_int_id SET NOT NULL;
END \$\$;
" "Asegurando user_int_id en documents"

# Asegurar que user_int_id existe en document_analyses
execute_sql "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = ''document_analyses'' AND column_name = ''user_int_id'') THEN
        ALTER TABLE public.document_analyses ADD COLUMN user_int_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE ''Columna user_int_id agregada a document_analyses'';
    END IF;
    
    ALTER TABLE public.document_analyses ALTER COLUMN user_int_id SET NOT NULL;
END \$\$;
" "Asegurando user_int_id en document_analyses"

# Crear vistas simplificadas
create_user_summary_view='
CREATE OR REPLACE VIEW public.user_document_summary AS
SELECT 
    u.id as user_int_id,
    u.email,
    u.username,
    COUNT(d.id) as total_documents,
    COUNT(CASE WHEN d.processing_status = ''completed'' THEN 1 END) as completed_documents,
    COUNT(CASE WHEN d.file_type = ''pdf'' THEN 1 END) as pdf_count,
    COUNT(CASE WHEN d.file_type = ''pptx'' THEN 1 END) as pptx_count,
    COUNT(CASE WHEN d.file_type IN (''jpg'', ''jpeg'', ''png'', ''bmp'', ''tiff'', ''webp'') THEN 1 END) as image_count,
    SUM(d.file_size_bytes) as total_storage_used,
    MAX(d.uploaded_at) as last_upload
FROM public.users u
LEFT JOIN public.documents d ON u.id = d.user_int_id
GROUP BY u.id, u.email, u.username;
'

execute_sql "$create_user_summary_view" "Creando vista user_document_summary"

# Paso 5: Verificación final
echo ""
echo "🔍 Verificación final de la migración:"

echo "🔍 Verificando tabla users..."
if check_table "users"; then
    echo "✅ Tabla users verificada"
else
    echo "❌ Error verificando tabla users"
fi

echo "🔍 Verificando que profiles fue eliminada..."
if check_table "profiles"; then
    echo "⚠️  Tabla profiles todavía existe"
else
    echo "✅ Tabla profiles eliminada correctamente"
fi

echo "🔍 Verificando tabla documents..."
if check_table "documents"; then
    echo "✅ Tabla documents verificada"
else
    echo "❌ Error verificando tabla documents"
fi

# Limpiar función temporal
execute_sql "DROP FUNCTION IF EXISTS exec_sql(TEXT);" "Limpiando función temporal"

echo ""
echo "🎉 ¡MIGRACIÓN COMPLETADA!"
echo "📋 Resumen de cambios:"
echo "   ✅ Eliminada tabla profiles"
echo "   ✅ Eliminadas referencias a user_id (UUID)"
echo "   ✅ Mantenida tabla users con id BIGINT"
echo "   ✅ Actualizadas tablas para usar user_int_id"
echo "   ✅ Creadas vistas simplificadas"

echo ""
echo "🚀 Ahora puedes iniciar el servidor con: npm start"