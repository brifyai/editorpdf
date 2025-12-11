#!/bin/bash

echo "🧹 Limpiando caché de base de datos Supabase..."

# Variables de entorno (ajusta según tu configuración)
SUPABASE_URL="https://fvpnfefppfzxdvfhxqjl.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cG5mZWZwcGZ6eGR2Zmh4cWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NjQ4NzIsImV4cCI6MjA0OTU0MDg3Mn0.7tq0S2XwM2Zk_JkXv9a8Y6z3XJhQJJRqj3aF3wKkR4"

echo "🗑️ Eliminando vistas y tablas problemáticas..."

# Eliminar vistas si existen
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "DROP VIEW IF EXISTS analysis_results_basic_2 CASCADE;"
  }'

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "DROP TABLE IF EXISTS analysis_results_basic_2 CASCADE;"
  }'

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "DROP TABLE IF EXISTS analysis_results_basic CASCADE;"
  }'

echo "🔄 Limpiando caché del sistema..."

# Limpiar caché del sistema
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "DISCARD ALL;"
  }'

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "VACUUM FULL;"
  }'

curl -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "ANALYZE;"
  }'

echo "✅ Limpieza completada"