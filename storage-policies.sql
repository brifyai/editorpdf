-- ===========================================
-- POLÍTICAS RLS PARA STORAGE "documents"
-- ===========================================

-- Habilitar RLS en la tabla storage.objects si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política 1: Los usuarios pueden ver sus propios archivos
CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND (
    -- Usuarios autenticados: pueden ver archivos en su carpeta (user_id/)
    (auth.uid() IS NOT NULL AND split_part(name, '/', 1) = auth.uid()::text)
    OR
    -- Usuarios anónimos: pueden ver archivos en carpeta 'anonymous'
    (auth.uid() IS NULL AND split_part(name, '/', 1) = 'anonymous')
  )
);

-- Política 2: Los usuarios pueden subir archivos a su carpeta
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (
    -- Usuarios autenticados: pueden subir a su carpeta (user_id/)
    (auth.uid() IS NOT NULL AND split_part(name, '/', 1) = auth.uid()::text)
    OR
    -- Usuarios anónimos: pueden subir a carpeta 'anonymous'
    (auth.uid() IS NULL AND split_part(name, '/', 1) = 'anonymous')
  )
);

-- Política 3: Los usuarios pueden actualizar sus propios archivos
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents'
  AND (
    -- Usuarios autenticados: pueden actualizar archivos en su carpeta
    (auth.uid() IS NOT NULL AND split_part(name, '/', 1) = auth.uid()::text)
    OR
    -- Usuarios anónimos: pueden actualizar archivos en carpeta 'anonymous'
    (auth.uid() IS NULL AND split_part(name, '/', 1) = 'anonymous')
  )
);

-- Política 4: Los usuarios pueden eliminar sus propios archivos
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND (
    -- Usuarios autenticados: pueden eliminar archivos en su carpeta
    (auth.uid() IS NOT NULL AND split_part(name, '/', 1) = auth.uid()::text)
    OR
    -- Usuarios anónimos: pueden eliminar archivos en carpeta 'anonymous'
    (auth.uid() IS NULL AND split_part(name, '/', 1) = 'anonymous')
  )
);

-- ===========================================
-- VERIFICACIÓN DE POLÍTICAS
-- ===========================================

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ===========================================
-- NOTAS IMPORTANTES
-- ===========================================

/*
ESTRUCTURA DE ARCHIVOS ESPERADA:
- Los archivos deben subirse con la estructura: user_id/filename.pdf
- Ejemplo: 123e4567-e89b-12d3-a456-426614174000/documento.pdf

CÓMO USAR:
1. Copia este SQL completo
2. Ve a tu proyecto Supabase (https://supabase.com/dashboard)
3. Ve a SQL Editor
4. Pega y ejecuta este SQL
5. Las políticas RLS se crearán automáticamente

DESPUÉS DE EJECUTAR:
- Los usuarios autenticados podrán subir archivos
- Solo podrán acceder a archivos en su carpeta (user_id/)
- El sistema de análisis de documentos funcionará correctamente
*/