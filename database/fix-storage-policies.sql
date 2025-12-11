-- ========================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA STORAGE
-- ========================================

-- Verificar si existe el bucket 'documents'
SELECT name, id, public FROM storage.buckets WHERE name = 'documents';

-- Si no existe, crear el bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    false, -- Bucket privado
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/html']
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- POLÍTICAS RLS PARA STORAGE BUCKET 'documents'
-- ========================================

-- Permitir a los usuarios ver sus propios archivos
CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Permitir a los usuarios subir archivos
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Permitir a los usuarios actualizar sus propios archivos
CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Permitir a los usuarios eliminar sus propios archivos
CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ========================================
-- POLÍTICAS ALTERNATIVAS PARA SISTEMA DE AUTENTICACIÓN PERSONALIZADA
-- ========================================

-- Si estamos usando autenticación personalizada (user_int_id), usar estas políticas:
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Política más permisiva temporalmente para testing
CREATE POLICY "Allow authenticated users full access to documents" ON storage.objects
    FOR ALL USING (bucket_id = 'documents' AND auth.role() = 'authenticated')
    WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Verificar buckets
SELECT * FROM storage.buckets WHERE name = 'documents';