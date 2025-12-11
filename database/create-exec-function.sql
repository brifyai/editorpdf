-- ========================================
-- FUNCIÓN PARA EJECUTAR COMANDOS SQL DDL
-- ========================================

-- Crear función para ejecutar comandos SQL arbitrarios
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS text AS $$
BEGIN
  EXECUTE query;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos para usar la función
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon, authenticated, service_role;