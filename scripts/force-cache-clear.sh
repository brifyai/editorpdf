#!/bin/bash

echo "🧹 Forzando borrado agresivo de caché de Supabase..."

# Variables de entorno
SUPABASE_URL="https://fvpnfefppfzxdvfhxqjl.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cG5mZWZwcGZ6eGR2Zmh4cWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NjQ4NzIsImV4cCI6MjA0OTU0MDg3Mn0.7tq0S2XwM2Zk_JkXv9a8Y6z3XJhQJJRqj3aF3wKkR4"

echo "🔥 Ejecutando comandos de limpieza agresiva..."

# 1. Desconectar todas las sesiones
echo "Desconectando sesiones..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '\''postgres'\'' AND pid <> pg_backend_pid();"
  }' 2>/dev/null

# 2. Invalidar caché del planificador
echo "Invalidando caché del planificador..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "DISCARD PLANS;"
  }' 2>/dev/null

# 3. Limpiar caché de secuencias
echo "Limpiando caché de secuencias..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "DISCARD SEQUENCES;"
  }' 2>/dev/null

# 4. Limpiar caché temporal
echo "Limpiando caché temporal..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "DISCARD TEMP;"
  }' 2>/dev/null

# 5. Resetear todas las configuraciones
echo "Reseteando configuraciones..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "RESET ALL;"
  }' 2>/dev/null

# 6. Forzar re-análisis completo
echo "Forzando re-análisis completo..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "ANALYZE VERBOSE;"
  }' 2>/dev/null

# 7. VACUUM FULL con opciones agresivas
echo "Ejecutando VACUUM FULL agresivo..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "VACUUM (FULL, ANALYZE, VERBOSE) documents;"
  }' 2>/dev/null

# 8. Recrear índices
echo "Recreando índices..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "
      DROP INDEX IF EXISTS idx_documents_user_int_id;
      DROP INDEX IF EXISTS idx_documents_status;
      DROP INDEX IF EXISTS idx_document_analyses_user_int_id;
      DROP INDEX IF EXISTS idx_document_analyses_document_id;
      DROP INDEX IF EXISTS idx_analysis_results_basic_analysis_id;
      
      CREATE INDEX idx_documents_user_int_id ON documents(user_int_id);
      CREATE INDEX idx_documents_status ON documents(processing_status);
      CREATE INDEX idx_document_analyses_user_int_id ON document_analyses(user_int_id);
      CREATE INDEX idx_document_analyses_document_id ON document_analyses(document_id);
      CREATE INDEX idx_analysis_results_basic_analysis_id ON analysis_results_basic(analysis_id);
    "
  }' 2>/dev/null

# 9. Verificar estructura de la tabla documents
echo "Verificando estructura de tabla documents..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = '\''documents'\'' 
      AND table_schema = '\''public'\'' 
      ORDER BY ordinal_position;
    "
  }' 2>/dev/null

# 10. Forzar actualización de estadísticas del sistema
echo "Actualizando estadísticas del sistema..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "
      UPDATE pg_statistic SET stawidth = stawidth_default;
      ANALYZE;
    "
  }' 2>/dev/null

# 11. Reiniciar conexiones del pool
echo "Reiniciando pool de conexiones..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT pg_reload_conf();"
  }' 2>/dev/null

echo "✅ Limpieza agresiva completada"
echo "🔄 Esperando 5 segundos para que los cambios se propaguen..."

sleep 5

echo "🔍 Verificando que la columna user_int_id existe..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = '\''documents'\'' 
        AND column_name = '\''user_int_id'\'' 
        AND table_schema = '\''public'\''
      ) as column_exists;
    "
  }' 2>/dev/null

echo "🎯 Cache limpiado y verificado"