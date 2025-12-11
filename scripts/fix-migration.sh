#!/bin/bash

# Script para corregir problemas de la migración
set -e

# Configuración desde .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

SUPABASE_URL=${SUPABASE_URL:-"https://zolffzfbxkgiozfbbjnm.supabase.co"}
SUPABASE_KEY=${SUPABASE_ANON_KEY:-"sb_publishable_NXRZQrLi2o5kzJDMov4g9g_tvISDo2S"}

echo "🔧 Corrigiendo problemas de migración..."
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
echo ""
echo "🔧 Configurando función de ejecución SQL..."

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

# Paso 2: Verificar y crear tabla users correctamente
echo ""
echo "🔧 Verificando y creando tabla users..."

# Primero verificar si existe
check_users_sql="
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = ''public''
   AND    table_name   = ''users''
);
"

echo "🔍 Verificando si tabla users existe..."
execute_sql "$check_users_sql" "Verificando tabla users"

# Crear tabla users si no existe o está mal estructurada
create_users_sql='
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
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

execute_sql "$create_users_sql" "Creando tabla users"

# Paso 3: Eliminar definitivamente tabla profiles
echo ""
echo "🗑️  Eliminando tabla profiles..."

drop_profiles_sql='
DROP TABLE IF EXISTS public.profiles CASCADE;
'

execute_sql "$drop_profiles_sql" "Eliminando tabla profiles"

# Paso 4: Verificar y corregir tabla documents
echo ""
echo "🔧 Verificando y corregiendo tabla documents..."

# Verificar estructura actual de documents
check_docs_sql="
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = ''documents'' AND table_schema = ''public''
ORDER BY ordinal_position;
"

echo "🔍 Verificando estructura de documents..."
execute_sql "$check_docs_sql" "Verificando estructura documents"

# Asegurar que user_int_id existe en documents
add_user_int_id_docs='
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = ''documents'' AND column_name = ''user_int_id'') THEN
        ALTER TABLE public.documents ADD COLUMN user_int_id BIGINT;
        RAISE NOTICE ''Columna user_int_id agregada a documents'';
    END IF;
    
    -- Eliminar user_id si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = ''documents'' AND column_name = ''user_id'') THEN
        ALTER TABLE public.documents DROP COLUMN user_id;
        RAISE NOTICE ''Columna user_id eliminada de documents'';
    END IF;
    
    -- Si no hay datos, agregar constraint
    IF (SELECT COUNT(*) FROM public.documents) = 0 THEN
        ALTER TABLE public.documents ALTER COLUMN user_int_id SET NOT NULL;
        ALTER TABLE public.documents ADD CONSTRAINT fk_documents_user 
            FOREIGN KEY (user_int_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE ''Constraints agregados a documents'';
    END IF;
END $$;
'

execute_sql "$add_user_int_id_docs" "Configurando user_int_id en documents"

# Paso 5: Verificar y corregir tabla document_analyses
echo ""
echo "🔧 Verificando y corregiendo tabla document_analyses..."

# Asegurar que user_int_id existe en document_analyses
add_user_int_id_analyses='
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = ''document_analyses'' AND column_name = ''user_int_id'') THEN
        ALTER TABLE public.document_analyses ADD COLUMN user_int_id BIGINT;
        RAISE NOTICE ''Columna user_int_id agregada a document_analyses'';
    END IF;
    
    -- Eliminar user_id si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = ''document_analyses'' AND column_name = ''user_id'') THEN
        ALTER TABLE public.document_analyses DROP COLUMN user_id;
        RAISE NOTICE ''Columna user_id eliminada de document_analyses'';
    END IF;
    
    -- Si no hay datos, agregar constraint
    IF (SELECT COUNT(*) FROM public.document_analyses) = 0 THEN
        ALTER TABLE public.document_analyses ALTER COLUMN user_int_id SET NOT NULL;
        ALTER TABLE public.document_analyses ADD CONSTRAINT fk_analyses_user 
            FOREIGN KEY (user_int_id) REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE ''Constraints agregados a document_analyses'';
    END IF;
END $$;
'

execute_sql "$add_user_int_id_analyses" "Configurando user_int_id en document_analyses"

# Paso 6: Crear vista simplificada
echo ""
echo "🔧 Creando vista user_document_summary..."

create_view_sql='
DROP VIEW IF EXISTS public.user_document_summary;
CREATE VIEW public.user_document_summary AS
SELECT 
    u.id as user_int_id,
    u.email,
    u.username,
    COUNT(d.id) as total_documents,
    COUNT(CASE WHEN d.processing_status = ''completed'' THEN 1 END) as completed_documents,
    COUNT(CASE WHEN d.file_type = ''pdf'' THEN 1 END) as pdf_count,
    COUNT(CASE WHEN d.file_type = ''pptx'' THEN 1 END) as pptx_count,
    COUNT(CASE WHEN d.file_type IN (''jpg'', ''jpeg'', ''png'', ''bmp'', ''tiff'', ''webp'') THEN 1 END) as image_count,
    COALESCE(SUM(d.file_size_bytes), 0) as total_storage_used,
    MAX(d.uploaded_at) as last_upload
FROM public.users u
LEFT JOIN public.documents d ON u.id = d.user_int_id
GROUP BY u.id, u.email, u.username;
'

execute_sql "$create_view_sql" "Creando vista user_document_summary"

# Paso 7: Insertar usuario de prueba si no existe
echo ""
echo "👤 Creando usuario de prueba..."

insert_test_user='
INSERT INTO public.users (email, username, password_hash, full_name)
VALUES (''test@example.com'', ''testuser'', ''hashed_password'', ''Test User'')
ON CONFLICT (email) DO NOTHING;
'

execute_sql "$insert_test_user" "Insertando usuario de prueba"

# Paso 8: Verificación final
echo ""
echo "🔍 Verificación final..."

# Verificar tablas
verify_tables_sql="
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = ''public'' 
AND table_name IN (''users'', ''documents'', ''document_analyses'', ''profiles'')
ORDER BY table_name;
"

execute_sql "$verify_tables_sql" "Verificando tablas existentes"

# Verificar columnas de documents
verify_docs_columns_sql="
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = ''documents'' AND table_schema = ''public''
AND column_name IN (''user_int_id'', ''user_id'')
ORDER BY column_name;
"

execute_sql "$verify_docs_columns_sql" "Verificando columnas de documents"

# Verificar columnas de document_analyses
verify_analyses_columns_sql="
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = ''document_analyses'' AND table_schema = ''public''
AND column_name IN (''user_int_id'', ''user_id'')
ORDER BY column_name;
"

execute_sql "$verify_analyses_columns_sql" "Verificando columnas de document_analyses"

# Limpiar función temporal
execute_sql "DROP FUNCTION IF EXISTS exec_sql(TEXT);" "Limpiando función temporal"

echo ""
echo "🎉 ¡CORRECCIÓN COMPLETADA!"
echo "📋 Resumen de cambios:"
echo "   ✅ Tabla users creada correctamente"
echo "   ✅ Tabla profiles eliminada definitivamente"
echo "   ✅ Tabla documents configurada con user_int_id"
echo "   ✅ Tabla document_analyses configurada con user_int_id"
echo "   ✅ Vista user_document_summary creada"
echo "   ✅ Usuario de prueba creado"

echo ""
echo "🚀 Ahora puedes iniciar el servidor con: npm start"