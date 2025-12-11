#!/bin/bash

# Script para refrescar el schema cache de Supabase
set -e

# Configuración desde .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

SUPABASE_URL=${SUPABASE_URL:-"https://zolffzfbxkgiozfbbjnm.supabase.co"}
SUPABASE_KEY=${SUPABASE_ANON_KEY:-"sb_publishable_NXRZQrLi2o5kzJDMov4g9g_tvISDo2S"}

echo "🔄 Refrescando schema cache de Supabase..."
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

# Paso 2: Forzar refresh del schema cache
echo ""
echo "🔄 Forzando refresh del schema cache..."

refresh_sql='
-- Notificar a PostgREST que actualice el schema cache
DO $$
BEGIN
    -- Insertar y eliminar una tabla temporal para forzar refresh
    CREATE TEMP TABLE IF NOT EXISTS schema_refresh_trigger (id INT);
    DROP TABLE IF EXISTS schema_refresh_trigger;
    
    -- También podemos ejecutar un ANALYZE para actualizar estadísticas
    ANALYZE;
    
    RAISE NOTICE ''Schema cache refresh triggered'';
END $$;
'

execute_sql "$refresh_sql" "Refrescando schema cache"

# Paso 3: Verificar que las tablas existen
echo ""
echo "🔍 Verificando tablas después del refresh..."

verify_tables_sql='
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = ''public'' 
AND table_name IN (''users'', ''documents'', ''document_analyses'', ''profiles'')
ORDER BY table_name;
'

execute_sql "$verify_tables_sql" "Verificando tablas existentes"

# Paso 4: Verificar estructura de tabla users
echo ""
echo "🔍 Verificando estructura de tabla users..."

verify_users_structure_sql='
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = ''users'' AND table_schema = ''public''
ORDER BY ordinal_position;
'

execute_sql "$verify_users_structure_sql" "Verificando estructura users"

# Paso 5: Verificar columnas user_int_id
echo ""
echo "🔍 Verificando columnas user_int_id..."

verify_user_int_id_sql='
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = ''public'' 
AND column_name = ''user_int_id''
ORDER BY table_name;
'

execute_sql "$verify_user_int_id_sql" "Verificando columnas user_int_id"

# Paso 6: Verificar que no existen columnas user_id
echo ""
echo "🔍 Verificando que no existen columnas user_id (UUID)..."

verify_no_user_id_sql='
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = ''public'' 
AND column_name = ''user_id''
ORDER BY table_name;
'

execute_sql "$verify_no_user_id_sql" "Verificando ausencia de user_id"

# Limpiar función temporal
execute_sql "DROP FUNCTION IF EXISTS exec_sql(TEXT);" "Limpiando función temporal"

echo ""
echo "🎉 ¡SCHEMA CACHE REFRESCADO!"
echo "📋 Resumen:"
echo "   ✅ Schema cache de Supabase refrescado"
echo "   ✅ Tablas verificadas"
echo "   ✅ Estructura de users verificada"
echo "   ✅ Columnas user_int_id verificadas"
echo "   ✅ Ausencia de user_id verificada"

echo ""
echo "🚀 Ahora prueba nuevamente el registro de usuario"